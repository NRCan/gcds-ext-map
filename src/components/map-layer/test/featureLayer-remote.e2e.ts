import { test, expect, chromium } from '@playwright/test';

test.describe('Retrieved Static Features Tests', () => {
  let page;
  let context;
  
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/map-layer/featureLayer.html', { waitUntil: 'networkidle' });
  });
  
  test.afterAll(async function () {
    await context.close();
  });

  test('Loading in retrieved features', async () => {
    await page.waitForTimeout(350);
    // Wait for the layer to be ready and SVG to be created
    await page.waitForFunction(
      () => {
        const layer = document.querySelector('map-layer#US');
        return (
          layer &&
          (layer as any)._layer &&
          (layer as any)._layer._container &&
          (layer as any)._layer._container.querySelector('svg') &&
          (layer as any)._layer._container.querySelector('svg').firstChild
        );
      },
      { timeout: 5000 }
    );

    const features = await page.$eval(
      'map-layer#US',
      (layer) =>
        layer._layer._container.querySelector('svg').firstChild
          .childElementCount
    );
    expect(features).toEqual(52);
  });

  test('valid <layer>.extent', async () => {
    // this is the us_pop_density.mapml layer
    // Wait for the layer to be fully loaded and have _layer property set
    await page.waitForFunction(
      () => {
        const layer = document.querySelector('map-layer#US');
        return layer && (layer as any)._layer && (layer as any).extent !== null;
      },
      { timeout: 10000 }
    );
    
    const layerExtent = await page.$eval(
      'body > gcds-ext-map > map-layer:nth-child(3)',
      (layer) => layer.extent
    );
    
    expect(layerExtent.topLeft.pcrs).toEqual({
      horizontal: -34655800,
      vertical: 39310000
    });
    expect(layerExtent.topLeft.gcrs).toEqual({
      horizontal: -169.78391348558873,
      vertical: -60.79113663130127
    });
    expect(layerExtent.bottomRight.pcrs).toEqual({
      horizontal: 14450964.88019643,
      vertical: -9796764.88019643
    });
    expect(layerExtent.bottomRight.gcrs).toEqual({
      horizontal: 79.6961805581841,
      vertical: -60.79110984572508
    });
    // corrected logic for MapLayer._calculateBounds min/maxNativeZoom
    // there are a bunch of features loaded at map zoom=2. Two have default
    // (no) zoom attribute, all the others have zoom=0. So, the minNativeZoom
    // should be 0, while the maxNativeZoom should be 2.
    // there is a <map-meta name="zoom" content="min=2,max=2,value=0"></map-meta>
    // so the min/maxZoom should be 2.
    expect(layerExtent.zoom).toEqual({
      maxNativeZoom: 2,
      minNativeZoom: 0,
      maxZoom: 2,
      minZoom: 2
    });
    expect(layerExtent.projection).toEqual('CBMTILE');
  });
});
