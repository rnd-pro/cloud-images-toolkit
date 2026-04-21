import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { resolveConnector } from '../../src/node/connectors/index.js';
import { cloudflare } from '../../src/node/connectors/cloudflare.js';
import { cloudinary } from '../../src/node/connectors/cloudinary.js';
import { imagekit } from '../../src/node/connectors/imagekit.js';
import { bunny } from '../../src/node/connectors/bunny.js';

describe('resolveConnector', () => {
  it('returns null when cdn is not set', () => {
    let result = resolveConnector({});
    assert.equal(result, null);
  });

  it('returns cloudflare connector', () => {
    let result = resolveConnector({ cdn: 'cloudflare' });
    assert.equal(result.name, 'Cloudflare Images');
  });

  it('returns cloudinary connector', () => {
    let result = resolveConnector({ cdn: 'cloudinary' });
    assert.equal(result.name, 'Cloudinary');
  });

  it('returns imagekit connector', () => {
    let result = resolveConnector({ cdn: 'imagekit' });
    assert.equal(result.name, 'ImageKit');
  });

  it('returns bunny connector', () => {
    let result = resolveConnector({ cdn: 'bunny' });
    assert.equal(result.name, 'Bunny.net');
  });

  it('throws on unknown cdn', () => {
    assert.throws(() => resolveConnector({ cdn: /** @type {*} */ ('unknown') }), /Unknown CDN connector/);
  });
});

describe('cloudflare connector', () => {
  it('applies default URL templates', () => {
    let cfg = { apiKey: 'test-token', projectId: 'acc123' };
    cloudflare.applyDefaults(cfg);
    assert.ok(cfg.uploadUrlTemplate.includes('cloudflare.com'));
    assert.ok(cfg.fetchUrlTemplate.includes('{UID}'));
    assert.ok(cfg.removeUrlTemplate.includes('{UID}'));
    assert.ok(cfg.imgUrlTemplate.includes('{VARIANT}'));
  });

  it('does not override existing templates', () => {
    let cfg = {
      apiKey: 'test-token',
      projectId: 'acc123',
      uploadUrlTemplate: 'https://custom.upload.example.com',
    };
    cloudflare.applyDefaults(cfg);
    assert.equal(cfg.uploadUrlTemplate, 'https://custom.upload.example.com');
  });

  it('parseApiKey accepts non-empty string', () => {
    assert.doesNotThrow(() => cloudflare.parseApiKey('some-token'));
  });

  it('parseApiKey rejects empty string', () => {
    assert.throws(() => cloudflare.parseApiKey(''), /empty/);
  });
});

describe('cloudinary connector', () => {
  it('applies default URL templates and extracts projectId', () => {
    let cfg = { apiKey: 'mycloud:apikey123:apisecret456' };
    cloudinary.applyDefaults(cfg);
    assert.equal(cfg.projectId, 'mycloud');
    assert.ok(cfg.uploadUrlTemplate.includes('cloudinary.com'));
    assert.ok(cfg.imgUrlTemplate.includes('w_{VARIANT}'));
  });

  it('parseApiKey accepts valid format', () => {
    assert.doesNotThrow(() => cloudinary.parseApiKey('cloud:key:secret'));
  });

  it('parseApiKey rejects invalid format', () => {
    assert.throws(() => cloudinary.parseApiKey('only-one-value'), /cloud_name:api_key:api_secret/);
  });
});

describe('imagekit connector', () => {
  it('applies default URL templates and extracts projectId', () => {
    let cfg = { apiKey: 'pk_test:https://ik.imagekit.io/myid' };
    imagekit.applyDefaults(cfg);
    assert.equal(cfg.projectId, 'https://ik.imagekit.io/myid');
    assert.ok(cfg.uploadUrlTemplate.includes('imagekit.io'));
    assert.ok(cfg.imgUrlTemplate.includes('tr:w-{VARIANT}'));
  });

  it('parseApiKey accepts valid format', () => {
    assert.doesNotThrow(() => imagekit.parseApiKey('key:https://ik.imagekit.io/id'));
  });

  it('parseApiKey rejects invalid format', () => {
    assert.throws(() => imagekit.parseApiKey('only-key'), /private_key:url_endpoint/);
  });
});

describe('bunny connector', () => {
  it('applies default URL templates and extracts projectId', () => {
    let cfg = { apiKey: 'pass123:my-zone:https://my-zone.b-cdn.net' };
    bunny.applyDefaults(cfg);
    assert.equal(cfg.projectId, 'my-zone');
    assert.ok(cfg.uploadUrlTemplate.includes('bunnycdn.com'));
    assert.ok(cfg.imgUrlTemplate.includes('width={VARIANT}'));
  });

  it('parseApiKey accepts valid format', () => {
    assert.doesNotThrow(() => bunny.parseApiKey('pass:zone:https://zone.b-cdn.net'));
  });

  it('parseApiKey rejects invalid format', () => {
    assert.throws(() => bunny.parseApiKey('only-pass'), /storage_password:storage_zone:pull_zone_url/);
  });
});
