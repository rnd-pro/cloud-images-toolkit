import { fillTpl } from '../../iso/fillTpl.js';

/** @type {CdnConnector} */
export const imagekit = {
  name: 'ImageKit',

  parseApiKey(apiKeyRaw) {
    let parts = apiKeyRaw.split(':');
    if (parts.length < 2) {
      throw new Error(
        'ImageKit API key must be in format: private_key:url_endpoint'
      );
    }
  },

  applyDefaults(cfg) {
    let parts = (cfg.apiKey || '').split(':');
    let urlEndpoint = parts.slice(1).join(':');
    cfg.projectId ||= urlEndpoint;
    cfg.uploadUrlTemplate ??= 'https://upload.imagekit.io/api/v1/files/upload';
    cfg.fetchUrlTemplate ??= '{PROJECT}/{UID}';
    cfg.removeUrlTemplate ??= 'https://api.imagekit.io/v1/files/{UID}';
    cfg.imgUrlTemplate ??= '{PROJECT}/tr:w-{VARIANT}/{UID}';
    cfg.previewUrlTemplate ??= cfg.imgUrlTemplate;
  },

  async upload(imgBytes, fileName, cfg) {
    let [privateKey] = cfg.apiKey.split(':');
    let authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    let formData = new FormData();
    formData.append('file', new File([new Uint8Array(imgBytes)], fileName));
    formData.append('fileName', fileName);

    let response = await (await fetch(cfg.uploadUrlTemplate, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: formData,
    })).json();

    return {
      cdnId: response.fileId,
      uploadDate: response.createdAt,
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
    let [privateKey] = cfg.apiKey.split(':');
    let authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    let removeUrl = fillTpl(cfg.removeUrlTemplate, {
      UID: cdnId,
    });

    await fetch(removeUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    });
  },
};

export default imagekit;
