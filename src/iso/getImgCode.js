
/**
 * 
 * @param {String} id 
 * @param {String} [alt] 
 * @param {String[] | Number[]} [breakpoints] 
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
 
  let srcset = breakpoints.filter((bp) => {
    return typeof bp === 'number' || !isNaN(parseInt(bp));
  }).map((bp) => {
    return `https://rnd-pro.com/idn/${id}/${bp} ${bp}w`;
  }).join(', ');

  let sizes = breakpoints.map((bp) => {
    return `(max-width: ${bp}px) ${bp}px`;
  }).join(', ');

  return /*html*/ `<img 
  loading="lazy"
  decoding="async"
  src="https://rnd-pro.com/idn/${id}/max" 
  srcset="${srcset}" 
  sizes="${sizes}" 
  alt="${alt}" />`;
};

export default getImgCode;