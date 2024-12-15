import Symbiote, { html, css } from '@symbiotejs/symbiote';

export class FolderItem extends Symbiote {

  onClick = () => {
    this.classList.toggle('selected');
    this.$.content.forEach((key) => {
      let sel = this.$['^selection'];
      if (this.classList.contains('selected')) {
        sel.push(key);
      } else {
        sel = sel.filter((k) => k !== key);
      }
      this.$['^selection'] = sel;
    });
  }

  onDblClick = () => {
    this.$['^filterSubstr'] = this.$._KEY_;
  }

  renderCallback() {
    this.addEventListener('click', this.onClick);
    this.addEventListener('dblclick', this.onDblClick);
    
    this.sub('^selection', (/** @type {Array<string>} */ val) => {
      if (!val.length) {
        this.classList.remove('selected');
      }
    });
  }

  destroyCallback() {
    this.removeEventListener('dblclick', this.onDblClick);
    this.removeEventListener('click', this.onClick);
  }
}

FolderItem.rootStyles = css`
folder-item {
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

  [folder] {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    width: 120px;
    background-color: rgb(190 166 0);
    border-radius: 6px;

    &:before {
      content: '';
      position: absolute;
      top: 10px;  
      left: 1px;
      right: 0px;
      bottom: 10px;
      background-color: #fff;
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
      transform: skewX(-2deg);
      transform-origin: bottom left;
    }

    &:after {
      content: '';
      position: absolute;
      top: 20px;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgb(190 166 0);
      box-shadow: 0 0 16px rgba(0, 0, 0, 0.4);
      border-radius: 6px;
      transform: skewX(-5deg);
      transform-origin: bottom left;
    }
  }

  [size] {
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 100%;
    height: 50px;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(5px, 10px) skewX(-5deg);
    z-index: 100;
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

FolderItem.template = html`
<div folder>
  <div size>{{size}}</div>
</div>
<div name>{{_KEY_}}</div>
`;

FolderItem.reg('folder-item');

export default FolderItem;