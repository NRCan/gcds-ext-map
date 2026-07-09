import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright gcds-ext-map Element Controls Test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('/test/gcds-ext-map/gcds-ext-mapControls.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Toggle controls context menu disabled when map created with no controls', async () => {
    const disabled = await page.$eval('body > #nocontrols', (map) =>
      map._map.contextMenu._items[8].el.el.hasAttribute('disabled')
    );
    expect(disabled).toEqual(true);
  });
});
