import { test, expect, chromium } from '@playwright/test';

test.describe('Multiple Extents Bounds Tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/map-extent/multipleExtents.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Only Extent Bounds show in debug mode', async () => {
    // this test used to be titled "Both Extent Bounds and Layer Bounds show in debug mode"
    // but since introduction of map-extent element, it was decided to only show
    // the bounds rectangles for the map-link elements
    const map = await page.getByTestId('themap');
    await map.evaluate(async (map)=> map.whenReady());
    await map.evaluate((map) => map.toggleDebug());
    await page.waitForTimeout(500);

    // we don't expect the _map.totalBounds to show unless the announceMovement
    // option is enabled on page load, by default it is false.
    // update: announceMovement is now true by default, so totalBounds will show
    // the bounds expected to show include the "projection center", totalBounds,
    // 4 features, and 3 map-extents =9
    const announceMovement = await map.evaluate((map) => map._map.options.announceMovement);
    if (announceMovement) {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(9);
    } else {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(8);
    }
    await expect(
      page.locator('.mapml-debug-vectors.projection-centre ')
    ).toHaveCount(1);
    // templated features formerly did not keep track of their layer- element,
    // which prevented them from being added to the debug layer. That is fixed.
    await expect(
      page.locator('.mapml-debug-vectors.multiple-extents')
    ).toHaveCount(6);
    await expect(
      page.locator('.mapml-debug-vectors.single-extent')
    ).toHaveCount(1);
  });

  test('When unchecked, extent bounds removed from debug layer', async () => {
    await page.hover(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div'
    );
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)'
    );
    // uncheck the templated features (alabama) extent / remove from map
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]'
    );
    // reload the debug layer; this  should not require cycling
    const map = await page.getByTestId('themap');
    await map.evaluate (async (map)=> map.whenReady());
    await map.evaluate((map) => map.toggleDebug());
    await map.evaluate((map) => map.toggleDebug());
    await page.waitForTimeout(500);
    const announceMovement = await map.evaluate((map) => map._map.options.announceMovement);
    if (announceMovement) {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(4);
    } else {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(3);
    }
    await expect(
      page.locator('.mapml-debug-vectors.projection-centre ')
    ).toHaveCount(1);
    await expect(
      page.locator('.mapml-debug-vectors.multiple-extents')
    ).toHaveCount(1);
    await expect(
      page.locator('.mapml-debug-vectors.single-extent')
    ).toHaveCount(1);
  });

  test('Checking an extent adds its bounds, unchecking an extent removes its bounds', async () => {
    // restore "alabama" features that was removed in previous test
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]'
    );
    //    // remove previously remaining extent
    //    await page.click(
    //      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]'
    //    );
    const map = await page.getByTestId('themap');
    await map.evaluate((map) => map.toggleDebug());
    await map.evaluate((map) => map.toggleDebug());

    const announceMovement = await map.evaluate((map) => map._map.options.announceMovement);
    if (announceMovement) {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(9);
    } else {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(8);
    }
    await expect(
      page.locator('.mapml-debug-vectors.projection-centre ')
    ).toHaveCount(1);
    // templated features formerly did not keep track of their layer- element,
    // which prevented them from being added to the debug layer. That is fixed.
    await expect(
      page.locator('.mapml-debug-vectors.multiple-extents')
    ).toHaveCount(6);
    await expect(
      page.locator('.mapml-debug-vectors.single-extent')
    ).toHaveCount(1);

    //    // restore the differentExtent onto the map
    //    await page.click(
    //      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]'
    //    );
  });

  test('Layer is disabled in layer control when all extents are out of bounds', async () => {
    // if debug mode is enabled, can't focus on map @ leaflet 1.9.3 see issue #720
    // so turn it off here
    const map = await page.getByTestId('themap');
    await map.evaluate((map) => map.toggleDebug());
    await map.evaluate((map) => map.toggleDebug());
    await map.click();
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('ArrowDown');
    }


    // layer is still enabled, map-extents that are out of bounds are disabled
    // those that overlap the viewport are enabled
    await expect(page.getByText('Multiple Extents')).toBeEnabled();
    // currently, we don't italicize extents except when ALL extents in the layer
    // are disabled due to the layer being disabled.
    // await expect(page.getByText('cbmt')).toBeDisabled();
    await expect(page.getByText('alabama_feature')).toBeEnabled();
    await page.keyboard.press('ArrowDown');
    const announceMovement = await map.evaluate((map) => map._map.options.announceMovement);
    if (announceMovement) {
      // when announceMovement is true, the map bounces back when it reaches
      // the total bounds of all layers, so one of the extents is still in bounds
      // while the other is out of bounds and hence disabled
      await expect(page.getByText('Multiple Extents')).toBeEnabled();
      await expect(page.getByText('cbmt')).toHaveCSS('font-style', 'italic');
      await expect(page.getByText('alabama_feature')).toHaveCSS(
        'font-style',
        'normal'
      );
    } else {
      // when announceMovement is false, the map continues panning out of bounds
      await expect(page.getByText('Multiple Extents')).toBeDisabled();
      await expect(page.getByText('cbmt')).toHaveCSS('font-style', 'italic');
      await expect(page.getByText('alabama_feature')).toHaveCSS(
        'font-style',
        'italic'
      );
    } 
  });

  test('Extent is individually disabled in layer control when out of bounds', async () => {
    const map = await page.locator('gcds-ext-map');
    await map.evaluate((map) => map.zoomTo(1.6, -90, 2));

    // 'alabama' bounds still overlap viewport
    const alabamaExtentItem = page.getByText('alabama_feature');
    await expect(alabamaExtentItem).toHaveCount(1);
    await expect(alabamaExtentItem).toHaveCSS('font-style', 'normal');

    const alabamaMapExtent = page.locator('map-extent[label=alabama_feature]');
    await expect(alabamaMapExtent).toHaveCount(1);
    await expect(alabamaMapExtent).not.toHaveAttribute('disabled');

    // cbmt bounds slightly outside viewport, map-extent should be disabled
    const cbmtMapExtent = page.locator('map-extent[label=cbmt]');
    await expect(cbmtMapExtent).toHaveCount(1);
    await expect(cbmtMapExtent).toHaveAttribute('disabled');

    // the text can't be disabled, but it should simulated disabled by being
    // rendered in gray italic font
    const cbmtExtentItem = page.getByText('cbmt');
    await expect(cbmtExtentItem).toHaveCount(1);
    await expect(cbmtExtentItem).toHaveCSS('font-style', 'italic');

    // multiple extents layer's extents should all be slightly offscreen,
    // layer and everything in it should be disabled or in italics

    await map.evaluate((map) => map.zoomTo(-11, -120, 1));
    await expect(alabamaMapExtent).toHaveAttribute('disabled');
    await expect(alabamaExtentItem).toHaveCSS('font-style', 'italic');
    await expect(cbmtMapExtent).toHaveAttribute('disabled');
    await expect(cbmtExtentItem).toHaveCSS('font-style', 'italic');

    const layerOpacitySliderText = page.locator(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-settings > details.mapml-layer-item-opacity'
    );
    await expect(layerOpacitySliderText).toHaveCount(1);
    await expect(layerOpacitySliderText).toHaveCSS('font-style', 'italic');

    // expect the remove layer button to be enabled

    // expect the remove extent buttons to be enabled
    const cbmtRemoveExtentButton = page.locator(
      'fieldset.mapml-layer-extent:nth-child(1) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)'
    );
    await expect(cbmtRemoveExtentButton).toBeEnabled();
    const alabamaRemoveExtentButton = page.locator(
      'fieldset.mapml-layer-extent:nth-child(1) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)'
    );
    await expect(alabamaRemoveExtentButton).toBeEnabled();
  });
});
