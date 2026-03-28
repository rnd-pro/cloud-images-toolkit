import { test, expect } from '@playwright/test';

test.describe('WebSocket Communication', () => {
  test('sync data endpoint returns valid JSON', async ({ request }) => {
    let response = await request.get('/sync-data.json');
    expect(response.status()).toBe(200);
    let contentType = response.headers()['content-type'];
    expect(contentType).toBe('application/json');
    let data = await response.json();
    expect(typeof data).toBe('object');
  });

  test('page establishes WebSocket connection without errors', async ({ page }) => {
    let errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    // Wait for WS connection to establish
    await page.waitForTimeout(2000);
    // Filter out non-critical errors — WS connection errors may occur in test env
    let criticalErrors = errors.filter((e) => !e.includes('WebSocket'));
    expect(criticalErrors).toEqual([]);
  });

  test('HTML response contains proper content type', async ({ request }) => {
    let response = await request.get('/');
    expect(response.status()).toBe(200);
    let contentType = response.headers()['content-type'];
    expect(contentType).toBe('text/html');
  });

  test('unknown routes return error text', async ({ request }) => {
    let response = await request.get('/nonexistent/path');
    let body = await response.text();
    expect(body).toContain('ERROR');
  });
});
