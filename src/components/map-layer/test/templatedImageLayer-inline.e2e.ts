import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright templatedImage Layer Tests - Inline', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    
    await page.goto('/test/map-layer/templatedImageLayer.html', { 
      waitUntil: 'domcontentloaded'
    });
    
    // Give a moment for layers to initialize
    await page.waitForTimeout(1000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.afterEach(async () => {
    await page.waitForTimeout(500);
  });

  test('Templated image layer position when turn it off then on', async () => {
    await page.click('body > gcds-ext-map');
    await page.waitForTimeout(200);
    for (let i = 0; i < 5; ++i) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(200);
    }
    await page.hover(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div'
    );
    await page.waitForTimeout(200);
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > input'
    );
    await page.waitForTimeout(300);
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > input'
    );
    await page.waitForTimeout(500);
    const imagePos = await page.$eval('body > gcds-ext-map', (map) => {
      let layers = map._map._layers;
      let keys = Object.keys(layers);
      return layers[keys[keys.length - 1]]._location;
    });
    const expectedPos = {
      x: 0,
      y: -400
    };
    expect(imagePos).toEqual(expectedPos);
  });

  test('Templated image layer - remove previous image on moveend', async () => {
    await page.click('body > gcds-ext-map');
    await page.waitForTimeout(200);
    // generate a few map moves
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');
    const images = await page.locator(
      '.mapml-extentlayer-container > .mapml-image-container > .leaflet-image-loaded'
    );
    await expect(images).toHaveCount(1);
  });
});

