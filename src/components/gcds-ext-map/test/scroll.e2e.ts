import { test, expect } from '@playwright/test';

test.describe('Scroll test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/scroll.html', { waitUntil: 'networkidle' });
  });

  test('Scrolling the map does not scroll the document', async ({ page }) => {
    // Force the window scroll bar to appear
    await page.$eval('body > textarea', (textarea) =>
      textarea.setAttribute('cols', '200')
    );
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);

    const scrollX = await page.evaluate(() => window.scrollX);
    expect(scrollX).toEqual(0);
  });
});
