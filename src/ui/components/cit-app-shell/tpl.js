import { html } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';
export { BackBtn } from '../cit-back-btn/back-btn.js';

export const CIT_UI_TPL = html`
<link 
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=block" 
  rel="stylesheet" />

<div panel column>
  <cit-left-panel></cit-left-panel>
</div>

<div>
  <div viewport ref="viewport">

    <cit-tabs write-to="APP/uiCtx">
      <button tab="images" style="--tab-color: var(--color-accent);">${icon('imagesmode')}Images</button>
      <button tab="ims" style="--tab-color: #00c3ffff;">${icon('animated_images')}IMS Widgets</button>
      <button tab="stories">${icon('auto_stories')}IMS Stories</button>
      <button tab="video">${icon('play_circle')}Video</button>
      <button tab="ai">${icon('robot')}AI Tools</button>
    </cit-tabs>

    <cit-ui-ctx read-from="APP/uiCtx">

      <div ui-ctx="images" ref="tiles_wrapper">
        <div loader ${{'@hidden': '!isLoading'}}>
          ${icon('cloud_sync')}
        </div>
        <div empty-state ${{'@hidden': 'hasItems'}}>
          ${icon('photo_library')}
          <div title>No images yet...</div>
          <div sub>Put images to the configured local folder to see them here</div>
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
          ${icon('animated_images')}
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

      <div ui-ctx="stories" tiles>
        <div empty-state>
          ${icon('auto_stories')}
          <div title>IMS Stories</div>
          <div sub>Coming soon...</div>
          <div>Give us a star on <a target="_blank" href="https://github.com/rnd-pro/cloud-images-toolkit">GitHub</a> to see it faster.</div>
        </div>
      </div>
      <div ui-ctx="video" tiles>
        <div empty-state>
          ${icon('play_circle')}
          <div title>Video</div>
          <div sub>Coming soon...</div>
          <div>Give us a star on <a target="_blank" href="https://github.com/rnd-pro/cloud-images-toolkit">GitHub</a> to see it faster.</div>
        </div>
      </div>
      <div ui-ctx="ai" tiles>
        <div empty-state>
          ${icon('robot')}
          <div title>AI Tools</div>
          <div sub>Coming soon...</div>
          <div>Give us a star on <a target="_blank" href="https://github.com/rnd-pro/cloud-images-toolkit">GitHub</a> to see it faster.</div>
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
<cit-collection-profiles></cit-collection-profiles>
`;