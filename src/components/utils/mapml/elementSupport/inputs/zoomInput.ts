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
export class ZoomInput {
  name: string;
  min: string;
  max: string;
  value: number;
  step: string;
  layer: any;

  constructor(name: string, min: string, max: string, value: number, step: string, layer: any) {
    this.name = name;
    this.min = min;
    this.max = max;
    this.value = value;
    this.step = step;
    this.layer = layer;
  }

  validateInput(): boolean {
    // name is required
    if (!this.name) {
      return false;
    }
    // min and max can not be present
    // fallback would be layer's meta, -> projection min, max
    // don't need value, map-meta max value, -> fallback is max zoom of projection
    // don't need step, defaults to 1
    return true;
  }

  getValue(): number {
    return this.layer._map.options.mapEl.zoom;
  }
}
