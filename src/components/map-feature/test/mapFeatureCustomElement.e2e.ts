import { test, expect } from '@playwright/test';
import data from './mapFeatureCustomElement.data.js';



// Helper function to compare geojson with tolerance for floating point differences
function expectGeojsonToMatch(actual: any, expected: any, tolerance: number = 1e-10) {
  function compareValues(a: any, b: any): boolean {
    if (typeof a === 'number' && typeof b === 'number') {
      return Math.abs(a - b) < tolerance;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => compareValues(val, b[idx]));
    }
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      const keysA = Object.keys(a).sort();
      const keysB = Object.keys(b).sort();
      if (keysA.length !== keysB.length) return false;
      if (!keysA.every((key, idx) => key === keysB[idx])) return false;
      return keysA.every(key => compareValues(a[key], b[key]));
    }
    return a === b;
  }
  expect(compareValues(actual, expected)).toBe(true);
}

test.describe('Playwright MapFeature Custom Element Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/map-feature/mapFeatureCustomElement.html', { waitUntil: 'networkidle' });
  });

  test('Shadowroot tests of <map-layer> with src attribute', async ({ page }) => {
    let shadowAttached = await page.$eval(
      'body > gcds-ext-map',
      (map) => (map as any).layers[1].shadowRoot !== null
    );
    expect(shadowAttached).toEqual(true);

    // remove and then re-add <map-layer> element
    shadowAttached = await page.$eval('body > gcds-ext-map', (map: any) => {
      let layer = map.layers[1];
      map.removeChild(layer);
      map.appendChild(layer);
      return layer.shadowRoot !== null;
    });
    expect(shadowAttached).toEqual(true);
  });

  test('MapFeature interactivity tests', async ({ page }) => {
    await page.waitForTimeout(1000);
    const buttonFeature = page.locator('map-feature.button');
    await expect(buttonFeature).toHaveCount(1);
    const buttonFeatureRendering = page.getByLabel("feature, role='button'");
    await expect(buttonFeatureRendering).toHaveCount(1);

    // change <map-feature> attributes
    await page.$eval('body > gcds-ext-map', async (map) => {
      let layer = map.querySelector('map-layer'),
        mapFeature = layer.querySelector('map-feature');
      mapFeature.setAttribute('zoom', '4');
      (mapFeature as any).zoomTo();
    });
    await page.waitForTimeout(200);
    let mapZoom = await page.$eval('body > gcds-ext-map', (map) =>
      map.getAttribute('zoom')
    );
    // expect the associated <g> el to re-render and re-attach to the map
    expect(mapZoom).toEqual('4');

    // change <map-coordinates>
    await page.reload({ waitUntil: 'networkidle' });
    let prevExtentBR = await page.$eval('body > gcds-ext-map', (map) => {
      let layer = map.querySelector('map-layer'),
        mapFeature = layer.querySelector('map-feature');
      return (mapFeature as any).extent.bottomRight.pcrs;
    });
    let newExtentBR = await page.$eval('body > gcds-ext-map', (map) => {
      let layer = map.querySelector('map-layer'),
        mapFeature = layer.querySelector('map-feature'),
        mapCoord = mapFeature.querySelector('map-coordinates');
      mapCoord.innerHTML = '12 11 12 11 12 12 11 13';
      return (mapFeature as any).extent.bottomRight.pcrs;
    });
    // expect the associated <g> el to re-render and re-attach to the map
    expect(newExtentBR === prevExtentBR).toBe(false);

    // remove <map-properties>
    await page.$eval('body > gcds-ext-map', (map) => {
      let layer = map.querySelector('map-layer'),
        mapFeature = layer.querySelector('map-feature');
      mapFeature.querySelector('map-properties').remove();
    });
    await page.$eval('body > gcds-ext-map', (map) => {
      let layer = map.querySelector('map-layer'),
        mapFeature = layer.querySelector('map-feature');
      return (mapFeature as any).click();
    });
    const popupCount = await page.$eval(
      'div.leaflet-pane.leaflet-popup-pane',
      (popupPane) => popupPane.childElementCount
    );
    // expect no popup is binded
    expect(popupCount).toEqual(0);
  });

  test('Get extent of <map-point> with zoom attribute = 2', async ({ page }) => {
    const extent = await page.$eval(
      'body > gcds-ext-map',
      (map) => (map.querySelector('.point_1') as any).extent
    );
    expect(extent).toEqual(data.pointExtentwithZoom);
  });

  test('Zoom to <map-point> with zoom attribute = 2', async ({ page }) => {
    const mapZoom = await page.$eval('body > gcds-ext-map', (map: any) => {
      map.querySelector('.point_1').zoomTo();
      return +map.zoom;
    });
    expect(mapZoom).toEqual(2);
  });

  test('Get extent of <map-point> with no zoom attribute', async ({ page }) => {
    const extent = await page.$eval(
      'body > gcds-ext-map',
      (map) => (map.querySelector('.point_2') as any).extent
    );
    expect(extent).toEqual(data.pointExtentNoZoom);
  });

  test('Zoom to <map-point> with no zoom attribute', async ({ page }) => {
    const mapZoom = await page.$eval('body > gcds-ext-map', (map: any) => {
      map.querySelector('.point_2').zoomTo();
      return +map.zoom;
    });
    expect(mapZoom).toEqual(3);
  });

  test('Get geojson representation of <map-geometry> with single geometry', async ({ page }) => {
    // options = {propertyFunction: null, transform: true} (default)
    let geojson = await page.$eval('body > gcds-ext-map', (map) =>
      (map.querySelector('map-feature') as any).mapml2geojson()
    );
    expectGeojsonToMatch(geojson, data.geojsonData.withDefOptions);

    // options = {propertyFunction: null, transform: false}
    geojson = await page.$eval('body > gcds-ext-map', (map) =>
      (map.querySelector('map-feature') as any).mapml2geojson({ transform: false })
    );
    expectGeojsonToMatch(geojson, data.geojsonData.withNoTransform);

    // options = {propertyFunction: function (properties) {...}, transform: true}
    geojson = await page.$eval('body > gcds-ext-map', (map) => {
      return (map.querySelector('.table') as any).mapml2geojson({
        propertyFunction: function (properties) {
          let obj = {},
            count = 0;
          properties.querySelectorAll('th').forEach((th) => {
            obj[th.innerHTML] = [];
            properties.querySelectorAll('tr').forEach((tr) => {
              let data = tr.querySelectorAll('td')[count]?.innerHTML;
              if (data) {
                obj[th.innerHTML].push(data);
              }
            });
            count++;
          });
          return obj;
        }
      });
    });
    expectGeojsonToMatch(geojson, data.geojsonData.withPropertyFunc);
  });

  test('Get geojson representation of <map-geometry> with multiple geometries', async ({ page }) => {
    // multiple geometries (<map-geometrycollection>)
    let geojson = await page.$eval('body > gcds-ext-map', (map) =>
      (map.querySelector('.link') as any).mapml2geojson()
    );
    expectGeojsonToMatch(geojson, data.geojsonData.withMultiGeo);
  });

  test('Default click method test', async ({ page }) => {
    // click method test
    // <map-feature> with role="button" should have popup opened after click
    const popup = await page.$eval('body > gcds-ext-map', (map) => {
      let feature = map.querySelector('.button') as any;
      feature.click();
      return feature._geometry.isPopupOpen();
    });
    expect(popup).toEqual(true);
    // <map-feature> with role="link" should add a new layer / jump to another page after click
    const layerCount = await page.$eval('body > gcds-ext-map', (map: any) => {
      map.querySelector('.link').click();
      return map.layers.length;
    });
    expect(layerCount).toEqual(4);

    // the <path> element should be marked as "visited" after click
    const mapLink = await page.locator('map-feature.link');

    let status = await mapLink.evaluate(
      (l: any) => {
        for (let path of Array.from(l._groupEl.querySelectorAll('path'))) {
          if (!(path as any).classList.contains('map-a-visited')) {
            return false;
          }
        }
        return true;
      }
    );
    expect(status).toEqual(true);
  });

  test('Custom click method test', async ({ page }) => {
    const isClicked = await page.$eval('body > gcds-ext-map', (map) => {
      let mapFeature = map.querySelector('map-feature') as any;
      // define custom click method
      mapFeature.onclick = function () {
        document.querySelector('map-feature').classList.add('customClick');
      };
      mapFeature.click();
      return mapFeature.classList.contains('customClick');
    });
    expect(isClicked).toEqual(true);
  });

  test('Default focus method test', async ({ page }) => {
    await page.locator('gcds-ext-map').click();
    await page.keyboard.press('Tab'); // focus first map-feature
    // vermont is closest to the map centre, so is the first in tab order
    const firstFeature = page.locator('map-feature').filter({
      has: page.locator('map-featurecaption', { hasText: 'Vermont' })
    });
    await expect(firstFeature).toHaveCount(1);
    let firstFeatureHasFocus = await firstFeature.evaluate( (f: any) => {
      let g = f._groupEl;
      return document.activeElement.shadowRoot?.activeElement === g;
    });
    // the first feature in tab order should be focused
    expect(firstFeatureHasFocus).toEqual(true);

    // focus state will be removed when user changes focus to any other feature
    await page.locator('map-feature').filter({
      has: page.locator('map-featurecaption', { hasText: 'feature with table properties' })
    }).evaluate((f: any) => f.focus());

    firstFeatureHasFocus = await firstFeature.evaluate( (f: any) => {
      let g = f._groupEl;
      return document.activeElement.shadowRoot?.activeElement === g;
    });
    expect(firstFeatureHasFocus).toEqual(false);
  });

  test('Default blur method test', async ({ page }) => {
    const loseFocus = await page.$eval('body > gcds-ext-map', (map: any) => {
      let feature = map.querySelector('map-feature');
      feature.focus();
      feature.blur();
      return (
        document.activeElement.shadowRoot?.activeElement === map._map._container
      );
    });
    expect(loseFocus).toEqual(true);
  });

  test('Custom focus method test', async ({ page }) => {
    const isFocused = await page.$eval('body > gcds-ext-map', (map) => {
      let mapFeature = map.querySelector('map-feature') as any;
      // define custom focus method
      mapFeature.onfocus = function () {
        map.querySelector('map-feature').classList.add('customFocus');
      };
      mapFeature.focus();
      return mapFeature.classList.contains('customFocus');
    });
    expect(isFocused).toEqual(true);
  });

  test('Add event handler via HTML', async ({ page }) => {
    const test = await page.$eval('body > gcds-ext-map', (map) => {
      let mapFeature = map.querySelector('.event') as any;
      mapFeature.setAttribute('onfocus', 'test_1()');
      mapFeature._groupEl.focus();
      return mapFeature.classList.contains('test_1');
    });
    expect(test).toEqual(true);
  });

  test('Add event handler via Script', async ({ page }) => {
    const test = await page.$eval('body > gcds-ext-map', (map) => {
      (window as any).test_1();
      let mapFeature = map.querySelector('.event') as any;
      mapFeature._groupEl.focus();
      mapFeature._groupEl.blur();
      return (
        mapFeature.classList.contains('blur_property_test') &&
        mapFeature.classList.contains('blur_addEvtLsn_test')
      );
    });
    expect(test).toEqual(true);
  });
});
