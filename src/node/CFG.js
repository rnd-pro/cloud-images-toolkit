import fs from 'fs';
import path from 'path';

import { getPath } from './getPath.js';
import { createInterface } from 'readline';

const CONFIG_FILE = 'cit-config.json';
const configPath = path.resolve(process.cwd(), CONFIG_FILE);

if (!fs.existsSync(configPath)) {
  let refPath = getPath('./cit-config_REFERENCE.json');
  if (fs.existsSync(refPath)) {
    console.log(`🟡 CIT config not found: ${configPath}`);
    let rl = createInterface({ input: process.stdin, output: process.stdout });
    await /** @type {Promise<void>} */ (new Promise((resolve) => {
      rl.question('   Create config from reference template? [Y/n] ', (answer) => {
        rl.close();
        if (!answer || answer.toLowerCase() === 'y') {
          fs.copyFileSync(refPath, configPath);
          console.log(`   ✅ Created ${CONFIG_FILE} — please edit it with your settings.`);
          process.exit(0);
        }
        resolve();
      });
    }));
  }
  console.error(`🔴 CIT config not found: ${configPath}`);
  console.error(`   Create a "${CONFIG_FILE}" in your project root.`);
  process.exit(1);
}

let cfg;
try {
  cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`🔴 Failed to parse ${CONFIG_FILE}: ${err.message}`);
  process.exit(1);
}

const REQUIRED_FIELDS = [
  'syncDataPath',
  'imgSrcFolder',
  'apiKeyPath',
  'projectId',
  'imgUrlTemplate',
  'uploadUrlTemplate',
  'fetchUrlTemplate',
  'removeUrlTemplate',
  'variants',
  'imgTypes',
  'wsPort',
  'httpPort',
];

let missing = REQUIRED_FIELDS.filter((f) => !(f in cfg));
if (missing.length) {
  console.error(`🔴 Missing required fields in ${CONFIG_FILE}: ${missing.join(', ')}`);
  process.exit(1);
}

let apiKeyPath = path.resolve(process.cwd(), cfg.apiKeyPath);
if (!fs.existsSync(apiKeyPath)) {
  console.error(`🔴 API key file not found: ${apiKeyPath}`);
  console.error(`   Create the file or update "apiKeyPath" in ${CONFIG_FILE}.`);
  process.exit(1);
}

cfg.apiKey = fs.readFileSync(apiKeyPath, 'utf8').trim();
delete cfg.apiKeyPath;

/**
 * @type {CITConfig}
 */
export const CFG = cfg;
export default CFG;
