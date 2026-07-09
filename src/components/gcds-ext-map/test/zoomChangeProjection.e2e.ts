import { test, expect } from '@playwright/test';

/*
 * Skip this use case until we figure out how to use media queries to select
 * links based on map scale, projection, zoom, extent etc.
 *
 * In the current configuration, the map is constrained to allow zooming only
 * within the zoom bounds of its layers. So, if the layer only allows zoom
 * levels 0-8 and it should give way to a different linked layer resource at
 * zoom = 9, and THEN change projections due to it being the only layer on the
 * map, there is a conflict between to maxZoom of the map (based on the initial
 * layer's min/max Zoom) and the zoom at which the layer should change source.
 *
 * That mechanism should be re-designed, eliminating the need for the zoomin and
 * zoomout link relations, by using links that have media queries on them,
 * probably with a simple rel=alternate value.
 */
test.describe.skip('Zoomin zoomout Projection Change Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/zoomChangeProjection.html', { waitUntil: 'networkidle' });
  });

  test('zoomin link changes projections', async ({ page }) => {
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in'
    );
    await page.waitForTimeout(1000);
    const newProjection = await page.$eval(
      'body > gcds-ext-map',
      (map: any) => map.projection
    );
    const layerValid = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => !layer.hasAttribute('disabled')
    );
    expect(newProjection).toEqual('OSMTILE');
    expect(layerValid).toEqual(true);
  });

  test('zoomout link changes projections', async ({ page }) => {
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out'
    );
    await page.waitForTimeout(1000);
    const newProjection = await page.$eval(
      'body > gcds-ext-map',
      (map: any) => map.projection
    );
    const layerValid = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => !layer.hasAttribute('disabled')
    );
    expect(newProjection).toEqual('CBMTILE');
    expect(layerValid).toEqual(true);
  });
});
