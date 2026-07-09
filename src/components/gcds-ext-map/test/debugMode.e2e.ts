import { test, expect } from '@playwright/test';

test.describe('Playwright Map Element Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/debugMode.html', { waitUntil: 'load' });
    
    // Wait for custom element to be defined and upgraded
    await page.waitForFunction(() => {
      const map = document.querySelector('[data-testid="viewer"]') as any;
      return map && typeof map.whenReady === 'function';
    });
    
    const map = page.getByTestId('viewer');
    // Wait for map to be ready, then toggle debug
    await map.evaluate(async (map: any) => { 
      await map.whenReady();
    });
    
    // Give a moment for layers to load, then toggle debug
    await page.waitForTimeout(2000);
    await map.evaluate((map: any) => map.toggleDebug());
    await page.waitForTimeout(1000);
  });

  test('Debug elements added to map', async ({ page }) => {
    const panel = await page.$eval(
      'div > table.mapml-debug > tbody.mapml-debug-panel',
      (panelElem) => panelElem.childElementCount
    );

    const banner = await page.$eval(
      'div > table.mapml-debug > caption.mapml-debug-banner',
      (bannerElem: any) => bannerElem.innerText
    );

    const grid = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid',
      (gridElem) => gridElem.childElementCount
    );

    expect(panel).toEqual(6);
    expect(banner).toEqual('DEBUG MODE');
    expect(grid).toEqual(1);
  });

  test('Reasonable debug layer extent created', async ({ page }) => {
    await expect(
      page.locator('.mapml-debug-vectors.cbmt-inline-layer')
    ).toHaveCount(1);
    await expect(
      page.locator('.mapml-debug-vectors.cbmt-large-layer')
    ).toHaveCount(1);
    await expect(
      page.locator('.mapml-debug-vectors.cbmt-beyond-layer')
    ).toHaveCount(1);
  });

  test('Accurate debug coordinates', async ({ page }) => {
    await page.hover('body > gcds-ext-map');
    const tile = await page.$eval(
      'div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(1)',
      (tileElem: any) => tileElem.innerText
    );
    const matrix = await page.$eval(
      'div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(2)',
      (matrixElem: any) => matrixElem.innerText
    );
    const map = await page.$eval(
      'div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(3)',
      (mapElem: any) => mapElem.innerText
    );
    const tcrs = await page.$eval(
      'div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(4)',
      (tcrsElem: any) => tcrsElem.innerText
    );
    const pcrs = await page.$eval(
      'div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(5)',
      (pcrsElem: any) => pcrsElem.innerText
    );
    const gcrs = await page.$eval(
      'div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(6)',
      (gcrsElem: any) => gcrsElem.innerText
    );

    expect(tile).toEqual('tile: i: 141, j: 6');
    expect(matrix).toEqual('tilematrix: column: 3, row: 4');
    expect(map).toEqual('map: i: 250, j: 250');
    expect(tcrs).toEqual('tcrs: x: 909, y: 1030');
    expect(pcrs).toEqual('pcrs: easting: 217676.00, northing: -205599.86');
    expect(gcrs).toEqual('gcrs: lon: -92.152897, lat: 47.114275');
  });

  test('Layer disabled attribute update when debug is toggled off', async ({ page }) => {
    await page.$eval('body > gcds-ext-map', (map: any) => map.toggleDebug());

    await page.$eval('body > gcds-ext-map', (map: any) => map.zoomTo(-51, 170, 0));

    await page.waitForTimeout(1000);

    const layer = await page.$eval(
      'body > gcds-ext-map > map-layer:nth-child(1)',
      (elem) => elem.hasAttribute('disabled')
    );

    expect(layer).toEqual(true);
  });

  test('Debug mode correctly re-enabled after disabling', async ({ page }) => {
    await page.$eval('body > gcds-ext-map', (map: any) => map.toggleDebug());

    await page.$eval('body > gcds-ext-map', (map: any) => map.zoomTo(-51, 170, 0));

    await page.waitForTimeout(1000);
    await page.$eval('body > gcds-ext-map', (map: any) => map.back());
    await page.$eval('body > gcds-ext-map', (map: any) => map.toggleDebug());

    const panel = await page.$eval(
      'div > table.mapml-debug > tbody.mapml-debug-panel',
      (panelElem) => panelElem.childElementCount
    );

    const banner = await page.$eval(
      'div > table.mapml-debug > caption.mapml-debug-banner',
      (bannerElem: any) => bannerElem.innerText
    );

    const grid = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid',
      (gridElem) => gridElem.childElementCount
    );

    expect(panel).toEqual(6);
    expect(banner).toEqual('DEBUG MODE');
    expect(grid).toEqual(1);
  });

  test('Layer deselected then selected again', async ({ page }) => {
    await page.hover('.leaflet-top.leaflet-right');
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > span'
    );
    await expect(
      page.locator('.mapml-debug-vectors.cbmt-inline-layer')
    ).toHaveCount(0);
    const map = await page.getByTestId('viewer');
    const announceMovement = await map.evaluate((map: any) => map._map.options.announceMovement)
    if (announceMovement) {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(4);
    } else {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(3);
    }
    await page.hover('.leaflet-top.leaflet-right');
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > span'
    );
    await expect(
      page.locator('.mapml-debug-vectors.cbmt-inline-layer')
    ).toHaveCount(1);
    if (announceMovement) {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(5); 
    } else {
      await expect(page.locator('.mapml-debug-vectors')).toHaveCount(4);
    }
  });
});
