/**
 * @param {number} [collectionIndex=0]
 * @returns {Promise<Object<string, CloudImageDescriptor>>}
 */
export async function getCloudImagesData(collectionIndex = 0) {
  try { 
    return await (await window.fetch(`./sync-data/${collectionIndex}.json`)).json();
  } catch(err) {
    console.warn('CIT: No cloud images data found');
    return {};
  }
}