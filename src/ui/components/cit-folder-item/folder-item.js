import Symbiote, { html } from '@symbiotejs/symbiote';
import styles from './css.js';

export class FolderItem extends Symbiote {

  onClick = () => {
    this.classList.toggle('selected');
    let sel = this.$['^selection'];
    this.$.content.forEach((key) => {
      if (this.classList.contains('selected')) {
        sel.push(key);
      } else {
        sel = sel.filter((k) => k !== key);
      }
    });
    this.$['^selection'] = sel;
  }

  onDblClick = () => {
    this.$['^folderHistory'] = [...this.$['^folderHistory'], this.$._KEY_];
    this.$['^filterSubstr'] = this.$['^folderHistory'].join('/') + '/';
    this.$['^scrollTop']();
  }

  renderCallback() {
    this.addEventListener('click', this.onClick);
    this.addEventListener('dblclick', this.onDblClick);
    
    this.sub('^selection', (/** @type {Array<string>} */ val) => {
      if (!val.length) {
        this.classList.remove('selected');
      } else if (this.$['^selection'].includes(this.$.content[0])) {
        this.classList.add('selected');
      }
    });
  }

  destroyCallback() {
    this.removeEventListener('dblclick', this.onDblClick);
    this.removeEventListener('click', this.onClick);
  }
}

FolderItem.rootStyles = styles;

FolderItem.template = html`
<div folder>
  <div size>{{size}}</div>
</div>
<div name>{{_KEY_}}</div>
`;

FolderItem.reg('cit-folder-item');

export default FolderItem;