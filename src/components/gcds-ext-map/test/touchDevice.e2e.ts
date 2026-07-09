import { test, expect, devices } from '@playwright/test';
const device = devices['Pixel 5'];

test.use({
  ...device,
  hasTouch: true
});

test.describe('Touch device tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/touchDevice.html', { waitUntil: 'networkidle' });
  });

  test('Tap/Long press to show layer control', async ({ page }) => {
    const layerControl = await page.locator('.leaflet-control-layers');
    await layerControl.tap({ force: true });
    
    await expect(layerControl).toHaveJSProperty('_isExpanded', true);

    // expect the opacity setting not open after the click
    const opacity = await page.$eval(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-properties > div > button:nth-child(2)',
      (btn) => btn.getAttribute('aria-expanded')
    );
    expect(opacity).toEqual('false');

    const viewer = await page.locator('gcds-ext-map');
    // tap on the map to dismiss the layer control
    await viewer.tap({ position: { x: 150, y: 150 } });
    // tap on the lc to expand it
    await layerControl.tap({ force: true });
    // long press on layercontrol does not dismiss it
    await layerControl.tap({ delay: 800, force: true } as any);
    
    await expect(layerControl).toHaveJSProperty('_isExpanded', true);

    // expect the layer context menu to NOT show after the long press
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('gcds-ext-map')
    );
    const nextHandle = await page.evaluateHandle(
      (doc: any) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root: any) => root.querySelector('.mapml-contextmenu.mapml-layer-menu'),
      nextHandle
    );
    const menuDisplay = await (
      await page.evaluateHandle(
        (elem: any) => window.getComputedStyle(elem).getPropertyValue('display'),
        resultHandle
      )
    ).jsonValue();
    expect(menuDisplay).toEqual('none');
  });
});
