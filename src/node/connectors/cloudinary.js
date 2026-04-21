import crypto from 'crypto';
import { fillTpl } from '../../iso/fillTpl.js';

/**
 * @param {Object<string, string>} params
 * @param {string} apiSecret
 * @returns {string}
 */
function generateSignature(params, apiSecret) {
  let sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(sorted + apiSecret).digest('hex');
}

/** @type {CdnConnector} */
export const cloudinary = {
  name: 'Cloudinary',

  parseApiKey(apiKeyRaw) {
    let parts = apiKeyRaw.split(':');
    if (parts.length < 3) {
      throw new Error(
        'Cloudinary API key must be in format: cloud_name:api_key:api_secret'
      );
    }
  },

  applyDefaults(cfg) {
    let [cloudName] = (cfg.apiKey || '').split(':');
    cfg.projectId ||= cloudName;
    cfg.uploadUrlTemplate ??= 'https://api.cloudinary.com/v1_1/{PROJECT}/image/upload';
    cfg.fetchUrlTemplate ??= 'https://res.cloudinary.com/{PROJECT}/image/upload/{UID}';
    cfg.removeUrlTemplate ??= 'https://api.cloudinary.com/v1_1/{PROJECT}/image/destroy';
    cfg.imgUrlTemplate ??= 'https://res.cloudinary.com/{PROJECT}/image/upload/w_{VARIANT},c_fit,f_auto,q_auto/{UID}';
    cfg.previewUrlTemplate ??= 'https://res.cloudinary.com/{PROJECT}/image/upload/w_{VARIANT},c_fit,f_auto,q_auto/{UID}';
  },

  async upload(imgBytes, fileName, cfg) {
    let [, apiKey, apiSecret] = cfg.apiKey.split(':');
    let timestamp = Math.floor(Date.now() / 1000).toString();

    let params = { timestamp };
    let signature = generateSignature(params, apiSecret);

    let formData = new FormData();
    formData.append('file', new File([new Uint8Array(imgBytes)], fileName));
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    let uploadUrl = fillTpl(cfg.uploadUrlTemplate, {
      PROJECT: cfg.projectId,
    });

    let response = await (await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })).json();

    return {
      cdnId: response.public_id,
      uploadDate: response.created_at,
    };
  },

  async fetchBlob(cdnId, cfg) {
    let fetchUrl = fillTpl(cfg.fetchUrlTemplate, {
      UID: cdnId,
      PROJECT: cfg.projectId,
    });

    let response = await fetch(fetchUrl, {
      method: 'GET',
    });

    return response.arrayBuffer();
  },

  async remove(cdnId, cfg) {
    let [, apiKey, apiSecret] = cfg.apiKey.split(':');
    let timestamp = Math.floor(Date.now() / 1000).toString();

    let params = { public_id: cdnId, timestamp };
    let signature = generateSignature(params, apiSecret);

    let removeUrl = fillTpl(cfg.removeUrlTemplate, {
      PROJECT: cfg.projectId,
    });

    let formData = new FormData();
    formData.append('public_id', cdnId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    await fetch(removeUrl, {
      method: 'POST',
      body: formData,
    });
  },
};

export default cloudinary;
