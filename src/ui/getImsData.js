export async function getImsData() {
  let response = await fetch('./ims-data.json');
  return await response.json();
}
