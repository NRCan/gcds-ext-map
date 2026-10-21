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

import { Component, Prop, Watch, Element } from '@stencil/core';

@Component({ 
  tag: 'map-meta',
  shadow: false
})
export class MapMeta {
  @Element() el: HTMLElement;

  @Prop({ reflect: true }) name?: string;
  @Prop({ reflect: true }) content?: string;

  @Watch('name')
  nameChanged(newValue: string, oldValue: string) {
    if (oldValue !== newValue) {
      // handle side effects if needed
    }
  }

  @Watch('content')
  contentChanged(newValue: string, oldValue: string) {
    if (oldValue !== newValue) {
      // handle side effects if needed
    }
  }

  // Validate 'cs' content
  set contentValue(val: string | undefined) {
    if (
      this.name === 'cs' &&
      val &&
      !['tcrs', 'tilematrix', 'pcrs', 'gcrs', 'map', 'tile'].includes(val)
    ) {
      return;
    }
    this.content = val;
  }

  connectedCallback() {}
  disconnectedCallback() {}

  render() {
    return null;
  }
}
