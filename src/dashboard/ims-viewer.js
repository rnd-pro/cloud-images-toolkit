import Symbiote, { css } from '@symbiotejs/symbiote';
import { imageToData } from 'interactive-media-spots/lib/imageToData.js';

export class ImsViewer extends Symbiote {

  initCallback() {
    this.sub('srcData', async (srcDataUrl) => {
      this.innerHTML = '';
      if (!srcDataUrl) {
        return;
      } else {
        window.fetch(srcDataUrl).then(async (resp) => {
          let srcData;
          if (resp.headers.get('Content-Type').toLowerCase().includes('image')) {
            srcData = await imageToData(srcDataUrl);
          } else {
            srcData = await resp.json();
          }
          await import(`https://cdn.jsdelivr.net/npm/interactive-media-spots@${srcData.version}/wgt/${srcData.imsType}/+esm`);
          let imsTypeEl = document.createElement(`ims-${srcData.imsType}`);
          let blob = new Blob([JSON.stringify(srcData)], {
            type: 'application/json',
          });
          let url = URL.createObjectURL(blob);
          imsTypeEl.setAttribute('src-data', url);
          this.appendChild(imsTypeEl);
        });
      }
    });
  }

}

ImsViewer.bindAttributes({
  'src-data': 'srcData',
});

ImsViewer.rootStyles = css`
ims-viewer {
  display: contents;
}
`;

ImsViewer.reg('ims-viewer');

export default ImsViewer;