import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test';

test.describe('MatchMedia Query Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      locale: 'en-US'
    });
    page = await context.newPage();
    await page.goto('/test/gcds-ext-map/combined-matchMedia.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('All conditions are met', async () => {
    const map = page.locator('gcds-ext-map');
    const layer = map.getByTestId('test-media-query');
    await expect(layer).not.toHaveAttribute('hidden');
  });

  test('Prefers-color-scheme does not match', async () => {
    const map = page.locator('gcds-ext-map');
    await page.emulateMedia({ colorScheme: 'dark' });
    const layer = map.getByTestId('test-media-query');
    await expect(layer).toHaveAttribute('hidden');
    await page.emulateMedia({ colorScheme: 'light' });
  });

  test('Prefers-lang does not match', async () => {
    const browser = await chromium.launch();
    const frContext = await browser.newContext({ locale: 'fr-CA' });
    const frPage = await frContext.newPage();

    await frPage.goto('/test/gcds-ext-map/combined-matchMedia.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const map = frPage.locator('gcds-ext-map');
    const layer = map.getByTestId('test-media-query');
    await expect(layer).toHaveAttribute('hidden');

    await frContext.close();
    await browser.close();
  });

  test('map-projection does not match', async () => {
    const map = page.locator('gcds-ext-map');
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map') as any;
      map.projection = 'CBMTILE';
    });
    await page.waitForTimeout(2000);
    const layer = map.getByTestId('test-media-query');
    await expect(layer).toHaveAttribute('hidden');
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map') as any;
      map.projection = 'OSMTILE';
    });
  });

  test('map-zoom does not match', async () => {
    const map = page.locator('gcds-ext-map');
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map') as any;
      map.zoomTo(45.406314, -75.6883335, 15);
    });
    await page.waitForTimeout(1000);
    const layer = map.getByTestId('test-media-query');
    await expect(layer).toHaveAttribute('hidden');
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map') as any;
      map.zoomTo(45.406314, -75.6883335, 13);
    });
  });

  test('Map does not overlap with the bounding box', async () => {
    const map = page.locator('gcds-ext-map');
    const layer = map.getByTestId('test-media-query');

    // move the map so that the layer is out of the map's extent
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map') as any;
      map.zoomTo(0, 0, 13);
    });
    await expect(layer).toHaveAttribute('hidden');

    // move the map back so that the layer is within the map's extent
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map') as any;
      map.zoomTo(45.406314, -75.6883335, 13);
    });
    await expect(layer).not.toHaveAttribute('hidden');
  });
});
