import { test, expect } from '@playwright/test';

test.describe('Keyboard shortcut attribution test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/kbdAttribution.html', { waitUntil: 'networkidle' });
  });

  test('Keyboard shortcuts attribution opens up dialog', async ({ page }) => {
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const dialog = await page.$eval(
      'body > gcds-ext-map div > dialog',
      (dialog) => dialog.hasAttribute('open')
    );

    expect(dialog).toBe(true);
  });

  test('X button closes dialog', async ({ page }) => {
    // Re-open dialog first since beforeEach reloads the page
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Now close it
    await page.keyboard.press('Enter');
    const dialog = await page.$eval(
      'body > gcds-ext-map div > dialog',
      (dialog) => dialog.hasAttribute('open')
    );
    expect(dialog).toBe(false);
  });
});
