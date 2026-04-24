import { html } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';

export const template = html`
<div popup>
  <div p-header>
    <div p-caption>${icon('settings')} &nbsp;Collections & Profiles</div>
    <button round ${{onclick: 'close'}}>${icon('close')}</button>
  </div>
  <div p-content>
    <div itemize="configs" item-tag="cit-collection-item">
      <template>
        <div controls>
          <button ${{onclick: '^toggleUnfold'}} title="Edit">{{name}} ${icon('keyboard_arrow_down', true)}</button>
          <div>
            <button ${{onclick: '^applyChanges', '@disabled': '!modified'}} title="Save Changes">${icon('save')} Save Changes</button>
            <button accent ${{onclick: '^onActivate'}} title="Activate Profile">${icon('check')} Set Profile</button>
          </div>
        </div>
        <x-cfg ${{'$.data': 'cfg', onchange: '^onCfgChange'}} editable></x-cfg>
      </template>
    </div>
  </div>
</div>
`;