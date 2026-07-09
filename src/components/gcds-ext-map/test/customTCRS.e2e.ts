import { test, expect } from '@playwright/test';

test.describe('Playwright Custom TCRS Tests', () => {
  test('Simple Custom TCRS, tiles load, mismatched layer disabled', async ({ page }) => {
    await page.goto('/test/gcds-ext-map/customTCRS-simple.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const mismatchedLayer = await page.getByTestId('projection-mismatched-layer');
    const matchedLayer = await page.getByTestId('projection-matched-layer');
    const misMatchedLayerDisabled = await mismatchedLayer.evaluate(layer => layer.hasAttribute('disabled'));
    const matchedLayerEnabled = await matchedLayer.evaluate((layer) => !layer.hasAttribute('disabled'));

    expect(await matchedLayer.evaluate(layer => layer.querySelectorAll('map-tile').length)).toEqual(2);
    expect(misMatchedLayerDisabled).toEqual(true);
    expect(matchedLayerEnabled).toEqual(true);
  });
  test('A projection name containing a colon is invalid', async ({ page }) => {
    await page.goto('/test/gcds-ext-map/customTCRS-invalid.html', { waitUntil: 'networkidle' });
    const message = await page.$eval(
      'body > p',
      (message) => message.innerHTML
    );
    expect(message).toEqual('passing');
  });
  test('Complex Custom TCRS, static features loaded, templated features loaded', async ({ page }) => {
    await page.goto('/test/gcds-ext-map/customTCRS-features.html', { waitUntil: 'networkidle' });
    const staticFeaturesLayerDisabled = await page
      .getByTestId('map2')
      .evaluate((map) =>
        map.querySelectorAll('map-layer')[0].hasAttribute('disabled')
      );
    const templatedFeaturesLayerEnabled = await page
      .getByTestId('map2')
      .evaluate((map) =>
        !map.querySelectorAll('map-layer')[1].hasAttribute('disabled')
      );

    const featureOne = await page
      .getByTestId('pcrsgeometry')
      .evaluate((f: any) => f._groupEl.firstElementChild.getAttribute('d'));
    const featureTwo = await page
      .getByTestId('tcrsgeometry')
      .evaluate((f: any) => f._groupEl.firstElementChild.getAttribute('d'));
    const featureThree = await page
      .getByTestId('tilematrixgeometry')
      .evaluate((f: any) => f._groupEl.firstElementChild.getAttribute('d'));
    const featureFour = await page
      .getByTestId('defaultcsgeometry')
      .evaluate((f: any) => f._groupEl.firstElementChild.getAttribute('d'));

    expect(featureOne).toEqual('M88 681L21 78L-436 201L-346 561z');
    expect(featureTwo).toEqual('M307 456L599 467L612 629L381 599z');

    expect(featureThree).toEqual('M382 -28L809 -28L809 399L382 399z');
    expect(featureFour).toEqual(
      'M150 429L171 426L175 438L181 457L183 461L185 463L185 465L187 465L185 468L185 470L184 472L186 477L186 481L188 485L182 486L154 490L154 492L157 494L157 497L158 498L156 501L154 501L151 499L150 495L149 495L148 498L148 501L144 501L141 477L141 448L141 431L139 430L150 429z'
    );

    expect(staticFeaturesLayerDisabled).toEqual(true);
    expect(templatedFeaturesLayerEnabled).toEqual(true);
  });
});
