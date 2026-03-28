import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const TMP_DIR = path.resolve(PROJECT_ROOT, 'TMP/test-foldersync');

const FOLDERSYNC_URL = pathToFileURL(path.join(PROJECT_ROOT, 'src/node/FolderSync.js')).href;
const CFG_URL = pathToFileURL(path.join(PROJECT_ROOT, 'src/node/CFG.js')).href;

/** Write a test script and run it with cwd=TMP_DIR so CFG reads config from there */
function runTestScript(name, code) {
  let scriptPath = path.join(TMP_DIR, `${name}.mjs`);
  fs.writeFileSync(scriptPath, code);
  return execFileSync('node', [scriptPath], {
    cwd: TMP_DIR,
    encoding: 'utf8',
    timeout: 10000,
    stdio: 'pipe',
  });
}

describe('FolderSync', () => {
  let syncDataPath;

  before(() => {
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true });
    }
    fs.mkdirSync(path.join(TMP_DIR, 'store'), { recursive: true });

    syncDataPath = path.join(TMP_DIR, 'sync-data.json');

    let config = {
      syncDataPath: syncDataPath,
      imsDataPath: path.join(TMP_DIR, 'ims-data.json'),
      imgSrcFolder: path.join(TMP_DIR, 'store/'),
      apiKeyPath: './API_KEY',
      projectId: 'test-project',
      imgUrlTemplate: 'https://example.com/{UID}/{VARIANT}',
      previewUrlTemplate: 'https://example.com/{UID}/{VARIANT}',
      uploadUrlTemplate: 'https://api.example.com/{PROJECT}/upload',
      fetchUrlTemplate: 'https://api.example.com/{PROJECT}/{UID}/blob',
      removeUrlTemplate: 'https://api.example.com/{PROJECT}/{UID}',
      variants: ['320', '640', 'max'],
      imgTypes: ['png', 'jpg'],
      wsPort: 19280,
      httpPort: 19281,
    };
    // Write config and API key to TMP_DIR — CWD will be TMP_DIR
    fs.writeFileSync(path.join(TMP_DIR, 'cit-config.json'), JSON.stringify(config));
    fs.writeFileSync(path.join(TMP_DIR, 'API_KEY'), 'test-api-key');
  });

  after(() => {
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true });
    }
  });

  it('checkDir creates directory structure', () => {
    let testPath = path.join(TMP_DIR, 'deep/nested/dir/file.json');
    let dirPath = path.dirname(testPath);
    assert.ok(!fs.existsSync(dirPath));

    let result = runTestScript('test-checkdir', `
import { checkDir } from '${FOLDERSYNC_URL}';
import fs from 'fs';
checkDir('${testPath}');
console.log(JSON.stringify({ exists: fs.existsSync('${dirPath}') }));
`);
    let parsed = JSON.parse(result.trim());
    assert.equal(parsed.exists, true);
  });

  it('writeSyncData writes JSON data to disk', () => {
    let testData = {
      './store/test.png': {
        cdnId: 'abc123',
        uploadDate: '2026-01-01',
        imageName: 'test.png',
        alt: '',
        width: '100',
        height: '100',
        aspectRatio: '1/1',
        srcFormat: 'PNG',
      },
    };

    let result = runTestScript('test-writesync', `
import FolderSync from '${FOLDERSYNC_URL}';
import fs from 'fs';
await FolderSync.writeSyncData(${JSON.stringify(testData)});
let written = JSON.parse(fs.readFileSync('${syncDataPath}', 'utf8'));
console.log(JSON.stringify({
  ok: !!written['./store/test.png'],
  cdnId: written['./store/test.png']?.cdnId,
}));
`);
    let parsed = JSON.parse(result.trim());
    assert.equal(parsed.ok, true);
    assert.equal(parsed.cdnId, 'abc123');
  });

  it('writeSyncData rejects on write failure', () => {
    let result = runTestScript('test-writefail', `
import FolderSync from '${FOLDERSYNC_URL}';
import CFG from '${CFG_URL}';
let origPath = CFG.syncDataPath;
CFG.syncDataPath = '/nonexistent/readonly/path/data.json';
try {
  await FolderSync.writeSyncData({});
  console.log(JSON.stringify({ rejected: false }));
} catch (e) {
  console.log(JSON.stringify({ rejected: true }));
}
CFG.syncDataPath = origPath;
`);
    let parsed = JSON.parse(result.trim());
    assert.equal(parsed.rejected, true);
  });
});
