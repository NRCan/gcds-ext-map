import { test, expect } from '@playwright/test';

test.describe('MapFeature Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/map-feature/mapFeatureEvents.html', { waitUntil: 'networkidle' });
  });

  test('Custom Click event - stopPropagation', async ({ page }) => {
    await page.waitForTimeout(1000);
    // Click on polygon
    await page
      .locator(
        'gcds-ext-map[role="application"]:has-text("Polygon -75.5859375 45.4656690 -75.6813812 45.4533876 -75.6961441 45.4239978 -75")'
      )
      .click();
    const popupCount = await page.$eval(
      'body > gcds-ext-map > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (popupPane) => popupPane.childElementCount
    );
    // expect no popup is binded
    expect(popupCount).toEqual(0);

    await page.waitForTimeout(500);

    // custom click property displaying on div
    const propertyDiv = await page.$eval(
      'body > div#property',
      (div) => (div.firstElementChild as HTMLElement).innerText
    );
    // check custom event is displaying properties
    expect(propertyDiv).toEqual('This is a Polygon');
  });

  test('click() method - stopPropagation', async ({ page }) => {
    // click() method on line feature
    await page.$eval(
      'body > gcds-ext-map > map-layer > map-feature#line',
      (line) => (line as any).click()
    );

    const popupCount = await page.$eval(
      'body > gcds-ext-map > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (popupPane) => popupPane.childElementCount
    );
    // expect no popup is binded
    expect(popupCount).toEqual(0);

    // custom click property displaying on div
    const propertyDiv = await page.$eval(
      'body > div#property',
      (div) => (div.firstElementChild as HTMLElement).innerText
    );
    // check custom event is displaying properties
    expect(propertyDiv).toEqual('This is a Line');
  });
});
