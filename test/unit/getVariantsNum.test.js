import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getVariantsNum } from '../../src/iso/getVariantsNum.js';

describe('getVariantsNum', () => {
  it('filters out non-numeric strings and sorts numerically', () => {
    assert.deepEqual(getVariantsNum(['120', 'max', '320', 'public']), [120, 320]);
  });

  it('sorts numerically, not lexicographically', () => {
    assert.deepEqual(getVariantsNum(['640', '120', '1024', '2048']), [120, 640, 1024, 2048]);
  });

  it('returns empty array for all non-numeric', () => {
    assert.deepEqual(getVariantsNum(['max', 'public', 'thumbnail']), []);
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(getVariantsNum([]), []);
  });

  it('parses integer part of mixed strings', () => {
    assert.deepEqual(getVariantsNum(['120px', '320']), [120, 320]);
  });
});
