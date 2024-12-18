let imsVersion = '0.0.18';

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
  <script type="importmap">
    {
      "imports": {
        "@symbiotejs/symbiote": "https://cdn.jsdelivr.net/npm/@symbiotejs/symbiote@2.3.2/+esm",
        "interactive-media-spots/wgt/viewer": "https://cdn.jsdelivr.net/npm/interactive-media-spots@${imsVersion}/wgt/viewer/index.js/+esm",
        "interactive-media-spots/lib/dataToImage.js": "https://cdn.jsdelivr.net/npm/interactive-media-spots@${imsVersion}/lib/dataToImage.js/+esm",
        "interactive-media-spots/lib/imageToData.js": "https://cdn.jsdelivr.net/npm/interactive-media-spots@${imsVersion}/lib/imageToData.js/+esm"
      }
    }
  </script>
  {{SCRIPT}}
</head>
<body>
  <cit-ui></cit-ui>
</body>
</html>`;
