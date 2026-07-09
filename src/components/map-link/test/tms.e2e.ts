import { test, expect } from '@playwright/test';

test.describe('TMS tile ordering tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/map-link/tms.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
  });

  test('Painting tiles are in proper order', async ({ page }) => {
    const tileOrder = ['1/0/1', '1/0/0', '1/1/1', '1/1/0'];
    
    const firstTile = await page
      .locator('gcds-ext-map .mapml-tile-group:nth-child(1) > img')
      .evaluate((img: HTMLImageElement) => img.src);
    const secondTile = await page
      .locator('gcds-ext-map .mapml-tile-group:nth-child(2) > img')
      .evaluate((img: HTMLImageElement) => img.src);
    const thirdTile = await page
      .locator('gcds-ext-map .mapml-tile-group:nth-child(3) > img')
      .evaluate((img: HTMLImageElement) => img.src);
    const fourthTile = await page
      .locator('gcds-ext-map .mapml-tile-group:nth-child(4) > img')
      .evaluate((img: HTMLImageElement) => img.src);
    
    expect(firstTile).toContain(tileOrder[0]);
    expect(secondTile).toContain(tileOrder[1]);
    expect(thirdTile).toContain(tileOrder[2]);
    expect(fourthTile).toContain(tileOrder[3]);
  });
});
