import { test, expect, chromium } from '@playwright/test';

// NOTE: These clipboard tests are currently failing because the paste functionality
// may not be working correctly. The tests detect clipboard content but layers aren't
// being added as expected. This needs investigation in the gcds-ext-map component's
// paste handler implementation.

test.describe('Playwright gcds-ext-map Clipboard Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('/test/gcds-ext-map/gcds-ext-map.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Paste geojson Layer to map using ctrl+v', async () => {
    const initialLayerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    
    await page.click('body > textarea#copyGeoJSON');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);

    // Focus the map container, not just the gcds-ext-map element
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const container = map.shadowRoot.querySelector('.leaflet-container');
      if (container) (container as any).focus();
    });
    await page.waitForTimeout(100);
    
    // Now trigger paste on the focused container
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const layerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    await page.pause();
    expect(layerCount).toEqual(initialLayerCount + 1);
  });

  test('Paste Link to map using ctrl+v', async () => {
    const initialLayerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    
    await page.click('body > textarea#copyLink');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);
    // Focus the map container, not just the gcds-ext-map element
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const container = map.shadowRoot.querySelector('.leaflet-container');
      if (container) (container as any).focus();
    });
    await page.waitForTimeout(100);
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const layerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(initialLayerCount + 1);
  });

  test('Paste Invalid text to map using ctrl+v', async () => {
    const initialLayerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    
    await page.click('body > textarea#invalidText');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);
    // Focus the map container, not just the gcds-ext-map element
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const container = map.shadowRoot.querySelector('.leaflet-container');
      if (container) (container as any).focus();
    });
    await page.waitForTimeout(100);
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);

    const layerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(initialLayerCount);
  });

  test('Paste Invalid link to map using ctrl+v', async () => {
    const initialLayerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    
    await page.click('body > textarea#invalidLink');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);
    // Focus the map container, not just the gcds-ext-map element
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const container = map.shadowRoot.querySelector('.leaflet-container');
      if (container) (container as any).focus();
    });
    await page.waitForTimeout(100);
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);

    const layerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(initialLayerCount);
  });

  test('Paste links with GeoJSON content-type to map using ctrl+v', async () => {
    const initialLayerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    
    await page.click('body > textarea#linkGeoJSONContentType');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);
    // Focus the map container, not just the gcds-ext-map element
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const container = map.shadowRoot.querySelector('.leaflet-container');
      if (container) (container as any).focus();
    });
    await page.waitForTimeout(100);
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);

    const layerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(initialLayerCount + 1);
  });

  test('Paste links with JSON content-type to map using ctrl+v', async () => {
    const initialLayerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    
    await page.click('body > textarea#linkJSONContentType');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);
    // Focus the map container, not just the gcds-ext-map element
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const container = map.shadowRoot.querySelector('.leaflet-container');
      if (container) (container as any).focus();
    });
    await page.waitForTimeout(100);
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);

    const layerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(initialLayerCount + 1);
  });

  test('Paste links with GeoJSON extension to map using ctrl+v', async () => {
    const initialLayerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    
    await page.click('body > textarea#linkGeoJSONExt');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);
    // Focus the map container, not just the gcds-ext-map element
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const container = map.shadowRoot.querySelector('.leaflet-container');
      if (container) (container as any).focus();
    });
    await page.waitForTimeout(100);
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);

    const layerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(initialLayerCount + 1);
  });

  test('Paste links with JSON extension to map using ctrl+v', async () => {
    const initialLayerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    
    await page.click('body > textarea#linkJSONExt');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);
    // Focus the map container, not just the gcds-ext-map element
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const container = map.shadowRoot.querySelector('.leaflet-container');
      if (container) (container as any).focus();
    });
    await page.waitForTimeout(100);
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);

    const layerCount = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(initialLayerCount + 1);
  });
});
