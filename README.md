# Cloud Images Toolkit
A powerful toolkit for managing image collections directly in your codebase, with CDN integration and advanced features.

## Features
- Automatic synchronization between local images and CDN
- Git-based image collection tracking and collaboration
- Adaptive image embed code generation
- Smart local caching - download cloud images only when needed
- Built-in image management UI application
- Interactive widget generation:
  - Image galleries
  - Panorama viewers
  - 360° object views
  - And more...
- Native Cloudflare Images API support

## Installation

```bash
npm install cloud-images-toolkit
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

> **Important**: Add your image folder and API key file to `.gitignore`

## Usage

Start the toolkit server:
```bash
node ./node_modules/cloud-images-toolkit/src/node/serve.js
```

Then open the dashboard at: `http://localhost:8081`

## License

MIT License © [rnd-pro.com](https://rnd-pro.com)