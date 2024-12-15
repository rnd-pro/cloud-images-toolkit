/**
 * 
 * @param {Object<string, CloudImageDescriptor>} data 
 * @param {string} srcFolder 
 * @param {string} filter 
 * @returns 
 */
export function getFilesAndFolders(data, srcFolder = '', filter = '') {
  /** @type {Object<string, CloudImageDescriptor>} */
  let files = {};
  /** @type {Object<string, {size: number, content: string[]}>} */
  let folders = {};

  for (let key in data) {
    let fileKey = key.replace(srcFolder, '');
    if (fileKey.includes(filter)) {
      let itemPath = filter ? fileKey.split(filter)[1] : fileKey;
      if (itemPath.startsWith('/')) {
        itemPath = itemPath.slice(1);
      }
      let folder = itemPath.includes('/') ? itemPath.split('/')[0] : null;
      if (folder) {
        if (!folders[folder]) { 
          folders[folder] = {
            size: 1,
            content: [key],
          };
        } else {
          folders[folder].size++;
          folders[folder].content.push(key);
        }
      } else {
        files[key] = data[key];
      } 
    }
  } 

  return {
    files,
    folders,
  };
}