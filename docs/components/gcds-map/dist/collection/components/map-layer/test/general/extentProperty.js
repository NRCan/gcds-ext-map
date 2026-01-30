import { test, expect, chromium } from '@playwright/test';

exports.test = (path, expectedPCRS, expectedGCRS) => {
  test.describe(`<Layer>.extent Property Tests for ${
    path.split('.')[0]
  }`, () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('');
      page =
        context.pages().find((page) => page.url() === 'about:blank') ||
        (await context.newPage());
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    });

    test.afterAll(async () => {
      await context.close();
    });

    test.afterEach(async () => {
      await page.waitForTimeout(500);
    });

    test('<map-layer>.extent test', async () => {
      // Wait for the layer to be ready and have its extent initialized
      await page.waitForFunction(
        () => {
          const layer = document.querySelector('body > gcds-map > map-layer:nth-child(1)');
          return layer && layer.extent !== undefined;
        },
        { timeout: 5000 }
      );
      
      const extent = await page.$eval(
        'body > gcds-map > map-layer:nth-child(1)',
        (layer) => layer.extent
      );
      expect(extent.hasOwnProperty('zoom')).toBeTruthy();
      expect(extent.hasOwnProperty('topLeft')).toBeTruthy();
      expect(extent.hasOwnProperty('bottomRight')).toBeTruthy();
      expect(extent.hasOwnProperty('projection')).toBeTruthy();
      expect(extent.topLeft.pcrs).toEqual(expectedPCRS.topLeft);
      expect(extent.bottomRight.pcrs).toEqual(expectedPCRS.bottomRight);
      expect(extent.topLeft.gcrs).toEqual(expectedGCRS.topLeft);
      expect(extent.bottomRight.gcrs).toEqual(expectedGCRS.bottomRight);
    });
    test('2nd <map-layer>.extent test', async () => {
      // Wait for the second layer to be ready
      await page.waitForFunction(
        () => {
          const layer = document.querySelector('body > gcds-map > map-layer:nth-child(2)');
          return layer && layer.extent !== undefined;
        },
        { timeout: 5000 }
      );
      
      const extent = await page.$eval(
        'body > gcds-map > map-layer:nth-child(2)',
        (layer) => layer.extent
      );
      expect(extent.hasOwnProperty('zoom')).toBeTruthy();
      expect(extent.hasOwnProperty('topLeft')).toBeTruthy();
      expect(extent.hasOwnProperty('bottomRight')).toBeTruthy();
      expect(extent.hasOwnProperty('projection')).toBeTruthy();
    });
  });
};
