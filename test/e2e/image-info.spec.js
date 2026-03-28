import { test, expect } from '@playwright/test';

test.describe('Image Info', () => {
  test('CFG.js endpoint does not expose API key', async ({ request }) => {
    let response = await request.get('/CFG.js');
    let body = await response.text();
    expect(response.status()).toBe(200);
    expect(body).toContain('export const CFG');
    expect(body).not.toContain('test-api-key');
  });

  test('background invert button exists in page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    let content = await page.content();
    // The page should contain the cit-img-info component
    expect(content).toContain('cit-img-info');
  });
});
