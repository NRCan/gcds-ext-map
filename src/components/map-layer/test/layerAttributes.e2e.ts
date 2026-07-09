import { test, expect } from '@playwright/test';

test.describe('Layer Attributes Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/map-layer/layerAttributes.html', { waitUntil: 'networkidle' });
  });

  test('Check attribute removed', async ({ page }) => {
    await page.$eval('body > gcds-ext-map > map-layer', (layer) =>
      layer.removeAttribute('checked')
    );
    await page.hover(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right'
    );
    const layerController = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > label > input',
      (controller) => (controller as HTMLInputElement).checked
    );

    expect(layerController).toEqual(false);
  });

  test('Check attribute added', async ({ page }) => {
    await page.$eval('body > gcds-ext-map > map-layer', (layer) =>
      layer.setAttribute('checked', '')
    );
    const layerController = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > label > input',
      (controller) => (controller as HTMLInputElement).checked
    );

    expect(layerController).toEqual(true);
  });

  test.describe('Hidden attribute tests', () => {
    test('Control panel hidden when no layers/all layers hidden', async ({ page }) => {
      await page.$eval('body > gcds-ext-map > map-layer', (layer) =>
        layer.setAttribute('hidden', '')
      );
      const controlsHidden = await page.$eval(
        'css=body > gcds-ext-map:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control',
        (elem) => elem.hasAttribute('hidden')
      );
      expect(controlsHidden).toEqual(true);
    });

    test('Control panel unhidden when at least one layer with no hidden attribute', async ({ page }) => {
      await page.$eval('body > gcds-ext-map > map-layer', (layer) =>
        layer.setAttribute('hidden', '')
      );
      // there's a single layer in the page, so the layer control
      // should disappear (is hidden) when the last layer in it is hidden
      let controlsHidden = await page.$eval(
        'css=body > gcds-ext-map:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control',
        (elem) => elem.hasAttribute('hidden')
      );
      expect(controlsHidden).toEqual(true);
      // so far so good
      await page.$eval('body > gcds-ext-map > map-layer', (layer) =>
        layer.removeAttribute('hidden')
      );
      controlsHidden = await page.$eval(
        'css=body > gcds-ext-map:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control',
        (elem) => elem.hasAttribute('hidden')
      );
      expect(controlsHidden).toEqual(false);
    });
  });

  test.describe('Disabled attributes test', () => {
    test('Setting disabled, attribute reset on update/move', async ({ page }) => {
      const layer = page.getByTestId('testlayer');
      await layer.evaluate((l) => l.setAttribute('disabled', ''));
      const viewer = page.getByTestId('testviewer');
      await viewer.evaluate((map) => (map as any).zoomTo(47, -92, 0));
      await page.waitForTimeout(500);
      await expect(layer).not.toHaveAttribute('disabled');
    });
  });

  test.describe('Opacity setters & getters test', () => {
    test('Setting and getting opacity', async ({ page }) => {
      await page.reload();
      const layer = page.getByTestId('testlayer');
      await layer.evaluate((layer) => (layer as any).whenReady());
      await layer.evaluate((layer) => ((layer as any).opacity = 0.4));
      let value = await layer.evaluate(
        (layer) =>
          (layer as any)._layerControlHTML.querySelector('input[type=range]').value
      );
      expect(value).toEqual('0.4');
      
      // Getting appropriate opacity
      value = await layer.evaluate((layer) => (layer as any).opacity);
      expect(value).toEqual(0.4);
    });
  });
});
