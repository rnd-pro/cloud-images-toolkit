import fs from 'fs';

let cfg = JSON.parse(fs.readFileSync('./cit-config.json', 'utf8'));
cfg.apiKey = fs.readFileSync(cfg.apiKeyPath, 'utf8');
delete cfg.apiKeyPath;

/**
 * @type {CITConfig}
 */
export const CFG = cfg;
export default CFG;
