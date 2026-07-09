import { test, expect } from '@playwright/test';

// Function defined in map-projectionchange.html
declare function changeProjection(): void;

test.describe('map-projectionchange test ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/map-projectionchange.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });

  test('Multiple map-extents in different projections adapt to map-projectionchange', async ({ page }) => {
    const viewer = await page.locator('gcds-ext-map');
    expect(await viewer.evaluate((v: any) => v.projection)).toEqual('OSMTILE');
    expect(
      await viewer.evaluate((v: any) => {
        return v.querySelector('map-extent[units=OSMTILE]').disabled;
      })
    ).toBe(false);
    expect(
      await viewer.evaluate((v: any) => {
        return v.querySelector('map-extent[units=CBMTILE]').disabled;
      })
    ).toBe(true);
    await viewer.evaluate(() => changeProjection());
    await page.waitForTimeout(500);
    expect(await viewer.evaluate((v: any) => v.projection)).toEqual('CBMTILE');
    expect(
      await viewer.evaluate((v: any) => {
        return v.querySelector('map-extent[units=OSMTILE]').disabled;
      })
    ).toBe(true);
    expect(
      await viewer.evaluate((v: any) => {
        return v.querySelector('map-extent[units=CBMTILE]').disabled;
      })
    ).toBe(false);
  });
  
  test('History is empty after map-projectionchange', async ({ page }) => {
    // history api needs a complete review; test can't pass without many
    // odd hacks, so skip for now.
    const viewer = await page.locator('gcds-ext-map');
    expect(await viewer.evaluate((v: any) => v.projection)).toEqual('OSMTILE');
    await viewer.evaluate(() => changeProjection());
    await page.waitForTimeout(500);
    expect(await viewer.evaluate((v: any) => v.projection)).toEqual('CBMTILE');
    const reload = await page.getByLabel('Reload');
    expect(await reload.evaluate((button) => button.ariaDisabled)).toBe('true');
  });
  
  test('Opacity is maintained on map-layer and map-extent after map-projectionchange', async ({ page }) => {
    const viewer = await page.locator('gcds-ext-map');
    const layer = await page.locator('map-layer');
    await layer.evaluate((layer: any) => (layer.opacity = 0.5));
    expect(
      await layer.evaluate((layer: any) => {
        return layer.opacity;
      })
    ).toBe(0.5);
    const osmtileExtent = await page.locator('map-extent[units=OSMTILE]');
    await osmtileExtent.evaluate((e: any) => (e.opacity = 0.4));
    const cbmtileExtent = await page.locator('map-extent[units=CBMTILE]');
    await cbmtileExtent.evaluate((e: any) => (e.opacity = 0.3));
    await viewer.evaluate(() => changeProjection());
    await page.waitForTimeout(1000);
    expect(await osmtileExtent.evaluate((e: any) => e.opacity)).toBe(0.4);
    expect(await cbmtileExtent.evaluate((e: any) => e.opacity)).toBe(0.3);
    expect(
      await layer.evaluate((layer: any) => {
        return layer.opacity;
      })
    ).toBe(0.5);
  });
});
