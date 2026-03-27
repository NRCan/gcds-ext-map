const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');

// this is a simple express server to serve test files for gcds-map PMtiles testing because the stencil
// dev server does not support byte range requests needed for PMTiles
const app = express();
const PORT = 30333; // Different port from Stencil dev/test server (3333)

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

app.listen(PORT, () => {
  console.log(`PMTiles test server running on http://localhost:${PORT}`);
  console.log(`Byte range requests enabled for PMTiles files`);
  console.log(`Use this server for PMTiles tests, Stencil dev server for others`);
});
