import Symbiote, { html, css } from '@symbiotejs/symbiote';
import { icon } from './icon.js';

export class PopMsg extends Symbiote {
  init$ = {
    close: () => {
      this.$['^message'] = '';
    }
  }

  renderCallback() {
    this.sub('^message', (msg) => {
      if (msg) {
        this.setAttribute('active', '');
      } else {
        this.removeAttribute('active');
      }
    });
  }
}

PopMsg.rootStyles = css`
  pop-msg {
    display: grid;
    grid-template-columns: 1fr min-content;
    gap: 20px;
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: rgba(0, 255, 200, .6);
    backdrop-filter: blur(3px);
    box-shadow: 0 0 10px rgba(0, 0, 0, .2);
    color: #000;
    padding: 10px;
    border-radius: 10px;
    transition: .3s;
    min-width: 290px;
    z-index: 10000;

    &:not([active]) {
      opacity: 0;
      pointer-events: none;
      transform: translateY(20%);
    }
  }
`;

PopMsg.template = html`
  <div>{{^message}}</div>
  <div>
    <button round message ${{onclick: 'close'}}>${icon('close')}</button>
  </div>
`;

PopMsg.reg('pop-msg');