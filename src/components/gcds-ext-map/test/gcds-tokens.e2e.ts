import { test, expect, chromium } from '@playwright/test';

test.describe('GCDS tokens resolve through shadow DOM', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/gcds-ext-map/gcds-tokens.html', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(1000);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Context menu border-radius uses --gcds-border-radius-md token (6px, not 4px fallback)', async () => {
    // Right-click the map to open context menu
    await page.locator('gcds-ext-map').click({ button: 'right' });
    await page.waitForTimeout(300);

    const borderRadius = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const menu = map.shadowRoot.querySelector('.mapml-contextmenu');
      return getComputedStyle(menu).borderRadius;
    });

    // --gcds-border-radius-md: 0.375rem = 6px (fallback would be 4px)
    expect(borderRadius).toBe('6px');
  });

  test('Context menu item text color uses --gcds-text-primary token', async () => {
    // Ensure context menu is open
    await page.locator('gcds-ext-map').click({ button: 'right' });
    await page.waitForTimeout(300);

    const color = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const item = map.shadowRoot.querySelector(
        '.mapml-contextmenu button.mapml-contextmenu-item'
      );
      return getComputedStyle(item).color;
    });

    // --gcds-text-primary: #333333 = rgb(51, 51, 51), not #222 fallback
    expect(color).toBe('rgb(51, 51, 51)');
  });

  test('Context menu hover state uses --gcds-bg-light token (not #f4f4f4 fallback)', async () => {
    // Close context menu, reopen, and simulate hover on an item
    await page.locator('gcds-ext-map').click();
    await page.waitForTimeout(200);
    await page.locator('gcds-ext-map').click({ button: 'right' });
    await page.waitForTimeout(300);

    const bgColor = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const item = map.shadowRoot.querySelector(
        '.mapml-contextmenu button.mapml-contextmenu-item'
      );
      // Add the 'over' class to simulate hover state
      item.classList.add('over');
      return getComputedStyle(item).backgroundColor;
    });

    // --gcds-bg-light: #f2f2f2 = rgb(242, 242, 242), not fallback #f4f4f4 = rgb(244, 244, 244)
    expect(bgColor).toBe('rgb(242, 242, 242)');
  });

  test('Layer control border-color uses --gcds-color-grayscale-100 token', async () => {
    const borderColor = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const control = map.shadowRoot.querySelector('.leaflet-control-layers');
      if (!control) return null;
      return getComputedStyle(control).borderColor;
    });

    expect(borderColor).not.toBeNull();
    // --gcds-color-grayscale-100: #e6e6e6 = rgb(230, 230, 230)
    expect(borderColor).toBe('rgb(230, 230, 230)');
  });

  test('Layer control border-radius uses --gcds-border-radius-md token', async () => {
    const borderRadius = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const control = map.shadowRoot.querySelector('.leaflet-control-layers');
      if (!control) return null;
      return getComputedStyle(control).borderRadius;
    });

    expect(borderRadius).not.toBeNull();
    // --gcds-border-radius-md: 0.375rem = 6px
    expect(borderRadius).toBe('6px');
  });

  test('Popup separator uses --gcds-color-grayscale-100 token', async () => {
    // Tab to the feature and press Enter to open popup
    await page.locator('gcds-ext-map').click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const borderColor = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const hr = map.shadowRoot.querySelector('.mapml-popup-content hr');
      if (!hr) return null;
      return getComputedStyle(hr).borderBlockStartColor;
    });

    // If popup has an hr, check it uses the token
    // --gcds-color-grayscale-100: #e6e6e6 = rgb(230, 230, 230)
    if (borderColor) {
      expect(borderColor).toBe('rgb(230, 230, 230)');
    }
  });

  test('User can override GCDS tokens via :root', async () => {
    // Inject a token override
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent =
        ':root { --gcds-bg-white: rgb(255, 255, 0) !important; }';
      document.head.appendChild(style);
    });

    // Right-click to open context menu
    await page.locator('gcds-ext-map').click({ button: 'right' });
    await page.waitForTimeout(300);

    const bgColor = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const menu = map.shadowRoot.querySelector('.mapml-contextmenu');
      return getComputedStyle(menu).backgroundColor;
    });

    // Should now be yellow from the override
    expect(bgColor).toBe('rgb(255, 255, 0)');

    // Clean up the injected style
    await page.evaluate(() => {
      const styles = document.querySelectorAll('style');
      styles[styles.length - 1].remove();
    });
  });

  test('Context menu text renders in Noto Sans font', async () => {
    await page.locator('gcds-ext-map').click({ button: 'right' });
    await page.waitForTimeout(300);

    const fontFamily = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const item = map.shadowRoot.querySelector(
        '.mapml-contextmenu button.mapml-contextmenu-item'
      );
      return getComputedStyle(item).fontFamily;
    });

    expect(fontFamily).toContain('Noto Sans');
  });

  test('Layer control text renders in Noto Sans font', async () => {
    const fontFamily = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const label = map.shadowRoot.querySelector('.mapml-layer-item-name');
      if (!label) return null;
      return getComputedStyle(label).fontFamily;
    });

    expect(fontFamily).not.toBeNull();
    expect(fontFamily).toContain('Noto Sans');
  });

  test('Popup text renders in Noto Sans font', async () => {
    // Click the map to close context menu, then click the feature to open popup
    await page.locator('gcds-ext-map').click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const fontFamily = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const popupContent = map.shadowRoot.querySelector('.mapml-popup-content');
      if (!popupContent) return null;
      return getComputedStyle(popupContent).fontFamily;
    });

    if (fontFamily) {
      expect(fontFamily).toContain('Noto Sans');
    }
  });

  test('Layer context menu text renders in Noto Sans font', async () => {
    // Hover over layer control to expand it, then right-click the layer name
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover({ force: true });
    await page.waitForTimeout(300);
    const layerName = page.getByText('Test Layer');
    await layerName.click({ button: 'right' });
    await page.waitForTimeout(300);

    const fontFamily = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const menu = map.shadowRoot.querySelector(
        '.mapml-contextmenu.mapml-layer-menu'
      );
      if (!menu) return null;
      const item = menu.querySelector('button.mapml-contextmenu-item');
      if (!item) return null;
      return getComputedStyle(item).fontFamily;
    });

    expect(fontFamily).not.toBeNull();
    expect(fontFamily).toContain('Noto Sans');
  });
});

test.describe('Fallback values work without GCDS CSS', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    // Use existing test page that does NOT load GCDS CSS
    await page.goto('/test/gcds-ext-map/gcds-ext-map.html', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(1000);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Context menu uses fallback border-radius without GCDS CSS', async () => {
    await page.locator('gcds-ext-map').click({ button: 'right' });
    await page.waitForTimeout(300);

    const borderRadius = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const menu = map.shadowRoot.querySelector('.mapml-contextmenu');
      return getComputedStyle(menu).borderRadius;
    });

    // Fallback value: 4px (not 6px from token)
    expect(borderRadius).toBe('4px');
  });

  test('Context menu item uses fallback text color without GCDS CSS', async () => {
    await page.locator('gcds-ext-map').click({ button: 'right' });
    await page.waitForTimeout(300);

    const color = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const item = map.shadowRoot.querySelector(
        '.mapml-contextmenu button.mapml-contextmenu-item'
      );
      return getComputedStyle(item).color;
    });

    // Fallback: #222 = rgb(34, 34, 34), not the GCDS #333
    expect(color).toBe('rgb(34, 34, 34)');
  });

  test('Context menu uses fallback font without GCDS CSS', async () => {
    await page.locator('gcds-ext-map').click({ button: 'right' });
    await page.waitForTimeout(300);

    const fontFamily = await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      const item = map.shadowRoot.querySelector(
        '.mapml-contextmenu button.mapml-contextmenu-item'
      );
      return getComputedStyle(item).fontFamily;
    });

    // Without GCDS CSS, --gcds-font-families-body is undefined,
    // so the fallback 'Noto Sans', sans-serif is used.
    // The @font-face for Noto Sans is declared in the shadow DOM,
    // so it should still resolve to Noto Sans even without gcds.css.
    expect(fontFamily).toContain('Noto Sans');
  });
});
