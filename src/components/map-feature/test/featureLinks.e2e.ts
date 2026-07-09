import { test, expect } from '@playwright/test';


  test.describe('Features with nested links tests', () => {
    test('Link (a point) nested inside feature geometry (a polygon) adds new layer', async ({ page }) => {
      await page.goto('/test/map-feature/featureLinks.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      const layers = await page.$eval(
        'body > gcds-ext-map',
        (map: any) => map.layers.length
      );
      expect(layers).toEqual(1);
      for (let i = 0; i < 2; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
      }
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }
      await page.keyboard.press('Enter'); // Press enter on the point subpart of the 'Accessible Square' feature
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      expect( await page.$eval(
        'body > gcds-ext-map',
        (map: any) => map.layers.length
      )).toEqual(layers+1);
    });

    test('Nested inplace link adds new layer, does not change the map location', async ({ page }) => {
      await page.goto('/test/map-feature/featureLinks.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.click('body > gcds-ext-map');
      await page.keyboard.press('Tab');
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }
      const extentBeforeLink = await page.$eval(
        'body > gcds-ext-map',
        (map: any) => map.extent
      );
      const layers = await page.$eval(
        'body > gcds-ext-map',
        (map: any) => map.layers.length
      );
      await page.keyboard.press('Enter'); // Press enter on the `inplace` link (a point)
      await page.waitForTimeout(3000);
      const layerName = await page.$eval(
        '//html/body/gcds-ext-map/map-layer[2]',
        (layer: any) => layer.label
      );
      const extentAfterLink = await page.$eval(
        'body > gcds-ext-map',
        (map: any) => map.extent
      );
      // inplace link traversal should not move the map...
      expect(extentAfterLink.topLeft.gcrs).toEqual(
        extentBeforeLink.topLeft.gcrs
      );
      expect(extentAfterLink.bottomRight.gcrs).toEqual(
        extentBeforeLink.bottomRight.gcrs
      );
      expect(await page.$eval(
        'body > gcds-ext-map',
        (map: any) => map.layers.length
      )).toEqual(layers+1);
      expect(layerName).toEqual('Fire Danger (forecast)');
    });
    test('Outermost of 2 nested links adds new layer, map zooms to it', async ({ page }) => {
      await page.goto('/test/map-feature/featureLinks.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.click('body > gcds-ext-map');
      await page.keyboard.press('Tab');
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }
      const layers = await page.$eval(
        'body > gcds-ext-map',
        (map: any) => map.layers.length
      );
      await page.keyboard.press('Enter'); // follow outermost link of 2 nested links (not inplace)
      await page.waitForTimeout(5000);
      const layerName = await page.$eval(
        '//html/body/gcds-ext-map/map-layer[2]',
        (layer: any) => layer.label
      );
      // extent should have changed to new layer's extent (not `inplace`)
      const extent = await page.$eval('body > gcds-ext-map', (map: any) => map.extent);
      const cbmtExtent = await page.evaluate(async () => {
        (document.querySelector('map-layer:nth-last-of-type(1)') as any).zoomTo();
         await new Promise(resolve => setTimeout(resolve, 1000));
        const map = document.querySelector('gcds-ext-map') as any;
        return map.extent;
      });
      // Extent after link traversal should match the CBMT layer extent
      expect(extent.topLeft.gcrs.horizontal).toBeCloseTo(cbmtExtent.topLeft.gcrs.horizontal, 5);
      expect(extent.topLeft.gcrs.vertical).toBeCloseTo(cbmtExtent.topLeft.gcrs.vertical, 5);
      expect(extent.bottomRight.gcrs.horizontal).toBeCloseTo(cbmtExtent.bottomRight.gcrs.horizontal, 5);
      expect(extent.bottomRight.gcrs.vertical).toBeCloseTo(cbmtExtent.bottomRight.gcrs.vertical, 5);
      expect(await page.$eval(
        'body > gcds-ext-map',
        (map: any) => map.layers.length
      )).toEqual(layers+1);
      expect(layerName).toEqual('Canada Base Map - Geometry');
    });
  });
