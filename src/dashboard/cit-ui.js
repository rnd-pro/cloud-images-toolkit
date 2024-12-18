import Symbiote from '@symbiotejs/symbiote';
import { CIT_UI_CSS } from './styles.js';
import { CIT_UI_TPL } from './templates.js';
import { getImgCode } from '../iso/getImgCode.js';
import { CFG } from '../node/CFG.js';
import { WsClient } from './WsClient.js';
import {} from './pop-msg.js';
import {} from './ims-composer.js';
import { sortBySubNumber } from '../iso/sortBySubNumber.js';
import { getFilesAndFolders } from './getFilesAndFolders.js';
import { getCloudImagesData } from './getCloudImagesData.js';
export {} from './img-item.js';
export {} from './folder-item.js';
export {} from './img-info.js';

/**
 * 
 * @param {Array} arr 
 * @returns 
 */
function s(arr) {
  return arr.length > 1 ? 's' : '';
}

class CitUi extends Symbiote {

  init$ = {
    filesRenderData: {},
    foldersRenderData: {},
    selection: [],
    selectionSize: 0,
    hasSelection: false,
    filteredSize: 0,
    current: null,
    embedCode: '...',
    filterSubstr: '',
    message: '',
    altDescription: '',
    imsActive: false,
    currentImsType: '',
    folderHistory: [],
    historyBackAvailable: false,
    
    onFilter: (e) => {
      this.$.filterSubstr = e.target.value;
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

    scrollToCurrent: () => {
      if (this.$.current) {
        this.$.current.scrollIntoView({behavior: 'smooth'});
      }
    },

    scrollTop: () => {
      this.ref.tiles_wrapper.scrollTop = 0;
    },

    scrollBottom: () => {
      this.ref.tiles_wrapper.scrollTop = this.ref.tiles_wrapper.scrollHeight;
    },

    clearCurrent: () => {
      this.$.current.removeAttribute('current');
      this.$.current = null;
    },

    onInvertBg: () => {
      this.ref.tiles_wrapper.classList.toggle('inverted');
    },

    onVariantClick: (e) => {
      let variant = e.target.getAttribute('variant');
      if (variant) {
        window.open(`${CFG.baseUrl + this.$.current.$.cdnId + '/' + variant}`, '_blank');
      }
    },

    onRemove: async () => {
      if (window.confirm(`🟡 This will remove selected images from:\n\n- CDN\n- Local disk\n- Data file entries\n\n Are you sure?`)) {
        this.$.message = `Removing ${this.$.selection.length} image${this.$.selection.length > 1 ? 's' : ''}...`;
        await WsClient.send({
          cmd: 'REMOVE',
          data: this.$.selection,
        });
      }
    },

    onFetch: async () => {
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

    onAltSave: async () => {
      this.$.message = `Applying alt description to ${this.$.selection.length} image${this.$.selection.length > 1 ? 's' : ''}...`;
      
      /** @type {Object<string, Partial<CloudImageDescriptor>>} */
      let update = {};
      this.$.selection.forEach((key) => {
        this.$.filesRenderData[key].alt = this.$.altDescription;
        update[key] = {
          alt: this.$.altDescription,
        };
      });
      await WsClient.send({
        cmd: 'EDIT',
        data: update,
      });
      this.notify('filesRenderData');
    },

    onEmbedCopy: async () => {
      await navigator.clipboard.writeText(this.$.embedCode);
      this.$.message = `Embed code copied to clipboard.`;
    },

    onImsTypeSelected: (e) => {
      let imsType = e.target.getAttribute('type');
      if (imsType) {
        this.$.currentImsType = imsType;
        this.$.imsActive = true;
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
      this.ref.imgInfo.set$(val.localCtx.store, true);
      this.$.embedCode = getImgCode(val.$.cdnId, CFG.variants, val.$.alt);
    });
    this.sub('filterSubstr', async (val) => {
      let cloudImagesData = await getCloudImagesData();
      let rData = getFilesAndFolders(cloudImagesData, CFG.imgSrcFolder, val); 
      this.$.filesRenderData = rData.files;
      this.$.foldersRenderData = rData.folders;
      this.$.selection = [];
      this.$.current = null;
      let totalFoldersContentSize = Object.keys(rData.folders).reduce((acc, folder) => {  
        return acc + Object.keys(rData.folders[folder].content).length;
      }, 0);
      this.$.filteredSize = Object.keys(rData.files).length + totalFoldersContentSize;
    });
    this.sub('selection', (val) => {
      this.$.selectionSize = val.length;
      this.$.hasSelection = val.length > 0;
    });
    this.sub('folderHistory', (val) => {
      this.$.historyBackAvailable = !!val.length;
    });

    WsClient.onUpdate(async () => {
      this.$.message = `Processing of ${this.$.selection.length} items is done.`;
      this.$.folderHistory = [];
      this.$.filterSubstr = '';
    });

    WsClient.onText((text) => {
      this.$.message = text;
    });
  }

}

CitUi.bindAttributes({
  data: 'data',
  config: 'config',
});

CitUi.rootStyles = CIT_UI_CSS;
CitUi.template = CIT_UI_TPL;

CitUi.reg('cit-ui');

