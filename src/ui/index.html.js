import version from 'immersive-media-spots/lib/version.js';
import fs from 'fs';

let imsVersion = version;
let symbioteVersion = JSON.parse(fs.readFileSync('./node_modules/@symbiotejs/symbiote/package.json').toString()).version;

export default /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloud Images Toolkit</title>
  <style>
    body {
      background-color: #000;
    }
  </style>
  <link href="https://rnd-pro.com/svg/cit/index.svg" rel="icon">
  <script type="importmap">
    {
      "imports": {
        "@symbiotejs/symbiote": "https://cdn.jsdelivr.net/npm/@symbiotejs/symbiote@${symbioteVersion}/+esm",
        "immersive-media-spots/wgt/viewer": "https://cdn.jsdelivr.net/npm/immersive-media-spots@${imsVersion}/wgt/viewer/index.js/+esm",
        "immersive-media-spots/lib/dataToImage.js": "https://cdn.jsdelivr.net/npm/immersive-media-spots@${imsVersion}/lib/dataToImage.js/+esm",
        "immersive-media-spots/lib/imageToData.js": "https://cdn.jsdelivr.net/npm/immersive-media-spots@${imsVersion}/lib/imageToData.js/+esm"
      }
    }
  </script>
  {{SCRIPT}}
</head>
<body>
  <cit-ui></cit-ui>
</body>
</html>`;
