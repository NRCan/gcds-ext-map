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
import { Control } from 'leaflet';
import { LocateControl } from 'leaflet.locatecontrol';

export var GeolocationButton = Control.extend({
  options: {
    position: 'bottomright'
  },
  _getLocale: function (map) {
    return map.options.mapEl && map.options.mapEl.locale
      ? map.options.mapEl.locale
      : M.options.locale;
  },
  onAdd: function (map) {
    // customize locate control to focus map after start/stop, so that
    // featureIndexOverlay is correctly displayed
    Control.CustomLocate = LocateControl.extend({
      start: function () {
        LocateControl.prototype.start.call(this);
        map.getContainer().focus();
      },
      stop: function () {
        LocateControl.prototype.stop.call(this);
        map.getContainer().focus();
      }
    });
    let locale = this._getLocale(map);

    this.locateControl = new Control.CustomLocate({
      showPopup: false,
      strings: {
        title: locale.btnLocTrackOff
      },
      position: this.options.position,
      locateOptions: {
        maxZoom: 16
      }
    }).addTo(map);

    var container = this.locateControl._container;
    var button = this.locateControl;
    var observer = new MutationObserver(function (mutations) {
      if (
        container.classList.contains('active') &&
        container.classList.contains('following')
      ) {
        container.firstChild.title = locale.btnLocTrackOn;
        button._marker.bindTooltip(locale.btnMyLocTrackOn, {
          permanent: true
        });
      } else if (container.classList.contains('active')) {
        container.firstChild.title = locale.btnLocTrackLastKnown;
        button._marker.bindTooltip(locale.btnMyLastKnownLocTrackOn);
      } else {
        container.firstChild.title = locale.btnLocTrackOff;
      }
    });
    var observerConfig = { attributes: true, attributeFilter: ['class'] };
    observer.observe(container, observerConfig);

    return container;
  },

  stop: function () {
    return this.locateControl.stop();
  }
});

export var geolocationButton = function (options) {
  return new GeolocationButton(options);
};
