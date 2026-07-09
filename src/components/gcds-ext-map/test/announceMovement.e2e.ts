import { test, expect, chromium } from '@playwright/test';

test.describe('Announce movement test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
  });

  test.beforeEach(async () => {
    await page.goto('/test/gcds-ext-map/gcds-ext-map.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    // Focus the map initially
    const map = await page.getByTestId('testviewer');
    await map.click();
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Output values are correct during regular movement', async () => {
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(1000);
    const map = await page.getByTestId('testviewer');
    const movedUp = await map.evaluate((map) => {
      let output = map.shadowRoot
        ? map.shadowRoot.querySelector('output')
        : map.querySelector('div').shadowRoot.querySelector('output');
      return output.innerHTML;
    });
    expect(movedUp).toEqual('zoom level 0');

    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(500);
    }

    const movedLeft = await map.evaluate((map) => {
      let output = map.shadowRoot
        ? map.shadowRoot.querySelector('output')
        : map.querySelector('div').shadowRoot.querySelector('output');
      return output.innerHTML;
    });
    expect(movedLeft).toEqual('zoom level 0');

    await page.keyboard.press('Equal');
    await page.waitForTimeout(500);

    const zoomedIn = await map.evaluate((map) => {
      let output = map.shadowRoot
        ? map.shadowRoot.querySelector('output')
        : map.querySelector('div').shadowRoot.querySelector('output');
      return output.innerHTML;
    });
    expect(zoomedIn).toEqual('zoom level 1');

    await page.keyboard.press('Minus');
    await page.waitForTimeout(500);

    const zoomedOut = await map.evaluate((map) => {
      let output = map.shadowRoot
        ? map.shadowRoot.querySelector('output')
        : map.querySelector('div').shadowRoot.querySelector('output');
      return output.innerHTML;
    });
    expect(zoomedOut).toEqual(
      'At minimum zoom level, zoom out disabled zoom level 0'
    );
    // testing + button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const zoomedBackIn = await map.evaluate((map) => {
      let output = map.shadowRoot
        ? map.shadowRoot.querySelector('output')
        : map.querySelector('div').shadowRoot.querySelector('output');
      return output.innerHTML;
    });
    expect(zoomedBackIn).toEqual('zoom level 1');
  });

  test('Output values are correct at bounds and bounces back', async () => {
    const map = await page.getByTestId('testviewer');
    
    await page.keyboard.press('Equal'); // Zoom in "+/=" key
    await page.waitForTimeout(500);
    
    //Zoom out to min layer bound
    await page.keyboard.press('Minus');
    await page.waitForTimeout(500);

    // Verify we're at zoom level 0 (could be "At minimum zoom level..." or just "zoom level 0")
    const zoomMessage = await map.evaluate((map) => {
      let output = map.shadowRoot?.querySelector('output.mapml-screen-reader-output');
      return output?.innerHTML || '';
    });
    expect(zoomMessage).toMatch(/zoom level 0/);
    
    //Pan out of west bounds, expect the map to bounce back
    // Set up mutation observer to catch the messages
    await page.evaluate(() => {
      const map = document.querySelector('gcds-ext-map');
      if (!map?.shadowRoot) return;
      const output = map.shadowRoot.querySelector('output.mapml-screen-reader-output');
      if (!output) return;
      
      (window as any).observedMessages = [];
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const text = (mutation.target as HTMLElement).textContent || '';
            if (text) {
              (window as any).observedMessages.push(text);
            }
          }
        });
      });
      observer.observe(output, { 
        childList: true
      });
    });

    // Pan west repeatedly until we hit the bound or max attempts
    let hitBound = false;
    for (let i = 0; i < 10 && !hitBound; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(250);
      
      // Check if we've hit the bound
      const messages = await page.evaluate(() => (window as any).observedMessages || []);
      hitBound = messages.some((msg: string) => msg.includes('Reached west bound'));
    }

    // Give it time to bounce back if it did hit the bound
    await page.waitForTimeout(1000);

    // Check that we saw the expected messages
    const messages = await page.evaluate(() => (window as any).observedMessages || []);
    
    // Should have seen "Reached west bound" at some point
    const sawWestBound = messages.some((msg: string) => msg.includes('Reached west bound'));
    expect(sawWestBound).toBe(true);
    
    // Final state should be back to zoom level 0
    const finalMessage = await map.evaluate((map) => {
      let output = map.shadowRoot?.querySelector('output');
      return output?.innerHTML || '';
    });
    expect(finalMessage).toMatch(/zoom level 0/);

    //Zoom in greater than map zoom bounds, expect the map to zoom back
    // await page.keyboard.press('Equal');
    // await page.waitForFunction(() => {
    //   const map = document.querySelector('gcds-ext-map');
    //   if (!map) return false;
    //   let output = map.shadowRoot
    //     ? map.shadowRoot.querySelector('output')
    //     : map.querySelector('div')?.shadowRoot?.querySelector('output');
    //   if (!output) return false;
      // this is looking for locale.amZoomedOut per line 101 of AnnounceMovement.js
      // which means that the zoom out of bounds happened but that
      // can't normally happen via keyboard or mouse?
      // I don't believe this is operational, and maybe it should not be tbd
      // the layer becomes disabled, but the map can continue to zoom beyond
      // the layer's max zoom...
    //   return output.innerHTML === 'Zoomed out of bounds, returning to';
    // });
  //   await page.waitForFunction(() => {
  //     const map = document.querySelector('gcds-ext-map');
  //     if (!map) return false;
  //     let output = map.shadowRoot
  //       ? map.shadowRoot.querySelector('output')
  //       : map.querySelector('div')?.shadowRoot?.querySelector('output');
  //     if (!output) return false;
  //     return output.innerHTML === 'zoom level 0';
  //   });
  });
});
