/**
 * @param {string} name
 * @param {boolean} [right=false]
 * @returns {string}
 */
export function icon(name, right = false) {
  return right
    ? /*html*/ `<span class="material-symbols-outlined" right-icon>${name}</span>`
    : /*html*/ `<span class="material-symbols-outlined">${name}</span>`;
}
