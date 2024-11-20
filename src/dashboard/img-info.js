import { Symbiote, html, css } from '@symbiotejs/symbiote';

class ImgInfo extends Symbiote {

  init$ = {
    alt: '',
    preview: '',
  }

  renderCallback() {
    this.onclick = async (e) => {
      // @ts-expect-error
      if (e.target.tagName === 'INFO-ROW') {
        // @ts-expect-error
        await navigator.clipboard.writeText(e.target.textContent);
        this.$['^message'] = `Value copied to clipboard.`;
      }
    }
  }
}

ImgInfo.rootStyles = css`
  img-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

ImgInfo.template = html`
  <info-row caption="CDN ID: ">{{cdnId}}</info-row>
  <info-row caption="Local path: ">{{_KEY_}}</info-row>
  <info-row caption="Upload date: ">{{uploadDate}}</info-row>
  <info-row caption="File name: ">{{imageName}}</info-row>
  <info-row uppercase caption="Source image type: ">{{srcFormat}}</info-row>
  <div controls grow>
    <info-row caption="Width: ">{{width}}</info-row>
    <info-row caption="Height: ">{{height}}</info-row>
    <info-row caption="Aspect ratio: ">{{aspectRatio}}</info-row>
  </div>
`;

ImgInfo.reg('img-info');



