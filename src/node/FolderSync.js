import fs from 'fs';
import { configs, connectors } from './CFG.js';
import { getAspectRatio } from '../iso/getAspectRatio.js';
import imageSize from 'image-size';
import { fillTpl } from '../iso/fillTpl.js';

const DEFAULT_IMG_TYPES = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];

/**
 * @param {CITConfig} cfg
 * @returns {string[]}
 */
function getImgTypes(cfg) {
  return cfg.imgTypes?.length ? cfg.imgTypes : DEFAULT_IMG_TYPES;
}

/**
 * @param {string} syncDataPath
 * @returns {Object<string, CloudImageDescriptor>}
 */
function getImgCloudData(syncDataPath) {
  /** @type {Object<string, CloudImageDescriptor>} */
  let imgCloudData = {};
  if (fs.existsSync(syncDataPath)) {
    imgCloudData = JSON.parse(fs.readFileSync(syncDataPath).toString());
  }
  return imgCloudData;
}

export function checkDir(fullPath) {
  let dirPath = fullPath.split('/').slice(0, -1).join('/');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * @param {string} initFolderPath
 * @param {string[]} imgTypes
 * @returns {string[]}
 */
function findAllImages(initFolderPath, imgTypes) {
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

/**
 * @param {number} ms 
 * @returns {Promise<void>}
 */
let waitFor = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * @param {string} folderPath
 * @param {CITConfig} cfg
 * @param {CdnConnector | null} connector
 * @param {{ retries: number }} state
 */
async function processSrcFolder(folderPath, cfg, connector, state) {
  let imgCloudData = getImgCloudData(cfg.syncDataPath);
  let images = findAllImages(folderPath, getImgTypes(cfg));
  let hasErrors = false;

  for (let imgPath of images) {
    if (imgCloudData[imgPath]) {
      continue;
    }
    console.log(`[${cfg.name}] Uploading image: `, imgPath);

    try {
      let imgBytes = fs.readFileSync(imgPath);
      let imgDimensions = imageSize(new Uint8Array(imgBytes));
      let fileName = imgPath.split('/').pop();

      /** @type {CdnUploadResult} */
      let uploadResult;

      if (connector) {
        uploadResult = await connector.upload(imgBytes, fileName, cfg);
      } else {
        let formData = new FormData();
        formData.append('file', new File([imgBytes], fileName));
        formData.append('metadata', JSON.stringify({ localPath: imgPath }));
        let uploadUrl = fillTpl(cfg.uploadUrlTemplate, {
          PROJECT: cfg.projectId,
        });
        let response = await (await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.apiKey}`,
          },
          body: formData,
        })).json();
        uploadResult = {
          cdnId: response.result.id,
          uploadDate: response.result.uploaded,
        };
      }

      /** @type {CloudImageDescriptor} */
      let imgDesc = {
        cdnId: uploadResult.cdnId,
        uploadDate: uploadResult.uploadDate,
        imageName: fileName,
        alt: '',
        tags: [],
        width: imgDimensions.width.toString(),
        height: imgDimensions.height.toString(),
        aspectRatio: getAspectRatio(imgDimensions.width, imgDimensions.height),
        srcFormat: imgPath.split('.').pop().toUpperCase(),
      };
      imgCloudData[imgPath] = imgDesc;
      checkDir(cfg.syncDataPath);
      fs.writeFileSync(cfg.syncDataPath, JSON.stringify(imgCloudData, null, 2));
    } catch (error) {
      console.error(`[${cfg.name}] Error uploading image "${imgPath}":`, error.message || error);
      hasErrors = true;
    }
  }

  if (hasErrors && state.retries > 0) {
    state.retries--;
    await waitFor(2000);
    await processSrcFolder(folderPath, cfg, connector, state);
  } else {
    state.retries = 3;
    console.log(`[${cfg.name}] ${hasErrors ? 'Uploading finished with errors' : 'Uploading finished successfully'}`);
  }
}

export class FolderSync {

  /**
   * Starts folder sync for all configured collections.
   */
  static startAll() {
    for (let i = 0; i < configs.length; i++) {
      let cfg = configs[i];
      let connector = connectors[i];
      let state = { retries: 3 };

      processSrcFolder(cfg.imgSrcFolder, cfg, connector, state);

      fs.watch(cfg.imgSrcFolder, {
        recursive: true,
      }, () => {
        clearTimeout(state._watchTimeout);
        state._watchTimeout = setTimeout(() => {
          state.retries = 3;
          processSrcFolder(cfg.imgSrcFolder, cfg, connector, state);
        }, 1000);
      });
    }
  }

  /** @deprecated Use startAll() */
  static start() {
    FolderSync.startAll();
  }

  /**
   * @param {string} syncDataPath
   * @param {Object<string, CloudImageDescriptor>} imgCloudData 
   * @returns {Promise<void>}
   */
  static writeSyncData(syncDataPath, imgCloudData) {
    return new Promise((resolve, reject) => {
      try {
        checkDir(syncDataPath);
        fs.writeFileSync(syncDataPath, JSON.stringify(imgCloudData, null, 2));
        resolve();
      } catch (error) {
        console.error('Error writing sync data:', error.message || error);
        reject(error);
      }
    });
  }

  /**
   * @param {string[]} selection
   * @param {number} [collectionIndex=0]
   */
  static async fetch(selection, collectionIndex = 0) {
    let cfg = configs[collectionIndex];
    let connector = connectors[collectionIndex];
    let imgCloudData = getImgCloudData(cfg.syncDataPath);
    let promises = [];
    for (let imgPath of selection) {
      if (imgCloudData[imgPath] && !fs.existsSync(imgPath)) {
        let p = (async () => {
          try {
            /** @type {ArrayBuffer} */
            let imgBytes;
            if (connector) {
              imgBytes = await connector.fetchBlob(imgCloudData[imgPath].cdnId, cfg);
            } else {
              imgBytes = await (await fetch(fillTpl(cfg.fetchUrlTemplate, {
                UID: imgCloudData[imgPath].cdnId,
                PROJECT: cfg.projectId,
              }), {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${cfg.apiKey}`,
                },
              })).arrayBuffer();
            }
            checkDir(imgPath);
            fs.writeFileSync(imgPath, Buffer.from(imgBytes), {
              encoding: 'binary',
            });
          } catch (error) {
            console.error(`[${cfg.name}] Error fetching image "${imgPath}":`, error.message || error);
          }
        })();
        promises.push(p);
      }
    }
    await Promise.all(promises);
  }

  /**
   * @param {string[]} selection
   * @param {number} [collectionIndex=0]
   */
  static async remove(selection, collectionIndex = 0) {
    let cfg = configs[collectionIndex];
    let connector = connectors[collectionIndex];
    let imgCloudData = getImgCloudData(cfg.syncDataPath);
    let promises = [];
    for (let imgPath of selection) {
      if (imgCloudData[imgPath]) {
        let p = (async () => {
          try {
            if (connector) {
              await connector.remove(imgCloudData[imgPath].cdnId, cfg);
            } else {
              await fetch(fillTpl(cfg.removeUrlTemplate, {
                UID: imgCloudData[imgPath].cdnId,
                PROJECT: cfg.projectId,
              }), {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${cfg.apiKey}`,
                },
              });
            }
            delete imgCloudData[imgPath];
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
            }
            await FolderSync.writeSyncData(cfg.syncDataPath, imgCloudData);
          } catch (error) {
            console.error(`[${cfg.name}] Error deleting image "${imgPath}":`, error.message || error);
          }
        })();
        promises.push(p);
      }
    }
    await Promise.all(promises);
  }

  /**
   * @param {String} path 
   * @param {String} srcUrl
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
