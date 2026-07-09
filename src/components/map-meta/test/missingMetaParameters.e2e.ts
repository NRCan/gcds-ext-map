import { test, expect } from '@playwright/test';

test.describe('Missing Parameters Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/map-meta/missingMetaParameters.html', {waitUntil: 'domcontentloaded'});
  });

  test("Static features with missing <map-meta name='zoom'></map-meta> & <map-meta name='extent'></map-meta>", async ({ page }) => {
    await page.waitForTimeout(1000);
    const layerController = await page.locator('gcds-ext-map:nth-of-type(1) > map-layer:nth-of-type(1)').evaluate(
      (controller: any) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -2056306.8122221958,
      vertical: -870644.8824683931
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: -614264.1987553611,
      vertical: -1731574.5341126453
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 4,
      minNativeZoom: 2,
      minZoom: 0,
      maxZoom: 25
    });
  });

  test("Static tiles with missing <map-meta name='zoom'></map-meta>", async ({ page }) => {
    await page.waitForTimeout(1000);
    const layerController = await page.locator('gcds-ext-map:nth-of-type(1) > map-layer:nth-of-type(3)').evaluate(
      (controller: any) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -4175739.0398780815,
      vertical: 5443265.599864535
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 5984281.280162558,
      vertical: -1330081.280162558
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 3,
      minNativeZoom: 2,
      minZoom: 1,
      maxZoom: 4
    });
  });

  test("Templated features with missing <map-meta name='zoom'></map-meta>", async ({ page }) => {
    await page.waitForTimeout(1000);
    const layerController = await page.locator('gcds-ext-map:nth-of-type(1) > map-layer:nth-of-type(2)').evaluate(
      (controller: any) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: 1501645.2210838948,
      vertical: -66110.70639331453
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 1617642.4028044068,
      vertical: -222452.18449031282
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 18,
      minNativeZoom: 2,
      minZoom: 2,
      maxZoom: 18
    });
  });

  test("Templated tiles with missing <map-meta name='zoom'></map-meta> & extent", async ({ page }) => {
    await page.waitForTimeout(1000);
    const layerController = await page.locator('gcds-ext-map:nth-of-type(2) > map-layer').evaluate(
      (controller: any) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -180,
      vertical: 90
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 180,
      vertical: -90
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 2,
      minNativeZoom: 0,
      minZoom: 0,
      maxZoom: 2
    });
  });

  test("Templated image with missing <map-meta name='zoom'></map-meta>", async ({ page }) => {
    await page.waitForTimeout(1000);
    const layerController = await page.locator('gcds-ext-map:nth-of-type(1) > map-layer:nth-of-type(4)').evaluate(
      (controller: any) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: 28448056,
      vertical: 42672085
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 38608077,
      vertical: 28448056
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 19,
      minNativeZoom: 0,
      minZoom: 0,
      maxZoom: 19
    });
  });
});
