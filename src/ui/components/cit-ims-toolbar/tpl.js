import { html } from '@symbiotejs/symbiote';
import { icon } from '../../icon.js';

export default html`
<div toolbar caption="Selection Toolbar" ${{'@disabled': '!hasSelection'}}>
  <div controls column>
    <button ${{onclick: '^onImsEdit', disabled: '!current'}}>${icon('edit')}Edit Current</button>
    <button warning ${{onclick: '^onImsDelete', disabled: '!hasSelection'}}>${icon('delete')}Delete Selected</button>
  </div>
</div>

<div toolbar caption="New Widget Drafts">
  <div controls column ${{onclick: '^onImsDraftsOpen'}}>
    <button ims-type="gallery">${icon('gallery_thumbnail')}Create Gallery</button>
    <button ims-type="diff">${icon('photo_library')}Create Image Diff</button>
    <button ims-type="pano">${icon('panorama_photosphere')}Create Panorama</button>
    <button ims-type="spinner">${icon('motion_play')}Create Spinner 360</button>
    <button ims-type="model">${icon('3d_rotation')}Create 3D Model</button>
    <button ims-type="video">${icon('movie')}Create Video</button>
    <button ims-type="audio">${icon('audio_file')}Create Audio</button>
    <button ims-type="map">${icon('map')}Create Map</button>
  </div>
</div>
`;