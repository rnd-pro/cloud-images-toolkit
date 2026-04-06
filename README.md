[![npm version](https://badge.fury.io/js/cloud-images-toolkit.svg)](https://badge.fury.io/js/cloud-images-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# CIT - Cloud Images Toolkit

<img src="https://rnd-pro.com/svg/cit/index.svg" width="200" alt="CIT - Cloud Images Toolkit">

A powerful toolkit for managing image collections directly in your codebase, with CDN integration and advanced features.

![CIT Dashboard screenshot](https://rnd-pro.com/idn/f4ec5143-82fd-4dc1-2d76-6c9d7a752000/1024)

## Features

- Automatic synchronization between local images and CDN
- Git-based image collection data tracking and collaboration
- Flat structured cloud data to local folders mapping
- Automatic image sorting for ordered sequences
- Adaptive image embed code generation
- Smart local caching - download cloud images only when needed
- Built-in image management UI application
- Interactive widget generation using [Immersive Media Spots (IMS)](https://github.com/rnd-pro/immersive-media-spots):
  - Image galleries
  - Panorama viewers
  - 360° object views
  - And more...
- Native Cloudflare Images API support
- Data-to-image encoding for the uniform asset control workflow (store your widgets data directly in image CDN)

## Coming soon

- Video publishing & video collections view
- Advanced [IMS](https://github.com/rnd-pro/immersive-media-spots)-based hypermedia composer
- Built-in AI image generation support and prompt editor
- Image modifications and transformations:
  - Watermarks
  - Filters
  - Cropping
  - Rotating
- Additional tag-based grouping and filtering

## Requirements

- Node.js 20.0.0+
- npm 10.0.0+

## Quick Start

Run without installing:
```bash
npx cloud-images-toolkit
```

If no config file is found, CIT will offer to create one from the reference template.

## Installation

### Global installation

```bash
npm install -g cloud-images-toolkit
```

Then run from any project directory:
```bash
cit
```

### Local installation

```bash
npm install cloud-images-toolkit
```

Add a script to your `package.json`:
```json
"scripts": {
  "cit": "node ./node_modules/cloud-images-toolkit/src/node/serve.js"
}
```

Then:
```bash
npm run cit
```

## Configuration

Create a `cit-config.json` file in your project root. A reference template is included in the package as [`cit-config_REFERENCE.json`](./cit-config_REFERENCE.json):

```json
{
  "syncDataPath": "./cit-sync-data.json",
  "imsDataFolder": "./ims-widgets/",
  "imgSrcFolder": "./cit-store/",
  "apiKeyPath": "./CIT_API_KEY",
  "projectId": "<YOUR_PROJECT_ID>",
  "imgUrlTemplate": "https://<YOUR_DOMAIN>/images/{UID}/{VARIANT}",
  "previewUrlTemplate": "https://<YOUR_DOMAIN>/images/{UID}/{VARIANT}",
  "uploadUrlTemplate": "https://api.cloudflare.com/client/v4/accounts/{PROJECT}/images/v1",
  "fetchUrlTemplate": "https://api.cloudflare.com/client/v4/accounts/{PROJECT}/images/v1/{UID}/blob",
  "removeUrlTemplate": "https://api.cloudflare.com/client/v4/accounts/{PROJECT}/images/v1/{UID}",
  "imsUrlTemplate": "https://<YOUR_DOMAIN>/ims/{HASH}.json",
  "variants": ["120", "320", "640", "860", "1024", "1200", "2048", "max"],
  "imgTypes": ["png", "jpg", "jpeg", "webp", "gif", "svg"],
  "wsPort": 8080,
  "httpPort": 8081
}
```

This configuration example is set to work with the [Cloudflare Images API](https://developers.cloudflare.com/images/). For other CDN and API providers, you may set custom endpoints or your own API-adapters.

To use custom URLs for your images, you need to enable this feature and configure it in your service provider dashboard. 

In case you using Cloudflare Images, you can find the instructions [here](https://developers.cloudflare.com/images/manage-images/serve-images/serve-from-custom-domains/).

> **Important**: Add your image folder and API key file to `.gitignore`:
> ```
> cit-store/
> CIT_API_KEY
> cit-config.json
> ```

## Variants

Variants are very important part of the CIT workflow. They are necessary for the adaptive image embed code generation and image size control. CIT uses the convention of the variant names to generate the image URLs, based on the image width.

For example, if you have a variant named `120`, CIT will generate the URL for the image with the width of 120px.

It's a good practice to create variants for the screens with different DPI. For example, you can create a variant for the image with the width of `120` and the DPI of 1.0, and another variant for the image with the width of `240` and the DPI of 2.0.

In case you using the Cloudflare Images API, you need to create the variants in your Cloudflare Images account. More details you can find [here](https://developers.cloudflare.com/images/manage-images/serve-images/serve-uploaded-images/).

## Troubleshooting

### Config not found
CIT looks for `cit-config.json` in the current working directory. Make sure you're running the command from your project root. When run without a config, CIT will offer to create one from the reference template.

### API key errors
Ensure your API key file path in `cit-config.json` points to a valid file containing your Cloudflare Images API token.

### Port conflicts
If ports `8080` or `8081` are in use, update `wsPort` and `httpPort` in your config file.

### Upload failures
CIT automatically retries failed uploads up to 3 times. Check your API key and network connection if uploads consistently fail.

## License

MIT License © [rnd-pro.com](https://rnd-pro.com)
