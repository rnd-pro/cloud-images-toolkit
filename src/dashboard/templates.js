import { html } from '@symbiotejs/symbiote';
import { icon } from './icon.js';
import { CFG } from '../node/CFG.js';
export { BackBtn } from './back-btn.js';

export const CIT_UI_TPL = html`
<link 
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=block" 
  rel="stylesheet" />

<div panel column>
  <button round ${{onclick: 'scrollTop'}}>${icon('arrow_upward')}</button>
  <button round current ${{'@disabled': '!current', onclick: 'scrollToCurrent'}}>${icon('flag')}</button>
  <button round ${{onclick: 'scrollBottom'}}>${icon('arrow_downward')}</button>
  <button round ${{onclick: 'onInvertBg'}}>${icon('contrast')}</button>
  <button round warning ${{'@disabled': '!current', onclick: 'clearCurrent'}}>${icon('variable_remove')}</button>
  <button round ${{onclick: 'reloadData'}}>${icon('refresh')}</button>
</div>

<div tiles-wrapper>
  <div tiles ref="tiles">
  <back-btn></back-btn>
    <div 
      itemize="foldersRenderData" 
      item-tag="folder-item" 
      itemize-container></div>
    <div 
      itemize="filesRenderData" 
      item-tag="img-item" 
      itemize-container></div>
  </div>
</div>

<div panel column>

  <div toolbar caption="Filtering & Selection">
    <div controls grow>
      <info-row caption="Filtered: ">{{filteredSize}}</info-row>
      <info-row caption="Selected: ">{{selectionSize}}</info-row>
    </div>
    <input 
      type="text"
      placeholder="Filter by path pattern"
      ${{oninput: 'onFilter', value: 'filterSubstr'}}>
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

  <!--<div toolbar caption="Sorting">
    <div controls>
      <button>${icon('swap_vert')}Sort by substring</button>
      <button>${icon('sort_by_alpha')}Sort by field</button>
    </div>
  </div>-->

  <div toolbar caption="Remove & Download" ${{'@disabled': '!hasSelection'}}>
    <div controls>
      <button ${{onclick: 'onRemove'}}>${icon('delete_sweep')}Delete selected</button>
      <button ${{onclick: 'onFetch'}}>${icon('download')}Download remotes</button>
    </div>
  </div>

  <div toolbar caption="Current Image Info" ${{'@disabled': '!current'}}>
    <img-info ref="imgInfo"></img-info>
  </div>

  <div toolbar caption="Images Description" ${{'@disabled': '!hasSelection'}}>
    <input 
      ${{oninput: 'onAltInput'}}
      type="text" 
      placeholder="Description (alt)">
    <div controls>
      <!--<button>${icon('auto_awesome')}Generate with AI</button>-->
      <button ${{onclick: 'onAltSave'}}>${icon('save')}Apply for selection</button>
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

  <!--<div toolbar caption="Extract data" ${{'@disabled': '!hasSelection'}}>
    <button>${icon('data_object')}Extract JSON data</button>
  </div>-->

  <div footer>&copy; ${new Date().getFullYear()} <a href="https://rnd-pro.com">rnd-pro.com</a></div>

  <pop-msg></pop-msg>
  
</div>
<ims-composer></ims-composer>
`;

export const IMS_COMPOSER_TPL = html`
<div popup>
  <div p-header>
    <div p-caption>${icon('tune')} &nbsp;IMS Composer</div>
    <button round ${{onclick: 'close'}}>${icon('close')}</button>
  </div>
  <div p-content>
    <div layout>
      <div column>
        <ims-viewer ${{'@src-data': 'imsDataUrl'}}></ims-viewer>
        <div toolbar caption="Source data object">
          <div controls>
            <button ${{onclick: 'onSrcDataCopy'}}>${icon('data_object')}Copy source data JSON</button>
            <button ${{onclick: 'onSaveDataLocally', disabled: '!ableToSave'}}>${icon('save')}Save data locally</button>
          </div>
        </div>

        <div toolbar caption="Source data to image encoding">
          <input 
            type="text" 
            placeholder="Local file path..."
            ${{value: 'srcDataImageLocalPath'}}>
          <div controls>
            <img src-data-img ${{src: 'dataImageSrc'}}>
            <button ${{onclick: 'onDataImagePublish', disabled: '!ableToSave'}}>${icon('upload_file')}Publish data as image</button>
            <!--<button ${{onclick: 'onSrcDataCopy'}}>${icon('save')}Save data image</button>-->
          </div>
        </div>

        <div toolbar caption="HTML Embed code">
          <code embed-code contenteditable="true">{{htmlCode}}</code>
          <div controls>
            <button ${{onclick: 'onEmbedCodeCopy'}}>${icon('content_copy')}Copy embed code</button>
          </div>
        </div>
      </div>
      <div column>
        <pre><code 
            contenteditable="true" 
            spellcheck="false"
            ref="jsonEditor" 
            ${{
              oninput: 'onJsonEdit',
              '@error': 'jsonError',
              textContent: 'srcData',
            }}></code></pre>
      </div>
    <div>
  </div>
</div>
`;
