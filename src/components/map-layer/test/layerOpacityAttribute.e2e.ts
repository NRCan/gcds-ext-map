import { test, expect, chromium } from '@playwright/test';

test.describe('Test the map-layer opacity attribute', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('/test/map-layer/layerOpacityAttribute.html', { waitUntil: 'networkidle' });
    const l = await page.locator('map-layer');
    await l.evaluate((l) => l.whenReady());
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Setting Opacity Attibute to map-layer Element', async () => {
    let opacity_attribute_value = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.getAttribute('opacity')
    );
    let layer_opacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );
    expect(layer_opacity).toEqual(+opacity_attribute_value);
  });
  test('Layer control opacity slider reflected to map-layer.opacity property', async () => {
    let opacity_slider_value = await page.getByTestId('layer-item-opacity').inputValue();
    let layer_opacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );
    expect(layer_opacity).toEqual(+opacity_slider_value);
  });
  test('Changing layer control opacity slider updates map-layer.opacity', async () => {
    const opacitySlider = page.getByTestId('layer-item-opacity');
    
    // Set slider to a specific value
    await opacitySlider.evaluate((slider) => {
      slider.value = '0.3';
      slider.dispatchEvent(new Event('change'));
    });
    
    // Wait a bit for the change to propagate
    await page.waitForTimeout(100);
    
    // Check that the layer.opacity property was updated
    const layerOpacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );
    
    expect(layerOpacity).toEqual(0.3);
  });
  test('Changing layer control opacity slider does not update map-layer opacity attribute', async () => {
    const opacitySlider = page.getByTestId('layer-item-opacity');
    
    // Get initial attribute value
    const initialAttribute = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.getAttribute('opacity')
    );
    
    // Set slider to a different value
    await opacitySlider.evaluate((slider) => {
      slider.value = '0.5';
      slider.dispatchEvent(new Event('change'));
    });
    
    // Wait a bit for the change to propagate
    await page.waitForTimeout(100);
    
    // Check that the attribute was NOT changed (should remain the same as initial)
    const newAttribute = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.getAttribute('opacity')
    );
    
    // The attribute should NOT change when slider is moved
    expect(newAttribute).toEqual(initialAttribute);
    
    // But the property should have changed
    const layerOpacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );
    expect(layerOpacity).toEqual(0.5);
  });
  test('Changing map-layer.opacity value updates the layer control opacity slider value', async () => {
    const opacitySlider = page.getByTestId('layer-item-opacity');
    
    // Set the layer opacity property programmatically
    await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => {
        layer.opacity = 0.6;
      }
    );
    
    // Wait a bit for the change to propagate
    await page.waitForTimeout(100);
    
    // Check that the slider value was updated
    const sliderValue = await opacitySlider.inputValue();
    
    expect(+sliderValue).toEqual(0.6);
  });
  test('Changing map-layer.opacity value sets the map-layer._layer container style.opacity value', async () => {
    // Set the layer opacity property programmatically
    await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => {
        layer.opacity = 0.4;
      }
    );
    
    // Wait a bit for the change to propagate
    await page.waitForTimeout(100);
    
    // Check that the underlying layer container style was updated
    const layerContainerOpacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => {
        return layer._layer && layer._layer._container 
          ? layer._layer._container.style.opacity 
          : null;
      }
    );
    
    expect(+layerContainerOpacity).toEqual(0.4);
  });
  test('Turn controls off, change opacity via .opacity, turn controls on, opacity changes are reflected in layer control slider', async () => {
    // First, turn controls off by removing the controls attribute
    await page.$eval(
      'body > gcds-ext-map',
      (map) => {
        map.removeAttribute('controls');
      }
    );
    
    // Wait for controls to be removed
    await page.waitForTimeout(200);
    
    // Verify controls are not visible
    const controlsVisible = await page.isVisible('div.leaflet-control-container');
    expect(controlsVisible).toBe(false);
    
    // Change opacity programmatically while controls are off
    await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => {
        layer.opacity = 0.7;
      }
    );
    
    // Wait a bit for the change to take effect
    await page.waitForTimeout(100);
    
    // Turn controls back on
    await page.$eval(
      'body > gcds-ext-map',
      (map) => {
        map.setAttribute('controls', '');
      }
    );
    
    // Wait for controls to be re-rendered
    await page.waitForTimeout(500);
    
    // Check that the opacity slider reflects the changed opacity value
    const sliderValue = await page.getByTestId('layer-item-opacity').evaluate((slider) => slider.value);
    
    expect(+sliderValue).toEqual(0.7);
    
    // Also verify that the layer's opacity property still matches
    const layerOpacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );
    expect(layerOpacity).toEqual(0.7);
  });
  test('Having restored controls, change opacity slider to ensure that its value is reflected in map-layer.opacity property', async () => {
    // This test should run after the previous test that disabled/enabled controls
    // The previous test should have left the opacity at 0.7, and when controls are restored,
    // the slider should reflect that value
    
    // Check what the current opacity is (should be 0.7 from previous test)
    const currentOpacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );

    // Check that the slider reflects the current opacity from the previous test
    const sliderValue = await page.getByTestId('layer-item-opacity').inputValue();
    expect(+sliderValue).toEqual(currentOpacity);
      
    // Then test that changing the slider updates the property
    await page.getByTestId('layer-item-opacity').evaluate((slider) => {
      slider.value = '0.9';
      // this supposedly simulates the user releasing the slider
      slider.dispatchEvent(new Event('change'));
      // and the change event handler propagates the change to the layer etc
    });
    
    await page.waitForTimeout(500);
    
    await page.pause();
    // Since the DOM element's opacity getter is unreliable, test _opacity directly
    const finalOpacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );
    
    expect(+finalOpacity).toEqual(0.9);
  });
  test("Using the slider input, change the layer opacity. Validate that the slider's value is reflected to the map-Layer.opacity", async () => {
    // Ensure controls are enabled and wait for proper initialization
    await page.$eval('body > gcds-ext-map', (map) => map.setAttribute('controls', ''));

    await page.waitForTimeout(500);
        
    // check and uncheck layers in the layer menu should call map-change
    await page.hover('.leaflet-top.leaflet-right');
    const button = await page.locator('.mapml-layer-item-settings-control.mapml-button');
    await button.click();
    
    // Force the details element to be open via JavaScript
    await page.$eval('details.mapml-layer-item-opacity', (details) => {
      details.open = true;
    });
    
    // Now get the slider 
    const sliderLocator = page.getByTestId('layer-item-opacity');
    
    // Check that the opacity slider is now visible 
    await expect(sliderLocator).toBeVisible();

    const sliderBox = await sliderLocator.boundingBox();
    
    // Get initial opacity value to ensure we're changing it to something different
    const initialOpacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );
   
    // Start from current thumb position and drag to target
    const startX = sliderBox.x + (sliderBox.width * initialOpacity); // Assuming current value is 0.8
    const targetX = sliderBox.x + (sliderBox.width * 0.2); // Target 0.2 (increments of 0.1 on slider)
    const centerY = sliderBox.y + (sliderBox.height / 2);
    // Drag from current to target position
    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(targetX, centerY);
    await page.mouse.up();

    // Verify the change
    let layer_opacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => layer.opacity
    );
    
    expect(layer_opacity).toBeCloseTo(0.2, 1);
    
    // Verify that the underlying layer container style was also updated
    const layerContainerOpacity = await page.$eval(
      'body > gcds-ext-map > map-layer',
      (layer) => {
        return layer._layer && layer._layer._container 
          ? +(layer._layer._container.style.opacity)
          : null;
      }
    );
    const testOpacity: number = 0.2;
    expect(layerContainerOpacity).toEqual(testOpacity);
    
    // Test a second interaction to ensure it continues working

  });
});
