import fs from 'fs';
import path from 'path';

import { getPath } from './getPath.js';
import { createInterface } from 'readline';
import { resolveConnector } from './connectors/index.js';
import { getFreePorts } from './getFreePorts.js';

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

let rawConfig;
try {
  rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`🔴 Failed to parse ${CONFIG_FILE}: ${err.message}`);
  process.exit(1);
}

/** @type {CITConfig[]} */
let configArray = Array.isArray(rawConfig) ? rawConfig : [rawConfig];

if (!configArray.length) {
  console.error(`🔴 ${CONFIG_FILE} contains an empty array`);
  process.exit(1);
}

const ALWAYS_REQUIRED = [
  'syncDataPath',
  'imgSrcFolder',
  'apiKeyPath',
  'variants',
  'imgTypes',
];

const TEMPLATE_FIELDS = [
  'projectId',
  'imgUrlTemplate',
  'uploadUrlTemplate',
  'fetchUrlTemplate',
  'removeUrlTemplate',
];

/** @type {CITConfig[]} */
let configs = [];
/** @type {(CdnConnector | null)[]} */
let connectors = [];

for (let i = 0; i < configArray.length; i++) {
  let cfg = configArray[i];
  let label = cfg.name || `Collection #${i}`;

  let connector = resolveConnector(cfg);

  let requiredFields = [...ALWAYS_REQUIRED];
  if (!connector) {
    requiredFields.push(...TEMPLATE_FIELDS);
  }

  let missing = requiredFields.filter((f) => !(f in cfg));
  if (missing.length) {
    console.error(`🔴 [${label}] Missing required fields in ${CONFIG_FILE}: ${missing.join(', ')}`);
    process.exit(1);
  }

  let apiKeyPath = path.resolve(process.cwd(), cfg.apiKeyPath);
  if (!fs.existsSync(apiKeyPath)) {
    console.error(`🔴 [${label}] API key file not found: ${apiKeyPath}`);
    console.error(`   Create the file or update "apiKeyPath" in ${CONFIG_FILE}.`);
    process.exit(1);
  }

  cfg.apiKey = fs.readFileSync(apiKeyPath, 'utf8').trim();

  if (connector) {
    try {
      connector.parseApiKey(cfg.apiKey);
    } catch (err) {
      console.error(`🔴 [${label}] Invalid API key format for ${connector.name}: ${err.message}`);
      process.exit(1);
    }
    connector.applyDefaults(cfg);
    console.log(`✅ [${label}] CDN connector: ${connector.name}`);
  }

  if (!cfg.name) {
    let folder = cfg.imgSrcFolder.replace(/\/+$/, '');
    cfg.name = folder.split('/').pop() || `Collection ${i}`;
  }

  configs.push(cfg);
  connectors.push(connector);
}

// Resolve ports: first config that defines them wins, else auto-discover
let wsPort = configs.find((c) => c.wsPort)?.wsPort;
let httpPort = configs.find((c) => c.httpPort)?.httpPort;

if (!wsPort || !httpPort) {
  let needed = (!wsPort ? 1 : 0) + (!httpPort ? 1 : 0);
  let freePorts = await getFreePorts(needed);
  let idx = 0;
  if (!wsPort) wsPort = freePorts[idx++];
  if (!httpPort) httpPort = freePorts[idx++];
}

export { configs, connectors };

/** @type {{ ws: number, http: number }} */
export const ports = { ws: wsPort, http: httpPort };

/**
 * @type {CITConfig}
 */
export const CFG = configs[0];

/** @type {CdnConnector | null} */
export const cdnConnector = connectors[0];

export default CFG;
