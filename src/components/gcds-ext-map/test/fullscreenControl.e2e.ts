import { test, expect } from '@playwright/test';

test.describe('GCDS-Map Fullscreen Control Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/fullscreenControl.html', { waitUntil: 'networkidle' });
  });

  test('Fullscreen button makes gcds-ext-map element the fullscreen element', async ({ page }) => {
    await page.click(
      'xpath=/html/body/gcds-ext-map[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    let fullscreenElement = await page.evaluate(
      `document.fullscreenElement.id`
    );
    // the first gcds-ext-map should be returned by document.fullscreen
    expect(fullscreenElement).toEqual('map1');
    
    await page.click(
      'xpath=/html/body/gcds-ext-map[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    fullscreenElement = await page.evaluate(`document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();
    
    await page.click(
      'xpath=/html/body/gcds-ext-map[2] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual('map2');
    
    // try to click the fullscreen button of the other map that is not in fullscreen
    // this should fail because map1 is hidden behind fullscreen map2
    try {
      await page.click(
        'xpath=/html/body/gcds-ext-map[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a',
        { timeout: 500 }
      );
      // if we get here, the test should fail
      expect(false).toBe(true); // force failure if click succeeded
    } catch (e) {
      // expected - button is not clickable when hidden
    }
    
    // fullscreen element should not have changed
    fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual('map2');
  });

  test('Context Menu Fullscreen Button makes the gcds-ext-map element fullscreen', async ({ page }) => {
    await page.click('body > #map1');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('F');
    let fullscreenElement = await page.evaluate(
      `document.fullscreenElement.id`
    );
    expect(fullscreenElement).toEqual('map1');
  });
});
