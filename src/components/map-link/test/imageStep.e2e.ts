import { test, expect } from '@playwright/test';

async function zoomIn(page: any, requestCount: number, urlBase: string, url: string) {
  let u = '';
  let requests = 0;
  page.on('request', (request: any) => {
    if (request.url().includes(urlBase)) {
      requests += 1;
      u = request.url();
    }
  });
  await page.keyboard.press('Equal');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  expect(requests).toEqual(requestCount);
  if (url !== '') expect(u).toContain(url);
}

test.describe('Templated image layer with step', () => {
  test.describe('Request Tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/test/map-link/templatedImageLayerStep.html', { waitUntil: 'networkidle' });
    });

    const urlBase = 'toporama';
    const u1 = '-5537023.0124460235,-2392385.4881043136,5972375.006350018,3362313.521293707&m4h=t';
    const panU = '-5537023.0124460235,676787.3169079646,5972375.006350018,6431486.326305982&m4h=t';

    test('On add requests zoom level 0', async ({ page }) => {
      let url = '';
      await page.on('request', (request) => {
        if (request.url().includes(urlBase)) {
          url = request.url();
        }
      });
      await page.waitForTimeout(500);
      await page.reload({waitUntil: 'networkidle'});
      await page.waitForTimeout(500);
      expect(url).toContain(u1);
    });

    test('At zoom level 1, zooming in to 2', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await zoomIn(page, 0, urlBase, '');
    });

    test('At zoom level 2, zooming in to 3', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Equal');
      await page.waitForTimeout(1000);
      await zoomIn(page, 1, urlBase, '');
    });

    test('At zoom level 3, zooming in to 4', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Equal');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Equal');
      await page.waitForTimeout(1000);
      await zoomIn(page, 0, urlBase, '');
    });

    test('At zoom level 4, zooming in to 5', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Equal');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Equal');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Equal');
      await page.waitForTimeout(1000);
      await zoomIn(page, 0, urlBase, '');
    });

    test('Panning makes new request as needed', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Minus');
      await page.waitForTimeout(1000);
      
      let u = '';
      const listener = (request) => {
        if (request.url().includes(urlBase)) {
          u = request.url();
        }
      };
      page.on('request', listener);
      await page.keyboard.press('ArrowUp');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      page.off('request', listener);

      expect(u).toContain(panU);
    });
  });

  test.describe('Transform Tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/test/map-link/templatedImageLayerStep.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    });

    const selector = '.leaflet-layer.mapml-extentlayer-container > div > img:last-child';

    test('Scale layer on add', async ({ page }) => {
      const transform = await page.$eval(
        selector,
        (img: any) => img.style.transform
      );
      expect(transform).toEqual(
        'translate3d(-106px, -53px, 0px) scale(1.70588)'
      );
    });

    test('Shift zooming from level 1 -> 4 requests and scales level 3', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Shift+Equal');
      await page.waitForTimeout(1000);
      const transform = await page.$eval(
        selector,
        (img: any) => img.style.transform
      );
      const url = await page.$eval(selector, (img: any) => img.src);
      expect(transform).toEqual(
        'translate3d(-107px, -54px, 0px) scale(1.71429)'
      );
      expect(url).toContain(
        '-968982.6263652518,-107703.83540767431,1412272.136144273,1082923.545847088&m4h=t'
      );
    });

    /*
      The resetting mentioned below would make it look like the map zoomed out before panning since the
      scaled layer's css scale transform would be removed and there would be enough time to see it before the new
      layer is added.
      https://github.com/Maps4HTML/MapML.js/commit/8df7c993276e719bb30c4f55a8966289d4c918b7
      */
    test('Overlay to remove does not reset its transform on shift pan when on a scaled layer', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Shift+Equal');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Shift+ArrowUp');
      let unscaleOnShiftPan;
      try {
        unscaleOnShiftPan = await page.waitForFunction(
          () =>
            (document
              .querySelector('body > gcds-ext-map')
              .shadowRoot.querySelector(
                '.leaflet-layer.mapml-extentlayer-container > div > img'
              ) as HTMLElement).style.transform === 'translate3d(0px, 0px, 0px)',
          {},
          { timeout: 1000 }
        );
      } catch (e) {}
      expect(unscaleOnShiftPan).toEqual(undefined);
    });
  });
});
