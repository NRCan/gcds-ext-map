import { test, expect } from '@playwright/test';

test.describe('matchMedia map-zoom tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/map-zoom.html', { waitUntil: 'networkidle' });
  });

  test('matchMedia API detects changes in zoom', async ({ page }) => {
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomIndicator = page.locator('#zoom-indicator');

    for (let n = 1; n < 18; n++) {
      const updatedZoomLevel = await zoomIndicator.getAttribute('data-zoom-level');
      expect(updatedZoomLevel).toBe(String(n));
      await zoomIn.click();
      await page.waitForTimeout(500);
    }
  });
});
