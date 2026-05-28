const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');

// this is a simple express server to serve test files for gcds-map PMtiles testing because the stencil
// dev server does not support byte range requests needed for PMTiles
const app = express();
const PORT = 3333;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve the build directory (gcds-map components)
app.use('/build', express.static(path.join(__dirname, 'www/build')));

// serveStatic enables byte range requests, required for PMTiles
// Serve test directories with byte range support
app.use('/test/map-layer', serveStatic(path.join(__dirname, 'www/test/map-layer')));
app.use('/test/data', serveStatic(path.join(__dirname, 'www/test/data')));

// Serve other test directories (without byte range requirement)
app.use('/test', express.static(path.join(__dirname, 'www/test')));

// Serve all remaining www/ files (HTML pages, build output, etc.)
app.use(express.static(path.join(__dirname, 'www')));

// GeoJSON query response routes - serve JSON files with explicit Content-Type
// headers needed for QueryHandler content-type based response handling
app.get('/data/query/geojsonFeature', (req, res, next) => {
  res.sendFile(
    path.join(__dirname, 'www/test/data/geojson/geojsonFeature.geojson'),
    { headers: { 'Content-Type': 'application/geo+json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonProjectedWithCrs', (req, res, next) => {
  res.sendFile(
    path.join(__dirname, 'www/test/data/geojson/geojsonProjectedWithCrs.json'),
    { headers: { 'Content-Type': 'application/json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonProjectedNoCrs', (req, res, next) => {
  res.sendFile(
    path.join(__dirname, 'www/test/data/geojson/geojsonProjectedNoCrs.json'),
    { headers: { 'Content-Type': 'application/json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonNullGeometry', (req, res, next) => {
  res.sendFile(
    path.join(__dirname, 'www/test/data/geojson/geojsonNullGeometry.json'),
    { headers: { 'Content-Type': 'application/geo+json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonErroneousMediaType', (req, res, next) => {
  res.sendFile(
    path.join(__dirname, 'www/test/data/geojson/geojsonPoint.json'),
    { headers: { 'Content-Type': 'application/geojson' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});

// --- Mock search endpoints for search control tests ---

// Mock search suggestions endpoint (GeoJSON FeatureCollection)
app.get('/search/suggestions', (req, res) => {
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { display_name: 'Ottawa, Ontario, Canada', name: 'Ottawa' },
        geometry: { type: 'Point', coordinates: [-75.6972, 45.4215] },
        bbox: [-75.9, 45.2, -75.4, 45.6]
      },
      {
        type: 'Feature',
        properties: {
          display_name: 'Ottawa River, Canada',
          name: 'Ottawa River'
        },
        geometry: { type: 'Point', coordinates: [-75.5, 45.5] }
      },
      {
        type: 'Feature',
        properties: {
          display_name: 'Gatineau, Quebec, Canada',
          name: 'Gatineau'
        },
        geometry: { type: 'Point', coordinates: [-75.7, 45.48] }
      }
    ]
  });
});

// Mock search results endpoint (GeoJSON FeatureCollection)
app.get('/search/results', (req, res) => {
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          display_name: 'Ottawa, Ontario, Canada',
          name: 'Ottawa'
        },
        geometry: { type: 'Point', coordinates: [-75.6972, 45.4215] },
        bbox: [-75.9, 45.2, -75.4, 45.6]
      }
    ]
  });
});

// Mock geonames suggestions endpoint (returns geonames-format items array)
app.get('/geonames/suggestions', (req, res) => {
  res.json({
    items: [
      {
        id: 'FEVNT',
        name: 'Ottawa',
        latitude: 45.33339,
        longitude: -75.58429,
        bbox: [-76.3631149, 44.9445516, -75.2324963, 45.544859],
        concise: { code: 'CITY' },
        province: { code: '35' }
      },
      {
        id: 'NAABK',
        name: 'Arctic Ocean',
        latitude: 80,
        longitude: -140,
        bbox: [-140.02, 79.98, -139.98, 80.02],
        concise: { code: 'SEA' },
        province: { code: '73' }
      },
      {
        id: 'NAABI',
        name: 'Atlantic Ocean',
        latitude: 43,
        longitude: -63,
        bbox: [-63.02, 42.98, -62.98, 43.02],
        concise: { code: 'SEA' },
        province: { code: '73' }
      }
    ]
  });
});

// Mock geonames search endpoint (returns geonames-format items array)
app.get('/geonames/search', (req, res) => {
  res.json({
    items: [
      {
        id: 'FEVNT',
        name: 'Ottawa',
        latitude: 45.33339,
        longitude: -75.58429,
        bbox: [-76.3631149, 44.9445516, -75.2324963, 45.544859],
        concise: { code: 'CITY' },
        province: { code: '35' }
      }
    ]
  });
});

// Mock second-layer geonames suggestions endpoint (returns different items)
app.get('/geonames2/suggestions', (req, res) => {
  res.json({
    items: [
      {
        id: 'TRNTO',
        name: 'Toronto',
        latitude: 43.65107,
        longitude: -79.347015,
        bbox: [-79.6393, 43.4034, -79.1153, 43.8554],
        concise: { code: 'CITY' },
        province: { code: '35' }
      },
      {
        id: 'MNTRL',
        name: 'Montreal',
        latitude: 45.50884,
        longitude: -73.58781,
        bbox: [-73.9726, 45.4104, -73.4742, 45.7047],
        concise: { code: 'CITY' },
        province: { code: '24' }
      }
    ]
  });
});

// Mock second-layer geonames search endpoint
app.get('/geonames2/search', (req, res) => {
  res.json({
    items: [
      {
        id: 'TRNTO',
        name: 'Toronto',
        latitude: 43.65107,
        longitude: -79.347015,
        bbox: [-79.6393, 43.4034, -79.1153, 43.8554],
        concise: { code: 'CITY' },
        province: { code: '35' }
      }
    ]
  });
});

// Mock Japanese search suggestions endpoint (GeoJSON format)
app.get('/search/ja/suggestions', (req, res) => {
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { display_name: '東京都, 日本', name: '東京' },
        geometry: { type: 'Point', coordinates: [139.6917, 35.6895] },
        bbox: [138.9428, 35.5187, 139.9219, 35.8984]
      },
      {
        type: 'Feature',
        properties: {
          display_name: '東京タワー, 東京都, 日本',
          name: '東京タワー'
        },
        geometry: { type: 'Point', coordinates: [139.7454, 35.6586] }
      },
      {
        type: 'Feature',
        properties: { display_name: '東京駅, 東京都, 日本', name: '東京駅' },
        geometry: { type: 'Point', coordinates: [139.7671, 35.6812] }
      }
    ]
  });
});

// Mock Japanese search results endpoint (GeoJSON format)
app.get('/search/ja/results', (req, res) => {
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { display_name: '東京都, 日本', name: '東京' },
        geometry: { type: 'Point', coordinates: [139.6917, 35.6895] },
        bbox: [138.9428, 35.5187, 139.9219, 35.8984]
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`PMTiles test server running on http://localhost:${PORT}`);
  console.log(`Byte range requests enabled for PMTiles files`);
  console.log(`Use this server for PMTiles tests, Stencil dev server for others`);
});
