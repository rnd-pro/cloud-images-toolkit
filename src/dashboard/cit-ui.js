import Symbiote from '@symbiotejs/symbiote';
import { CIT_UI_CSS } from './styles.js';
import { CIT_UI_TPL } from './templates.js';
import {} from './img-item.js';
import { getImgCode } from '../iso/getImgCode.js';
import { filterData } from '../iso/filterData.js';
import { CFG } from '../node/CFG.js';
import {} from './img-info.js';
import { WsClient } from './WsClient.js';
import {} from './pop-msg.js';
import {} from './ims-composer.js';
import { sortBySubNumber } from '../iso/sortBySubNumber.js';

/** @type {Object<string, CloudImageDescriptor>} */
let cloudImagesData;

try {
  cloudImagesData = await (await window.fetch(CFG.syncDataPath)).json();
} catch(err) {
  cloudImagesData = (await import('./test-data.js')).default;
  console.warn('CIT: No cloud images data found');
  // console.error(err);
}

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
    renderData: cloudImagesData,
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
    
    onFilter: (e) => {
      this.$.renderData = filterData(cloudImagesData, e.target.value);
      this.$.selection = [];
      this.$.current = null;
    },

    selectAll: () => {
      this.ref.tiles.querySelectorAll('img-item').forEach((item) => {
        if (!this.$.selection.includes(item.$._KEY_)) {
          this.$.selection.push(item.$._KEY_);
        }
        this.notify('selection');
      });
    },

    deselectAll: () => {
      this.$.selection = [];
    },

    copySelectionJson: async () => {
      let selection = sortBySubNumber(this.$.selection).map((path) => {
        return this.$.renderData[path].cdnId;
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
      this.ref.tiles.scrollTop = 0;
    },

    scrollBottom: () => {
      this.ref.tiles.scrollTop = this.ref.tiles.scrollHeight;
    },

    clearCurrent: () => {
      this.$.current.removeAttribute('current');
      this.$.current = null;
    },

    onInvertBg: () => {
      this.ref.tiles.classList.toggle('inverted');
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
      this.$.message = `Reloading data...`;
      await this.updateCloudImagesData();
      this.$.message = `Data reloaded.`;
    },

    onAltInput: (e) => {
      this.$.altDescription = e.target.value;
    },

    onAltSave: async () => {
      this.$.message = `Applying alt description to ${this.$.selection.length} image${this.$.selection.length > 1 ? 's' : ''}...`;
      
      /** @type {Object<string, Partial<CloudImageDescriptor>>} */
      let update = {};
      this.$.selection.forEach((key) => {
        this.$.renderData[key].alt = this.$.altDescription;
        update[key] = {
          alt: this.$.altDescription,
        };
      });
      await WsClient.send({
        cmd: 'EDIT',
        data: update,
      });
      this.notify('renderData');
    },

    onEmbedCopy: async () => {
      await navigator.clipboard.writeText(this.$.embedCode);
      this.$.message = `Embed code copied to clipboard.`;
    },

    onImsPreview: () => {
      this.$.imsActive = true;
    },
  }

  async updateCloudImagesData() {
    cloudImagesData = await (await window.fetch(CFG.syncDataPath)).json();
    this.$.renderData = {...cloudImagesData};
    this.$.selection = [];
    this.$.current = null;
  }

  renderCallback() {
    this.sub('current', (val) => {
      if (!val) {
        return;
      }
      this.ref.imgInfo.set$(val.localCtx.store, true);
      this.$.embedCode = getImgCode(val.$.cdnId, CFG.variants, val.$.alt);
    });
    this.sub('selection', (val) => {
      this.$.selectionSize = val.length;
      this.$.hasSelection = val.length > 0;
    });
    this.sub('renderData', (val) => {
      this.$.filteredSize = Object.keys(val).length;
    });

    WsClient.onUpdate(async () => {
      this.$.message = `Processing of ${this.$.selection.length} items is done.`;
      await this.updateCloudImagesData();
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

