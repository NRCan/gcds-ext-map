import { test, expect, chromium, type Page, type BrowserContext } from '@playwright/test';

test.describe('Adding Width and Height Attribute to gcds-ext-map', () => {
  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/gcds-ext-map/gcds-ext-mapHeightAndWidthAttributes.html', { waitUntil: 'networkidle' });
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Setting New Width and Height Attributes to gcds-ext-map', async () => {
    // Wait for map to be fully initialized
    await page.waitForFunction(() => {
      const viewer = document.querySelector('body > gcds-ext-map') as any;
      return viewer && viewer._map;
    });
    
    //setting new height and width attribute values in the gcds-ext-map tag
    await page.$eval('body > gcds-ext-map', (viewer) =>
      viewer.setAttribute('width', '700')
    );
    await page.$eval('body > gcds-ext-map', (viewer) =>
      viewer.setAttribute('height', '700')
    );
    
    // Wait for attribute changes to be processed (MutationObserver is async)
    await page.waitForTimeout(300);
    
    //actual height and width value of the map
    let height_without_px = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => (viewer as any).height
    );
    let width_without_px = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => (viewer as any).width
    );
    // The getters return the computed CSS values - coerce to number for comparison
    expect(+height_without_px).toEqual(700);
    expect(+width_without_px).toEqual(700);
  });

  test('Testing Validity of Width and Height Attributes', async () => {
    // Wait a bit for the previous test's changes to settle
    await page.waitForTimeout(200);
    
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
    let height_with_px = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => (viewer as any)._container.style.height
    );
    let width_with_px = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => (viewer as any)._container.style.width
    );
    expect(height_with_px).toEqual(height_attribute_value + 'px');
    expect(width_with_px).toEqual(width_attribute_value + 'px');
  });

  test('Map Property Dimension Match On Window Size Change', async () => {
    await page.goto('/test/gcds-ext-map/windowSizeChange.html', { waitUntil: 'networkidle' });
    //change initial viewport of the map
    await page.setViewportSize({ width: 300, height: 300 });
    //actual height and width value of the map
    let _height = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => window.getComputedStyle(viewer).height
    );
    let _width = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => window.getComputedStyle(viewer).width
    );
    //expected width and height
    let map_height = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => (viewer as any).height
    );
    let map_width = await page.$eval(
      'body > gcds-ext-map',
      (viewer) => (viewer as any).width
    );
    map_height += 'px';
    map_width += 'px';
    expect(map_height).toEqual(_height);
    expect(map_width).toEqual(_width);
  });

  test('Only Width Added to A Map With No Width OR Height Attributes', async () => {
    await page.goto('/test/gcds-ext-map/noWidthAndHeight.html', { waitUntil: 'networkidle' });
    let has_height = await page.$eval('body > gcds-ext-map', (viewer) =>
      viewer.hasAttribute('height')
    );
    expect(has_height).toEqual(false);
    //set a height attribute to a map with no height or width attributes
    await page.$eval('body > gcds-ext-map', (viewer) =>
      viewer.setAttribute('height', '500')
    );
    //expected height to be true
    has_height = await page.$eval('body > gcds-ext-map', (viewer) =>
      viewer.hasAttribute('height')
    );
    expect(has_height).toEqual(true);
  });

  test('Only Height Added to A Map With No Width OR Height Attributes', async () => {
    await page.goto('/test/gcds-ext-map/noWidthAndHeight.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200); // Wait for map to load
    let has_width = await page.$eval('body > gcds-ext-map', (viewer) =>
      viewer.hasAttribute('width')
    );
    expect(has_width).toEqual(false);
    //set a width attribute to a map with no height or width attributes
    await page.$eval('body > gcds-ext-map', (viewer) =>
      viewer.setAttribute('width', '500')
    );
    //expected width to be true
    has_width = await page.$eval('body > gcds-ext-map', (viewer) =>
      viewer.hasAttribute('width')
    );
    expect(has_width).toEqual(true);
  });
});
