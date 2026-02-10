import { test, expect } from '@playwright/test';

test.describe('Adding Static Attribute to gcds-map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-map/staticAttribute.html', { waitUntil: 'networkidle' });
    
    // Wait for the gcds-map component to be hydrated and ready
    const map = await page.locator('gcds-map');
    await expect(map).toHaveClass('hydrated', { timeout: 10000 });
    await page.waitForTimeout(500); // Additional wait to ensure map is fully initialized
    
  });

  test('Setting Static Attribute to gcds-map', async ({ page }) => {
    // Setting static attribute in the gcds-map tag
    await page.$eval('body > gcds-map', (viewer: any) => (viewer.static = true));
    await page.waitForTimeout(250);
    let attribute = await page.$eval('body > gcds-map', (viewer) =>
      viewer.hasAttribute('static')
    );
    expect(attribute).toEqual(true);

    // Verify panning, zooming, etc. are disabled
    let drag = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.dragging._enabled
    );
    let touchZoom = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.touchZoom._enabled
    );
    let doubleClickZoom = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.doubleClickZoom._enabled
    );
    let scrollWheelZoom = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.scrollWheelZoom._enabled
    );
    let boxZoom = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.boxZoom._enabled
    );
    let keyboard = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.keyboard._enabled
    );
    let zoomControl = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._zoomControl && viewer._zoomControl._disabled
    );

    expect(drag).toEqual(false);
    expect(touchZoom).toEqual(false);
    expect(doubleClickZoom).toEqual(false);
    expect(scrollWheelZoom).toEqual(false);
    expect(boxZoom).toEqual(false);
    expect(keyboard).toEqual(false);
    expect(zoomControl).toEqual(true);
  });

  test('Removing Static Attribute', async ({ page }) => {
    // First enable static mode
    await page.$eval('body > gcds-map', (viewer: any) => (viewer.static = true));
    await page.waitForTimeout(100);
    // Then remove it
    await page.$eval(
      'body > gcds-map',
      (viewer: any) => (viewer.static = false)
    );
    await page.waitForTimeout(100);
    let attribute = await page.$eval('body > gcds-map', (viewer) =>
      viewer.hasAttribute('static')
    );
    expect(attribute).toEqual(false);

    // Verify panning, zooming, etc. are enabled
    let drag = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.dragging._enabled
    );
    let touchZoom = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.touchZoom._enabled
    );
    let doubleClickZoom = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.doubleClickZoom._enabled
    );
    let scrollWheelZoom = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.scrollWheelZoom._enabled
    );
    let boxZoom = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.boxZoom._enabled
    );
    let keyboard = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.keyboard._enabled
    );
    let zoomControl = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._zoomControl && viewer._zoomControl._disabled
    );

    expect(drag).toEqual(true);
    expect(touchZoom).toEqual(true);
    expect(doubleClickZoom).toEqual(true);
    expect(scrollWheelZoom).toEqual(true);
    expect(boxZoom).toEqual(true);
    expect(keyboard).toEqual(true);
    expect(zoomControl).toEqual(false);
  });

  test('Static attribute via HTML attribute', async ({ page }) => {
    // Test setting the static attribute via HTML setAttribute
    await page.$eval('body > gcds-map', (viewer) => viewer.setAttribute('static', ''));
    
    let hasAttribute = await page.$eval('body > gcds-map', (viewer) =>
      viewer.hasAttribute('static')
    );
    let propertyValue = await page.$eval('body > gcds-map', (viewer: any) => viewer.static);
    
    expect(hasAttribute).toEqual(true);
    expect(propertyValue).toEqual(true);

    // Verify interactions are disabled
    let drag = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.dragging._enabled
    );
    expect(drag).toEqual(false);

    // Remove attribute
    await page.$eval('body > gcds-map', (viewer) => viewer.removeAttribute('static'));
    
    hasAttribute = await page.$eval('body > gcds-map', (viewer) =>
      viewer.hasAttribute('static')
    );
    propertyValue = await page.$eval('body > gcds-map', (viewer: any) => viewer.static);
    
    expect(hasAttribute).toEqual(false);
    expect(propertyValue).toEqual(false);

    // Verify interactions are enabled
    drag = await page.$eval(
      'body > gcds-map',
      (viewer: any) => viewer._map.dragging._enabled
    );
    expect(drag).toEqual(true);
  });
});