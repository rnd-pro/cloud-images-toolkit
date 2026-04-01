import { html } from '@symbiotejs/symbiote';
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
  <button round ${{onclick: 'onInvertBg'}}>${icon('contrast')}</button>
  <button round warning ${{'@disabled': '!current', onclick: 'clearCurrent'}}>${icon('variable_remove')}</button>
  <button round ${{onclick: 'reloadData'}}>${icon('refresh')}</button>
  <div style="flex-grow: 1;"></div>
  <button round disabled ${{'style.color': 'wsStatusColor', '@title': 'wsStatus'}}>
    <span class="material-symbols-outlined">{{wsStatusIcon}}</span>
  </button>
</div>

<div>
  <div viewport>
    <cit-tabs write-to="APP/uiCtx">
      <button tab="images" style="--tab-color: rgb(190 166 0);">Images</button>
      <button tab="ims" style="--tab-color: #00c3ffff;">IMS Widgets</button>
      <button tab="stories">Stories</button>
      <button tab="video">Video</button>
      <button tab="ai">AI</button>
    </cit-tabs>

    <cit-ui-ctx read-from="APP/uiCtx">

      <div ui-ctx="images" ref="tiles_wrapper">
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

      <div ui-ctx="ims" ref="ims_wrapper">
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

    </cit-ui-ctx>
  </div>
</div>

<div panel column>
  <cit-ui-ctx read-from="APP/uiCtx">
    <cit-images-toolbar ${{'$.current': 'current', '$.hasSelection': 'hasSelection'}}></cit-images-toolbar>
    <cit-ims-toolbar ${{'$.current': 'current', '$.hasSelection': 'hasSelection'}}></cit-ims-toolbar>
  </cit-ui-ctx>
  <div footer>&copy; ${new Date().getFullYear()} <a href="https://rnd-pro.com">rnd-pro.com</a></div>
  <cit-pop-msg></cit-pop-msg>
</div>

<cit-ims-composer></cit-ims-composer>
`;