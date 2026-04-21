import { cloudflare } from './cloudflare.js';
import { cloudinary } from './cloudinary.js';
import { imagekit } from './imagekit.js';
import { bunny } from './bunny.js';

/** @type {Object<string, CdnConnector>} */
const connectors = {
  cloudflare,
  cloudinary,
  imagekit,
  bunny,
};

/**
 * @param {Partial<CITConfig>} cfg
 * @returns {CdnConnector | null}
 */
export function resolveConnector(cfg) {
  if (!cfg.cdn) {
    return null;
  }
  let connector = connectors[cfg.cdn];
  if (!connector) {
    let supported = Object.keys(connectors).join(', ');
    throw new Error(`Unknown CDN connector: "${cfg.cdn}". Supported: ${supported}`);
  }
  return connector;
}
