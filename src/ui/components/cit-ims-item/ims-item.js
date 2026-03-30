import Symbiote, { html, css } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';

export default class ImsItem extends Symbiote {

  init$ = {
    imsType: '',
    previewUrl: '',
    hash: '',
  }

  renderCallback() {
    this.onclick = () => {
      let selectionSet = new Set(this.$['^selection']);
      if (selectionSet.has(this.$.hash)) {
        selectionSet.delete(this.$.hash);
      } else {
        selectionSet.add(this.$.hash);
      }
      this.$['^selection'] = Array.from(selectionSet);
      this.$['^current'] = this;
    }

    this.sub('^selection', (val) => {
      this.classList.toggle('selected', val.includes(this.$.hash));
    });

    this.sub('^current', (val) => {
      if (val === this) {
        this.setAttribute('current', '');
      } else {
        this.removeAttribute('current');
      }
    });

    this.sub('imsType', (val) => {
      let icn = 'widgets';
      if (val === 'gallery') icn = 'gallery_thumbnail';
      if (val === 'diff') icn = 'photo_library';
      if (val === 'pano') icn = 'panorama_photosphere';
      if (val === 'spinner') icn = 'motion_play';
      this.$.iconType = icon(icn);
    });
  }
}

ImsItem.rootStyles = css`
  cit-ims-item {
    display: inline-block;
    box-sizing: border-box;
    background-color: rgba(0, 50, 0, 0.4);
    color: var(--color-2);
    border-radius: 6px;
    padding: 10px;
    content-visibility: auto;
    height: 180px;
    width: 140px;
    contain-intrinsic-size: 140px 180px;
    user-select: none;
    position: relative;

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

    .preview-container {
      height: 120px;
      width: 120px;
      background-color: var(--img-item-bg);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
      position: relative;
    }

    .preview-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
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

ImsItem.template = html`
  <div class="preview-container">
    <div ${{'@hidden': 'previewUrl'}}>{{iconType}}</div>
    <img loading="lazy" decoding="async" ${{'@hidden': '!previewUrl', src: 'previewUrl'}}>
  </div>
  <div name>{{hash}}</div>
`;

ImsItem.reg('cit-ims-item');
