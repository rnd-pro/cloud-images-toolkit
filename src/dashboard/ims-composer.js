import Symbiote from '@symbiotejs/symbiote';
import { IMS_COMPOSER_CSS } from './styles.js';
import { IMS_COMPOSER_TPL } from './templates.js';
import { CFG } from '../node/CFG.js';
export { ImsViewer } from 'interactive-media-spots/wgt/viewer';
import { ImsDiffData } from 'interactive-media-spots/wgt/diff/ImsDiffData.js';
import { ImsGalleryData } from 'interactive-media-spots/wgt/gallery/ImsGalleryData.js';
import { ImsPanoData } from 'interactive-media-spots/wgt/pano/ImsPanoData.js';
import { ImsSpinnerData } from 'interactive-media-spots/wgt/spinner/ImsSpinnerData.js';
import { dataToImage } from 'interactive-media-spots/lib/dataToImage.js';
import { sortBySubNumber } from '../iso/sortBySubNumber.js';
// import imageToData from 'interactive-media-spots/lib/imageToData.js';
import { getHash } from '@jam-do/jam-tools/iso/getHash.js';
import { WsClient } from './WsClient.js';

export class ImsComposer extends Symbiote {

  #jsonEditTimeout;

  get srcData() {
    return JSON.parse(this.ref.jsonEditor.textContent);
  }

  init$ = {
    srcData: '',
    imsDataUrl: '',
    htmlCode: '',
    jsonError: false,
    dataImageSrc: '',
    srcDataImageLocalPath: '',
    savedHashes: [],
    currentHash: '',
    ableToSave: false,
    imsType: 'viewer',

    close: () => {
      this.$['^imsActive'] = false;
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
        },
      });
      this.$['^message'] = 'Saving...';
    },

    onDataImagePublish: async () => {
      this.$.savedHashes = [...this.$.savedHashes, this.$.currentHash];
      this.$.ableToSave = false;
      await WsClient.send({
        cmd: 'PUB_DATA_IMG',
        data: {
          localPath: this.$.srcDataImageLocalPath,
          imgData: this.$.dataImageSrc,
        },
      });
      this.$['^message'] = 'Publishing to CDN...';
    },

    onEmbedCodeCopy: async () => {
      await navigator.clipboard.writeText(this.$.htmlCode);
      this.$['^message'] = 'IMS embed code is copied to clipboard...';
    },

  }

  get htmlEmbedCode() {
    return /*html*/ `<ims-${this.$.imsType} src-data="${this.$.imsDataUrl}"></ims-${this.$.imsType}>`;
  }

  async #applyData(srcData) {
    // let blob = new Blob([JSON.stringify(srcData)], {
    //   type: 'application/json',
    // });
    // let url = URL.createObjectURL(blob);
    let srcDataString = JSON.stringify(srcData);
    let url = 'data:application/json;base64,' + btoa(srcDataString);
    this.$.imsDataUrl = url;
    this.$.dataImageSrc = await dataToImage(srcData);
    this.$.imsType = srcData.imsType;
    this.$.htmlCode = this.htmlEmbedCode;
    this.$.currentHash = await getHash(srcDataString);
    // console.log(this.$.currentHash);
    this.$.ableToSave = !this.$.savedHashes.includes(this.$.currentHash);
    if (!this.$.srcDataImageLocalPath || this.$.ableToSave) {
      this.$.srcDataImageLocalPath = `${CFG.imgSrcFolder}ims-data-images/${srcData.imsType}/${Date.now()}.png`;
    }
  }

  renderCallback() {
    this.sub('^imsActive', (val) => {
      if (val) {
        this.setAttribute('active', '');
      } else {
        this.removeAttribute('active');
      }
    });

    this.sub('^currentImsType', (/** @type {String} */ val) => {
      console.log(val);
      if (!val) return;

      let selection = [...sortBySubNumber(this.$['^selection'])];
      if (!selection.length) return;

      let typeMap = {
        diff: ImsDiffData,
        gallery: ImsGalleryData,
        pano: ImsPanoData,
        spinner: ImsSpinnerData,
      };

      let typeData = typeMap[val];

      let srcData = new typeData({
        baseUrl: CFG.baseUrl,
        variants: CFG.variants.filter((vnt) => {
          return !Number.isNaN(parseFloat(vnt));
        }),
      });

      selection.forEach((uid) => {
        /** @type {Object<string, CloudImageDescriptor>} */
        let data = this.$['^renderData'];
        srcData.cdnIdList.push(data[uid].cdnId);
      });

      if (val === 'spinner') {
        srcData.coverUrl = CFG.baseUrl + srcData.cdnIdList[0] + '/public';
      }

      if (val === 'pano') {
        srcData.srcList = [
          CFG.baseUrl + srcData.cdnIdList[0] + '/public',
        ];
      }

      this.$.srcData = JSON.stringify(srcData, undefined, 2);
      this.#applyData(srcData);
    });
  }
}

ImsComposer.rootStyles = IMS_COMPOSER_CSS;
ImsComposer.template = IMS_COMPOSER_TPL;

ImsComposer.reg('ims-composer');