import { getAspectRatio } from '../iso/getAspectRatio.js';

/** @type {Object<string, CloudImageDescriptor>} */
let testData = {};

for (let i = 1; i <= 1000; i++) {
  testData[`./my-project-folder/sequence_${Math.floor(i / 10) + 1}/my-image-name-${i}.jpg`] = {
    cdnId: '6aed9d6c-e629-476b-effc-f7dd57f7ca00',
    uploadDate: '2024-01-01',
    imageName: `my-image-name-${i}.jpg`,
    alt: 'A beautiful image',
    width: '1920',
    height: '1080',
    aspectRatio: getAspectRatio(1920, 1080),
    srcFormat: 'jpg',
  }
}

export default testData;
