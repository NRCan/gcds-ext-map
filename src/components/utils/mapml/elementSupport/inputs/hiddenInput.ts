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
export class HiddenInput {
  name: string;
  value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }

  validateInput(): boolean {
    // name is required
    // value is required
    if (!this.name || !this.value) {
      return false;
    }
    return true;
  }

  getValue(): string {
    return this.value;
  }
}
