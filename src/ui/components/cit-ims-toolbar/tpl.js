import { html } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';

export default html`
<div toolbar caption="IMS Widgets Explorer Controls">
  <div controls column>
    <button ${{onclick: '^onImsEdit', disabled: '!hasSelection'}}>${icon('edit')}Edit Selected Widget</button>
    <button warning ${{onclick: '^onImsDelete', disabled: '!hasSelection'}}>${icon('delete')}Delete Selected</button>
  </div>
</div>
`;