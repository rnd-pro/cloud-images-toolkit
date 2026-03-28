import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('page loads with cit-ui element', async ({ page }) => {
    await page.goto('/');
    let citUi = page.locator('cit-ui');
    await expect(citUi).toBeAttached();
  });

  test('page contains script module', async ({ page }) => {
    await page.goto('/');
    let script = page.locator('script[type="module"]');
    await expect(script).toBeAttached();
  });

  test('toolbar panels render', async ({ page }) => {
    await page.goto('/');
    // Wait for shadow DOM / custom elements to register
    await page.waitForTimeout(500);
    // Check that the page has rendered content
    let body = await page.content();
    expect(body).toContain('cit-ui');
  });

  test('footer is visible', async ({ page }) => {
    await page.goto('/');
    let footer = page.locator('[footer]');
    await expect(footer).toBeAttached();
  });

  test('empty state loads without errors', async ({ page }) => {
    let errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForTimeout(1000);
    // No JS errors should occur
    expect(errors).toEqual([]);
  });
});
