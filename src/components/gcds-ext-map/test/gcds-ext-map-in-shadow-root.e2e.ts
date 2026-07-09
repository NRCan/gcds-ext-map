import { test, expect, chromium } from '@playwright/test';

const playwright = require('playwright');

test.describe('Playwright gcds-ext-map fullscreen tests', () => {
  let context, page;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      slowMo: 250
    });
    page = await context.newPage();
  });
  test.afterAll(async () => {
    await context.close();
  });
  test.beforeEach(async () => {
    await page.goto('/test/gcds-ext-map/gcds-ext-map-in-shadow-root.html', { waitUntil: 'networkidle' });
  });
  test('Fullscreen button makes shadow DOM gcds-ext-map element the fullscreen element', async () => {
    const map1 = page.getByTestId('map1');
    const fullscreenButton = map1.getByTitle(/(View)|(Exit) Fullscreen/i);
    await fullscreenButton.click();

    let fullscreenElement = await map1.evaluate(
      (m) => (window.M as any).Util.getClosest(m._map.getContainer(), ':fullscreen').id
    );
    // the first gcds-ext-map should be returned by document.fullscreen
    expect(fullscreenElement).toEqual('map1');
    await fullscreenButton.click();
    fullscreenElement = await page.evaluate(`document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();

    const map2 = page.getByTestId('map2');
    const fullscreenButton2 = map2.getByTitle(/(View)|(Exit) Fullscreen/i);
    // do the same with second map / element
    await fullscreenButton2.click();
    fullscreenElement = await map2.evaluate(
      (m) => (window.M as any).Util.getClosest(m._map.getContainer(), ':fullscreen').id
    );
    expect(fullscreenElement).toEqual('map2');
    try {
      // try to click the fullscreen button of the other map that is not in fullscreen
      await fullscreenButton.click({ timeout: 500 });
    } catch (e) {
      if (e instanceof playwright.errors.TimeoutError) {
        // all is well
      }
    }
    // fullscreen element should not have changed
    fullscreenElement = await map2.evaluate(
      (m) => (window.M as any).Util.getClosest(m._map.getContainer(), ':fullscreen').id
    );
    expect(fullscreenElement).toEqual('map2');
    await fullscreenButton2.click(); // exit fullscreen
  });

  test('Context Menu Fullscreen Button makes shadow DOM gcds-ext-map element fullscreen', async () => {
    const map2 = page.getByTestId('map2');
    await map2.click();
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('F');
    let fullscreenElement = await map2.evaluate(
      (m) => (window.M as any).Util.getClosest(m._map.getContainer(), ':fullscreen').id
    );
    expect(fullscreenElement).toEqual('map2');
    await map2.click();
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('F'); // exit fullscreen
    fullscreenElement = await page.evaluate(`document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();
  });
  test('Fullscreen button makes light DOM gcds-ext-map element the fullscreen element', async () => {
    const map3 = page.getByTestId('map3');
    const fullscreenButton = map3.getByTitle(/(View)|(Exit) Fullscreen/i);
    await fullscreenButton.click();

    let fullscreenElement = await page.evaluate(
      `document.fullscreenElement.id`
    );
    // the first gcds-ext-map should be returned by document.fullscreen
    expect(fullscreenElement).toEqual('map3');

    const map2 = page.getByTestId('map2');
    const fullscreenButton2 = map2.getByTitle(/(View)|(Exit) Fullscreen/i);

    try {
      // try to click the fullscreen button of the other map that is not in fullscreen
      await fullscreenButton2.click({ timeout: 500 });
    } catch (e) {
      if (e instanceof playwright.errors.TimeoutError) {
        // all is well
      }
    }
    // fullscreen element should not have changed
    fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual('map3');
    await fullscreenButton.click(); // exit fullscreen
    fullscreenElement = await page.evaluate(`document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();
  });
  test('Context Menu Fullscreen Button light DOM gcds-ext-map element fullscreen', async () => {
    const map3 = page.getByTestId('map3');
    await map3.click();
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('F');
    let fullscreenElement = await map3.evaluate(
      (m) => (window.M as any).Util.getClosest(m._map.getContainer(), ':fullscreen').id
    );
    expect(fullscreenElement).toEqual('map3');
    await map3.click();
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('F'); // exit fullscreen
    fullscreenElement = await page.evaluate(`document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();
  });
});
