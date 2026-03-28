import { test, expect } from '@playwright/test';

test.describe('IMS Composer', () => {
  test('ims-composer element is present in the page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    let content = await page.content();
    expect(content).toContain('cit-ims-composer');
  });

  test('composer is not active by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    let composer = page.locator('cit-ims-composer');
    await expect(composer).toBeAttached();
    // Active attribute should not be present initially
    await expect(composer).not.toHaveAttribute('active');
  });
});
