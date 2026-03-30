import { test, expect } from '@playwright/test';

test.describe('Dashboard UX Improvements Phase 4', () => {
  test('loader spinner is initially hidden', async ({ page }) => {
    await page.goto('/');
    // The web component should initialize
    await page.waitForTimeout(500);

    const loader = page.locator('cit-ui >> css=[loader]');
    await expect(loader).toBeAttached();

    // Check that hidden applies 'display: none' from updated css
    await expect(loader).toBeHidden();
  });

  test('empty state handles visibility based on items', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const emptyState = page.locator('cit-ui >> css=[empty-state]').first();
    await expect(emptyState).toBeAttached();

    // In testing env, we use a mocked config with NO files but there is a 'store' folder
    // But since `store/` is the base dir, and we only create `store` and its `cit-config.json` is at parent level...
    // Let's actually check if empty-state is hidden because there's generally a folder or item
    const isVisible = await emptyState.isVisible();
    const hasItems = await page.locator('cit-ui >> css=[itemize-container] > *').count() > 0;
    
    if (hasItems) {
      expect(isVisible).toBe(false);
    } else {
      expect(isVisible).toBe(true);
    }
  });

  test('wsStatusIcon binding and styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // After 1 sec, WS should be connected and icon changed
    const wsBtn = page.locator('cit-ui >> text=wifi').locator('..');
    await expect(wsBtn).toBeAttached();
    
    // Check if the title text binding works for wsStatus
    await expect(wsBtn).toHaveAttribute('title', 'connected');
  });

  test('CSS structure is valid and applies grid to cit-ui', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const display = await page.evaluate(() => {
      const ui = document.querySelector('cit-ui');
      return window.getComputedStyle(ui).display;
    });
    // This will fail if CSS parser crashed (it would return "inline" or "block" instead of "grid")
    expect(display).toBe('grid');
  });
});
