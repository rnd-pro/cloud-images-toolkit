import Symbiote, { css } from '@symbiotejs/symbiote';
import tpl from './tpl.js';

export class CitImagesToolbar extends Symbiote {

  init$ = {
    current: null,
    hasSelection: false,
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('ui-ctx', 'ims');
  }
}

CitImagesToolbar.rootStyles = css`
cit-ims-toolbar {
  display: contents;
}
`;
CitImagesToolbar.template = tpl;
CitImagesToolbar.reg('cit-ims-toolbar');