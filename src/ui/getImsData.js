/**
 * @param {number} [collectionIndex=0]
 */
export async function getImsData(collectionIndex = 0) {
  let response = await fetch(`./ims-data/${collectionIndex}.json`);
  return await response.json();
}
