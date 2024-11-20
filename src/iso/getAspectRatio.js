function getCommonD(a, b) {
  return b ? getCommonD(b, a % b) : a;
};

/**
 * 
 * @param {Number} w 
 * @param {Number} h 
 * @returns 
 */
export function getAspectRatio(w, h) {
  let d = getCommonD(w, h);
  return `${w / d}/${h / d}`;
};
