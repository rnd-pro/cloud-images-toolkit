import { html } from '@symbiotejs/symbiote';
import { CFG } from '../../../node/CFG.js';
import { icon } from '../../icon.js';
export { BackBtn } from '../cit-back-btn/back-btn.js';

export const CIT_UI_TPL = html`
<link 
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=block" 
  rel="stylesheet" />

<div panel column>
  <button round ${{onclick: 'scrollTop'}}>${icon('arrow_upward')}</button>
  <button round current ${{'@disabled': '!current', onclick: 'scrollToCurrent'}}>${icon('flag')}</button>
  <button round ${{onclick: 'scrollBottom'}}>${icon('arrow_downward')}</button>
  <button round ${{onclick: 'toggleImsExplorer'}} ${{'@current': 'isImsExplorer'}} title="Toggle IMS Widgets">${icon('widgets')}</button>
  <button round ${{onclick: 'onInvertBg'}}>${icon('contrast')}</button>
  <button round warning ${{'@disabled': '!current', onclick: 'clearCurrent'}}>${icon('variable_remove')}</button>
  <button round ${{onclick: 'reloadData'}}>${icon('refresh')}</button>
  <div style="flex-grow: 1;"></div>
  <button round disabled ${{'style.color': 'wsStatusColor', '@title': 'wsStatus'}}>
    <span class="material-symbols-outlined">{{wsStatusIcon}}</span>
  </button>
</div>

<div tiles-wrapper ref="tiles_wrapper" ${{'@hidden': 'isImsExplorer'}}>
  <div loader ${{'@hidden': '!isLoading'}}>
    ${icon('cloud_sync')}
  </div>
  <div empty-state ${{'@hidden': 'hasItems'}}>
    ${icon('photo_library')}
    <div title>No images found</div>
    <div sub>Upload images to the configured local folder to see them here</div>
  </div>
  <div tiles ${{'@hidden': '!hasItems'}}>
    <cit-back-btn></cit-back-btn>
    <div 
      itemize="foldersRenderData" 
      item-tag="cit-folder-item" 
      itemize-container></div>
    <div 
      itemize="filesRenderData" 
      item-tag="cit-img-item" 
      itemize-container></div>
  </div>
</div>

<div tiles-wrapper ref="ims_wrapper" ${{'@hidden': '!isImsExplorer'}}>
  <div empty-state ${{'@hidden': 'hasImsItems'}}>
    ${icon('widgets')}
    <div title>No IMS widgets found</div>
    <div sub>Save widgets from the composer to see them here</div>
  </div>
  <div tiles ${{'@hidden': '!hasImsItems'}}>
    <div 
      itemize="imsRenderData" 
      item-tag="cit-ims-item" 
      itemize-container></div>
  </div>
</div>

<div panel column ${{'@hidden': 'isImsExplorer'}}>

  <div toolbar caption="Filtering & Selection">
    <div controls grow>
      <info-row caption="Filtered: ">{{filteredSize}}</info-row>
      <info-row caption="Selected: ">{{selectionSize}}</info-row>
    </div>
    <input 
      type="text"
      placeholder="Filter by path pattern"
      ${{oninput: 'onFilter', value: 'filterSubstr'}}>
    <input 
      type="text"
      placeholder="Filter by tag"
      ${{oninput: 'onTagFilter', value: 'tagFilterSubstr'}}>
    <div controls>
      <button
        ${{onclick: 'selectAll'}}>
        ${icon('library_add_check')}
        Select all
      </button>
      <button
        ${{onclick: 'deselectAll', disabled: '!hasSelection'}}>
        ${icon('remove_selection')}
        Deselect all
      </button>
      <button
        ${{onclick: 'copySelectionJson', disabled: '!hasSelection'}}>
        ${icon('copy_all')}
        Copy selection JSON
      </button>
    </div>
  </div>

  <div toolbar caption="Sorting" ${{'@disabled': '!hasSelection'}}>
    <div controls>
      <button ${{onclick: 'sortSelectionByNumber'}}>${icon('swap_vert')}Sort logically (numbers)</button>
      <button ${{onclick: 'sortSelectionByAlpha'}}>${icon('sort_by_alpha')}Sort alphabetically</button>
    </div>
  </div>

  <div toolbar caption="Remove & Download" ${{'@disabled': '!hasSelection'}}>
    <div controls>
      <button ${{onclick: 'onRemove'}}>${icon('delete_sweep')}Delete selected</button>
      <button ${{onclick: 'onFetch'}}>${icon('download')}Download remotes</button>
    </div>
  </div>

  <div toolbar caption="Current Image Info" ${{'@disabled': '!current'}}>
    <cit-img-info ref="imgInfo"></cit-img-info>
  </div>

  <div toolbar caption="Images Meta Data" ${{'@disabled': '!hasSelection'}}>
    <input 
      ${{oninput: 'onAltInput'}}
      type="text" 
      placeholder="Description (alt)">
    <input 
      ${{oninput: 'onTagsInput'}}
      type="text" 
      placeholder="Tags (comma-separated)">
    <div controls>
      <button ${{onclick: 'onMetaSave'}}>${icon('save')}Apply for selection</button>
    </div>
  </div>

  <div toolbar caption="CDN Variants" ${{'@disabled': '!current'}}>
    <div controls ${{onclick: 'onVariantClick'}}>
      ${CFG.variants.map((v) => {
        return html`<button variant="${v}">${v}</button>`;
      }).join('')}
    </div>
  </div>

  <div toolbar caption="Embed Code" ${{'@disabled': '!current'}}>
    <pre><code contenteditable="true">{{embedCode}}</code></pre>
    <button ${{onclick: 'onEmbedCopy'}}>${icon('content_copy')}Copy image embed code</button>
  </div>

  <div toolbar caption="IMS Widgets" ${{'@disabled': '!hasSelection'}}>
    <div controls column ${{onclick: 'onImsTypeSelected'}}>
      <button type="gallery">${icon('gallery_thumbnail')}Gallery</button>
      <button type="diff">${icon('photo_library')}Difference</button>
      <button type="pano">${icon('panorama_photosphere')}Spherical panorama</button>
      <button type="spinner">${icon('motion_play')}Spinner animation</button>
    </div>
  </div>


  <div toolbar caption="IMS Widgets Explorer Controls" ${{'@hidden': '!isImsExplorer'}}>
    <div controls column>
      <button ${{onclick: 'onImsEdit', disabled: '!hasSelection'}}>${icon('edit')}Edit Selected Widget</button>
      <button warning ${{onclick: 'onImsDelete', disabled: '!hasSelection'}}>${icon('delete')}Delete Selected</button>
    </div>
  </div>

  <div footer>&copy; ${new Date().getFullYear()} <a href="https://rnd-pro.com">rnd-pro.com</a></div>

  <cit-pop-msg></cit-pop-msg>
  
</div>
<cit-ims-composer></cit-ims-composer>
`;