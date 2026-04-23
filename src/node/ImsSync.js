import fs from 'fs';
import { configs } from './CFG.js';
import { checkDir } from './FolderSync.js';

/** @type {Record<string, ReturnType<typeof setTimeout>>} */
let watchTimeouts = {};

export class ImsSync {

  /**
   * @param {number} [collectionIndex=0]
   * @returns {Object<string, any>}
   */
  static getList(collectionIndex = 0) {
    let cfg = configs[collectionIndex];
    let result = {};
    if (!cfg?.imsDataFolder || !fs.existsSync(cfg.imsDataFolder)) {
      return result;
    }
    
    let files = fs.readdirSync(cfg.imsDataFolder);
    files.forEach(file => {
      const fullPath = `${cfg.imsDataFolder}/${file}`.replaceAll('//', '/');
      const stat = fs.lstatSync(fullPath);
      
      if (stat.isFile() && file.endsWith('.json')) {
        try {
          let content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          let hash = file.replace('.json', '');
          result[hash] = content;
        } catch (e) {
          console.error(`Error parsing IMS json ${fullPath}: `, e.message);
        }
      }
    });

    return result;
  }

  /**
   * Starts IMS watchers for all collections.
   * Deduplicates shared folders to avoid double-watching.
   * @param {Function} onUpdateCallback
   */
  static startAll(onUpdateCallback) {
    /** @type {Set<string>} */
    let watchedFolders = new Set();

    for (let cfg of configs) {
      if (!cfg.imsDataFolder) continue;

      if (!fs.existsSync(cfg.imsDataFolder)) {
        checkDir(cfg.imsDataFolder + '/tmp.json');
      }

      let folder = cfg.imsDataFolder;
      if (watchedFolders.has(folder)) continue;
      watchedFolders.add(folder);

      fs.watch(folder, {
        recursive: false,
      }, (eventType, fileName) => {
        if (fileName && fileName.endsWith('.json')) {
          clearTimeout(watchTimeouts[folder]);
          watchTimeouts[folder] = setTimeout(() => {
            if (onUpdateCallback) onUpdateCallback();
          }, 300);
        }
      });
    }
  }

  /** @deprecated Use startAll() */
  static start(onUpdateCallback) {
    ImsSync.startAll(onUpdateCallback);
  }

  /**
   * @param {string} hash
   * @param {any} data
   * @param {number} [collectionIndex=0]
   */
  static save(hash, data, collectionIndex = 0) {
    let cfg = configs[collectionIndex];
    if (!cfg?.imsDataFolder) return;
    checkDir(cfg.imsDataFolder + '/tmp.json');
    let path = `${cfg.imsDataFolder}/${hash}.json`.replaceAll('//', '/');
    let jsonStr = cfg.imsDataMinify === false ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    fs.writeFileSync(path, jsonStr);
  }

  /**
   * @param {string} hash
   * @param {number} [collectionIndex=0]
   */
  static delete(hash, collectionIndex = 0) {
    let cfg = configs[collectionIndex];
    if (!cfg?.imsDataFolder || !fs.existsSync(cfg.imsDataFolder)) return;
    let files = fs.readdirSync(cfg.imsDataFolder);
    files.forEach(file => {
      if (file.startsWith(hash) && file.endsWith('.json')) {
        let fullPath = `${cfg.imsDataFolder}/${file}`.replaceAll('//', '/');
        fs.unlinkSync(fullPath);
      }
    });
  }

}

export default ImsSync;
