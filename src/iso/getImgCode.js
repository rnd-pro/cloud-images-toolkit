
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
 
  breakpoints = breakpoints.filter((bp) => {    
    return !isNaN(parseInt(bp));
  });

  let srcset = breakpoints.map((bp) => {
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