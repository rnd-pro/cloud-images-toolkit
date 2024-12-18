import fs from 'fs';
import CFG from './CFG.js';
import { getAspectRatio } from '../iso/getAspectRatio.js';
import imageSize from 'image-size';

const imgTypes = CFG.imgTypes.length ? CFG.imgTypes : [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'svg',
];

function getImgCloudData() {
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
  
  let wait = (ms) => {
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
        const response = await (await fetch(CFG.apiUrl, {
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
        console.error('Error uploading image: ', error);
        hasErrors = true;
      }

      if (idx === images.length - 1) {
        if (hasErrors && retries > 0) {
          retries--;
          await wait(2000);
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

  static writeSyncData() {
    let imgCloudData = getImgCloudData();
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
          let imgBytes = await (await fetch(CFG.apiUrl + '/' + imgCloudData[imgPath].cdnId + '/blob', {
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
          console.error('Error fetching image: ', error);
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
            await fetch(CFG.apiUrl + '/' + imgCloudData[imgPath].cdnId, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${CFG.apiKey}`,
              },
            });
            delete imgCloudData[imgPath];
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
            }
            await this.writeSyncData();
          } catch (error) {
            console.error('Error deleting image: ', error);
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



