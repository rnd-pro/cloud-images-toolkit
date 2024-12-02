/**
 * 
 * @param {String[]} pathArr
 */
export function sortBySubNumber(pathArr) {
  return pathArr.sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true });
  });
}