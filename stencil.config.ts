import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

/**
 * The W3C Software and Document License requires its notice to be reproduced
 * in a location viewable to users of a redistributed or derivative work.
 * Prepend a legal-comment banner to every entry chunk so the attribution
 * survives into the shipped bundles, not just the NOTICE file in the package.
 */
const LICENSE_BANNER = `/*!
 * @gcds-extensions/map -- the <gcds-ext-map> component suite.
 * Copyright (c) 2026 Natural Resources Canada.
 * @license MIT AND W3C-20150513
 *
 * Includes material copied from or derived from MapML.js
 * (https://github.com/Maps4HTML/MapML.js), copyright 2015-2024 Canada Centre
 * for Mapping and Earth Observation, Natural Resources Canada, and the
 * MapML.js contributors, licensed under the W3C Software and Document License
 * (http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document),
 * and modified by Natural Resources Canada.
 *
 * Bundles Leaflet (BSD-2-Clause), proj4 (MIT), Proj4Leaflet (BSD-2-Clause),
 * Leaflet.Locate (MIT), protomaps-leaflet and PMTiles (BSD-3-Clause), and
 * media-query-parser/-solver (MIT).
 *
 * Full notices, which must be retained on redistribution:
 * https://github.com/gcds-extensions/map/blob/main/NOTICE
 */
`;

const licenseBanner = () => ({
  name: 'gcds-license-banner',
  renderChunk(code: string, chunk: { isEntry?: boolean }) {
    if (!chunk.isEntry || code.startsWith('/*!')) {
      return null;
    }
    return { code: LICENSE_BANNER + code, map: null };
  }
});

export const config: Config = {
  namespace: 'gcds-ext-map',
  taskQueue: 'async',
  globalScript: 'src/global/mapml-globals.js',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        {
          src: 'components/gcds-ext-map/assets',
          dest: 'assets',
          warn: true
        },
        // Copy test HTML and mapml files to build output so they're accessible via dev server
        {
          src: 'components/gcds-ext-map/test/*.{html,mapml,css,js}',
          dest: 'test/gcds-ext-map'
        },
        {
          src: 'components/map-layer/test/*.{html,mapml,css,js,pmtiles}',
          dest: 'test/map-layer'
        },
        {
          src: 'components/map-layer/test/events/*.{html,mapml}',
          dest: 'test/map-layer/events'
        },
        {
          src: 'components/map-extent/test/*.{html,mapml,css}',
          dest: 'test/map-extent'
        },
        {
          src: 'components/map-feature/test/*.{html,mapml,css}',
          dest: 'test/map-feature'
        },
        {
          src: 'components/map-tile/test/*.{html,mapml,css}',
          dest: 'test/map-tile'
        },
        {
          src: 'components/map-style/test/*.{html,mapml,css}',
          dest: 'test/map-style'
        },
        {
          src: 'components/map-link/test/*.{html,mapml,css,js}',
          dest: 'test/map-link'
        },
        {
          src: 'components/map-input/test/*.{html,mapml,css}',
          dest: 'test/map-input'
        },
        {
          src: 'components/map-select/test/*.{html,mapml,css}',
          dest: 'test/map-select'
        },
        {
          src: 'components/map-a/test/*.{html,mapml,css}',
          dest: 'test/map-a'
        },
        {
          src: 'components/map-caption/test/*.{html,mapml,css}',
          dest: 'test/map-caption'
        },
        {
          src: 'components/map-span/test/*.{html,mapml,css}',
          dest: 'test/map-span'
        },
        {
          src: 'components/map-meta/test/*.{html,mapml,css}',
          dest: 'test/map-meta'
        },
        // Copy shared test data directory recursively
        {
          src: 'components/test/data',
          dest: 'test/data'
        },
        // Copy Leaflet for test imports
        {
          src: '../node_modules/leaflet/dist/leaflet-src.esm.js',
          dest: 'leaflet-src.esm.js'
        },
        // Copy GCDS fonts to build output
        {
          src: '../node_modules/@gcds-core/fonts/fonts',
          dest: 'fonts'
        }
      ],
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {
          src: '../node_modules/@gcds-core/components/dist/gcds',
          dest: 'gcds',
        },
        {
          src: 'components/gcds-ext-map/assets',
          dest: 'build/assets',
          warn: true
        },
        // Copy test HTML and mapml files to build output so they're accessible via dev server
        {
          src: 'components/gcds-ext-map/test/*.{html,mapml,css,js}',
          dest: 'test/gcds-ext-map'
        },
        {
          src: 'components/map-layer/test/*.{html,mapml,css,js,pmtiles}',
          dest: 'test/map-layer'
        },
        {
          src: 'components/map-layer/test/events/*.{html,mapml}',
          dest: 'test/map-layer/events'
        },
        {
          src: 'components/map-extent/test/*.{html,mapml,css}',
          dest: 'test/map-extent'
        },
        {
          src: 'components/map-feature/test/*.{html,mapml,css}',
          dest: 'test/map-feature'
        },
        {
          src: 'components/map-tile/test/*.{html,mapml,css}',
          dest: 'test/map-tile'
        },
        {
          src: 'components/map-style/test/*.{html,mapml,css}',
          dest: 'test/map-style'
        },
        {
          src: 'components/map-link/test/*.{html,mapml,css,js}',
          dest: 'test/map-link'
        },
        {
          src: 'components/map-input/test/*.{html,mapml,css}',
          dest: 'test/map-input'
        },
        {
          src: 'components/map-select/test/*.{html,mapml,css}',
          dest: 'test/map-select'
        },
        {
          src: 'components/map-a/test/*.{html,mapml,css}',
          dest: 'test/map-a'
        },
        {
          src: 'components/map-caption/test/*.{html,mapml,css}',
          dest: 'test/map-caption'
        },
        {
          src: 'components/map-span/test/*.{html,mapml,css}',
          dest: 'test/map-span'
        },
        {
          src: 'components/map-meta/test/*.{html,mapml,css}',
          dest: 'test/map-meta'
        },
        // Copy shared test data directory recursively
        {
          src: 'components/test/data',
          dest: 'test/data'
        },
        // Copy Leaflet for test imports
        {
          src: '../node_modules/leaflet/dist/leaflet-src.esm.js',
          dest: 'leaflet-src.esm.js'
        },
        // Copy GCDS fonts to build output
        {
          src: '../node_modules/@gcds-core/fonts/fonts',
          dest: 'fonts'
        },
        // empty.html used by tests that need page.setContent() with server origin
        {
          src: 'empty.html',
          dest: 'empty.html'
        }
      ],
    },
  ],
  extras: {
    enableImportInjection: true,
    experimentalSlotFixes: true,
  },
  testing: {
    browserHeadless: 'shell',
  },
  rollupPlugins: {
    after: [nodePolyfills(), licenseBanner()],
  },
};
