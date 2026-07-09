import { test, expect, chromium } from '@playwright/test';

test.describe('Adding Opacity Attribute to the <map-extent> Element', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/map-extent/multipleExtentsOpacity.html', { waitUntil: 'networkidle' });
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Setting Opacity Attibute Value to map-extent Element', async () => {
    await page.waitForTimeout(3000);
    let extent_opacity1 = await page.$eval(
      'body > gcds-ext-map > map-layer > map-extent:nth-child(1)',
      (extent) => extent._extentLayer._container.style.opacity
    );
    expect(extent_opacity1).toEqual('0.9');
    let extent_opacity2 = await page.$eval(
      'body > gcds-ext-map > map-layer > map-extent:nth-child(2)',
      (extent) => extent._extentLayer._container.style.opacity
    );
    expect(extent_opacity2).toEqual('0.3');
    let extent_opacity3 = await page.$eval(
      'body > gcds-ext-map > map-layer > map-extent:nth-child(3)',
      (extent) => extent._extentLayer._container.style.opacity
    );
    expect(extent_opacity3).toEqual('0.2');
  });

  test('All map-extent layerControl are hidden because of the map-extent hidden attribute', async () => {
    let layerControlExtentsFieldsetCount = await page.$eval(
      'fieldset.mapml-layer-grouped-extents',
      (group) => group.childElementCount
    );
    expect(layerControlExtentsFieldsetCount).toEqual(0);
  });

  test('Opacity Slider Value Matches the Extent Opacity after map-extent are unhidden', async () => {
    // set hidden=false for all map-extents
    await page.$eval('body > gcds-ext-map > map-layer', (layer) => {
      [].forEach.call(layer.children, (extent) => {
        extent.hidden = false;
      });
    });
    await page.waitForTimeout(300);
    // check the opacity slider value for each map-extent matches its opacity
    let extent1 = await page.$eval(
      'body > gcds-ext-map > map-layer > map-extent:nth-child(1)',
      (extent) => ({
        opacity: extent._extentLayer._container.style.opacity,
        sliderValue: extent._opacitySlider.value
      })
    );
    let extent2 = await page.$eval(
      'body > gcds-ext-map > map-layer > map-extent:nth-child(2)',
      (extent) => ({
        opacity: extent._extentLayer._container.style.opacity,
        sliderValue: extent._opacitySlider.value
      })
    );
    let extent3 = await page.$eval(
      'body > gcds-ext-map > map-layer > map-extent:nth-child(3)',
      (extent) => ({
        opacity: extent._extentLayer._container.style.opacity,
        sliderValue: extent._opacitySlider.value
      })
    );
    expect(extent1.opacity).toEqual(extent1.sliderValue);
    expect(extent2.opacity).toEqual(extent2.sliderValue);
    expect(extent3.opacity).toEqual(extent3.sliderValue);
  });
});
