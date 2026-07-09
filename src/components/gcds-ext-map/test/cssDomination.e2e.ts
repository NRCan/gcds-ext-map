import { test, expect, chromium } from '@playwright/test';

test.describe('Adding Width and Height Attribute to gcds-ext-map', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/gcds-ext-map/cssDomination.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Css Values Dominate Attribute Values', async () => {
    //height and width attribute value in the gcds-ext-map tag
    let height_attribute_value = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => viewer.getAttribute('height')
    );
    let width_attribute_value = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => viewer.getAttribute('width')
    );
    //actual height and width value of the map
    let map_height = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => viewer.height
    );
    let map_width = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => viewer.width
    );
    
    // Also check the actual rendered bounding box
    let boundingBox = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => {
        const rect = viewer.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }
    );
    
    expect(height_attribute_value).not.toEqual(map_height);
    expect(width_attribute_value).not.toEqual(map_width);
    expect(map_width).toEqual(300);
    expect(map_height).toEqual(300);
    expect(height_attribute_value).toEqual('600');
    expect(width_attribute_value).toEqual('600');
    
    // Verify the actual rendered size matches CSS (300x300), not attributes (600x600)
    expect(boundingBox.width).toEqual(300);
    expect(boundingBox.height).toEqual(300);
  });
});
