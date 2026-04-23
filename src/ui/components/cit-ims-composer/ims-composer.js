import Symbiote from '@symbiotejs/symbiote';
import { IMS_COMPOSER_CSS } from './css.js';
import { IMS_COMPOSER_TPL } from './tpl.js';
import { CFG, configs } from '../../../node/CFG.js';
export { ImsViewer } from 'immersive-media-spots/wgt/viewer';
import { ImsDiffData } from 'immersive-media-spots/wgt/diff/ImsDiffData.js';
import { ImsGalleryData } from 'immersive-media-spots/wgt/gallery/ImsGalleryData.js';
import { ImsPanoData } from 'immersive-media-spots/wgt/pano/ImsPanoData.js';
import { ImsSpinnerData } from 'immersive-media-spots/wgt/spinner/ImsSpinnerData.js';
import { ImsModelData } from 'immersive-media-spots/wgt/model/ImsModelData.js';
import { ImsVideoData } from 'immersive-media-spots/wgt/video/ImsVideoData.js';
import { ImsAudioData } from 'immersive-media-spots/wgt/audio/ImsAudioData.js';
import { ImsMapData } from 'immersive-media-spots/wgt/map/ImsMapData.js';
import { dataToImage } from 'immersive-media-spots/lib/dataToImage.js';
import { sortBySubNumber } from '../../../iso/sortBySubNumber.js';
// import imageToData from 'immersive-media-spots/lib/imageToData.js';
import { getHash } from 'jsda-kit/iso/getHash.js';
import { WsClient } from '../../WsClient.js';
import { getCloudImagesData } from '../../getCloudImagesData.js';

export class ImsComposer extends Symbiote {

  #jsonEditTimeout;

  get srcData() {
    return JSON.parse(this.ref.jsonEditor.textContent);
  }

  open(srcData) {
    this.$['^imsComposerActive'] = true;
    this.$['^currentImsType'] = null;
    this.$.srcData = JSON.stringify(srcData, undefined, 2);
    this.$.imsData = srcData;
    this.#applyData(srcData);
  }

  init$ = {
    srcData: '',
    imsData: null,
    imsDataUrl: '',
    htmlCode: '',
    useCommonViewer: false,
    jsonError: false,
    dataImageSrc: '',
    srcDataImageLocalPath: '',
    savedHashes: [],
    currentHash: '',
    ableToSave: false,
    imsType: 'viewer',

    onCommonViewerToggle: (e) => {
      this.$.useCommonViewer = !this.$.useCommonViewer;
      this.$.htmlCode = this.htmlEmbedCode;
    },

    close: () => {
      this.$['^imsComposerActive'] = false;
    },

    onJsonEdit: () => {
      if (this.#jsonEditTimeout) {
        window.clearTimeout(this.#jsonEditTimeout);
      }
      this.#jsonEditTimeout = window.setTimeout(() => {
        try {
          this.$.jsonError = false;
          this.#applyData(this.srcData);
        } catch(e) {
          this.$.jsonError = true;
        }
      }, 400);
    },

    onObjectUiChange: (e) => {
      let objUi = e.target.closest('x-cfg');
      if (objUi.value) {
        this.$.imsData = objUi.value;
        this.$.srcData = JSON.stringify(objUi.value, undefined, 2);
        this.#applyData(objUi.value);
      }
    },

    onSrcDataCopy: async () => {
      if (this.$.jsonError) {
        this.$['^message'] = 'Source data object error occurred... Please, fix it before.';
      } else {
        await navigator.clipboard.writeText(this.ref.jsonEditor.textContent);
        this.$['^message'] = 'Source data object is copied to clipboard...';
      }
    },

    onSaveDataLocally: async () => {
      this.$.savedHashes = [...this.$.savedHashes, this.$.currentHash];
      this.$.ableToSave = false;
      await WsClient.send({
        cmd: 'SAVE_IMS',
        data: {
          hash: this.$.currentHash,
          srcData: this.srcData,
          collectionIndex: this.$['^activeCollectionIndex'],
        },
      });
      this.$['^message'] = 'Saving...';
      window.setTimeout(() => {
        this.$['^loadImsData']();
      }, 200);
    },

    onSaveFile: () => {
      if (this.$.jsonError) {
        this.$['^message'] = 'Source data object error occurred... Please, fix it before.';
        return;
      }
      let text = this.ref.jsonEditor.textContent;
      let blob = new Blob([text], { type: 'application/json' });
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = `${this.$.imsType}_${this.$.currentHash.slice(0, 5)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    onSrcDataImageLocalPathInput: (e) => {
      this.$.srcDataImageLocalPath = e.target.value;
      console.log(this.$.srcDataImageLocalPath);
      this.$.ableToSave = true;
    },

    onDataImagePublish: async () => {
      this.$.savedHashes = [...this.$.savedHashes, this.$.currentHash];
      this.$.ableToSave = false;
      await WsClient.send({
        cmd: 'PUB_DATA_IMG',
        data: {
          localPath: this.$.srcDataImageLocalPath,
          imgData: this.$.dataImageSrc,
          collectionIndex: this.$['^activeCollectionIndex'],
        },
      });
      this.$['^message'] = 'Publishing to CDN...';
      this.$.ableToSave = false;
    },

    onEmbedCodeCopy: async () => {
      await navigator.clipboard.writeText(this.$.htmlCode);
      this.$['^message'] = 'IMS embed code is copied to clipboard...';
    },

  }

  get htmlEmbedCode() {
    let activeCfg = configs[this.$['^activeCollectionIndex']] || CFG;
    let url = activeCfg.imsUrlTemplate ? activeCfg.imsUrlTemplate.replace('{HASH}', this.$.currentHash) : this.$.imsDataUrl;
    let tag = this.$.useCommonViewer ? 'ims-viewer' : `ims-${this.$.imsType}`;
    return /*html*/ `<${tag} src-data="${url}"></${tag}>`;
  }

  async #applyData(srcData) {
    let srcDataString = JSON.stringify(srcData);
    let url = 'data:application/json;base64,' + btoa(srcDataString);
    this.$.imsDataUrl = url;
    this.$.dataImageSrc = await dataToImage(srcData);
    this.$.imsType = srcData.imsType;
    this.$.currentHash = await getHash(srcDataString);
    this.$.htmlCode = this.htmlEmbedCode;
    this.$.ableToSave = !this.$.savedHashes.includes(this.$.currentHash);
    let activeCfg = configs[this.$['^activeCollectionIndex']] || CFG;
    if (!this.$.srcDataImageLocalPath || this.$.ableToSave) {
      this.$.srcDataImageLocalPath = `${activeCfg.imgSrcFolder}ims-data-images/${srcData.imsType}_v${srcData.version}/${(new Date()).toISOString().split('T')[0] + '_' + this.$.currentHash.slice(0, 5)}.png`;
    }
  }

  renderCallback() {
    this.sub('^imsComposerActive', (val) => {
      if (val) {
        this.setAttribute('active', '');
      } else {
        this.removeAttribute('active');
      }
    });

    this.sub('^currentImsType', async (/** @type {String} */ val) => {
      if (!val) return;

      let selection = [...sortBySubNumber(this.$['^selection'])];

      let typeMap = {
        diff: ImsDiffData,
        gallery: ImsGalleryData,
        pano: ImsPanoData,
        spinner: ImsSpinnerData,
        model: ImsModelData,
        video: ImsVideoData,
        audio: ImsAudioData,
        map: ImsMapData,
      };

      let typeData = typeMap[val];
      let srcData = new typeData();

      let activeCfg = configs[this.$['^activeCollectionIndex']] || CFG;

      if (Object.hasOwn(srcData, 'urlTemplate')) {
        srcData.urlTemplate = activeCfg.imgUrlTemplate;
      }

      if (Object.hasOwn(srcData, 'variants')) {
        srcData.variants = activeCfg.variants.filter((vnt) => {
          return !Number.isNaN(parseFloat(vnt));
        });
      }

      if (Object.hasOwn(srcData, 'cdnIdList')) {
        let imgData = await getCloudImagesData(this.$['^activeCollectionIndex']);
        for (let uid of selection) {
          if (imgData[uid] && imgData[uid].cdnId) {
            srcData.cdnIdList.push(imgData[uid].cdnId);
          }
        }
      }

      this.$.imsData = srcData;
      this.$.srcData = JSON.stringify(srcData, undefined, 2);
      this.#applyData(srcData);
    });
  }
}

ImsComposer.rootStyles = IMS_COMPOSER_CSS;
ImsComposer.template = IMS_COMPOSER_TPL;

ImsComposer.reg('cit-ims-composer');