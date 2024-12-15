import { CFG } from '../node/CFG.js';

/**
 * @returns {Promise<Object<string, CloudImageDescriptor>>}
 */
export async function getCloudImagesData() {
  try { 
    return await (await window.fetch(CFG.syncDataPath)).json();
  } catch(err) {
    console.warn('CIT: No cloud images data found');
    return {};
  }
}