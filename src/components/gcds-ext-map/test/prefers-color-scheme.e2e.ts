import { test, expect } from '@playwright/test';

test.describe('matchMedia prefers-color-scheme tests', () => {
  test('matchMedia recognizes light scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/test/gcds-ext-map/prefers-color-scheme.html', { waitUntil: 'networkidle' });
    const preferredColor = await page.locator('#preferred-color').textContent();
    expect(preferredColor).toBe('Prefers light');
  });

  test('matchMedia recognizes dark scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/test/gcds-ext-map/prefers-color-scheme.html', { waitUntil: 'networkidle' });
    const preferredColor = await page.locator('#preferred-color').textContent();
    expect(preferredColor).toBe('Prefers dark');
  });
});
