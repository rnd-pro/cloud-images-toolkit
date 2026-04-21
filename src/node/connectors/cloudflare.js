import { fillTpl } from '../../iso/fillTpl.js';

/** @type {CdnConnector} */
export const cloudflare = {
  name: 'Cloudflare Images',

  parseApiKey(apiKeyRaw) {
    if (!apiKeyRaw) {
      throw new Error('Cloudflare API key is empty');
    }
  },

  applyDefaults(cfg) {
    cfg.uploadUrlTemplate ??= 'https://api.cloudflare.com/client/v4/accounts/{PROJECT}/images/v1';
    cfg.fetchUrlTemplate ??= 'https://api.cloudflare.com/client/v4/accounts/{PROJECT}/images/v1/{UID}/blob';
    cfg.removeUrlTemplate ??= 'https://api.cloudflare.com/client/v4/accounts/{PROJECT}/images/v1/{UID}';
    cfg.imgUrlTemplate ??= 'https://imagedelivery.net/{PROJECT}/{UID}/{VARIANT}';
    cfg.previewUrlTemplate ??= cfg.imgUrlTemplate;
  },

  async upload(imgBytes, fileName, cfg) {
    let formData = new FormData();
    formData.append('file', new File([new Uint8Array(imgBytes)], fileName));
    formData.append('metadata', JSON.stringify({ localPath: fileName }));

    let uploadUrl = fillTpl(cfg.uploadUrlTemplate, {
      PROJECT: cfg.projectId,
    });

    let response = await (await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: formData,
    })).json();

    return {
      cdnId: response.result.id,
      uploadDate: response.result.uploaded,
    };
  },

  async fetchBlob(cdnId, cfg) {
    let fetchUrl = fillTpl(cfg.fetchUrlTemplate, {
      UID: cdnId,
      PROJECT: cfg.projectId,
    });

    let response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
    });

    return response.arrayBuffer();
  },

  async remove(cdnId, cfg) {
    let removeUrl = fillTpl(cfg.removeUrlTemplate, {
      UID: cdnId,
      PROJECT: cfg.projectId,
    });

    await fetch(removeUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
    });
  },
};

export default cloudflare;
