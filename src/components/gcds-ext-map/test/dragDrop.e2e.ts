import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Layers (map-layer, GeoJSON, Link) to gcds-ext-map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/dragDrop.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
  });

  test('Drag and drop of valid mapml URL', async ({ page }) => {
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(
        'http://localhost:3333/test/data/tiles/cbmt/DouglasFir.mapml',
        'text/plain'
      );
      return dt;
    });
    await page.dispatchEvent('gcds-ext-map', 'drop', { dataTransfer });
    // Wait for the layer to actually be added to the layer control
    await page.hover('.leaflet-top.leaflet-right');
    await page.waitForSelector('.leaflet-control-layers-overlays > fieldset:nth-of-type(2)', { timeout: 3000 });
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(2);
  });

  test('Drag and drop of valid geoJSON', async ({ page }) => {
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(
        '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "coordinates": [ [ -79.81317924469873, 43.57621615843999 ], [ -80.67304547572238, 43.287051102433196 ] ], "type": "LineString" } } ] }',
        'text/plain'
      );
      return dt;
    });
    await page.dispatchEvent('gcds-ext-map', 'drop', { dataTransfer });
    await page.hover('.leaflet-top.leaflet-right');
    await page.waitForSelector('.leaflet-control-layers-overlays > fieldset:nth-of-type(2)', { timeout: 3000 });
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(2);
  });

  test('Drag and drop of valid map-layer', async ({ page }) => {
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(
        '<map-layer label="Ottawa" checked> <map-meta name="projection" content="CBMTILE"></map-meta> <map-meta name="cs" content="gcrs"></map-meta> <map-feature> <map-featurecaption>Ottawa</map-featurecaption> <map-geometry> <map-point class="ottawa"> <map-coordinates>-75.697193 45.421530</map-coordinates> </map-point> </map-geometry> </map-feature> </map-layer>',
        'text/plain'
      );
      return dt;
    });
    await page.dispatchEvent('gcds-ext-map', 'drop', { dataTransfer });
    await page.hover('.leaflet-top.leaflet-right');
    await page.waitForSelector('.leaflet-control-layers-overlays > fieldset:nth-of-type(2)', { timeout: 3000 });
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(2);
  });

  test('Drag and drop of Invalid text', async ({ page }) => {
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add('This is an invalid layer yo!', 'text/plain');
      return dt;
    });
    await page.dispatchEvent('gcds-ext-map', 'drop', { dataTransfer });
    // Invalid drop shouldn't add a layer, wait a bit then check count is still 1
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(1);
  });
});
