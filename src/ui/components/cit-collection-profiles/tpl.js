import { html } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';

export const template = html`
<div popup>
  <div p-header>
    <div p-caption>${icon('layers')} &nbsp;Collections & Profiles</div>
    <button round ${{onclick: 'close'}}>${icon('close')}</button>
  </div>
  <div p-content>
    <div itemize="configs" item-tag="cit-collection-item">
      <template>
        <div>{{name}}</div>
        <x-cfg ${{'$.data': 'cfg', onchange: '^onCfgChange'}} editable></x-cfg>
        <div controls>
          <button ${{onclick: '^applyChanges', '@disabled': '!modified'}} title="Apply Changes">${icon('save')} Apply Changes</button>
          <button accent ${{onclick: '^onActivate'}} title="Activate Profile">${icon('check')} Activate Profile</button>
        </div>
      </template>
    </div>
  </div>
</div>
`;