import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAspectRatio } from '../../src/iso/getAspectRatio.js';

describe('getAspectRatio', () => {
  it('returns 16/9 for 1920x1080', () => {
    assert.equal(getAspectRatio(1920, 1080), '16/9');
  });

  it('returns 1/1 for square', () => {
    assert.equal(getAspectRatio(800, 800), '1/1');
  });

  it('returns 4/3 for 640x480', () => {
    assert.equal(getAspectRatio(640, 480), '4/3');
  });

  it('handles prime dimensions', () => {
    assert.equal(getAspectRatio(1920, 1079), '1920/1079');
  });

  it('handles very small dimensions', () => {
    assert.equal(getAspectRatio(1, 1), '1/1');
    assert.equal(getAspectRatio(2, 3), '2/3');
  });

  it('handles 3/2 ratio', () => {
    assert.equal(getAspectRatio(3000, 2000), '3/2');
  });
});
