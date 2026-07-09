import { test, expect, chromium } from '@playwright/test';

test.describe('Search custom handler tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/gcds-ext-map/searchCustomHandler.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });
  test.afterAll(async () => {
    await context.close();
  });

  test('Search button is enabled when layer has search link', async () => {
    let disabled = await page.$eval('.mapml-search-button', (btn) =>
      btn.getAttribute('aria-disabled')
    );
    expect(disabled).toBe('false');
  });

  test('Custom suggestions handler renders geonames item names', async () => {
    // Open the panel
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    // Type a query
    await page.fill('.mapml-search-input', 'Ottawa');
    // Wait for debounce + fetch + custom handler
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    expect(texts).toEqual(['Ottawa', 'Arctic Ocean', 'Atlantic Ocean']);
  });

  test('Default suggestions handler does NOT run', async () => {
    // If default handler ran, results would show display_name (GeoJSON format)
    // Custom handler shows just the name from geonames items
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    // None should contain comma-separated address (default handler pattern)
    for (let text of texts) {
      expect(text).not.toContain(',');
    }
  });

  test('Clicking a suggestion triggers a search (not direct navigation)', async () => {
    // Click Ottawa (first result — has `value`, so it re-searches)
    await page.click('.mapml-search-result:first-child');
    // Wait for the search to complete and render results
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    await page.waitForTimeout(300);
    // The search handler renders results without `value`, so these are
    // navigable results (search endpoint returns 1 result: "Ottawa")
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    expect(texts).toEqual(['Ottawa']);
  });

  test('Custom search handler renders geonames items on Enter', async () => {
    // Close and re-open the panel for a fresh search
    await page.click('.mapml-search-close');
    await page.waitForTimeout(400);
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    // Type and press Enter for search
    await page.fill('.mapml-search-input', 'Ottawa');
    await page.press('.mapml-search-input', 'Enter');
    // Wait for search results
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    await page.waitForTimeout(300);
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    // Search endpoint returns 1 result
    expect(texts).toEqual(['Ottawa']);
  });

  test('Clicking a search result moves the map', async () => {
    await page.click('.mapml-search-result:first-child');
    await page.waitForTimeout(500);
    let center = await page.$eval('[data-testid=viewer]', (viewer: any) => {
      let map = viewer._map;
      return { lat: map.getCenter().lat, lng: map.getCenter().lng };
    });
    // Ottawa bbox center is roughly (45.24, -75.8)
    expect(center.lat).toBeCloseTo(45.24, 0);
    expect(center.lng).toBeCloseTo(-75.8, 0);
  });

  test('Arrow keys navigate between results in the dropdown', async () => {
    // Ensure clean state: reload the page
    await page.goto('/test/gcds-ext-map/searchCustomHandler.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Open the panel and get suggestions (3 items)
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    await page.fill('.mapml-search-input', 'Ottawa');
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });

    // Helper: get focused element text inside shadow DOM
    const getFocusedText = () =>
      page.evaluate(() => {
        const viewer = document.querySelector('[data-testid=viewer]') as any;
        const active = viewer.shadowRoot?.activeElement;
        return active?.textContent ?? null;
      });
    const getFocusedTag = () =>
      page.evaluate(() => {
        const viewer = document.querySelector('[data-testid=viewer]') as any;
        const active = viewer.shadowRoot?.activeElement;
        return active?.tagName?.toLowerCase() ?? null;
      });

    // ArrowDown from input → first result
    await page.press('.mapml-search-input', 'ArrowDown');
    expect(await getFocusedText()).toBe('Ottawa');

    // ArrowDown → second result
    await page.keyboard.press('ArrowDown');
    expect(await getFocusedText()).toBe('Arctic Ocean');

    // ArrowDown → third result
    await page.keyboard.press('ArrowDown');
    expect(await getFocusedText()).toBe('Atlantic Ocean');

    // ArrowDown at end → stays on last result (no wrap)
    await page.keyboard.press('ArrowDown');
    expect(await getFocusedText()).toBe('Atlantic Ocean');

    // ArrowUp → back to second
    await page.keyboard.press('ArrowUp');
    expect(await getFocusedText()).toBe('Arctic Ocean');

    // ArrowUp → back to first
    await page.keyboard.press('ArrowUp');
    expect(await getFocusedText()).toBe('Ottawa');

    // ArrowUp from first result → focus returns to input
    await page.keyboard.press('ArrowUp');
    expect(await getFocusedTag()).toBe('input');
  });
});
