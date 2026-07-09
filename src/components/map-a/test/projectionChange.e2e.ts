import { test, expect } from '@playwright/test';

test.describe('Linked Feature Projection Change Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/map-a/projectionChange.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
  });

  test('_self Linked Feature Change To OSMTILE', async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    const isChecked = await page.locator('gcds-ext-map:nth-of-type(1) > map-layer').evaluate(
      (layer: any) => layer.checked
    );
    const isDisabled = await page.locator('gcds-ext-map:nth-of-type(1) > map-layer').evaluate(
      (layer: any) => layer.disabled
    );
    expect(isChecked).toBeTruthy();
    expect(isDisabled).toEqual(false);
  });

  test('_parent Linked Feature Change To OSMTILE', async ({ page }) => {
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    const isChecked = await page.locator('gcds-ext-map:nth-of-type(1) > map-layer').evaluate(
      (layer: any) => layer.checked
    );
    const isDisabled = await page.locator('gcds-ext-map:nth-of-type(1) > map-layer').evaluate(
      (layer: any) => layer.disabled
    );
    expect(isChecked).toBeTruthy();
    expect(isDisabled).toEqual(false);
  });

  test('Debug components update with projection changes', async ({ page }) => {
    await page.locator('gcds-ext-map:nth-of-type(1)').evaluate((map: any) => map.toggleDebug());
    const viewer = page.getByTestId('viewer-one');

    const colBefore = await page.locator('xpath=//html/body/gcds-ext-map[1] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid > div > div:nth-child(1)').evaluate(
      (tile: any) => tile.getAttribute('col')
    );
    const rowBefore = await page.locator('xpath=//html/body/gcds-ext-map[1] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid > div > div:nth-child(1)').evaluate(
      (tile: any) => tile.getAttribute('row')
    );
    const zoomBefore = await page.locator('xpath=//html/body/gcds-ext-map[1] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid > div > div:nth-child(1)').evaluate(
      (tile: any) => tile.getAttribute('zoom')
    );

    const centerBefore = await viewer.evaluate((viewer: any) => {
      return { lon: viewer.lon, lat: viewer.lat, zoom: viewer.zoom };
    });

    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
    }
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    // Wait for the map to finish zooming to layer extent
    await page.waitForTimeout(2000);

    const colAfter = await page.locator('xpath=//html/body/gcds-ext-map[1] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid > div > div:nth-child(1)').evaluate(
      (tile: any) => tile.getAttribute('col')
    );
    const rowAfter = await page.locator('xpath=//html/body/gcds-ext-map[1] >> css=div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid > div > div:nth-child(1)').evaluate(
      (tile: any) => tile.getAttribute('row')
    );
    const zoomAfter = await page.locator('xpath=//html/body/gcds-ext-map[1] >> css=div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid > div > div:nth-child(1)').evaluate(
      (tile: any) => tile.getAttribute('zoom')
    );

    const centerAfter = await viewer.evaluate((viewer: any) => {
      return { lon: viewer.lon, lat: viewer.lat, zoom: viewer.zoom };
    });

    expect(colBefore).toEqual('10');
    expect(rowBefore).toEqual('11');
    expect(zoomBefore).toEqual('2');
    expect(colAfter).toEqual('0');
    expect(rowAfter).toEqual('0');
    expect(zoomAfter).toEqual('0');
    expect(centerBefore).toEqual({
      lat: 45.505204,
      lon: -75.2202344,
      zoom: 2
    });
    expect(centerAfter).toEqual({
      lat: 0,
      lon: 0,
      zoom: 0
    });
  });
});
