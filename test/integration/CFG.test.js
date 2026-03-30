import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.resolve(__dirname, '../../TMP/test-cfg');

describe('CFG', () => {
  let origCwd;

  beforeEach(() => {
    origCwd = process.cwd();
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true });
    }
    fs.mkdirSync(TMP_DIR, { recursive: true });
  });

  afterEach(() => {
    process.chdir(origCwd);
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true });
    }
  });

  it('exits with error when config file is missing', async () => {
    process.chdir(TMP_DIR);
    let exitCode = null;
    let origExit = process.exit;
    let origError = console.error;
    let errors = [];

    process.exit = (code) => { exitCode = code; throw new Error('EXIT'); };
    console.error = (msg) => { errors.push(msg); };

    try {
      // Dynamic import in a subprocess would be cleaner, but for simplicity:
      let { execSync } = await import('child_process');
      let result = execSync(
        `node -e "import('./../../src/node/CFG.js')" 2>&1`,
        { cwd: TMP_DIR, encoding: 'utf8', timeout: 5000, stdio: 'pipe', env: { ...process.env, NODE_NO_READLINE: '1' } }
      );
    } catch (err) {
      assert.ok(err.status !== 0 || err.stderr, 'Should exit with non-zero code');
    } finally {
      process.exit = origExit;
      console.error = origError;
    }
  });

  it('exits with error when required fields are missing', async () => {
    process.chdir(TMP_DIR);
    fs.writeFileSync(path.join(TMP_DIR, 'cit-config.json'), JSON.stringify({ syncDataPath: './data.json' }));
    fs.writeFileSync(path.join(TMP_DIR, 'API_KEY'), 'test-key');

    let { execSync } = await import('child_process');
    try {
      execSync(
        `node -e "await import('${path.resolve(__dirname, '../../src/node/CFG.js').replace(/\\/g, '/')}')"`,
        { cwd: TMP_DIR, encoding: 'utf8', timeout: 5000, stdio: 'pipe', input: 'n\n' }
      );
      assert.fail('Should have exited');
    } catch (err) {
      assert.ok(err.stderr.includes('Missing required fields') || err.status !== 0);
    }
  });

  it('loads valid config successfully', async () => {
    process.chdir(TMP_DIR);
    let config = {
      syncDataPath: './data.json',
      imsFolder: './ims/',
      imgSrcFolder: './store/',
      apiKeyPath: './API_KEY',
      projectId: 'test-project',
      imgUrlTemplate: 'https://example.com/{UID}/{VARIANT}',
      previewUrlTemplate: 'https://example.com/{UID}/{VARIANT}',
      uploadUrlTemplate: 'https://api.example.com/{PROJECT}/upload',
      fetchUrlTemplate: 'https://api.example.com/{PROJECT}/{UID}/blob',
      removeUrlTemplate: 'https://api.example.com/{PROJECT}/{UID}',
      variants: ['320', '640', 'max'],
      imgTypes: ['png', 'jpg'],
      wsPort: 19080,
      httpPort: 19081,
    };
    fs.writeFileSync(path.join(TMP_DIR, 'cit-config.json'), JSON.stringify(config));
    fs.writeFileSync(path.join(TMP_DIR, 'API_KEY'), 'test-api-key-123');

    let { execSync } = await import('child_process');
    let result = execSync(
      `node -e "let m = await import('${path.resolve(__dirname, '../../src/node/CFG.js').replace(/\\/g, '/')}'); console.log(JSON.stringify({ok: true, port: m.CFG.httpPort, hasKey: !!m.CFG.apiKey, noKeyPath: !m.CFG.apiKeyPath}))"`,
      { cwd: TMP_DIR, encoding: 'utf8', timeout: 5000, stdio: 'pipe', input: 'n\n' }
    );
    let parsed = JSON.parse(result.trim());
    assert.equal(parsed.ok, true);
    assert.equal(parsed.port, 19081);
    assert.equal(parsed.hasKey, true);
    assert.equal(parsed.noKeyPath, true);
  });
});
