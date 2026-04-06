import fs from 'fs';
import CFG from './CFG.js';
import { checkDir } from './FolderSync.js';

let watchTimeout;

export class ImsSync {

  static getList() {
    let result = {};
    if (!CFG.imsDataFolder || !fs.existsSync(CFG.imsDataFolder)) {
      return result;
    }
    
    let files = fs.readdirSync(CFG.imsDataFolder);
    files.forEach(file => {
      const fullPath = `${CFG.imsDataFolder}/${file}`.replaceAll('//', '/');
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

  static start(onUpdateCallback) {
    if (!CFG.imsDataFolder) return;
    if (!fs.existsSync(CFG.imsDataFolder)) {
      checkDir(CFG.imsDataFolder + '/tmp.json'); // small trick to create dir
    }

    fs.watch(CFG.imsDataFolder, {
      recursive: false,
    }, (eventType, fileName) => {
      if (fileName && fileName.endsWith('.json')) {
        clearTimeout(watchTimeout);
        watchTimeout = setTimeout(() => {
          if (onUpdateCallback) onUpdateCallback();
        }, 300);
      }
    });
  }

  static save(hash, data) {
    if (!CFG.imsDataFolder) return;
    checkDir(CFG.imsDataFolder + '/tmp.json');
    let path = `${CFG.imsDataFolder}/${hash}.json`.replaceAll('//', '/');
    let jsonStr = CFG.imsDataMinify === false ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    fs.writeFileSync(path, jsonStr);
  }

  static delete(hash) {
    if (!CFG.imsDataFolder || !fs.existsSync(CFG.imsDataFolder)) return;
    let files = fs.readdirSync(CFG.imsDataFolder);
    files.forEach(file => {
      if (file.startsWith(hash) && file.endsWith('.json')) {
        let fullPath = `${CFG.imsDataFolder}/${file}`.replaceAll('//', '/');
        fs.unlinkSync(fullPath);
      }
    });
  }

}

export default ImsSync;
