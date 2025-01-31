/**
 * 
 * @param {String[]} arr 
 * @returns 
 */
export function getVariantsNum(arr) {
  return arr.filter((variant) => {
    return !Number.isNaN(parseInt(variant));
  }).map((variant) => {
    return parseInt(variant);
  }).sort((a, b) => {
    return a - b;
  });
}