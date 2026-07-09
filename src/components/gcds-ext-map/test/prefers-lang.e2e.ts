import { test, expect, chromium } from '@playwright/test';

test.describe('gcds-ext-map matchMedia API tests', () => {
  test('Test prefers-lang: en media feature', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ locale: 'en-CA' });
    const page = await context.newPage();

    await page.goto('/test/gcds-ext-map/prefers-lang.html', { waitUntil: 'networkidle' });
    const layer = page.locator('map-layer[lang=fr]');
    await expect(layer).toHaveAttribute('hidden');

    await context.close();
    await browser.close();
  });

  test('Test prefers-lang: fr media feature', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ locale: 'fr-CA' });
    const page = await context.newPage();

    await page.goto('/test/gcds-ext-map/prefers-lang.html', { waitUntil: 'networkidle' });
    const layer = page.locator('map-layer[lang=en]');
    await expect(layer).toHaveAttribute('hidden');

    await context.close();
    await browser.close();
  });
});
