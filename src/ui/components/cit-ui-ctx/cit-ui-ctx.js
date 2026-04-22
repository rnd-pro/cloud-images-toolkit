import Symbiote, { css } from '@symbiotejs/symbiote';

export class CitUiCtx extends Symbiote {

  activate() {
    let readFrom = this.getAttribute('read-from');
    let ctxEls = [...this.querySelectorAll('[ui-ctx]')];
    if (readFrom) {
      this.sub(readFrom, (val) => {
        ctxEls.forEach(el => {
          el.removeAttribute('active');
          if (el.getAttribute('ui-ctx') === val) {
            el.setAttribute('active', '');
          }
        });
      });
    }
  }

  renderCallback() {
    queueMicrotask(() => {
      this.activate();
    });
  }

}

CitUiCtx.rootStyles = css`
cit-ui-ctx {
  display: contents;
  [ui-ctx] {
    display: none;
    &[active] {
      display: contents;
    }
  }
}
`;

CitUiCtx.reg('cit-ui-ctx');