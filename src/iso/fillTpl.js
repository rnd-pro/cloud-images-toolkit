/**
 * 
 * @param {String} template 
 * @param {Object<string, string | number>} data
 * @returns 
 */
export function fillTpl(template, data) {
  let result = template;
  Object.keys(data).forEach((key) => {
    result = result.replaceAll(`{${key}}`, data[key].toString());
  });
  return result;
};