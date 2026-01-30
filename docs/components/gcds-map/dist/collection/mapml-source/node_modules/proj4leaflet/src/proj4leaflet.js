import {
  CRS,
  Class,
  Util,
  Transformation,
  Point as LPoint,
  LatLng
} from 'leaflet';

import proj4 from 'proj4';

const Proj = {};

// Check if an object is a Proj4 projection object
Proj._isProj4Obj = function (a) {
  return typeof a.inverse !== 'undefined' && typeof a.forward !== 'undefined';
};

// Define the Proj.Projection class
Proj.Projection = Class.extend({
  initialize: function (code, def, bounds) {
    const isP4 = Proj._isProj4Obj(code);
    this._proj = isP4 ? code : this._projFromCodeDef(code, def);
    this.bounds = isP4 ? def : bounds;
  },

  project: function (latlng) {
    const point = this._proj.forward([latlng.lng, latlng.lat]);
    return new LPoint(point[0], point[1]);
  },

  unproject: function (point, unbounded) {
    const point2 = this._proj.inverse([point.x, point.y]);
    // this attempts to adapt new proj4 output to old Leaflet code that
    // requires 0 over NaN for out-of-bounds coordinates (with no corresponding
    // earth location, that is).
    return new LatLng(point2[1] || 0, point2[0] || 0, unbounded);
  },

  _projFromCodeDef: function (code, def) {
    if (def) {
      proj4.defs(code, def);
    } else if (proj4.defs[code] === undefined) {
      const urn = code.split(':');
      if (urn.length > 3) {
        code = `${urn[urn.length - 3]}:${urn[urn.length - 1]}`;
      }
      if (proj4.defs[code] === undefined) {
        throw new Error(`No projection definition for code ${code}`);
      }
    }

    return proj4(code);
  }
});

Proj.CRS = Class.extend({
  includes: CRS,

  options: {
    transformation: new Transformation(1, 0, -1, 0)
  },

  initialize: function (a, b, c) {
    let code;
    let proj;
    let def;
    let options;

    if (Proj._isProj4Obj(a)) {
      proj = a;
      code = proj.srsCode;
      options = b || {};

      this.projection = new Proj.Projection(proj, options.bounds);
    } else {
      code = a;
      def = b;
      options = c || {};
      this.projection = new Proj.Projection(code, def, options.bounds);
    }

    Util.setOptions(this, options);
    this.code = code;
    this.transformation = this.options.transformation;

    if (this.options.origin) {
      this.transformation = new Transformation(
        1,
        -this.options.origin[0],
        -1,
        this.options.origin[1]
      );
    }

    if (this.options.scales) {
      this._scales = this.options.scales;
    } else if (this.options.resolutions) {
      this._scales = [];
      for (let i = this.options.resolutions.length - 1; i >= 0; i--) {
        if (this.options.resolutions[i]) {
          this._scales[i] = 1 / this.options.resolutions[i];
        }
      }
    }

    this.infinite = !this.options.bounds;
  },

  scale: function (zoom) {
    const iZoom = Math.floor(zoom);
    if (zoom === iZoom) {
      return this._scales[zoom];
    } else {
      // Non-integer zoom, interpolate
      const baseScale = this._scales[iZoom];
      const nextScale = this._scales[iZoom + 1];
      const scaleDiff = nextScale - baseScale;
      const zDiff = zoom - iZoom;
      return baseScale + scaleDiff * zDiff;
    }
  },

  zoom: function (scale) {
    // Find closest number in this._scales, down
    const downScale = this._closestElement(this._scales, scale);
    const downZoom = this._scales.indexOf(downScale);
    if (scale === downScale) {
      return downZoom;
    }
    if (downScale === undefined) {
      return -Infinity;
    }
    // Interpolate
    const nextZoom = downZoom + 1;
    const nextScale = this._scales[nextZoom];
    if (nextScale === undefined) {
      return Infinity;
    }
    const scaleDiff = nextScale - downScale;
    return (scale - downScale) / scaleDiff + downZoom;
  },

  distance: CRS.Earth.distance,
  R: CRS.Earth.R,

  _closestElement: function (array, element) {
    let low;
    for (let i = array.length; i--; ) {
      if (array[i] <= element && (low === undefined || low < array[i])) {
        low = array[i];
      }
    }
    return low;
  }
});

export default Proj;
