/**
 * 
 * @param {Object} data 
 * @param {String} substr
 * @param {String} [key] 
 * @returns {Object}
 */
export function filterData(data, substr, key = null) {
  return Object.fromEntries(Object.entries(data).filter(([path, item]) => {
    return key ? item[key].includes(substr) : path.includes(substr);
  }));
}
