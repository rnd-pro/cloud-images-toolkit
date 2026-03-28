import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fillTpl } from '../../src/iso/fillTpl.js';

describe('fillTpl', () => {
  it('replaces a single placeholder', () => {
    assert.equal(fillTpl('https://example.com/{UID}', { UID: 'abc123' }), 'https://example.com/abc123');
  });

  it('replaces multiple different placeholders', () => {
    let result = fillTpl('https://api.com/{PROJECT}/images/{UID}/{VARIANT}', {
      PROJECT: 'proj1',
      UID: 'img42',
      VARIANT: '1024',
    });
    assert.equal(result, 'https://api.com/proj1/images/img42/1024');
  });

  it('replaces multiple occurrences of the same placeholder', () => {
    assert.equal(fillTpl('{X}-{X}-{X}', { X: 'a' }), 'a-a-a');
  });

  it('leaves unreferenced placeholders intact', () => {
    assert.equal(fillTpl('{UID}/{VARIANT}', { UID: 'abc' }), 'abc/{VARIANT}');
  });

  it('returns template unchanged with empty data', () => {
    assert.equal(fillTpl('no placeholders here', {}), 'no placeholders here');
  });

  it('converts numeric values to strings', () => {
    assert.equal(fillTpl('size={WIDTH}', { WIDTH: 1024 }), 'size=1024');
  });
});
