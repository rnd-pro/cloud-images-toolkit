import fs from 'fs';
import CFG from './CFG.js';
import { checkDir } from './FolderSync.js';

let watchTimeout;

export class ImsSync {

  static getList() {
    let result = {};
    if (!fs.existsSync(CFG.imsFolder)) {
      return result;
    }
    
    let files = fs.readdirSync(CFG.imsFolder);
    files.forEach(file => {
      const fullPath = `${CFG.imsFolder}/${file}`.replaceAll('//', '/');
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
    if (!fs.existsSync(CFG.imsFolder)) {
      checkDir(CFG.imsFolder + '/tmp.json'); // small trick to create dir
    }

    fs.watch(CFG.imsFolder, {
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
    checkDir(CFG.imsFolder + '/tmp.json');
    let path = `${CFG.imsFolder}/${hash}.json`.replaceAll('//', '/');
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }

  static delete(hash) {
    let files = fs.readdirSync(CFG.imsFolder);
    files.forEach(file => {
      if (file.startsWith(hash) && file.endsWith('.json')) {
        let fullPath = `${CFG.imsFolder}/${file}`.replaceAll('//', '/');
        fs.unlinkSync(fullPath);
      }
    });
  }

}

export default ImsSync;
