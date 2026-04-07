import { html } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';

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
            <button accent ${{onclick: 'onSaveDataLocally', disabled: '!ableToSave'}}>${icon('save')}Save to IMS collection</button>
            <button ${{onclick: 'onSaveFile'}}>${icon('save_as')}Save file</button>
            <button ${{onclick: 'onSrcDataCopy'}}>${icon('data_object')}Copy source data JSON</button>
          </div>
        </div>

        <div toolbar caption="HTML Embed code">
          <div controls>
            <button ${{onclick: 'onCommonViewerToggle', '@toggle-on': 'useCommonViewer'}}>${icon('toggle_off')}Toggle Common Viewer</button>
          </div>
          <code embed-code contenteditable="true">{{htmlCode}}</code>
          <div controls>
            <button ${{onclick: 'onEmbedCodeCopy'}}>${icon('content_copy')}Copy embed code</button>
          </div>
        </div>

        <div toolbar caption="Source data to image encoding">
          <input 
            type="text" 
            placeholder="Local file path..."
            ${{value: 'srcDataImageLocalPath', oninput: 'onSrcDataImageLocalPathInput'}}>
          <div controls>
            <img src-data-img ${{src: 'dataImageSrc'}}>
            <button ${{onclick: 'onDataImagePublish', disabled: '!ableToSave'}}>${icon('upload_file')}Publish data as image</button>
            <!--<button ${{onclick: 'onSrcDataCopy'}}>${icon('save')}Save data image</button>-->
          </div>
        </div>

      </div>

      <div column>
        <cit-tabs write-to="APP/imsComposerMode">
          <button tab="object-ui" style="--tab-color: #00fe87ff;">${icon('settings')} Widget Data Editor</button>
          <button tab="json" style="--tab-color: #00c3ffff;">${icon('data_object')} Raw JSON</button>
        </cit-tabs>
        <cit-ui-ctx read-from="APP/imsComposerMode">
          <div ui-ctx="json">
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
          <div ui-ctx="object-ui">
            <x-cfg ${{'$.data': 'imsData', onchange: 'onObjectUiChange'}} editable></x-cfg>
          </div>
        </cit-ui-ctx>
      </div>
    </div>
  </div>
</div>
`;