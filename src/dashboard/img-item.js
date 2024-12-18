import Symbiote, { html, css } from '@symbiotejs/symbiote';
import { CFG } from '../node/CFG.js';

export default class ImgItem extends Symbiote {

  init$ = {
    cdnId: '',
    preview: '',
  }

  renderCallback() {
    this.onclick = () => {
      let selectionSet = new Set(this.$['^selection']);
      if (selectionSet.has(this.$._KEY_)) {
        selectionSet.delete(this.$._KEY_);
      } else {
        selectionSet.add(this.$._KEY_);
      }
      this.$['^selection'] = Array.from(selectionSet);
      this.$['^current'] = this;
    }

    this.ondblclick = () => {
      window.open(CFG.baseUrl + this.$.cdnId + '/' + CFG.variants[CFG.variants.length - 1], '_blank');
    };

    this.sub('^selection', (val) => {
      this.classList.toggle('selected', val.includes(this.$._KEY_));
    });

    this.sub('^current', (val) => {
      if (val === this) {
        this.setAttribute('current', '');
      } else {
        this.removeAttribute('current');
      }
    });

    this.sub('cdnId', (val) => {
      this.$.preview = CFG.baseUrl + val + '/' + CFG.variants[0];
      this.title = this.$._KEY_;
    });
  }
}

ImgItem.rootStyles = css`
  img-item {
    display: block;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.4);
    color: var(--color-2);
    border-radius: 6px;
    padding: 10px;
    content-visibility: auto;
    height: 180px;
    width: 140px;
    contain-intrinsic-size: 140px 180px;
    user-select: none;

    &.selected {
      box-shadow: 0 0 8px 2px inset rgba(0, 200, 255, 0.6);
      background-color: rgba(0, 100, 155, 0.4);
    }

    &[current]:after {
      content: '';
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 10px;
      height: 6px;
      background-color: #0f0;
      border-radius: 3px;
    }

    img {
      height: 120px;
      width: 120px;
      object-fit: contain;
      background-color: var(--img-item-bg);
      border-radius: 2px;
      image-rendering: pixelated;
    }

    [name] {
      font-size: 12px;
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

ImgItem.template = html`
  <img loading="lazy" decoding="async" ${{src: 'preview'}}>
  <div name>{{imageName}}</div>
`;

ImgItem.reg('img-item');