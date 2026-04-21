import { fillTpl } from '../../iso/fillTpl.js';

/** @type {CdnConnector} */
export const bunny = {
  name: 'Bunny.net',

  parseApiKey(apiKeyRaw) {
    let parts = apiKeyRaw.split(':');
    if (parts.length < 3) {
      throw new Error(
        'Bunny.net API key must be in format: storage_password:storage_zone:pull_zone_url'
      );
    }
  },

  applyDefaults(cfg) {
    let parts = (cfg.apiKey || '').split(':');
    let storageZone = parts[1] || '';
    let pullZoneUrl = parts.slice(2).join(':');
    cfg.projectId ||= storageZone;
    cfg.uploadUrlTemplate ??= 'https://storage.bunnycdn.com/{PROJECT}/{UID}';
    cfg.fetchUrlTemplate ??= 'https://storage.bunnycdn.com/{PROJECT}/{UID}';
    cfg.removeUrlTemplate ??= 'https://storage.bunnycdn.com/{PROJECT}/{UID}';
    cfg.imgUrlTemplate ??= pullZoneUrl + '/{UID}?width={VARIANT}';
    cfg.previewUrlTemplate ??= cfg.imgUrlTemplate;
  },

  async upload(imgBytes, fileName, cfg) {
    let [storagePassword] = cfg.apiKey.split(':');

    let uploadUrl = fillTpl(cfg.uploadUrlTemplate, {
      PROJECT: cfg.projectId,
      UID: fileName,
    });

    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': storagePassword,
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array(imgBytes),
    });

    return {
      cdnId: fileName,
      uploadDate: new Date().toISOString(),
    };
  },

  async fetchBlob(cdnId, cfg) {
    let [storagePassword] = cfg.apiKey.split(':');

    let fetchUrl = fillTpl(cfg.fetchUrlTemplate, {
      UID: cdnId,
      PROJECT: cfg.projectId,
    });

    let response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'AccessKey': storagePassword,
      },
    });

    return response.arrayBuffer();
  },

  async remove(cdnId, cfg) {
    let [storagePassword] = cfg.apiKey.split(':');

    let removeUrl = fillTpl(cfg.removeUrlTemplate, {
      UID: cdnId,
      PROJECT: cfg.projectId,
    });

    await fetch(removeUrl, {
      method: 'DELETE',
      headers: {
        'AccessKey': storagePassword,
      },
    });
  },
};

export default bunny;
