import Symbiote, { html, css} from '@symbiotejs/symbiote';
import { icon } from './icon.js';

export class ImsPreview extends Symbiote {
  init$ = {
    close: () => {
      this.$['^imsActive'] = false;
    },
  }

  renderCallback() {
    this.sub('^imsActive', (val) => {
      if (val) {
        this.setAttribute('active', '');
      } else {
        this.removeAttribute('active');
      }
    });
    
  }
}

ImsPreview.rootStyles = css`
  ims-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, .2);
    backdrop-filter: blur(6px);
    transition: opacity .3s;
    padding: 20px;

    &:not([active]) {
      opacity: 0;
      pointer-events: none;
    }

    [popup] {
      display: grid;
      grid-template-rows: min-content auto;
      height: 100%;
      width: 100%;
      max-height: 480px;
      max-width: 640px;
      background-color: var(--color-1);
      border-radius: 6px;
      box-shadow: 0 0 12px rgba(0, 0, 0, .4);
      overflow: hidden;

      [p-header] {
        display: flex;
        justify-content: space-between;
        padding: 6px;

        [p-caption] {
          height: 100%;
          display: flex;
          align-items: center;
          padding-left: 10px;
        }
      }

      [p-content] {
        background-color: rgba(255, 255, 255, .1);
        padding: 10px;
      }
    }
  }
`;

ImsPreview.template = html`
<div popup>
  <div p-header>
    <div p-caption>IMS Preview</div>
    <button round ${{onclick: 'close'}}>${icon('close')}</button>
  </div>
  <div p-content>
    IMS
  </div>
</div>
`;

ImsPreview.reg('ims-preview');