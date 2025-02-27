import fs from 'fs';
import CFG from './CFG.js';
import { getAspectRatio } from '../iso/getAspectRatio.js';
import imageSize from 'image-size';
import { fillTpl } from '../iso/fillTpl.js';

const imgTypes = CFG.imgTypes.length ? CFG.imgTypes : [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'svg',
];

function getImgCloudData() {
  /** @type {Object<string, CloudImageDescriptor>} */
  let imgCloudData = {};
  if (fs.existsSync(CFG.syncDataPath)) {
    imgCloudData = JSON.parse(fs.readFileSync(CFG.syncDataPath).toString());
  }
  return imgCloudData;
}

export function checkDir(fullPath) {
  let dirPath = fullPath.split('/').slice(0, -1).join('/');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function findAllImages(initFolderPath) {
  /** @type {String[]} */
  let result = [];
    
  function processPath(path) {
    let files = fs.readdirSync(path);
    
    files.forEach(file => {
      const fullPath = `${path}/${file}`.replaceAll('//', '/');
      const stat = fs.lstatSync(fullPath);
      
      if (stat.isDirectory()) {
        processPath(fullPath);
      } else if (stat.isFile()) {
        const ext = file.split('.').pop().toLowerCase();
        if (imgTypes.includes(ext)) {
          result.push(fullPath);
        }
      }
    });
  }
  
  processPath(initFolderPath);
  return result;
}

let retries = 3;
async function processSrcFolder(folderPath) {
  let imgCloudData = getImgCloudData();
  let images = findAllImages(folderPath);
  let hasErrors = false;
  
  /**
   * @param {number} ms 
   * @returns {Promise<void>}
   */
  let waitFor = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  return new Promise((resolve) => {
    images.forEach(async (imgPath, idx) => {
      if (imgCloudData[imgPath]) {
        // console.log('Image already exists: ', imgPath);
        return;
      }
      console.log('Uploading image: ', imgPath);
  
      try {
        let imgBytes = fs.readFileSync(imgPath);
        let imgDimensions = imageSize(imgPath);
    
        const formData = new FormData();
        formData.append('file', new File([imgBytes], imgPath.split('/').pop()));
        formData.append('metadata', JSON.stringify({
          localPath: imgPath,
        }));
        let uploadUrl = fillTpl(CFG.uploadUrlTemplate, {
          PROJECT: CFG.projectId,
        });
        const response = await (await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CFG.apiKey}`,
          },
          body: formData,
        })).json();
        
        /** @type {CloudImageDescriptor} */
        let imgDesc = {
          cdnId: response.result.id,
          uploadDate: response.result.uploaded,
          imageName: imgPath.split('/').pop(),
          alt: '',
          width: imgDimensions.width.toString(),
          height: imgDimensions.height.toString(),
          aspectRatio: getAspectRatio(imgDimensions.width, imgDimensions.height),
          srcFormat: imgPath.split('.').pop().toUpperCase(),
        };
        imgCloudData[imgPath] = imgDesc;
        checkDir(CFG.syncDataPath);
        fs.writeFileSync(CFG.syncDataPath, JSON.stringify(imgCloudData, null, 2));
      } catch (error) {
        console.error('Error uploading image: ', imgPath);
        hasErrors = true;
      }

      if (idx === images.length - 1) {
        if (hasErrors && retries > 0) {
          retries--;
          await waitFor(2000);
          await processSrcFolder(folderPath);
        } else {
          retries = 3;
          console.log(hasErrors ? 'Uploading finished with errors' : 'Uploading finished successfully');
          resolve();
        }
      }
    });
  });
}

let watchTimeout;
let writeFileTimeout;

export class FolderSync {

  static start() {
    fs.watch(CFG.imgSrcFolder, {
      recursive: true,
    }, (eventType, fileName) => {
      // console.log('File changed: ', fileName);
      clearTimeout(watchTimeout);
      watchTimeout = setTimeout(() => {
        processSrcFolder(CFG.imgSrcFolder);
      }, 1000);
    });
  }

  /**
   * @param {Object<string, CloudImageDescriptor>} imgCloudData 
   * @returns {Promise<void>}
   */
  static writeSyncData(imgCloudData) {
    let timeout = 400;
    if (writeFileTimeout) {
      clearTimeout(writeFileTimeout);
    }
    writeFileTimeout = setTimeout(() => {
      checkDir(CFG.syncDataPath);
      fs.writeFileSync(CFG.syncDataPath, JSON.stringify(imgCloudData, null, 2));
    }, timeout);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  }

  /**
   * @param {string[]} selection
   */
  static async fetch(selection) {
    let imgCloudData = getImgCloudData();
    let promises = [];
    selection.forEach(async (imgPath) => {
      if (imgCloudData[imgPath] && !fs.existsSync(imgPath)) {
        try {
          let imgBytes = await (await fetch(fillTpl(CFG.fetchUrlTemplate, {
            UID: imgCloudData[imgPath].cdnId,
            PROJECT: CFG.projectId,
          }), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${CFG.apiKey}`,
            },
          })).arrayBuffer();
          promises.push(new Promise((resolve) => {
            checkDir(imgPath);
            fs.writeFileSync(imgPath, Buffer.from(imgBytes), {
              encoding: 'binary',
            });
            resolve();
          }));
        } catch (error) {
          console.error('Error fetching image: ', imgPath);
        }
      }
    });
    await Promise.all(promises);
  }

  /**
   * @param {string[]} selection
   */
  static async remove(selection) {
    let imgCloudData = getImgCloudData();
    let promises = [];
    selection.forEach((imgPath) => {
      if (imgCloudData[imgPath]) {
        promises.push(new Promise(async (resolve) => {
          try {
            await fetch(fillTpl(CFG.removeUrlTemplate, {
              UID: imgCloudData[imgPath].cdnId,
              PROJECT: CFG.projectId,
            }), {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${CFG.apiKey}`,
              },
            });
            delete imgCloudData[imgPath];
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
            }
            await this.writeSyncData(imgCloudData);
          } catch (error) {
            console.error('Error deleting image: ', imgPath);
          }
          resolve();
        }));
      }
    });
    await Promise.all(promises);
  }

  /**
   * 
   * @param {String} path 
   * @param {String} srcUrl // Base64 encoded image url
   */
  static async saveImage(path, srcUrl) {
    checkDir(path);
    let arrBuffer = await (await (fetch(srcUrl))).arrayBuffer();
    fs.writeFileSync(path, Buffer.from(arrBuffer), {
      encoding: 'binary',
    });
  }

}

export default FolderSync;



