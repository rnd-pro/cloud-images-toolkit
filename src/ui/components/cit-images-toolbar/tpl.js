import { html } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';
import { CFG } from '../../../node/CFG.js';

export default html`
<div toolbar caption="Filtering & Selection">
  <div controls grow>
    <info-row caption="Filtered: ">{{^filteredSize}}</info-row>
    <info-row caption="Selected: ">{{^selectionSize}}</info-row>
  </div>
  <input 
    type="text"
    placeholder="Filter by path pattern"
    ${{oninput: '^onFilter', value: '^filterSubstr'}}>
  <input 
    type="text"
    placeholder="Filter by tag"
    ${{oninput: '^onTagFilter', value: '^tagFilterSubstr'}}>
  <div controls>
    <button
      ${{onclick: '^selectAll'}}>
      ${icon('library_add_check')}
      Select all
    </button>
    <button
      ${{onclick: '^deselectAll', disabled: '!hasSelection'}}>
      ${icon('remove_selection')}
      Deselect all
    </button>
    <button
      ${{onclick: '^copySelectionJson', disabled: '!hasSelection'}}>
      ${icon('copy_all')}
      Copy selection JSON
    </button>
  </div>
</div>

<div toolbar caption="Sorting" ${{'@disabled': '!hasSelection'}}>
  <div controls>
    <button ${{onclick: '^sortSelectionByNumber'}}>${icon('swap_vert')}Sort logically (numbers)</button>
    <button ${{onclick: '^sortSelectionByAlpha'}}>${icon('sort_by_alpha')}Sort alphabetically</button>
  </div>
</div>

<div toolbar caption="Remove & Download" ${{'@disabled': '!hasSelection'}}>
  <div controls>
    <button ${{onclick: '^onRemove'}}>${icon('delete_sweep')}Delete selected</button>
    <button ${{onclick: '^onFetch'}}>${icon('download')}Download remotes</button>
  </div>
</div>

<div toolbar caption="Current Image Info" ${{'@disabled': '!current'}}>
  <cit-img-info ${{'$.current': 'current'}}></cit-img-info>
</div>

<div toolbar caption="Images Meta Data" ${{'@disabled': '!hasSelection'}}>
  <input 
    ${{oninput: '^onAltInput'}}
    type="text" 
    placeholder="Description (alt)">
  <input 
    ${{oninput: '^onTagsInput'}}
    type="text" 
    placeholder="Tags (comma-separated)">
  <div controls>
    <button ${{onclick: '^onMetaSave'}}>${icon('save')}Apply for selection</button>
  </div>
</div>

<div toolbar caption="CDN Variants" ${{'@disabled': '!current'}}>
  <div controls ${{onclick: '^onVariantClick'}}>
    ${CFG.variants.map((v) => {
      return html`<button variant="${v}">${v}</button>`;
    }).join('')}
  </div>
</div>

<div toolbar caption="Embed Code" ${{'@disabled': '!current'}}>
  <pre><code contenteditable="true">{{^embedCode}}</code></pre>
  <button ${{onclick: '^onEmbedCopy'}}>${icon('content_copy')}Copy image embed code</button>
</div>

<div toolbar caption="IMS Widgets" ${{'@disabled': '!hasSelection'}}>
  <div controls column ${{onclick: '^onImsTypeSelected'}}>
    <button type="gallery">${icon('gallery_thumbnail')}Gallery</button>
    <button type="diff">${icon('photo_library')}Difference</button>
    <button type="pano">${icon('panorama_photosphere')}Spherical panorama</button>
    <button type="spinner">${icon('motion_play')}Spinner animation</button>
  </div>
</div>
`;