import { test, expect, chromium } from '@playwright/test';

test.describe('UI Drag&Drop Test', () => {
  let page;
  let context;

  // The layer control only swaps two entries when the drag distance exceeds
  // the height of the fieldset under the cursor (see createLayerControlForLayer).
  // Row heights depend on the label text wrapping, so derive the drag offset
  // from live geometry rather than assuming a fixed row height.
  async function dragRowPastNeighbour(fromIndex, direction) {
    const boxes = await page.$$eval(
      '.leaflet-control-layers-overlays > fieldset',
      (els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        })
    );
    const from = boxes[fromIndex];
    const neighbour = boxes[direction === 'down' ? fromIndex + 1 : fromIndex - 1];
    // Must clear the neighbour's height, while leaving the cursor inside it.
    const offset = neighbour.height + from.height / 4;
    const startX = from.x + from.width / 2;
    const startY = from.y + from.height / 2;
    const endY = direction === 'down' ? startY + offset : startY - offset;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, endY);
    await page.mouse.up();
  }
  test.beforeEach(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/gcds-ext-map/drag.html', { waitUntil: 'networkidle' });
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Drag and drop of invalid HTML page', async () => {
    await page.waitForTimeout(500);
    const dataTransfer = await page.evaluateHandle(() =>
      new DataTransfer().setData('text/uri-list', 'http://example.com')
    );
    await page.dispatchEvent('.leaflet-control-zoom-in', 'dragstart', {
      dataTransfer
    });

    await page.dispatchEvent('gcds-ext-map', 'drop', {
      dataTransfer
    });
    await page.hover('.leaflet-top.leaflet-right',{force: true});
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(3);
  });

  test('Drag and drop of layers', async () => {
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right',{force: true});
    let control = await page.$(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1)'
    );
    let controlBBox = await control.boundingBox();
    await page.mouse.move(
      controlBBox.x + controlBBox.width / 2,
      controlBBox.y + controlBBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(50, 50);
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(3);
  });

  test('Moving layer down one in control overlay', async () => {
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right',{force: true});
    await dragRowPastNeighbour(0, 'down');
    await page.hover('.leaflet-top.leaflet-right',{force: true});
    await page.waitForTimeout(500);

    const controlText = await page.$eval(
      '.leaflet-control-layers-overlays > fieldset:nth-child(2) > div:nth-child(1) > label > span',
      (span) => span.innerText
    );
    const layerIndex = await page.$eval(
      '.leaflet-pane.leaflet-overlay-pane .mapml-templated-tile-container',
      (div) => div.parentElement.parentElement.style.zIndex
    );
    const domLayer = await page.$eval(
      'body > gcds-ext-map',
      (map) => map.layers[1].label
    );

    expect(controlText.toLowerCase()).toContain(domLayer.toLowerCase());
    expect(layerIndex).toEqual('2');
    expect(controlText).toBe('Canada Base Map - Transportation (CBMT)');
  });

  test('Moving layer up one in control overlay', async () => {
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right',{force: true});
    await dragRowPastNeighbour(1, 'up');
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right',{force: true});

    const controlText = await page.$eval(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > span',
      (span) => span.innerText
    );
    const layerIndex = await page.$eval(
      '.leaflet-overlay-pane .mapml-static-tile-container',
      (div) => div.parentElement.style.zIndex
    );
    const domLayer = await page.$eval(
      'gcds-ext-map',
      (map) => map.layers[0].label
    );

    expect(controlText.toLowerCase()).toContain(domLayer.toLowerCase());
    expect(layerIndex).toEqual('1');
    expect(controlText).toBe('Static MapML with tiles');
  });
  test('Re-order checked bug (#955) test', async () => {
    await page.waitForTimeout(500);
    const layerControl = page.locator('.leaflet-top.leaflet-right');
    await layerControl.hover({force: true});
    const overlaysList = page.locator('.leaflet-control-layers-overlays');
    const startingLowestLayer = overlaysList
      .getByRole('group', { name: 'Canada Base Map - Transportation (CBMT)' })
      .first();
    expect(await startingLowestLayer.count()).toBeGreaterThan(0);

    // assert that CBMT is first of three layers
    const cbmtIsFirstInLayerControl = await overlaysList.evaluate((l) => {
      return (
        l.firstElementChild.querySelector('.mapml-layer-item-name')
          .textContent === 'Canada Base Map - Transportation (CBMT)'
      );
    });
    expect(cbmtIsFirstInLayerControl).toBe(true);

    // move (drag/drop) CBMT to the top of the layer stack, one row at a time;
    // geometry is re-measured on each step because the rows reflow after a swap
    await dragRowPastNeighbour(0, 'down');
    await page.waitForTimeout(200);
    await dragRowPastNeighbour(1, 'down');
    await page.waitForTimeout(200);

    let cbmtIsTopOfLayerControl = await overlaysList.evaluate((l) => {
      return (
        l.querySelectorAll(':scope > fieldset').length === 3 &&
        l.lastElementChild.querySelector('.mapml-layer-item-name')
          .textContent === 'Canada Base Map - Transportation (CBMT)'
      );
    });
    // assert that CBMT is third of three layers
    expect(cbmtIsTopOfLayerControl).toBe(true);

    const cbmtCheckbox = overlaysList
      .getByRole('checkbox', {
        name: 'Canada Base Map - Transportation (CBMT)'
      })
      .first();
    let cbmtIsChecked = await cbmtCheckbox.isChecked();
    expect(cbmtIsChecked).toBe(true);
    await cbmtCheckbox.click();
    cbmtIsChecked = await cbmtCheckbox.isChecked();
    expect(cbmtIsChecked).toBe(false);
    // cbmt layer should still be on top of layer control despite that it's unchecked
    cbmtIsTopOfLayerControl = await overlaysList.evaluate((l) => {
      return (
        l.querySelectorAll(':scope > fieldset').length === 3 &&
        l.lastElementChild.querySelector('.mapml-layer-item-name')
          .textContent === 'Canada Base Map - Transportation (CBMT)'
      );
    });
    // assert that CBMT is still third of three layers
    expect(cbmtIsTopOfLayerControl).toBe(true);
    await cbmtCheckbox.click();
    cbmtIsChecked = await cbmtCheckbox.isChecked();
    expect(cbmtIsChecked).toBe(true);
    cbmtIsTopOfLayerControl = await overlaysList.evaluate((l) => {
      return (
        l.querySelectorAll(':scope > fieldset').length === 3 &&
        l.lastElementChild.querySelector('.mapml-layer-item-name')
          .textContent === 'Canada Base Map - Transportation (CBMT)'
      );
    });
    // assert that CBMT is still third of three layers
    expect(cbmtIsTopOfLayerControl).toBe(true);
  });
});
