import Symbiote, { css } from '@symbiotejs/symbiote';

export class CitTabs extends Symbiote {

  renderCallback() {
    let writeTo = this.getAttribute('write-to');
    this.tabEls = [...this.querySelectorAll('[tab]')];
    this.tabEls.forEach((/** @type {HTMLElement} */ el) => {
      el.onclick = () => {
        if (writeTo) {
          this.$[writeTo] = el.getAttribute('tab');
        }
      };
    });
    this.sub(writeTo, (val) => {
      this.tabEls.forEach((/** @type {HTMLElement} */ el) => {
        if (el.getAttribute('tab') === val) {
          el.setAttribute('current', '');
        } else {
          el.removeAttribute('current');
        }
      });
    });
  }

}

CitTabs.rootStyles = css`
cit-tabs {
  display: flex;
  gap: var(--gap-min);
  background-color: rgba(0, 0, 0, .2);
  border-bottom: 2px solid rgba(0, 0, 0, .3);
  margin-bottom: var(--gap-mid);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  padding-top: 2px;
  padding-left: 4px;
  padding-right: 4px;
  padding-bottom: 0;

  button {
    background-color: rgba(255, 255, 255, .1);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    transform: translateY(2px);
    border-bottom: 2px solid transparent;

    &[current] {
      border-bottom: 2px solid var(--tab-color, #fff);
      pointer-events: none;
    }
  }
}
`;

CitTabs.reg('cit-tabs');