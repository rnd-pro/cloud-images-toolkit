import { defineConfig } from '@playwright/test';

const HTTP_PORT = 19381;
const WS_PORT = 19380;

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: `http://localhost:${HTTP_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: `node -e "
      import fs from 'fs';
      import path from 'path';
      let tmp = './TMP/test-e2e';
      fs.mkdirSync(tmp + '/store', { recursive: true });
      let config = {
        syncDataPath: path.resolve(tmp, 'sync-data.json'),
        imsFolder: path.resolve(tmp, 'ims-widgets/'),
        imgSrcFolder: path.resolve(tmp, 'store/'),
        apiKeyPath: path.resolve(tmp, 'API_KEY'),
        projectId: 'test-project',
        imgUrlTemplate: 'https://example.com/{UID}/{VARIANT}',
        previewUrlTemplate: 'https://example.com/{UID}/{VARIANT}',
        uploadUrlTemplate: 'https://api.example.com/{PROJECT}/upload',
        fetchUrlTemplate: 'https://api.example.com/{PROJECT}/{UID}/blob',
        removeUrlTemplate: 'https://api.example.com/{PROJECT}/{UID}',
        variants: ['320', '640', '1024', 'max'],
        imgTypes: ['png', 'jpg', 'webp'],
        wsPort: ${WS_PORT},
        httpPort: ${HTTP_PORT},
      };
      fs.writeFileSync(path.resolve(tmp, 'cit-config.json'), JSON.stringify(config));
      fs.writeFileSync(path.resolve(tmp, 'API_KEY'), 'test-api-key');
      fs.writeFileSync(path.resolve(tmp, 'sync-data.json'), JSON.stringify({}));

      // Monkey-patch config loading
      let orig = fs.readFileSync;
      let done = false;
      fs.readFileSync = function(p, ...a) {
        if (!done && typeof p === 'string' && p.endsWith('cit-config.json')) {
          done = true;
          return orig(path.resolve(tmp, 'cit-config.json'), ...a);
        }
        return orig.call(this, p, ...a);
      };
      await import('./src/node/serve.js');
    "`,
    port: HTTP_PORT,
    reuseExistingServer: false,
    timeout: 15000,
  },
});
