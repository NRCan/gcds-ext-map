import { test, expect, chromium } from '@playwright/test';

test.describe('map-select tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page = await context.newPage();
    await page.goto('/test/map-select/map-select.html', { waitUntil: 'networkidle' });
  });

  test.afterAll(async function () {
    await context.close();
  });
  test('<map-select> <map-option> attributes are copied to layer control <option> elements', async () => {
    // Wait for map to be ready
    await page.waitForTimeout(1000);
    
    // Open the layer control by clicking the layers button
    const layersButton = page.locator('gcds-ext-map .leaflet-control-layers');
    await layersButton.hover();
    await page.waitForTimeout(300);
    
    // Click the extent settings button (the three dots icon) to reveal the select
    const layerSettingsButton = page.locator('gcds-ext-map .mapml-layer-item-settings-control').first();
    await layerSettingsButton.click();
    await page.waitForTimeout(300);

    const sublayerSettingsButton = page.getByRole('button', { name: 'Sub-layer Settings' })
    await sublayerSettingsButton.click();
    await page.waitForTimeout(300);
    // the time details should be visible, open it

    const timeDetails = page.locator('details').filter({ hasText: 'time' });
    await timeDetails.evaluate((details) => details.open = true);
    
    // Now the select should be visible in the shadow DOM
    const select = await timeDetails.locator('select');

    // Select the first option
    await select.selectOption('2000');
    await page.waitForTimeout(250);
    
    const firstOptionSelected = await select.evaluate((selectEl) => {
      return selectEl.querySelector('option:nth-child(1)').selected;
    });
    expect(firstOptionSelected).toBeTruthy();
    
    const firstOptionLabel = await select.evaluate((selectEl) => {
      return selectEl.querySelector('option:nth-child(1)').label;
    });
    expect(firstOptionLabel).toEqual('2000');
    
    const firstOptionValue = await select.evaluate((selectEl) => {
      return selectEl.querySelector('option:nth-child(1)').value;
    });
    expect(firstOptionValue).toEqual('2000-08-15T00:00:00Z');
    
    const thirdOptionValue = await select.evaluate((selectEl) => {
      return selectEl.querySelector('option:nth-child(3)').value;
    });
    expect(thirdOptionValue).toEqual('2002-08-15T00:00:00Z');
  });
});
