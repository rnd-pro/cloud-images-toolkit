import Symbiote from '@symbiotejs/symbiote';
export { default as AppData } from '../../data/AppData.js';

import '../exports.js';

import { CIT_UI_CSS } from './css.js';
import { CIT_UI_TPL } from './tpl.js';

import { getImgCode } from '../../../iso/getImgCode.js';
import { CFG } from '../../../node/CFG.js';
import { fillTpl } from '../../../iso/fillTpl.js';
import { WsClient } from '../../WsClient.js';
import { sortBySubNumber } from '../../../iso/sortBySubNumber.js';
import { getFilesAndFolders } from '../../getFilesAndFolders.js';
import { getCloudImagesData } from '../../getCloudImagesData.js';
import { getImsData } from '../../getImsData.js';


/**
 * 
 * @param {Array} arr 
 * @returns 
 */
function s(arr) {
  return arr.length > 1 ? 's' : '';
}

class CitUi extends Symbiote {

  /** @type {number} */
  #filterTimeout;

  init$ = {
    filesRenderData: {},
    foldersRenderData: {},
    imsRenderData: {},
    isLoading: false,
    hasItems: true,
    hasImsItems: false,
    selection: [],
    selectionSize: 0,
    hasSelection: false,
    filteredSize: 0,
    current: null,
    embedCode: '...',
    filterSubstr: '',
    tagFilterSubstr: '',
    message: '',
    altDescription: '',
    tagsString: '',
    imsComposerActive: false,
    currentImsType: '',
    folderHistory: [],
    historyBackAvailable: false,
    wsStatus: 'connecting',
    wsStatusIcon: 'sync',
    wsStatusColor: 'var(--color-4)',
    
    onFilter: (e) => {
      if (this.#filterTimeout) {  
        clearTimeout(this.#filterTimeout);
      }
      this.#filterTimeout = window.setTimeout(() => {
        if (e.target.value.length === 1) {
          return;
        }
        this.$.filterSubstr = e.target.value.trim();
      }, 400);
    },

    onTagFilter: (e) => {
      if (this.#filterTimeout) {  
        clearTimeout(this.#filterTimeout);
      }
      this.#filterTimeout = window.setTimeout(() => {
        this.$.tagFilterSubstr = e.target.value.trim();
      }, 400);
    },

    selectAll: () => {
      let selection = Object.keys(this.$.filesRenderData);
      Object.values(this.$.foldersRenderData).forEach((folder) => {
        selection = [...selection, ...folder.content];
      });
      this.$.selection = selection;
    },

    deselectAll: () => {
      this.$.selection = [];
    },

    copySelectionJson: async () => {
      let selection = sortBySubNumber(this.$.selection).map((path) => {
        return this.$.filesRenderData[path].cdnId;
      });
      await navigator.clipboard.writeText(JSON.stringify(selection, undefined, 2));
      this.$.message = `Selection of ${this.$.selection.length} image${s(this.$.selection)} is copied to clipboard in JSON format`;
    },

    sortSelectionByNumber: () => {
      let sel = [...this.$.selection];
      sel = sortBySubNumber(sel);
      this.$.selection = sel;
      this.$.message = 'Selection sorted logically by number';
    },

    sortSelectionByAlpha: () => {
      let sel = [...this.$.selection];
      sel.sort((a, b) => a.localeCompare(b));
      this.$.selection = sel;
      this.$.message = 'Selection sorted alphabetically';
    },

    scrollToCurrent: () => {
      if (this.$.current) {
        this.$.current.scrollIntoView({behavior: 'smooth'});
      }
    },

    scrollTop: () => {
      this.ref.viewport.scrollTop = 0;
    },

    scrollBottom: () => {
      this.ref.viewport.scrollTop = this.ref.viewport.scrollHeight;
    },

    clearCurrent: () => {
      this.$.current.removeAttribute('current');
      this.$.current = null;
    },

    onInvertBg: () => {
      this.ref.viewport.classList.toggle('inverted');
    },

    onVariantClick: (e) => {
      let variant = e.target.getAttribute('variant');
      if (variant) {
        window.open(fillTpl(CFG.imgUrlTemplate, {
          UID: this.$.current.$.cdnId,
          VARIANT: variant,
        }), '_blank');
      }
    },

    toggleImsExplorer: async () => {

    },

    onImsDelete: async () => {
      if (window.confirm(`🟡 This will remove selected IMS widgets. Are you sure?`)) {
        this.$.isLoading = true;
        this.$.message = `Removing ${this.$.selection.length} widget${this.$.selection.length > 1 ? 's' : ''}...`;
        for (let hash of this.$.selection) {
          await WsClient.send({
            cmd: 'DELETE_IMS',
            data: hash,
          });
        }
      }
    },

    onImsEdit: () => {
      if (this.$.current) {
        /** @type {import('../cit-ims-composer/ims-composer.js').ImsComposer} */ 
        let composer = document.querySelector('cit-ims-composer');
        let imsData = this.$.current.$.imsData;
        composer.open(imsData);
      }
    },

    onRemove: async () => {
      if (window.confirm(`🟡 This will remove selected images from:\n\n- CDN\n- Local disk\n- Data file entries\n\n Are you sure?`)) {
        this.$.isLoading = true;
        this.$.message = `Removing ${this.$.selection.length} image${this.$.selection.length > 1 ? 's' : ''}...`;
        await WsClient.send({
          cmd: 'REMOVE',
          data: this.$.selection,
        });
      }
    },

    onFetch: async () => {
      this.$.isLoading = true;
      this.$.message = `Fetching remote images...`;
      await WsClient.send({
        cmd: 'FETCH',
        data: this.$.selection,
      });
    },

    reloadData: async () => {
      this.$.folderHistory = [];
      this.$.filterSubstr = '';
    },

    onAltInput: (e) => {
      this.$.altDescription = e.target.value;
    },

    onTagsInput: (e) => {
      this.$.tagsString = e.target.value;
    },

    onMetaSave: async () => {
      this.$.message = `Applying meta data to ${this.$.selection.length} image${this.$.selection.length > 1 ? 's' : ''}...`;
      
      let tags = this.$.tagsString ? this.$.tagsString.split(',').map(t => t.trim()).filter(Boolean) : undefined;
      let alt = this.$.altDescription || undefined;
      
      /** @type {Object<string, Partial<CloudImageDescriptor>>} */
      let update = {};
      this.$.selection.forEach((key) => {
        let partialUpdate = {};
        if (alt !== undefined) {
          this.$.filesRenderData[key].alt = alt;
          partialUpdate.alt = alt;
        }
        if (tags !== undefined) {
          this.$.filesRenderData[key].tags = tags;
          partialUpdate.tags = tags;
        }
        if (Object.keys(partialUpdate).length > 0) {
          update[key] = partialUpdate;
        }
      });
      
      if (Object.keys(update).length > 0) {
        await WsClient.send({
          cmd: 'EDIT',
          data: update,
        });
        this.notify('filesRenderData');
      }
    },

    onEmbedCopy: async () => {
      await navigator.clipboard.writeText(this.$.embedCode);
      this.$.message = `Embed code copied to clipboard.`;
    },

    onImsTypeSelected: (e) => {
      let imsType = e.target.getAttribute('type');
      if (imsType) {
        this.$.currentImsType = imsType;
        this.$.imsComposerActive = true;
      }
    },

    onImsDraftsOpen: (e) => {
      let imsType = e.target.getAttribute('ims-type');
      if (imsType) {
        this.$.currentImsType = imsType;
        this.$.imsComposerActive = true;
      }
    },

    onHistoryBack: () => {
      this.$.folderHistory.pop();
      this.$.filterSubstr = this.$.folderHistory.length ? this.$.folderHistory.join('/') + '/' : '';
      this.notify('folderHistory');
    },
  }

  renderCallback() {
    this.sub('current', (val) => {
      if (!val) {
        return;
      }
      if (val.$.cdnId && !val.$.imsType) {
        this.$.embedCode = getImgCode(val.$.cdnId, CFG.variants, val.$.alt);
      }
    });

    this.sub('APP/uiCtx', (val) => {
      this.$.selection = [];
      this.$.current = null;
      if (val === 'ims') {
        this.#loadImsData();
      }
    });
    
    const applyFilters = async () => {
      let cloudImagesData = await getCloudImagesData();
      let rData = getFilesAndFolders(cloudImagesData, CFG.imgSrcFolder, this.$.filterSubstr, this.$.tagFilterSubstr); 
      this.$.filesRenderData = rData.files;
      this.$.foldersRenderData = rData.folders;
      this.$.hasItems = Object.keys(rData.files).length > 0 || Object.keys(rData.folders).length > 0;
      this.$.selection = [];
      this.$.current = null;
      let totalFoldersContentSize = Object.keys(rData.folders).reduce((acc, folder) => {  
        return acc + Object.keys(rData.folders[folder].content).length;
      }, 0);
      this.$.filteredSize = Object.keys(rData.files).length + totalFoldersContentSize;
    };
    
    this.sub('filterSubstr', applyFilters);
    this.sub('tagFilterSubstr', applyFilters);
    this.sub('selection', (val) => {
      this.$.selectionSize = val.length;
      this.$.hasSelection = val.length > 0;
    });
    this.sub('folderHistory', (val) => {
      this.$.historyBackAvailable = !!val.length;
    });

    WsClient.onUpdateIms(() => {
      if (this.$.isImsExplorer) {
        this.#loadImsData();
      }
    });

    WsClient.onUpdate(async () => {
      this.$.isLoading = false;
      this.$.message = `Processing of ${this.$.selection.length} items is done.`;
      this.$.folderHistory = [];
      this.$.filterSubstr = '';
    });

    WsClient.onText((text) => {
      this.$.message = text;
    });

    WsClient.onStatus((status) => {
      this.$.wsStatus = status;
      if (status === 'connected') {
        this.$.wsStatusIcon = 'wifi';
        this.$.wsStatusColor = '#0f0';
      } else if (status === 'disconnected') {
        this.$.wsStatusIcon = 'wifi_off';
        this.$.wsStatusColor = '#f00';
      } else {
        this.$.wsStatusIcon = 'sync';
        this.$.wsStatusColor = 'var(--color-4)';
      }
    });

    WsClient.connect().catch(() => {});

    // Handle global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an input or contenteditable
      let target = /** @type {HTMLElement} */ (e.target);
      let tag = target.tagName ? target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || target.isContentEditable) {
        return;
      }

      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.$.selectAll();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.$.deselectAll();
      }
    });
  }
  
  async #loadImsData() {
    this.$.isLoading = true;
    let data = await getImsData();
    let renderData = {};
    for (let hash in data) {
      let previewUrl = '';
      if (data[hash].imsType === 'diff') {
        previewUrl = data[hash].img1 || data[hash].img2 || '';
      } else if (data[hash].imsType === 'pano') {
        previewUrl = data[hash].mapSrc || '';
      } else if (data[hash].imsType === 'spinner') {
        previewUrl = data[hash].srcTemplate?.replace('{num}', '1') || '';
      } else if (data[hash].imsType === 'gallery') {
        previewUrl = data[hash].images?.[0]?.src || '';
      }
      
      renderData[hash] = {
        imsData: data[hash],
      };
    }
    this.$.imsRenderData = renderData;
    this.$.hasImsItems = Object.keys(renderData).length > 0;
    this.$.isLoading = false;
  }

}

CitUi.bindAttributes({
  data: 'data',
  config: 'config',
});

CitUi.rootStyles = CIT_UI_CSS;
CitUi.template = CIT_UI_TPL;

CitUi.reg('cit-ui');

