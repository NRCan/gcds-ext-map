// @ts-nocheck
import { test, expect, chromium, Page, BrowserContext } from '@playwright/test';

// This test file uses extensive DOM manipulation and custom element APIs
// that are not typed in the TypeScript definitions

test.describe('Query Popup Tests', () => {
  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', {
      ignoreHTTPSErrors: true
    });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    
    await page.goto('/test/map-link/queryLink.html', { waitUntil: 'networkidle' });

  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Query link shows when within bounds', async () => {
    await page.getByLabel('Interactive map').click();
    const popups = await page
      .locator('.leaflet-popup-pane')
      .evaluate((popup) => popup.childElementCount);
    expect(popups).toEqual(1);
  });

  test('Query link closes previous popup when new query made within bounds', async () => {
    await page.evaluateHandle(() =>
      (document.querySelector('gcds-ext-map') as any).zoomTo(9, -27, 0)
    );
    await page.waitForTimeout(1000);
    await page.getByLabel('Interactive map').click();
    await page.waitForTimeout(1000);
    const popups = await page
      .locator('.leaflet-popup-pane')
      .evaluate((popup) => popup.childElementCount);
    expect(popups).toEqual(1);
  });

  test('Query link does not show when out of bounds', async () => {
    await page.evaluateHandle(() =>
      (document.querySelector('gcds-ext-map') as any).zoomTo(-37.07821, -9.010487, 0)
    );
    await page.waitForTimeout(1000);
    await page.getByLabel('Interactive map').click();
    await page.waitForTimeout(1000);
    const popupNumRight = await page
      .locator('.leaflet-popup-pane')
      .evaluate((popup) => popup.childElementCount);

    await page.evaluateHandle(() =>
      (document.querySelector('gcds-ext-map') as any).zoomTo(-45.679787, -93.041053, 0)
    );
    await page.waitForTimeout(1000);
    await page.getByLabel('Interactive map').click();
    await page.waitForTimeout(1000);
    const popupNumBottom = await page
      .locator('.leaflet-popup-pane')
      .evaluate((popup) => popup.childElementCount);
    await page.evaluateHandle(() =>
      (document.querySelector('gcds-ext-map') as any).zoomTo(-37.399782, 177.15222, 0)
    );
    await page.waitForTimeout(1000);
    await page.getByLabel('Interactive map').click();
    await page.waitForTimeout(1000);
    const popupNumLeft = await page
      .locator('.leaflet-popup-pane')
      .evaluate((popup) => popup.childElementCount);

    await page.evaluateHandle(() =>
      (document.querySelector('gcds-ext-map') as any).zoomTo(-32.240953, 94.969783, 0)
    );
    await page.waitForTimeout(1000);
    await page.getByLabel('Interactive map').click();
    await page.waitForTimeout(1000);
    const popupNumTop = await page
      .locator('.leaflet-popup-pane')
      .evaluate((popup) => popup.childElementCount);

    expect(popupNumRight).toEqual(0);
    expect(popupNumBottom).toEqual(0);
    expect(popupNumLeft).toEqual(0);
    expect(popupNumTop).toEqual(0);
  });
});
