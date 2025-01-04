# Cloud Images Toolkit
A powerful toolkit for managing image collections directly in your codebase, with CDN integration and advanced features.

## Features
- Automatic synchronization between local images and CDN
- Git-based image collection data tracking and collaboration
- Flat structured cloud data to local folders mapping
- Automatic image sorting for ordered sequences
- Adaptive image embed code generation
- Smart local caching - download cloud images only when needed
- Built-in image management UI application
- Interactive widget generation:
  - Image galleries
  - Panorama viewers
  - 360° object views
  - And more...
- Native Cloudflare Images API support
- Data-to-image encoding for the uniform asset control workflow (store your widgets data directly in image CDN)

## Coming soon features
- Video publishing & video collections view
- IMS collections view & management
- Advanced IMS editor
- Built-in AI image generation support and prompt editor
- Image modifications and transformations:
  - Watermarks
  - Filters
  - Cropping
  - Rotating

## Installation

```bash
npm install --save-dev cloud-images-toolkit
```

## Configuration

Create a `cit-config.json` file in your project root:
```json
{
  "syncDataPath": "./cit-sync-data.json",
  "imsDataPath": "./ims-data.json",
  "imgSrcFolder": "./cit-store/",
  "apiKeyPath": "./CIT_API_KEY",
  "apiUrl": "https://api.cloudflare.com/client/v4/accounts/<YOUR_PROJECT_ID>/images/v1",
  "baseUrl": "https://your-domain.com/images/",
  "variants": ["120", "320", "640", "860", "1024", "1200", "2048", "max", "public"],
  "imgTypes": ["png", "jpg", "jpeg", "webp", "gif", "svg"],
  "wsPort": 8080,
  "httpPort": 8081
}
```
This configuration example is set to work with the [Cloudflare Images API](https://developers.cloudflare.com/images/). For other CDN and API providers, you may set custom endpoints or your own API-adapters.

To use custom URLs for your images, you need to enable this feature and configure it in your service provider dashboard. 

In case you using Cloudflare Images, you can find the instructions [here](https://developers.cloudflare.com/images/manage-images/serve-images/serve-from-custom-domains/).

> **Important**: Add your image folder and API key file to `.gitignore`

## Usage

Start the toolkit server:
```bash
node ./node_modules/cloud-images-toolkit/src/node/serve.js
```

Or add `cit` script to your `package.json`:
```json
"scripts": {
  "cit": "node ./node_modules/cloud-images-toolkit/src/node/serve.js"
}
```

And then use npm script:
```bash
npm run cit
```

Then open the dashboard at: `http://localhost:<httpPort>`

## License

MIT License © [rnd-pro.com](https://rnd-pro.com)
