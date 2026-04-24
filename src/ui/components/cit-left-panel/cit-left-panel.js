import Symbiote, { html, css } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';

export class CitLeftPanel extends Symbiote {
  curr = null;

  selectProfilePopup() {
    this.$['APP/collectionProfilesActive'] = true;
  }

  renderCallback() {
    this.sub('^current', (val) => {
      this.$.curr = val;
    });
  }
}

CitLeftPanel.rootStyles = css`
cit-left-panel {
  display: contents;
  img {
    margin-bottom: var(--gap-mid);
    background-color: rgba(255, 254, 175, 1);
    border-radius: 3px;
    padding: 2px;
    cursor: pointer;
    transition: background-color .3s;
    &:hover {
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
}
`;

CitLeftPanel.template = html`
<img 
  src="https://rnd-pro.com/svg/cit/index.svg"
  ${{onclick: 'selectProfilePopup'}}
  title="Select Collection Profile"
  width="32" height="32">

<button round 
  ${{onclick: '^scrollTop'}} 
  title="Scroll to Top">${icon('arrow_upward')}</button>
<button round current 
  ${{'@disabled': '!curr', onclick: '^scrollToCurrent'}} 
  title="Go to Current Item">${icon('flag')}</button>
<button round 
  ${{onclick: '^scrollBottom'}} 
  title="Scroll to Bottom">${icon('arrow_downward')}</button>
<button round invert-bg 
  ${{onclick: '^onInvertBg'}} 
  title="Invert Tile Background">${icon('contrast')}</button>
<button round warning 
  ${{'@disabled': '!curr', onclick: '^clearCurrent'}} 
  title="Clear Current Item">${icon('variable_remove')}</button>
<button round 
  ${{onclick: '^reloadData'}} 
  title="Reload Data">${icon('refresh')}</button>
<div style="flex-grow: 1;"></div>
<button round disabled 
  ${{'style.color': '^wsStatusColor', '@title': '^wsStatus'}}>
  <span class="material-symbols-outlined">{{^wsStatusIcon}}</span>
</button>
`;

CitLeftPanel.reg('cit-left-panel');