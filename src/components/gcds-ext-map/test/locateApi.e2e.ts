import { test, expect } from '@playwright/test';

test.use({
  geolocation: { longitude: -73.56766530667056, latitude: 45.5027789304487 },
  permissions: ['geolocation']
});

test.describe('Locate API Test', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await page.goto('/test/gcds-ext-map/locateApi.html', { waitUntil: 'networkidle' });
  });

  test('Using locate API to find myself', async ({ page }) => {
    await page.$eval('body > gcds-ext-map', (viewer: any) => viewer.locate());

    let locateAPI_lat = await page.$eval(
      'body > gcds-ext-map',
      (viewer: any) => viewer.lat
    );
    let locateAPI_lng = await page.$eval(
      'body > gcds-ext-map',
      (viewer: any) => viewer.lon
    );
    //rounding to three decimal places
    locateAPI_lat = parseFloat(locateAPI_lat).toFixed(3);
    locateAPI_lng = parseFloat(locateAPI_lng).toFixed(3);

    expect(locateAPI_lat).toEqual('45.503');
    expect(locateAPI_lng).toEqual('-73.568');
  });

  test('Testing maplocationfound event', async ({ page }) => {
    const latlng = await page.evaluate(() => {
      const viewer = document.querySelector('body > gcds-ext-map') as any;
      return new Promise((resolve) => {
        viewer.addEventListener(
          'maplocationfound',
          (e: CustomEvent) => {
            resolve(e.detail.latlng);
          },
          { once: true }
        );
        viewer.locate();
      });
    });
    expect((latlng as any).lat).toEqual(45.5027789304487);
    expect((latlng as any).lng).toEqual(-73.56766530667056);
  });

  test('Testing locationerror event', async ({ page }) => {
    const error = await page.evaluate(() => {
      const viewer = document.querySelector('body > gcds-ext-map') as any;
      return new Promise((resolve) => {
        viewer.addEventListener(
          'locationerror',
          (e: CustomEvent) => {
            resolve(e.detail.error);
          },
          { once: true }
        );
        const errorEvent = new CustomEvent('locationerror', {
          detail: { error: 'Your location could not be determined.' }
        });
        viewer.dispatchEvent(errorEvent);
        viewer.locate();
      });
    });
    expect(error).toEqual('Your location could not be determined.');
  });

  test('Testing API when the button is used', async ({ page }) => {
    await page.reload({ waitUntil: 'networkidle' });
    await page.click('body > gcds-ext-map');
    await page.getByTitle('Show my location - location tracking off').click();

    await page.mouse.move(600, 300);
    await page.mouse.down();
    await page.mouse.move(1200, 450, { steps: 5 });
    await page.mouse.up();
    await page.$eval('body > gcds-ext-map', (viewer: any) => viewer.locate());

    let locateAPI_lat = await page.$eval(
      'body > gcds-ext-map',
      (viewer: any) => viewer.lat
    );
    let locateAPI_lng = await page.$eval(
      'body > gcds-ext-map',
      (viewer: any) => viewer.lon
    );

    locateAPI_lat = parseFloat(locateAPI_lat).toFixed(1);
    locateAPI_lng = parseFloat(locateAPI_lng).toFixed(1);

    expect(locateAPI_lat).toEqual('45.5');
    expect(locateAPI_lng).toEqual('-73.6');
  });
});
