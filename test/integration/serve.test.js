import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const TMP_DIR = path.resolve(PROJECT_ROOT, 'TMP/test-serve');
const WS_PORT = 19180;
const HTTP_PORT = 19181;

describe('serve', () => {
  /** @type {import('child_process').ChildProcess} */
  let serverProcess;

  before(() => {
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true });
    }
    fs.mkdirSync(path.join(TMP_DIR, 'store'), { recursive: true });

    let config = {
      syncDataPath: path.join(TMP_DIR, 'sync-data.json'),
      imsDataFolder: path.join(TMP_DIR, 'ims-widgets'),
      imgSrcFolder: path.join(TMP_DIR, 'store/'),
      apiKeyPath: path.join(TMP_DIR, 'API_KEY'),
      projectId: 'test-project',
      imgUrlTemplate: 'https://example.com/{UID}/{VARIANT}',
      previewUrlTemplate: 'https://example.com/{UID}/{VARIANT}',
      uploadUrlTemplate: 'https://api.example.com/{PROJECT}/upload',
      fetchUrlTemplate: 'https://api.example.com/{PROJECT}/{UID}/blob',
      removeUrlTemplate: 'https://api.example.com/{PROJECT}/{UID}',
      variants: ['320', '640', 'max'],
      imgTypes: ['png', 'jpg'],
      wsPort: WS_PORT,
      httpPort: HTTP_PORT,
    };
    // Write config to project root so the server finds node_modules
    let configPath = path.join(PROJECT_ROOT, 'cit-config-test.json');
    fs.writeFileSync(configPath, JSON.stringify(config));
    fs.writeFileSync(path.join(TMP_DIR, 'API_KEY'), 'test-api-key');

    return new Promise((resolve, reject) => {
      // Run server from project root but override config path via a wrapper script
      serverProcess = spawn('node', [
        '-e',
        `
          import fs from 'fs';
          // Monkey-patch: override config file path for testing
          let origReadFileSync = fs.readFileSync;
          let patched = false;
          fs.readFileSync = function(p, ...args) {
            if (!patched && typeof p === 'string' && p.endsWith('cit-config.json')) {
              patched = true;
              return origReadFileSync('${configPath.replace(/\\/g, '/')}', ...args);
            }
            return origReadFileSync.call(this, p, ...args);
          };
          await import('./src/node/serve.js');
        `,
      ], {
        cwd: PROJECT_ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let started = false;
      serverProcess.stdout.on('data', (data) => {
        let output = data.toString();
        if (output.includes('HTTP server started') && !started) {
          started = true;
          setTimeout(resolve, 300);
        }
      });
      serverProcess.stderr.on('data', (data) => {
        let msg = data.toString();
        if (!started && !msg.includes('ExperimentalWarning')) {
          reject(new Error(`Server error: ${msg}`));
        }
      });
      setTimeout(() => {
        if (!started) reject(new Error('Server start timeout'));
      }, 15000);
    });
  });

  after(() => {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
    let configPath = path.join(PROJECT_ROOT, 'cit-config-test.json');
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true });
    }
  });

  it('GET / returns HTML with bundled script', async () => {
    let res = await fetch(`http://localhost:${HTTP_PORT}/`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/html');
    let body = await res.text();
    assert.ok(body.includes('<!DOCTYPE html>'));
    assert.ok(body.includes('<cit-ui>'));
    assert.ok(body.includes('<script type="module">'));
  });

  it('GET /CFG.js returns JS module', async () => {
    let res = await fetch(`http://localhost:${HTTP_PORT}/CFG.js`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/javascript');
    let body = await res.text();
    assert.ok(body.includes('export const CFG'));
  });

  it('GET /CFG.js does NOT contain apiKey', async () => {
    let res = await fetch(`http://localhost:${HTTP_PORT}/CFG.js`);
    let body = await res.text();
    assert.ok(!body.includes('test-api-key'), 'API key must not be exposed to browser');
  });

  it('GET /*.json returns sync data', async () => {
    let res = await fetch(`http://localhost:${HTTP_PORT}/data.json`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json');
    let data = await res.json();
    assert.equal(typeof data, 'object');
  });

  it('unknown route returns error', async () => {
    let res = await fetch(`http://localhost:${HTTP_PORT}/unknown`);
    let body = await res.text();
    assert.ok(body.includes('ERROR'));
  });

  it('WebSocket connection works and handles messages', async () => {
    let { default: WebSocket } = await import('ws');
    let ws = new WebSocket(`ws://localhost:${WS_PORT}`);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
      setTimeout(() => reject(new Error('WS connect timeout')), 3000);
    });

    ws.send(JSON.stringify({
      cmd: 'EDIT',
      data: {},
    }));

    let response = await new Promise((resolve, reject) => {
      ws.on('message', (data) => {
        resolve(JSON.parse(data.toString()));
      });
      setTimeout(() => reject(new Error('WS response timeout')), 3000);
    });

    assert.equal(response.cmd, 'TEXT');
    assert.ok(response.data.includes('updated'));
    ws.close();
  });
});
