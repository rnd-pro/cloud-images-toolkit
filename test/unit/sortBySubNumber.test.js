import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sortBySubNumber } from '../../src/iso/sortBySubNumber.js';

describe('sortBySubNumber', () => {
  it('sorts paths with numeric suffixes naturally', () => {
    let input = ['img_2.png', 'img_10.png', 'img_1.png'];
    assert.deepEqual(sortBySubNumber(input), ['img_1.png', 'img_2.png', 'img_10.png']);
  });

  it('keeps already sorted input unchanged', () => {
    let input = ['a_1.jpg', 'a_2.jpg', 'a_3.jpg'];
    assert.deepEqual(sortBySubNumber(input), ['a_1.jpg', 'a_2.jpg', 'a_3.jpg']);
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(sortBySubNumber([]), []);
  });

  it('sorts paths with deep numeric segments', () => {
    let input = ['folder/img_12.png', 'folder/img_2.png', 'folder/img_3.png'];
    assert.deepEqual(sortBySubNumber(input), ['folder/img_2.png', 'folder/img_3.png', 'folder/img_12.png']);
  });

  it('handles single element array', () => {
    assert.deepEqual(sortBySubNumber(['only.png']), ['only.png']);
  });
});
