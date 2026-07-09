import { test, expect, chromium } from '@playwright/test';

// Helper function to normalize HTML by removing Stencil-specific attributes
function normalizeHTML(html: string): string {
  return html
    .replace(/\s+class="[^"]*hydrated[^"]*"/g, '') // Remove hydrated class
    .replace(/\s+class=""/g, '') // Remove empty class attributes
    .replace(/\s+s-[a-z0-9-]+="[^"]*"/g, '') // Remove Stencil scope IDs
    .replace(/<!---->/g, '') // Remove Stencil placeholder comments
    .trim();
}

test.describe('GeoJSON API - geojson2mapml', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/gcds-ext-map/geojson2mapml.html', { waitUntil: 'networkidle' });
    // Wait longer for the page to fully load and execute scripts
    await page.waitForTimeout(2000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Point Geometry (string json)', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[0].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(1)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('Line Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[1].innerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(2)').innerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('Polygon Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[2].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(3)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('MultiPoint Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[3].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(4)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('MultiLineString Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[4].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(5)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('MultiPolygon Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[5].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(6)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('Geometry Collection', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[6].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(7)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('Feature Collection', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[7].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(8)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('BBOX, Options label, caption + properties string', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[8].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(9)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('BBOX, Options label, caption + properties function', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[9].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) =>
          node.content.querySelector('map-layer:nth-child(10)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });

  test('Feature', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[10].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) =>
          node.content.querySelector('map-layer:nth-child(11)').outerHTML
      );
    expect(normalizeHTML(out)).toEqual(normalizeHTML(exp));
  });
  test('M.geojson2mapml public API method exists and works', async () => {
    const viewer = page.getByTestId('map');
    
    await viewer.evaluate((v) => {
      // point is a global variable defined in geojson2mapmlJSON.js loaded by the HTML page
      // Use eval to bypass TypeScript checking and access the global variable directly
      let pointData = eval('point');
      
      if (typeof pointData === 'string') {
        pointData = JSON.parse(pointData);
      }
      
      let l = eval('M.geojson2mapml')(pointData, {
        label: 'M.geojson2mapml public API method works'
      });
      v.appendChild(l);
      l.setAttribute('data-testid', 'test-layer');
    });
    const layer = page.getByTestId('test-layer');
    await expect(layer).not.toHaveAttribute('disabled');
    await expect(layer).toHaveAttribute(
      'label',
      'M.geojson2mapml public API method works'
    );
  });
});
