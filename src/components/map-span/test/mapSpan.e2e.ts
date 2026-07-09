import { test, expect } from '@playwright/test';

test.describe('<map-span> test', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the tile request for 2/1/1 and serve the test data from 1_1.mapml
    // This test data is specifically designed to test the map-span whitespace parsing bug
    // See: https://github.com/Maps4HTML/MapML.js/issues/559#issuecomment-959805896
    await page.route('**/test/data/tiles/osmtile/2/1/1.mapml', async (route) => {
      const testTileContent = `<mapml- xmlns="http://www.w3.org/1999/xhtml">
    <map-head>
        <map-title>ne_10m_admin_0_countries</map-title>
        <map-meta charset="utf-8"/>
        <map-meta content="text/mapml" http-equiv="Content-Type"/>
      <map-meta name="projection" content="OSMTILE"></map-meta>
      <map-meta name="cs" content="pcrs"></map-meta>
    </map-head>
    <map-body>
        <map-feature id="fclass.73" class="fclass">
            <map-geometry>
                <map-polygon>
                    <map-coordinates>
                        -10019154.93269 1538354.08306 -10018754.17139 1538179.92761 -9953778.73157 1518203.74208 -9871068.81875 1482220.46653 -9790805.04014 1478766.01397 -9768484.06551 1498870.65375 -9796003.07532 1547622.63538 -9951944.13091 1647924.2825 -10018754.17139 1569038.46245 
                        <map-span class="noline">-10019154.93269 1569012.97177 -10019154.93269 1538354.08306</map-span>
                    </map-coordinates>
                </map-polygon>
            </map-geometry>
        </map-feature>
    </map-body>
</mapml->`;
      await route.fulfill({
        status: 200,
        contentType: 'text/mapml',
        body: testTileContent
      });
    });
    // in order to use networkidle here, we had to eliminate the tile layers returning 404s, 
    // which seemed to indefinitely delay networkidle state.  To achieve that, we set up the route above,
    // which replaces the requested tile with a tile that is configured to have the (fixed) parsing bug we want to test.
    //https://github.com/Maps4HTML/MapML.js/issues/559#issuecomment-959805896
    await page.goto('/test/map-span/mapSpan.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });

  test('<map-span> hides tile boundaries', async ({ page }) => {
    const total = await page.$eval(
      'body > gcds-ext-map:nth-child(1) > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-extentlayer-container > div > div > div:nth-child(1) > svg > g > g:nth-child(1) > path:nth-child(2)',
      (path) => path.getAttribute('style')
    );

    const featureOutline = await page.$(
      'body > gcds-ext-map:nth-child(1) > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-extentlayer-container > div > div > div:nth-child(1) > svg > g > g:nth-child(1) > path.fclass._2.mapml-feature-outline'
    );

    const hidden = await page.$eval(
      'body > gcds-ext-map:nth-child(1) > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-extentlayer-container > div > div > div:nth-child(1) > svg > g > g:nth-child(1) > path.noline.fclass._2',
      (path) => path.getAttribute('d')
    );
    expect(featureOutline).not.toBe(null);

    const d = await featureOutline.getAttribute('d');
    const spliced = hidden.slice(3, hidden.length);
    //Makes sure that the part that should be hidden is not part of the feature outline
    let index = d.indexOf(spliced);

    expect(total).toEqual('stroke: none;');
    expect(index).toEqual(-1);
  });

  //https://github.com/Maps4HTML/MapML.js/issues/559#issuecomment-959805896
  test('White space parsing for map-coordinates', async ({ page }) => {
    const feature = await page.$eval(
      'body > gcds-ext-map:nth-child(2) > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-extentlayer-container > div > div > div:nth-child(1) > svg > g > g > path.fclass.mapml-feature-outline',
      (path) => path.getAttribute('d')
    );

    expect(feature).toEqual(
      'M0 217L0 217L0 217L2 217L4 218L6 218L6 218L6 216L2 214L0 216L0 216'
    );
  });
});
