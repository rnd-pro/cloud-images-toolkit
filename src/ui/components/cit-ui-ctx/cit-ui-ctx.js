import Symbiote, { css } from '@symbiotejs/symbiote';

export class CitUiCtx extends Symbiote {
  initCallback() {
    let readFrom = this.getAttribute('read-from');
    if (readFrom) {
      this.sub(readFrom, (val) => {
        this.setAttribute('ui-ctx', val);
      });
    }
  }
}

const uxCtxList = [
  'images',
  'ims',
  'json',
  'object-ui',
];

CitUiCtx.rootStyles = css`
cit-ui-ctx {
  display: contents;
  ${uxCtxList.map(ctx => `
    &:not([ui-ctx="${ctx}"]) > [ui-ctx="${ctx}"] {
      display: none;
    }
  `).join('')}
}
`;

CitUiCtx.reg('cit-ui-ctx');