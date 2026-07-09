import { test, expect } from '@playwright/test';

test.describe('Playwright Map Context Menu Keyboard Tests', () => {
  // Grant clipboard permissions for all tests in this suite
  test.use({
    permissions: ['clipboard-read', 'clipboard-write']
  });

  test('Tab forward works like ArrowDown to navigate map context menu items', async ({ page }) => {
    await page.goto('/test/gcds-ext-map/gcds-ext-map.html', {waitUntil: 'networkidle'});
    await page.waitForTimeout(1000);
    await page.locator('gcds-ext-map').click();
    // display map context menu
    await page.locator('gcds-ext-map').press('Shift+F10');
    await page.locator('text=View Fullscreen (F)').press('Tab');
    await page.locator('text=Copy (C)').press('Tab');
    await page.locator('text=Paste (P)').press('Tab');
    await page.locator('text=Toggle Controls (T)').press('Tab');
    await page.locator('text=Toggle Debug Mode (D)').press('Tab');
    await page.locator('text=View Map Source (V)').press('Tab');
    await page.locator('text=View Fullscreen (F)').press('Tab');
    await page.locator('text=Copy (C)').press('Tab');
    await page.locator('text=Paste (P)').press('Tab');
    await page.locator('text=Toggle Controls (T)').press('Enter');

    let controls = await page.evaluate(() => {
      return document.querySelector('gcds-ext-map').controls ? true : false;
    });
    expect(controls).toBe(false);
  });
  test('Shift+Tab works like ArrowUp to navigate map context menu items', async ({ page }) => {
    await page.goto('/test/gcds-ext-map/gcds-ext-map.html', {waitUntil: 'networkidle'});
    await page.waitForTimeout(1000);
    await page.locator('gcds-ext-map').click();
    // display map context menu
    await page.locator('gcds-ext-map').press('Shift+F10');
    // View Fullscreen should be selected item
    await page.locator('text=View Fullscreen (F)').press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // should be at toggle controls here
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // back to toggle controls, in theory
    await page.keyboard.press('Enter');
    //await page.locator('text=Toggle Controls (T)').press('Enter');
    let controls = await page.evaluate(() => {
      return document.querySelector('gcds-ext-map').controls ? true : false;
    });
    expect(controls).toBe(false);
  });
  test('Shift+F10 on feature does not throw', async ({ page }) => {
    // check for error messages in console
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    await page.goto('/test/gcds-ext-map/mapContextMenuKeyboard.html', {waitUntil: 'networkidle'});
    const viewer = await page.locator('gcds-ext-map');
    await page.waitForTimeout(1000); // allow time for map to load
    await viewer.evaluate((viewer: any) => viewer.whenLayersReady());
    await viewer.press('Tab');
    await page
      .locator('[aria-label="The Man With Two Hats"]')
      .press('Shift+F10');
    // check for error messages in console
    expect(errorLogs.length).toBe(0);
  });
  test('Arrow key navigation of context menu does not scroll document', async ({ page }) => {
    await page.goto('/test/gcds-ext-map/mapContextMenuKeyboard.html', {waitUntil: 'networkidle'});
    const mapPosition1 = await page.evaluate(() => {
      return document.querySelector('gcds-ext-map').getBoundingClientRect().y;
    });
    await page.locator('gcds-ext-map').click();
    await page.locator('gcds-ext-map').press('Shift+F10');
    await page.locator('text=View Fullscreen (F)').press('ArrowDown');
    await page.locator('text=Copy (C)').press('ArrowDown');
    await page.locator('text=Paste (P)').press('ArrowDown');
    await page.locator('text=Toggle Controls (T)').press('ArrowDown');
    const mapPosition2 = await page.evaluate(() => {
      return document.querySelector('gcds-ext-map').getBoundingClientRect().y;
    });
    expect(mapPosition2).toEqual(mapPosition1);
  });
});
