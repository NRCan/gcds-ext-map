import { test, expect } from '@playwright/test';

test.describe('map-style and map-link[rel=stylesheet] tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/gcds-ext-map/styleParsing.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  //tests using the 1st map in the page
  test(`Local-content (no src) styles rendered as style/link in same order as \
found, in expected shadow root location`, async ({ page }) => {
    const localContentLayer = page.getByTestId('arizona');
    const ids = await localContentLayer.evaluate((layer: any) => {
      const elementSequence = layer.querySelectorAll(
        'map-link[rel=stylesheet],map-style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await localContentLayer.evaluate((layer: any) => {
      const elementSequence = layer._layer._container.querySelectorAll(
        'link[rel=stylesheet],style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(ids).toEqual(renderedIds);
  });

  test(`Local layer content (no src) map-link[rel=features] remote styles \
rendered as style/link in same order as found, in expected shadow root location`, async ({ page }) => {
    const featuresLink = page.getByTestId('alabama-features');
    const ids = await featuresLink.evaluate((link: any) => {
      const elementSequence = link.shadowRoot.querySelectorAll(
        'map-link[rel=stylesheet],map-style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await featuresLink.evaluate((link: any) => {
      const elementSequence = link._templatedLayer._container.querySelectorAll(
        'link[rel=stylesheet],style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(ids).toEqual(renderedIds);
  });

  // TODO: This test is currently failing because the source query finds 4 elements
  // (parent layer's styles + extent's own styles) but the rendered container only
  // has 2 elements (extent's own styles). In the original MapML, both queries
  // return 2 elements. This suggests a DOM structure difference in how Stencil
  // organizes the layer/extent hierarchy.
  test(`Local style children of map-extent rendered as style/link in same order \
as found, in expected shadow root location`, async ({ page }) => {
    const mapExtent = page.getByTestId('map-ext1');
    const ids = await mapExtent.evaluate((e: any) => {
      const elementSequence = e.querySelectorAll(
        ':scope > map-link[rel=stylesheet],:scope > map-style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await mapExtent.evaluate((e: any) => {
      const elementSequence = e._extentLayer._container.querySelectorAll(
        ':scope > link[rel=stylesheet],:scope > style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(ids).toEqual(renderedIds);
  });
  
  test(`Local content map-link[rel=tile][type=text/mapml] with remote styles \
embedded in text/mapml tiles are rendered in same order as found in tile`, async ({ page }) => {
    // it's a bit tricky to work with tiled mapml vectors because the map-feature
    // is discarded and only the rendered path is kept.  In this case, we're using
    // the same layer twice in the styleParsing.html (vector-tile-test.mapml),
    // which refers to the WGS84 countries' test tile data
    // as a result, we get the same feature rendered whenever we add the layer
    // in this case it is used inline and remotely. The inline countries are
    // first in DOM order, so we'll take the first location of the rendered thing
    // we're looking for (in this test, at least)
    const renderedPath = await page.getByTestId('r0_c0').first();
    const renderedStyleIds = await renderedPath.evaluate((p) => {
      const elementSequence = p
        .closest('.mapml-tile-group.leaflet-tile')
        .querySelectorAll(':scope > link[rel=stylesheet],:scope > style');
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(renderedStyleIds).toEqual('one,two,three');
  });
  
  test(`Remote styles (map-layer src) in the map-head rendered in the same source order\
as children of map-layer._layer._container`, async ({ page }) => {
    const remoteLayer = page.getByTestId('remote');
    const ids = await remoteLayer.evaluate((l: any) => {
      const elementSequence = l.shadowRoot.querySelectorAll(
        ':host > map-style,:host > [rel=stylesheet]'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await remoteLayer.evaluate((l: any) => {
      const elementSequence = l._layer._container.querySelectorAll(
        ':scope > link[rel=stylesheet],:scope > style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(renderedIds).toEqual(ids);
  });
  
  test(`Remote (map-layer src) styles in the remote map-extent should be rendered \
in the same order as in remote source, in the map-extent._extentLayer._container`, async ({ page }) => {
    const remoteLayer = page.getByTestId('remote');
    const ids = await remoteLayer.evaluate((l: any) => {
      const elementSequence = l.shadowRoot.querySelectorAll(
        ':host > map-extent > map-style,:host > map-extent > [rel=stylesheet]'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await remoteLayer.evaluate((l: any) => {
      const e = l.shadowRoot.querySelector('map-extent');
      const elementSequence = e._extentLayer._container.querySelectorAll(
        ':scope > link[rel=stylesheet],:scope > style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(renderedIds).toEqual(ids);
  });
  
  test(`Remote (map-layer src) styles embedded within loaded tiles should be \
rendered in the same order as in the tile, in the tile container`, async ({ page }) => {
    // there's more than one use of vector-tile-test.mapml here, so the test id
    // is not unique. this is the second and last occurence of it though:
    const renderedPath = await page.getByTestId('r0_c0').last();
    const renderedStyleIds = await renderedPath.evaluate((p) => {
      const elementSequence = p
        .closest('.mapml-tile-group.leaflet-tile')
        .querySelectorAll(':scope > link[rel=stylesheet],:scope > style');
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    // see /test/data/tiles/wgs84/0/r0_c0.mapml for original order, it's one,two,three...
    expect(renderedStyleIds).toEqual('one,two,three');
  });
});
