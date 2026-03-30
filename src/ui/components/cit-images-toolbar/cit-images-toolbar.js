import Symbiote, { css } from '@symbiotejs/symbiote';
import tpl from './tpl.js';

export class CitImagesToolbar extends Symbiote {

  init$ = {
    current: null,
    hasSelection: false,
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('ui-ctx', 'images');
  }
}

CitImagesToolbar.rootStyles = css`
cit-images-toolbar {
  display: contents;
}
`;
CitImagesToolbar.template = tpl;
CitImagesToolbar.reg('cit-images-toolbar');