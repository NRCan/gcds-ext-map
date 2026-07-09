import { test, expect } from '@playwright/test';

test.describe('Playwright Feature Links Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/map-feature/linkTypes.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  });

  test.describe('HTML Link Type Tests', () => {
    test('HTML _self target navigates to new page', async ({ page }) => {
      await page.click('body > gcds-ext-map');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }
      await page.keyboard.press('Enter'); // Press enter on the feature in the top-left
      await page.waitForURL('https://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/');
      const url = await page.url();
      expect(url).toEqual('https://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/');
    });
    test('HTML _top target point navigates to new page', async ({ page }) => {
      await page.click('body > gcds-ext-map');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      await page.keyboard.press('Enter'); // Press enter on the top point feature in the top left
      await page.waitForURL('https://geogratis.gc.ca/mapml/en/cbmtile/fdi/');
      const url = await page.url();
      expect(url).toEqual('https://geogratis.gc.ca/mapml/en/cbmtile/fdi/');
    });
    test('HTML _parent target point navigates to new page', async ({ page }) => {
      await page.click('body > gcds-ext-map');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }
      await page.keyboard.press('Enter'); // Press enter on the second feature in the top left
      await page.waitForURL('https://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/');
      const url = await page.url();
      expect(url).toEqual('https://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/');
    });
    test('HTML _blank target projection negotiation with hash', async ({ page }) => {
      await page.click('body > gcds-ext-map');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await page.keyboard.press('Enter'); // Press enter on the second point in the top left
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(10000);
      const extent = await page.$eval('body > gcds-ext-map', (map) => (map as any).extent);
      expect(extent.topLeft.gcrs).toEqual({
        horizontal: -118.38250407225894,
        vertical: 54.364895138267244
      });
      expect(extent.bottomRight.gcrs).toEqual({
        horizontal: -41.67362559864071,
        vertical: 7.463862967414659
      });
    });
  });
});
