import { test, expect } from '@playwright/test';

test.describe('Crosshair Reticle Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/reticle.html', { waitUntil: 'networkidle' });
  });

  test('Crosshair hidden onload, shows on focus', async ({ page }) => {
    const beforeTabHidden = await page.$eval(
      'div > div.mapml-crosshair',
      (div) => window.getComputedStyle(div).getPropertyValue('display')
    );
    await page.keyboard.press('Tab');
    const afterTab = await page.$eval('div > div.mapml-crosshair', (div) =>
      window.getComputedStyle(div).getPropertyValue('display')
    );
    expect(beforeTabHidden).toEqual('none');
    expect(afterTab).toEqual('block');
  });

  test('Crosshair remains on map move with arrow keys', async ({ page }) => {
    await page.keyboard.press('Tab'); // Focus the map first
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    const afterMove = await page.$eval('div > div.mapml-crosshair', (div) =>
      window.getComputedStyle(div).getPropertyValue('display')
    );
    expect(afterMove).toEqual('block');
  });

  test('Crosshair shows on esc but hidden on tab out', async ({ page }) => {
    await page.keyboard.press('Tab'); // Focus the map
    await page.keyboard.press('Escape');
    const afterEsc = await page.$eval('div > div.mapml-crosshair', (div) =>
      window.getComputedStyle(div).getPropertyValue('display')
    );
    await page.click('body');
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowUp');

    await page.keyboard.press('Tab');
    const afterTab = await page.$eval('div > div.mapml-crosshair', (div) =>
      window.getComputedStyle(div).getPropertyValue('display')
    );

    expect(afterEsc).toEqual('block');
    expect(afterTab).toEqual('none');
  });

  test('Crosshair hidden when queryable layer is unselected, shows on reselect', async ({ page }) => {
    await page.keyboard.press('Tab'); // Focus the map
    await page.keyboard.press('ArrowUp');
    await page.evaluate(() =>
      document.querySelector('map-layer').removeAttribute('checked')
    );
    const afterUncheck = await page.$eval(
      'div > div.mapml-crosshair',
      (div) => window.getComputedStyle(div).getPropertyValue('display')
    );

    await page.evaluate(() =>
      document.querySelector('map-layer').setAttribute('checked', '')
    );
    const afterCheck = await page.$eval('div > div.mapml-crosshair', (div) =>
      window.getComputedStyle(div).getPropertyValue('display')
    );

    expect(afterUncheck).toEqual('none');
    expect(afterCheck).toEqual('block');
  });
});
