/*
 * This file includes material copied from or derived from MapML.js
 * <https://github.com/Maps4HTML/MapML.js>.
 * Copyright 2015-2024 Canada Centre for Mapping and Earth Observation,
 * Natural Resources Canada, and the MapML.js contributors.
 * Licensed under the W3C Software and Document License
 * <http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document>.
 * SPDX-License-Identifier: W3C-20150513
 *
 * Modified by Natural Resources Canada for @gcds-extensions/map.
 * See the NOTICE file in the root of this distribution for the full notice,
 * which must be retained in all copies and derivative works.
 */
import { Point } from 'leaflet';
import { Util } from '../../Util';

export class LocationInput {
  name: string;
  position?: string;
  axis: string;
  units?: string;
  min?: string;
  max?: string;
  rel?: string;
  layer: any;

  constructor(
    name: string,
    position: string,
    axis: string,
    units: string,
    min: string,
    max: string,
    rel: string,
    layer: any
  ) {
    this.name = name;
    this.position = position;
    this.axis = axis;
    // if unit/cs not present, find it
    if (!units && axis && !['i', 'j'].includes(axis)) {
      this.units = Util.axisToCS(axis).toLowerCase();
    } else {
      this.units = units; // cs
    }
    this.min = min;
    this.max = max;
    this.rel = rel;
    this.layer = layer;
  }

  validateInput(): boolean {
    // name is required
    // axis is required
    if (!this.name || !this.axis) {
      return false;
    }
    // cs/units is only required when the axis is i/j. To differentiate between the units/cs
    if (
      (this.axis === 'i' || this.axis === 'j') &&
      !['map', 'tile'].includes(this.units)
    ) {
      return false;
    }
    // check if axis match the units/cs
    if (this.units) {
      let axisCS = Util.axisToCS(this.axis);
      if (
        typeof axisCS === 'string' &&
        axisCS.toUpperCase() !== this.units.toUpperCase()
      ) {
        return false;
      }
    }
    // position is not required, will default to top-left
    // min max fallbacks, map-meta -> projection
    // rel not required, default is image/extent
    return true;
  }

  _TCRSToPCRS(coords: any, zoom: number): any {
    // TCRS pixel point to Projected CRS point (in meters, presumably)
    const map = this.layer._map;
    const crs = map.options.crs;
    const loc = crs.transformation.untransform(coords, crs.scale(zoom));
    return loc;
  }

  getValue(zoom?: number, bounds?: any): any {
    // units = cs
    //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting|latitude|longitude">
    if (zoom === undefined) zoom = this.layer._map.getZoom();
    if (bounds === undefined) bounds = this.layer._map.getPixelBounds();

    if (this.units === 'pcrs' || this.units === 'gcrs') {
      switch (this.axis) {
        case 'longitude':
        case 'easting':
          if (this.position) {
            if (this.position.match(/.*?-left/i)) {
              return this._TCRSToPCRS(bounds.min, zoom).x;
            } else if (this.position.match(/.*?-right/i)) {
              return this._TCRSToPCRS(bounds.max, zoom).x;
            }
          } else {
            // position is not required, will default to top-left
            return this._TCRSToPCRS(bounds.min, zoom).x;
          }
          break;
        case 'latitude':
        case 'northing':
          if (this.position) {
            if (this.position.match(/top-.*?/i)) {
              return this._TCRSToPCRS(bounds.min, zoom).y;
            } else if (this.position.match(/bottom-.*?/i)) {
              return this._TCRSToPCRS(bounds.max, zoom).y;
            }
          } else {
            // position is not required, will default to top-left
            return this._TCRSToPCRS(bounds.min, zoom).y;
          }
          break;
      }
    } else if (this.units === 'tilematrix') {
      // Value is retrieved from the createTile method of TemplatedTileLayer, on move end.
      // Different values for each tile when filling in the map tiles on the map.
      // Currently storing all x,y,z within one object,
      // TODO: change return value as needed based on usage by map-input
      // https://github.com/Leaflet/Leaflet/blob/6994baf25f267db1c8b720c28a61e0700d0aa0e8/src/layer/tile/GridLayer.js#L652
      const center = this.layer._map.getCenter();
      const templatedTileLayer = this.layer._extentLayer._templates[0].layer;
      const pixelBounds = templatedTileLayer._getTiledPixelBounds(center);
      const tileRange = templatedTileLayer._pxBoundsToTileRange(pixelBounds);
      const obj: any[] = [];
      for (let j = tileRange.min.y; j <= tileRange.max.y; j++) {
        for (let i = tileRange.min.x; i <= tileRange.max.x; i++) {
          const coords = new Point(i, j);
          (coords as any).z = templatedTileLayer._tileZoom;
          obj.push(coords);
        }
      }
      return obj;
    } else if (this.units === 'tile' || this.units === 'map') {
      // used for query handler on map enter or click.
      // mapi, tilei, mapj, tilej used for query handling, value is derived from the mouse click event
      // or center of the map when used with keyboard.
    }
    return;
  }
}
