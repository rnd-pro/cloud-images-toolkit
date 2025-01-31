import { CFG } from '../node/CFG.js';
import { fillTpl } from './fillTpl.js';
import { getVariantsNum } from './getVariantsNum.js';

/**
 * 
 * @param {String} id 
 * @param {String} [alt] 
 * @param {String[]} [breakpoints]
 * @returns {String}
 */
export function getImgCode(id, breakpoints = [
  '320',
  '640',
  '860',
  '1024',
  '1200',
  '1600',
  '2048',
], alt = '') {
 
  let bpArr = getVariantsNum(breakpoints);

  let srcset = bpArr.map((bp) => {
    return `${fillTpl(CFG.imgUrlTemplate, {
      UID: id,
      VARIANT: bp,
    })} ${bp}w`;
  }).join(', ');

  let sizes = breakpoints.map((bp) => {
    return `(max-width: ${bp}px) ${bp}px`;
  }).join(', ');

  let maxSize = breakpoints[breakpoints.length - 1];

  return /*html*/ `<img 
  loading="lazy"
  decoding="async"
  src="${fillTpl(CFG.imgUrlTemplate, {
    UID: id,
    VARIANT: maxSize,
  })}"
  srcset="${srcset}" 
  sizes="${sizes}"
  alt="${alt}" />`;
};

export default getImgCode;