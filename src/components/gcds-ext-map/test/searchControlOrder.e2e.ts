import { test, expect, chromium } from '@playwright/test';

// Regression test for the bug where adding controlslist="search" at runtime
// (on a map that was initialized with `controls` but no `controlslist`) caused
// the search button to be appended at the end of the topleft control corner
// (after the fullscreen button) instead of being inserted between the zoom
// and reload controls, where it belongs.
test.describe('Search control DOM order when added at runtime', () => {
  let page;
  let context;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((p) => p.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/gcds-ext-map/searchControlOrder.html', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(1000);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Search button is inserted between zoom and reload after controlslist="search" is set at runtime', async () => {
    // Sanity check: search button container exists in the DOM (it is
    // always created up-front by _createControls() to guarantee its DOM
    // position), but it must be initially hidden because the map was
    // loaded without controlslist="search".
    const initialState = await page.$eval(
      '[data-testid=viewer]',
      (viewer: any) => {
        const root = viewer.shadowRoot || viewer;
        const el = root.querySelector('.mapml-search-control');
        return {
          present: !!el,
          hidden: !!el && el.hasAttribute('hidden')
        };
      }
    );
    expect(initialState.present).toBe(true);
    expect(initialState.hidden).toBe(true);

    // Add controlslist="search" at runtime.
    await page.$eval('[data-testid=viewer]', (viewer) =>
      viewer.setAttribute('controlslist', 'search')
    );
    await page.waitForTimeout(500);

    // The search button must now be visible (no hidden attribute).
    const visibleAfter = await page.$eval(
      '[data-testid=viewer]',
      (viewer: any) => {
        const root = viewer.shadowRoot || viewer;
        const el = root.querySelector('.mapml-search-control');
        return !!el && !el.hasAttribute('hidden');
      }
    );
    expect(visibleAfter).toBe(true);

    // Collect the class names of every direct child of the topleft control
    // corner, in DOM order, then locate the indexes of zoom, search and
    // reload. The search button must appear AFTER zoom and BEFORE reload.
    const order: string[] = await page.$eval(
      '[data-testid=viewer]',
      (viewer: any) => {
        const root = viewer.shadowRoot || viewer;
        const corner = root.querySelector(
          '.leaflet-control-container > .leaflet-top.leaflet-left'
        );
        if (!corner) return [] as string[];
        const result: string[] = [];
        for (let i = 0; i < corner.children.length; i++) {
          result.push(corner.children[i].className);
        }
        return result;
      }
    );

    const zoomIndex = order.findIndex((cn) =>
      cn.includes('leaflet-control-zoom')
    );
    const searchIndex = order.findIndex((cn) =>
      cn.includes('mapml-search-control')
    );
    const reloadIndex = order.findIndex((cn) =>
      cn.includes('mapml-reload-button')
    );

    expect(zoomIndex).toBeGreaterThanOrEqual(0);
    expect(searchIndex).toBeGreaterThanOrEqual(0);
    expect(reloadIndex).toBeGreaterThanOrEqual(0);

    expect(searchIndex).toBeGreaterThan(zoomIndex);
    expect(searchIndex).toBeLessThan(reloadIndex);
  });
});
