import { test, expect } from '@playwright/test';

test.describe('matchMedia map-projection tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/map-projection.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  });

  test('matchMedia API shows maps based on projections selected by user', async ({ page }) => {
    const osmLayer = page.locator('#OSMTILE');
    const cbmtLayer = page.locator('#CBMTILE');
    const switchOSM = page.locator('.switchOSM');
    const switchCBMT = page.locator('.switchCBMT');

    await switchCBMT.click();
    await page.waitForTimeout(500);
    await expect(osmLayer).toHaveAttribute('hidden');

    await switchOSM.click();
    await page.waitForTimeout(500);
    await expect(cbmtLayer).toHaveAttribute('hidden');
  });
});
