import { l as leafletSrcExports, U as Util, M as MapFeatureLayer, p as proxyCustomElement, H } from './index.js';
import { M as MapTileLayer } from './p-DKgl40ry.js';
import { r as renderStyles } from './p-EYVT9Efh.js';

var MapLayer$1 = leafletSrcExports.LayerGroup.extend({
  options: {
    zIndex: 0,
    opacity: '1.0'
  },
  // initialize is executed before the layer is added to a map
  initialize: function (href, layerEl, options) {
    // in the custom element, the attribute is actually 'src'
    // the _href version is the URL received from map-layer@src
    leafletSrcExports.LayerGroup.prototype.initialize.call(this, null, options);
    if (href) {
      this._href = href;
    }
    this._layerEl = layerEl;
    this._content = layerEl.src ? layerEl.shadowRoot : layerEl;
    leafletSrcExports.setOptions(this, options);
    this._container = leafletSrcExports.DomUtil.create('div', 'leaflet-layer');
    this.changeOpacity(this.options.opacity);
    leafletSrcExports.DomUtil.addClass(this._container, 'mapml-layer');

    // hit the service to determine what its extent might be
    // OR use the extent of the content provided

    this._initialize(this._content);
  },
  getContainer: function () {
    return this._container;
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();

    return this;
  },
  getHref: function () {
    return this._href ?? '';
  },
  _updateZIndex: function () {
    if (
      this._container &&
      this.options.zIndex !== undefined &&
      this.options.zIndex !== null
    ) {
      this._container.style.zIndex = this.options.zIndex;
    }
  },
  changeOpacity: function (opacity) {
    this._container.style.opacity = opacity;
    this._layerEl._opacity = opacity;
    if (this._layerEl._opacitySlider)
      this._layerEl._opacitySlider.value = opacity;
  },
  titleIsReadOnly() {
    return !!this._titleIsReadOnly;
  },
  setName(newName) {
    // a layer's accessible name is set by the <map-title>, if present
    // if it's not available the <map-layer label="accessible-name"> attribute
    // can be used
    if (!this.titleIsReadOnly()) {
      this._title = newName;
      this._layerEl._layerControlHTML.querySelector(
        '.mapml-layer-item-name'
      ).innerHTML = newName;
    }
  },
  getName() {
    return this._title;
  },

  onAdd: function (map) {
    this.getPane().appendChild(this._container);
    leafletSrcExports.LayerGroup.prototype.onAdd.call(this, map);

    this.setZIndex(this.options.zIndex);
    map.on('popupopen', this._attachSkipButtons, this);
  },

  _calculateBounds: function () {
    delete this.bounds;
    delete this.zoomBounds;
    let bnds, zoomBounds;
    let layerTypes = ['_staticTileLayer', '_mapmlvectors', '_extentLayer'];
    bnds =
      this._layerEl.src &&
      this._layerEl.shadowRoot.querySelector(
        ':host > map-meta[name=extent][content]'
      )
        ? Util.getBoundsFromMeta(this._layerEl.shadowRoot)
        : this._layerEl.querySelector(':scope > map-meta[name=extent][content]')
        ? Util.getBoundsFromMeta(this._layerEl)
        : undefined;
    zoomBounds =
      this._layerEl.src &&
      this._layerEl.shadowRoot.querySelector(
        ':host > map-meta[name=zoom][content]'
      )
        ? Util.getZoomBoundsFromMeta(this._layerEl.shadowRoot)
        : this._layerEl.querySelector(':scope > map-meta[name=zoom][content]')
        ? Util.getZoomBoundsFromMeta(this._layerEl)
        : undefined;
    const mapExtents = this._layerEl.src
      ? this._layerEl.shadowRoot.querySelectorAll('map-extent')
      : this._layerEl.querySelectorAll('map-extent');
    layerTypes.forEach((type) => {
      let zoomMax, zoomMin, minNativeZoom, maxNativeZoom;
      if (zoomBounds) {
        zoomMax = zoomBounds.maxZoom;
        zoomMin = zoomBounds.minZoom;
        maxNativeZoom = zoomBounds.maxNativeZoom
          ? zoomBounds.maxNativeZoom
          : -Infinity;
        minNativeZoom = zoomBounds.minNativeZoom
          ? zoomBounds.minNativeZoom
          : Infinity;
      }
      if (type === '_extentLayer' && mapExtents.length) {
        for (let i = 0; i < mapExtents.length; i++) {
          if (mapExtents[i]._extentLayer?.bounds) {
            let mapExtentLayer = mapExtents[i]._extentLayer;
            if (!bnds) {
              bnds = leafletSrcExports.bounds(
                mapExtentLayer.bounds.min,
                mapExtentLayer.bounds.max
              );
            } else {
              bnds.extend(mapExtentLayer.bounds);
            }
            if (mapExtentLayer.zoomBounds) {
              if (!zoomBounds) {
                zoomBounds = mapExtentLayer.zoomBounds;
              } else {
                // Extend layer zoombounds
                zoomMax = Math.max(zoomMax, mapExtentLayer.zoomBounds.maxZoom);
                zoomMin = Math.min(zoomMin, mapExtentLayer.zoomBounds.minZoom);
                maxNativeZoom = Math.max(
                  maxNativeZoom,
                  mapExtentLayer.zoomBounds.maxNativeZoom
                );
                minNativeZoom = Math.min(
                  minNativeZoom,
                  mapExtentLayer.zoomBounds.minNativeZoom
                );
                zoomBounds.minZoom = zoomMin;
                zoomBounds.maxZoom = zoomMax;
                zoomBounds.minNativeZoom = minNativeZoom;
                zoomBounds.maxNativeZoom = maxNativeZoom;
              }
            }
          }
        }
      } else if (type === '_mapmlvectors') {
        // Iterate through individual MapFeatureLayer instances in the LayerGroup
        this.eachLayer(function (layer) {
          // Check if this is a MapFeatureLayer
          if (layer instanceof MapFeatureLayer && layer.layerBounds) {
            if (!bnds) {
              bnds = layer.layerBounds;
            } else {
              bnds.extend(layer.layerBounds);
            }
          }
          if (layer instanceof MapFeatureLayer && layer.zoomBounds) {
            if (!zoomBounds) {
              zoomBounds = layer.zoomBounds;
            } else {
              // Extend layer zoombounds
              zoomMax = Math.max(zoomMax, layer.zoomBounds.maxZoom);
              zoomMin = Math.min(zoomMin, layer.zoomBounds.minZoom);
              maxNativeZoom = Math.max(
                maxNativeZoom,
                layer.zoomBounds.maxNativeZoom
              );
              minNativeZoom = Math.min(
                minNativeZoom,
                layer.zoomBounds.minNativeZoom
              );
              zoomBounds.minZoom = zoomMin;
              zoomBounds.maxZoom = zoomMax;
              zoomBounds.minNativeZoom = minNativeZoom;
              zoomBounds.maxNativeZoom = maxNativeZoom;
            }
          }
        });
      } else {
        // inline tiles
        this.eachLayer((layer) => {
          if (layer instanceof MapTileLayer) {
            if (layer.layerBounds) {
              if (!bnds) {
                bnds = layer.layerBounds;
              } else {
                bnds.extend(layer.layerBounds);
              }
            }

            if (layer.zoomBounds) {
              // Extend zoomBounds with layer zoomBounds
              zoomMax = Math.max(zoomMax, layer.zoomBounds.maxZoom);
              zoomMin = Math.min(zoomMin, layer.zoomBounds.minZoom);
              maxNativeZoom = Math.max(
                maxNativeZoom,
                layer.zoomBounds.maxNativeZoom
              );
              minNativeZoom = Math.min(
                minNativeZoom,
                layer.zoomBounds.minNativeZoom
              );
              zoomBounds.minZoom = zoomMin;
              zoomBounds.maxZoom = zoomMax;
              zoomBounds.minNativeZoom = minNativeZoom;
              zoomBounds.maxNativeZoom = maxNativeZoom;
            }
          }
        });
      }
    });
    if (bnds) {
      this.bounds = bnds;
    } else {
      let projectionBounds = M[this.options.projection].options.bounds;
      this.bounds = leafletSrcExports.bounds(projectionBounds.min, projectionBounds.max);
    }
    // we could get here and zoomBounds might still not be defined (empty layer)
    if (!zoomBounds) zoomBounds = {};
    if (!zoomBounds.minZoom) {
      zoomBounds.minZoom = 0;
    }
    if (!zoomBounds.maxZoom) {
      zoomBounds.maxZoom =
        M[this.options.projection].options.resolutions.length - 1;
    }
    if (zoomBounds.minNativeZoom === Infinity) {
      zoomBounds.minNativeZoom = zoomBounds.minZoom;
    }
    if (zoomBounds.maxNativeZoom === -Infinity) {
      zoomBounds.maxNativeZoom = zoomBounds.maxZoom;
    }
    this.zoomBounds = zoomBounds;
  },

  onRemove: function (map) {
    leafletSrcExports.LayerGroup.prototype.onRemove.call(this, map);
    leafletSrcExports.DomUtil.remove(this._container);
    map.off('popupopen', this._attachSkipButtons);
  },
  getAttribution: function () {
    return this.options.attribution;
  },
  getBase: function () {
    return new URL(
      this._content.querySelector('map-base')
        ? this._content.querySelector('map-base').getAttribute('href')
        : this._content.nodeName === 'MAP-LAYER' ||
          this._content.nodeName === 'LAYER-'
        ? this._content.baseURI
        : this._href,
      this._href
    ).href;
  },
  renderStyles,
  _initialize: function () {
    var layer = this;
    layer.getBase();
      var mapml = this._content;
    parseLicenseAndLegend();
    setLayerTitle();
    // update controls if needed based on mapml-viewer controls/controlslist attribute
    if (layer._layerEl.parentElement) {
      // if layer does not have a parent Element, do not need to set Controls
      layer._layerEl.parentElement._toggleControls();
    }
    // local functions
    function setLayerTitle() {
      if (mapml.querySelector('map-title')) {
        layer._title = mapml.querySelector('map-title').textContent.trim();
        layer._titleIsReadOnly = true;
      } else if (layer._layerEl && layer._layerEl.hasAttribute('label')) {
        layer._title = layer._layerEl.getAttribute('label').trim();
      }
    }
    function parseLicenseAndLegend() {
      var licenseLink = mapml.querySelector('map-link[rel=license]'),
        licenseTitle,
        licenseUrl,
        attText;
      if (licenseLink) {
        licenseTitle = licenseLink.getAttribute('title');
        licenseUrl = licenseLink.getAttribute('href');
        attText =
          '<a href="' +
          licenseUrl +
          '" title="' +
          licenseTitle +
          '">' +
          licenseTitle +
          '</a>';
      }
      leafletSrcExports.setOptions(layer, { attribution: attText });
      var legendLink = mapml.querySelector('map-link[rel=legend]');
      if (legendLink) {
        layer._legendUrl = legendLink.getAttribute('href');
      }
      if (layer._map) {
        // if the layer is checked in the layer control, force the addition
        // of the attribution just received
        if (layer._map.hasLayer(layer)) {
          layer._map.attributionControl.addAttribution(layer.getAttribution());
        }
      }
    }
  },
  getQueryTemplates: function (location, zoom) {
    const queryLinks = this._layerEl.querySelectorAll(
      'map-extent[checked] map-link[rel=query]'
    ).length
      ? this._layerEl.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        )
      : this._layerEl.shadowRoot.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        ).length
      ? this._layerEl.shadowRoot.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        )
      : null;
    if (queryLinks) {
      var templates = [];
      for (let i = 0; i < queryLinks.length; i++) {
        const minZoom = queryLinks[i].extent.zoom.minZoom,
          maxZoom = queryLinks[i].extent.zoom.maxZoom,
          withinZoomBounds = (z) => {
            return minZoom <= z && z <= maxZoom;
          },
          bounds = queryLinks[i].getBounds();

        if (bounds.contains(location) && withinZoomBounds(zoom)) {
          templates.push(queryLinks[i]._templateVars);
        }
      }
      return templates;
    }
  },
  _attachSkipButtons: function (e) {
    let popup = e.popup,
      map = e.target,
      layer,
      group,
      content = popup._container.getElementsByClassName(
        'mapml-popup-content'
      )[0];

    popup._container.setAttribute('role', 'dialog');
    content.setAttribute('tabindex', '-1');
    // https://github.com/Maps4HTML/MapML.js/pull/467#issuecomment-844307818
    content.setAttribute('role', 'document');
    popup._count = 0; // used for feature pagination

    if (popup._source._eventParents) {
      // check if the popup is for a feature or query
      layer =
        popup._source._eventParents[
          Object.keys(popup._source._eventParents)[0]
        ]; // get first parent of feature, there should only be one
      group = popup._source.group;
      // if the popup is for a static / templated feature, the "zoom to here" link can be attached once the popup opens
      attachZoomLink.call(popup);
    } else {
      // getting access to the first map-extent to get access to _extentLayer to use it's (possibly) generic _previousFeature + _nextFeature methods.
      const mapExtent =
        popup._source._layerEl.querySelector('map-extent') ||
        popup._source._layerEl.shadowRoot.querySelector('map-extent');
      layer = mapExtent._extentLayer;
      // if the popup is for a query, the "zoom to here" link should be re-attached every time new pagination features are displayed
      map.on('attachZoomLink', attachZoomLink, popup);
    }

    if (popup._container.querySelector('nav[class="mapml-focus-buttons"]')) {
      leafletSrcExports.DomUtil.remove(
        popup._container.querySelector('nav[class="mapml-focus-buttons"]')
      );
      leafletSrcExports.DomUtil.remove(popup._container.querySelector('hr'));
    }
    //add when popopen event happens instead
    let div = leafletSrcExports.DomUtil.create('nav', 'mapml-focus-buttons');
    // creates |< button, focuses map
    let mapFocusButton = leafletSrcExports.DomUtil.create('button', 'mapml-popup-button', div);
    mapFocusButton.type = 'button';
    mapFocusButton.title = map.options.mapEl.locale.kbdFocusMap;
    mapFocusButton.innerHTML = "<span aria-hidden='true'>|&#10094;</span>";
    leafletSrcExports.DomEvent.on(
      mapFocusButton,
      'click',
      (e) => {
        leafletSrcExports.DomEvent.stop(e);
        map.featureIndex._sortIndex();
        map.closePopup();
        map._container.focus();
      },
      popup
    );

    // creates < button, focuses previous feature, if none exists focuses the current feature
    let previousButton = leafletSrcExports.DomUtil.create('button', 'mapml-popup-button', div);
    previousButton.type = 'button';
    previousButton.title = map.options.mapEl.locale.kbdPrevFeature;
    previousButton.innerHTML = "<span aria-hidden='true'>&#10094;</span>";
    leafletSrcExports.DomEvent.on(previousButton, 'click', layer._previousFeature, popup);

    // static feature counter that 1/1
    let featureCount = leafletSrcExports.DomUtil.create('p', 'mapml-feature-count', div),
      totalFeatures = this._totalFeatureCount ? this._totalFeatureCount : 1;
    featureCount.innerText = popup._count + 1 + '/' + totalFeatures;

    // creates > button, focuses next feature, if none exists focuses the current feature
    let nextButton = leafletSrcExports.DomUtil.create('button', 'mapml-popup-button', div);
    nextButton.type = 'button';
    nextButton.title = map.options.mapEl.locale.kbdNextFeature;
    nextButton.innerHTML = "<span aria-hidden='true'>&#10095;</span>";
    leafletSrcExports.DomEvent.on(nextButton, 'click', layer._nextFeature, popup);

    // creates >| button, focuses map controls
    let controlFocusButton = leafletSrcExports.DomUtil.create(
      'button',
      'mapml-popup-button',
      div
    );
    controlFocusButton.type = 'button';
    controlFocusButton.title = map.options.mapEl.locale.kbdFocusControls;
    controlFocusButton.innerHTML = "<span aria-hidden='true'>&#10095;|</span>";
    leafletSrcExports.DomEvent.on(
      controlFocusButton,
      'click',
      (e) => {
        map.featureIndex._sortIndex();
        map.featureIndex.currentIndex =
          map.featureIndex.inBoundFeatures.length - 1;
        map.featureIndex.inBoundFeatures[0]?.path.setAttribute('tabindex', -1);
        map.featureIndex.inBoundFeatures[
          map.featureIndex.currentIndex
        ]?.path.setAttribute('tabindex', 0);
        leafletSrcExports.DomEvent.stop(e);
        map.closePopup();
        map._controlContainer.querySelector('A:not([hidden])').focus();
      },
      popup
    );

    let divider = leafletSrcExports.DomUtil.create('hr', 'mapml-popup-divider');

    popup._navigationBar = div;
    popup._content.parentElement.parentElement.appendChild(divider);
    popup._content.parentElement.parentElement.appendChild(div);

    content.focus();

    if (group && !M.options.featureIndexOverlayOption) {
      // e.target = this._map
      // Looks for keydown, more specifically tab and shift tab
      group.setAttribute('aria-expanded', 'true');
      map.on('keydown', focusFeature);
    } else {
      map.on('keydown', focusMap);
    }
    // When popup is open, what gets focused with tab needs to be done using JS as the DOM order is not in an accessibility friendly manner
    function focusFeature(focusEvent) {
      let path =
        focusEvent.originalEvent.path ||
        focusEvent.originalEvent.composedPath();
      let isTab = focusEvent.originalEvent.keyCode === 9,
        shiftPressed = focusEvent.originalEvent.shiftKey;
      if (
        (path[0].classList.contains('leaflet-popup-close-button') &&
          isTab &&
          !shiftPressed) ||
        focusEvent.originalEvent.keyCode === 27 ||
        (path[0].classList.contains('leaflet-popup-close-button') &&
          focusEvent.originalEvent.keyCode === 13)
      ) {
        setTimeout(() => {
          map.closePopup(popup);
          group.focus();
          leafletSrcExports.DomEvent.stop(focusEvent);
        }, 0);
      } else if (
        path[0].classList.contains('mapml-popup-content') &&
        isTab &&
        shiftPressed
      ) {
        setTimeout(() => {
          //timeout needed so focus of the feature is done even after the keypressup event occurs
          map.closePopup(popup);
          group.focus();
          leafletSrcExports.DomEvent.stop(focusEvent);
        }, 0);
      } else if (
        path[0] === popup._content.querySelector('a') &&
        isTab &&
        shiftPressed
      ) {
        setTimeout(() => {
          map.closePopup(popup);
          group.focus();
          leafletSrcExports.DomEvent.stop(focusEvent);
        }, 0);
      }
    }

    function focusMap(focusEvent) {
      let path =
        focusEvent.originalEvent.path ||
        focusEvent.originalEvent.composedPath();
      let isTab = focusEvent.originalEvent.keyCode === 9,
        shiftPressed = focusEvent.originalEvent.shiftKey;

      if (
        (focusEvent.originalEvent.keyCode === 13 &&
          path[0].classList.contains('leaflet-popup-close-button')) ||
        focusEvent.originalEvent.keyCode === 27
      ) {
        leafletSrcExports.DomEvent.stopPropagation(focusEvent);
        map.closePopup(popup);
        map._container.focus();
        if (focusEvent.originalEvent.keyCode !== 27) map._popupClosed = true;
      } else if (
        isTab &&
        path[0].classList.contains('leaflet-popup-close-button')
      ) {
        map.closePopup(popup);
      } else if (
        path[0].classList.contains('mapml-popup-content') &&
        isTab &&
        shiftPressed
      ) {
        map.closePopup(popup);
        setTimeout(() => {
          //timeout needed so focus of the feature is done even after the keypressup event occurs
          leafletSrcExports.DomEvent.stop(focusEvent);
          map._container.focus();
        }, 0);
      } else if (
        path[0] === popup._content.querySelector('a') &&
        isTab &&
        shiftPressed
      ) {
        map.closePopup(popup);
        setTimeout(() => {
          leafletSrcExports.DomEvent.stop(focusEvent);
          map.getContainer.focus();
        }, 0);
      }
    }

    function attachZoomLink(e) {
      // this === popup
      let popupWrapper = this._wrapper,
        featureEl = e ? e.currFeature : this._source._groupLayer._featureEl;
      if (popupWrapper.querySelector('a.mapml-zoom-link')) {
        popupWrapper.querySelector('a.mapml-zoom-link').remove();
      }

      // return early if feature doesn't have map-geometry
      if (!featureEl.querySelector('map-geometry')) return;

      // calculate zoom parameters
      let tL = featureEl.extent.topLeft.gcrs,
        bR = featureEl.extent.bottomRight.gcrs,
        center = leafletSrcExports.latLngBounds(
          leafletSrcExports.latLng(tL.horizontal, tL.vertical),
          leafletSrcExports.latLng(bR.horizontal, bR.vertical)
        ).getCenter(true);

      // construct zoom link
      let zoomLink = document.createElement('a');
      zoomLink.href = `#${featureEl.getZoomToZoom()},${center.lng},${
        center.lat
      }`;
      zoomLink.innerHTML = `${map.options.mapEl.locale.popupZoom}`;
      zoomLink.className = 'mapml-zoom-link';

      // handle zoom link interactions
      zoomLink.onclick = zoomLink.onkeydown = function (e) {
        if (!(e instanceof MouseEvent) && e.keyCode !== 13) return;
        e.preventDefault();
        featureEl.zoomTo();
        map.closePopup();
        map.getContainer().focus();
      };

      // we found that the popupopen event is fired as many times as there
      // are layers on the map (<map-layer> elements / MapLayers that is).
      // In each case the target layer is always this layer, so we can't
      // detect and conditionally add the zoomLink if the target is not this.
      // so, like Ahmad, we are taking a 'delete everyting each time'
      // approach (see _attachSkipButtons for this approach taken with
      // feature navigation buttons); obviously he dealt with this leaflet bug
      // this way some time ago, and we can't figure out how to get around it
      // apart from this slightly non-optimal method. Revisit sometime!
      let link = popupWrapper.querySelector('.mapml-zoom-link');
      if (link) link.remove();

      // attach link to popup
      popupWrapper.insertBefore(
        zoomLink,
        popupWrapper.querySelector('hr.mapml-popup-divider')
      );
    }

    // if popup closes then the focusFeature handler can be removed
    map.on('popupclose', removeHandlers);
    function removeHandlers(removeEvent) {
      if (removeEvent.popup === popup) {
        map.off('keydown', focusFeature);
        map.off('keydown', focusMap);
        map.off('popupopen', attachZoomLink);
        map.off('popupclose', removeHandlers);
        if (group) group.setAttribute('aria-expanded', 'false');
      }
    }
  }
});
var mapLayer = function (url, node, options) {
  if (!url && !node) return null;
  return new MapLayer$1(url, node, options);
};

var createLayerControlHTML = async function () {
  var fieldset = leafletSrcExports.DomUtil.create('fieldset', 'mapml-layer-item'),
    input = leafletSrcExports.DomUtil.create('input'),
    layerItemName = leafletSrcExports.DomUtil.create('span', 'mapml-layer-item-name'),
    settingsButtonNameIcon = leafletSrcExports.DomUtil.create('span'),
    layerItemProperty = leafletSrcExports.DomUtil.create(
      'div',
      'mapml-layer-item-properties',
      fieldset
    ),
    layerItemSettings = leafletSrcExports.DomUtil.create(
      'div',
      'mapml-layer-item-settings',
      fieldset
    ),
    itemToggleLabel = leafletSrcExports.DomUtil.create(
      'label',
      'mapml-layer-item-toggle',
      layerItemProperty
    ),
    layerItemControls = leafletSrcExports.DomUtil.create(
      'div',
      'mapml-layer-item-controls',
      layerItemProperty
    ),
    opacityControl = leafletSrcExports.DomUtil.create(
      'details',
      'mapml-layer-item-opacity mapml-control-layers',
      layerItemSettings
    ),
    opacity = leafletSrcExports.DomUtil.create('input'),
    opacityControlSummary = leafletSrcExports.DomUtil.create('summary'),
    svgSettingsControlIcon = leafletSrcExports.SVG.create('svg'),
    settingsControlPath1 = leafletSrcExports.SVG.create('path'),
    settingsControlPath2 = leafletSrcExports.SVG.create('path'),
    extentsFieldset = leafletSrcExports.DomUtil.create('fieldset', 'mapml-layer-grouped-extents'),
    mapEl = this.parentNode;
    opacity.setAttribute('data-testid', 'layer-item-opacity');

  // append the paths in svg for the remove layer and toggle icons
  svgSettingsControlIcon.setAttribute('viewBox', '0 0 24 24');
  svgSettingsControlIcon.setAttribute('height', '22');
  svgSettingsControlIcon.setAttribute('width', '22');
  svgSettingsControlIcon.setAttribute('fill', 'currentColor');
  settingsControlPath1.setAttribute('d', 'M0 0h24v24H0z');
  settingsControlPath1.setAttribute('fill', 'none');
  settingsControlPath2.setAttribute(
    'd',
    'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'
  );
  svgSettingsControlIcon.appendChild(settingsControlPath1);
  svgSettingsControlIcon.appendChild(settingsControlPath2);

  layerItemSettings.hidden = true;
  settingsButtonNameIcon.setAttribute('aria-hidden', true);

  let removeControlButton = leafletSrcExports.DomUtil.create(
    'button',
    'mapml-layer-item-remove-control',
    layerItemControls
  );
  removeControlButton.type = 'button';
  removeControlButton.title = mapEl.locale.lmRemoveLayer;
  removeControlButton.innerHTML = "<span aria-hidden='true'>&#10005;</span>";
  removeControlButton.classList.add('mapml-button');
  leafletSrcExports.DomEvent.on(removeControlButton, 'click', leafletSrcExports.DomEvent.stop);
  leafletSrcExports.DomEvent.on(
    removeControlButton,
    'click',
    (e) => {
      let fieldset = 0,
        elem,
        root;
      root =
        mapEl.tagName === 'GCDS-MAP'
          ? mapEl.shadowRoot
          : mapEl.querySelector('.mapml-web-map').shadowRoot;
      if (
        e.target.closest('fieldset').nextElementSibling &&
        !e.target.closest('fieldset').nextElementSibling.disbaled
      ) {
        elem = e.target.closest('fieldset').previousElementSibling;
        while (elem) {
          fieldset += 2; // find the next layer menu item
          elem = elem.previousElementSibling;
        }
      } else {
        // focus on the link
        elem = 'link';
      }
      mapEl.removeChild(
        e.target.closest('fieldset').querySelector('span').layer._layerEl
      );
      elem = elem
        ? root.querySelector('.leaflet-control-attribution').firstElementChild
        : (elem = root.querySelectorAll('input')[fieldset]);
      elem.focus();
    },
    this._layer
  );

  let itemSettingControlButton = leafletSrcExports.DomUtil.create(
    'button',
    'mapml-layer-item-settings-control',
    layerItemControls
  );
  itemSettingControlButton.type = 'button';
  itemSettingControlButton.title = mapEl.locale.lmLayerSettings;
  itemSettingControlButton.setAttribute('aria-expanded', false);
  itemSettingControlButton.classList.add('mapml-button');
  leafletSrcExports.DomEvent.on(
    itemSettingControlButton,
    'click',
    (e) => {
      let layerControl = this._layer._layerEl._layerControl._container;
      if (!layerControl._isExpanded && e.pointerType === 'touch') {
        layerControl._isExpanded = true;
        return;
      }
      if (layerItemSettings.hidden === true) {
        itemSettingControlButton.setAttribute('aria-expanded', true);
        layerItemSettings.hidden = false;
      } else {
        itemSettingControlButton.setAttribute('aria-expanded', false);
        layerItemSettings.hidden = true;
      }
    },
    this._layer
  );

  input.defaultChecked = this.checked;
  input.type = 'checkbox';
  input.setAttribute('class', 'leaflet-control-layers-selector');
  input.setAttribute('data-testid', 'layer-item-checkbox');
  layerItemName.layer = this._layer;
  const changeCheck = function () {
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('map-change'));
    this._layerControlCheckbox.focus();
  };
  input.addEventListener('change', changeCheck.bind(this));
  if (this._layer._legendUrl) {
    var legendLink = document.createElement('a');
    legendLink.text = ' ' + this._layer._title;
    legendLink.href = this._layer._legendUrl;
    legendLink.target = '_blank';
    legendLink.draggable = false;
    layerItemName.appendChild(legendLink);
  } else {
    layerItemName.innerHTML = this._layer._title;
  }
  layerItemName.id = 'mapml-layer-item-name-{' + leafletSrcExports.stamp(layerItemName) + '}';
  opacityControlSummary.innerText = mapEl.locale.lcOpacity;
  opacityControlSummary.id =
    'mapml-layer-item-opacity-' + leafletSrcExports.stamp(opacityControlSummary);
  opacityControl.appendChild(opacityControlSummary);
  opacityControl.appendChild(opacity);
  opacity.setAttribute('type', 'range');
  opacity.setAttribute('min', '0');
  opacity.setAttribute('max', '1.0');
  opacity.setAttribute('value', this._opacity || '1.0');
  opacity.setAttribute('step', '0.1');
  opacity.setAttribute(
    'aria-labelledby',
    'mapml-layer-item-opacity-' + leafletSrcExports.stamp(opacityControlSummary)
  );

  const changeOpacity = function (e) {
    if (e && e.target && e.target.value >= 0 && e.target.value <= 1.0) {
      this._layer.changeOpacity(e.target.value);
    }
  };
  opacity.value = this._opacity || '1.0';
  opacity.addEventListener('change', changeOpacity.bind(this));

  fieldset.setAttribute('aria-grabbed', 'false');
  fieldset.setAttribute('aria-labelledby', layerItemName.id);

  fieldset.ontouchstart = fieldset.onmousedown = (downEvent) => {
    if (
      (downEvent.target.parentElement.tagName.toLowerCase() === 'label' &&
        downEvent.target.tagName.toLowerCase() !== 'input') ||
      downEvent.target.tagName.toLowerCase() === 'label'
    ) {
      downEvent =
        downEvent instanceof TouchEvent ? downEvent.touches[0] : downEvent;
      let control = fieldset,
        controls = fieldset.parentNode,
        moving = false,
        yPos = downEvent.clientY,
        originalPosition = Array.from(
          controls.querySelectorAll('fieldset')
        ).indexOf(fieldset);

      document.body.ontouchmove = document.body.onmousemove = (moveEvent) => {
        moveEvent.preventDefault();
        moveEvent =
          moveEvent instanceof TouchEvent ? moveEvent.touches[0] : moveEvent;

        // Fixes flickering by only moving element when there is enough space
        let offset = moveEvent.clientY - yPos;
        moving = Math.abs(offset) > 15 || moving;
        if (
          (controls && !moving) ||
          (controls && controls.childElementCount <= 1) ||
          controls.getBoundingClientRect().top >
            control.getBoundingClientRect().bottom ||
          controls.getBoundingClientRect().bottom <
            control.getBoundingClientRect().top
        ) {
          return;
        }

        controls.classList.add('mapml-draggable');
        control.style.transform = 'translateY(' + offset + 'px)';
        control.style.pointerEvents = 'none';

        let x = moveEvent.clientX,
          y = moveEvent.clientY,
          root =
            mapEl.tagName === 'GCDS-MAP'
              ? mapEl.shadowRoot
              : mapEl.querySelector('.mapml-web-map').shadowRoot,
          elementAt = root.elementFromPoint(x, y),
          swapControl =
            !elementAt || !elementAt.closest('fieldset')
              ? control
              : elementAt.closest('fieldset');

        swapControl =
          Math.abs(offset) <= swapControl.offsetHeight ? control : swapControl;

        control.setAttribute('aria-grabbed', 'true');
        control.setAttribute('aria-dropeffect', 'move');
        if (swapControl && controls === swapControl.parentNode) {
          swapControl =
            swapControl !== control.nextSibling
              ? swapControl
              : swapControl.nextSibling;
          if (control !== swapControl) {
            yPos = moveEvent.clientY;
            control.style.transform = null;
          }
          controls.insertBefore(control, swapControl);
        }
      };

      document.body.ontouchend = document.body.onmouseup = () => {
        let newPosition = Array.from(
          controls.querySelectorAll('fieldset')
        ).indexOf(fieldset);
        control.setAttribute('aria-grabbed', 'false');
        control.removeAttribute('aria-dropeffect');
        control.style.pointerEvents = null;
        control.style.transform = null;
        if (originalPosition !== newPosition) {
          let controlsElems = controls.children,
            zIndex = 1;
          // re-order layer elements DOM order
          for (let c of controlsElems) {
            let layerEl = c.querySelector('span').layer._layerEl;
            layerEl.setAttribute('data-moving', '');
            mapEl.insertAdjacentElement('beforeend', layerEl);
            layerEl.removeAttribute('data-moving');
          }
          // update zIndex of all map-layer elements
          let layers = mapEl.querySelectorAll('map-layer,layer-');
          for (let i = 0; i < layers.length; i++) {
            let layer = layers[i]._layer;
            if (layer.options.zIndex !== zIndex) {
              layer.setZIndex(zIndex);
            }
            zIndex++;
          }
        }
        controls.classList.remove('mapml-draggable');
        document.body.ontouchmove =
          document.body.onmousemove =
          document.body.onmouseup =
            null;
      };
    }
  };

  itemToggleLabel.appendChild(input);
  itemToggleLabel.appendChild(layerItemName);
  itemSettingControlButton.appendChild(settingsButtonNameIcon);
  settingsButtonNameIcon.appendChild(svgSettingsControlIcon);

  let mapml = this.src ? this.shadowRoot : this;
  var styleLinks = mapml.querySelectorAll(
    'map-link[rel=style],map-link[rel="self style"],map-link[rel="style self"]'
  );
  let styles;
  if (styleLinks) {
    styles = this.getAlternateStyles(styleLinks);
    if (styles) {
      layerItemSettings.appendChild(styles);
    }
  }

  this._layerControlCheckbox = input;
  this._layerControlLabel = itemToggleLabel;
  this._opacityControl = opacityControl;
  this._opacitySlider = opacity;
  this._layerControlHTML = fieldset;
  this._layerItemSettingsHTML = layerItemSettings;
  this._propertiesGroupAnatomy = extentsFieldset;
  this._styles = styles;
  extentsFieldset.setAttribute('aria-label', 'Sublayers');
  extentsFieldset.setAttribute('hidden', '');
  let mapExtents = mapml.querySelectorAll('map-extent:not([hidden])');
  let mapExtentLayerControls = [];
  for (let i = 0; i < mapExtents.length; i++) {
    mapExtentLayerControls.push(mapExtents[i].whenReady());
    // if any map-extent is not hidden, the parent fieldset should not be hidden
    extentsFieldset.removeAttribute('hidden');
  }
  await Promise.all(mapExtentLayerControls);
  for (let i = 0; i < mapExtents.length; i++) {
    extentsFieldset.appendChild(mapExtents[i].getLayerControlHTML());
  }
  layerItemSettings.appendChild(extentsFieldset);
  return this._layerControlHTML;
};

const GcdsMapLayer = /*@__PURE__*/ proxyCustomElement(class GcdsMapLayer extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    // Core properties matching BaseLayerElement observedAttributes
    src;
    checked;
    hidden = false;
    opacity = 1;
    _opacity;
    media;
    get opacityValue() {
        return this._opacity ?? this.opacity ?? 1.0;
    }
    _layer;
    _layerControl;
    _layerControlHTML;
    _layerItemSettingsHTML;
    _propertiesGroupAnatomy;
    disabled = false;
    _fetchError = false;
    // the layer registry is a semi-private Map stored on each map-link and map-layer element
    // structured as follows: position -> {layer: layerInstance, count: number}
    // where layer is either a MapTileLayer or a MapFeatureLayer, 
    // and count is the number of tiles or features in that layer
    _layerRegistry = new Map();
    // Watchers for attribute changes - these automatically don't fire during initial load
    srcChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            this._onRemove();
            if (this.el.isConnected) {
                this._onAdd();
            }
        }
    }
    checkedChanged(newValue) {
        if (this._layer) {
            // Get the parent map element
            const mapEl = this.getMapEl();
            if (mapEl && mapEl._map) {
                const leafletMap = mapEl._map;
                if (newValue) {
                    // If checked is true, add the layer to the map
                    leafletMap.addLayer(this._layer);
                }
                else {
                    // If checked is false, remove the layer from the map
                    leafletMap.removeLayer(this._layer);
                }
            }
            // Update the layer control checkbox to match the checked state
            if (this._layerControlCheckbox) {
                this._layerControlCheckbox.checked = newValue;
            }
        }
    }
    opacityChanged(newValue, oldValue) {
        // This watcher handles programmatic changes to the opacity property
        if (oldValue !== newValue && this._layer) {
            this._opacity = newValue;
            this._layer.changeOpacity(newValue);
            // reflect to map-layer opacity attribute when opacity property changes
            // this.el.setAttribute('opacity', newValue.toString());
            // Update opacity slider if it exists
            if (this._opacitySlider) {
                this._opacitySlider.value = newValue.toString();
            }
        }
    }
    mediaChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            this._registerMediaQuery(newValue);
        }
    }
    hiddenChanged(newValue, oldValue) {
        // Only process hidden changes after the layer is fully initialized
        // During initial load, this will be handled in _attachedToMap()
        if (oldValue !== newValue && this._layer && this._layerControl) {
            this._applyHiddenState(newValue);
        }
    }
    _applyHiddenState(isHidden) {
        if (!this._layer || !this._layerControl)
            return;
        if (isHidden) {
            // Hidden was set to true - remove from layer control
            this._layerControl.removeLayer(this._layer);
        }
        else {
            // Hidden was set to false - add back to layer control and validate
            this._layerControl.addOrUpdateOverlay(this._layer, this.label);
            this._validateDisabled();
        }
    }
    loggedMessages;
    _observer;
    _mql;
    _changeHandler;
    _boundCreateLayerControlHTML;
    // Layer control element references (synced from DOM element properties)
    _layerControlCheckbox;
    _layerControlLabel;
    _opacityControl;
    _opacitySlider;
    // private _layerItemSettingsHTML?: HTMLElement; 
    // private _propertiesGroupAnatomy?: HTMLElement; 
    _styles;
    get label() {
        if (this._layer)
            return this._layer.getName();
        else
            return this.el.hasAttribute('label') ? this.el.getAttribute('label') : '';
    }
    set label(val) {
        if (val) {
            this.el.setAttribute('label', val);
            if (this._layer)
                this._layer.setName(val);
        }
    }
    get extent() {
        // calculate the bounds of all content, return it.
        if (this._layer) {
            this._layer._calculateBounds();
        }
        return this._layer
            ? Object.assign(Util._convertAndFormatPCRS(this._layer.bounds, window.M[this.getProjection()], this.getProjection()), { zoom: this._layer.zoomBounds })
            : null;
    }
    _registerMediaQuery(mq) {
        if (!this._changeHandler) {
            this._changeHandler = () => {
                this._onRemove();
                if (this._mql.matches) {
                    this._onAdd();
                }
                // set the disabled 'read-only' attribute indirectly, via _validateDisabled
                this._validateDisabled();
            };
        }
        if (mq) {
            // a new media query is being established
            let map = this.getMapEl();
            if (!map)
                return;
            // Remove listener from the old media query (if it exists)
            if (this._mql) {
                this._mql.removeEventListener('change', this._changeHandler);
            }
            this._mql = map.matchMedia(mq);
            this._changeHandler();
            this._mql.addEventListener('change', this._changeHandler);
        }
        else if (this._mql) {
            // the media attribute removed or query set to ''
            this._mql.removeEventListener('change', this._changeHandler);
            delete this._mql;
            // effectively, no / empty media attribute matches, do what changeHandler does
            this._onRemove();
            this._onAdd();
            this._validateDisabled();
        }
    }
    getMapEl() {
        return Util.getClosest(this.el, 'gcds-map');
    }
    // Note: Stencil handles constructor automatically, but we can use componentWillLoad for initialization
    componentWillLoad() {
        // Mirror the original constructor logic
        // by keeping track of console.log, we can avoid overwhelming the console
        this.loggedMessages = new Set();
        // Publish queryable() early so it's available even before connectedCallback
        // This is needed for dynamically added layers (e.g., via inplace links)
        Object.defineProperty(this.el, 'queryable', {
            value: () => this.queryable(),
            writable: true,
            configurable: true
        });
    }
    disconnectedCallback() {
        // if the map-layer node is removed from the dom, the layer should be
        // removed from the map and the layer control
        if (this.el.hasAttribute('data-moving'))
            return;
        this._onRemove();
        if (this._mql) {
            if (this._changeHandler) {
                this._mql.removeEventListener('change', this._changeHandler);
            }
            delete this._mql;
        }
    }
    _onRemove() {
        if (this._observer) {
            this._observer.disconnect();
        }
        let l = this._layer, lc = this._layerControl;
        if (l) {
            l.off();
        }
        // if this layer has never been connected, it will not have a _layer
        if (l && l._map) {
            l._map.removeLayer(l);
        }
        if (lc && !this.el.hasAttribute('hidden')) {
            // lc.removeLayer depends on this._layerControlHTML, can't delete it until after
            lc.removeLayer(l);
        }
        // remove properties of layer involved in whenReady() logic
        delete this._layer;
        delete this._layerControl;
        delete this._layerControlHTML;
        delete this._fetchError;
        // Clean up DOM element properties exposed for MapML compatibility
        delete this.el._layer;
        delete this.el._layerControl;
        delete this.el._layerControlHTML;
        delete this.el._fetchError;
        // Clean up layer control element references
        this._layerControlCheckbox = undefined;
        this._layerControlLabel = undefined;
        this._opacityControl = undefined;
        this._opacitySlider = undefined;
        // this._layerItemSettingsHTML = undefined;
        // this._propertiesGroupAnatomy = undefined;
        this._styles = undefined;
        this.el.shadowRoot.innerHTML = '';
        if (this.src)
            this.el.innerHTML = '';
        this._layerRegistry.clear();
    }
    connectedCallback() {
        if (this.el.hasAttribute('data-moving'))
            return;
        this._boundCreateLayerControlHTML = createLayerControlHTML.bind(this.el);
        // Publish _validateDisabled on element for MapML compatibility
        this.el._validateDisabled = this._validateDisabled.bind(this);
        // Expose disabled property on DOM element
        Object.defineProperty(this.el, 'disabled', {
            get: () => this.disabled,
            set: (val) => {
                this.disabled = val;
            },
            configurable: true,
            enumerable: true
        });
        // Expose _opacity property on DOM element (internal opacity state)
        Object.defineProperty(this.el, '_opacity', {
            get: () => this._opacity,
            set: (val) => {
                if (val !== this._opacity) {
                    this._opacity = val;
                }
            },
            configurable: true,
            enumerable: true
        });
        // Expose opacity getter/setter on DOM element using the component's opacityValue
        Object.defineProperty(this.el, 'opacity', {
            get: () => {
                return this.opacityValue;
            },
            set: (val) => {
                if (+val > 1 || +val < 0)
                    return;
                this._opacity = val;
                this._layer?.changeOpacity(val);
            },
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(this.el, 'whenElemsReady', {
            value: () => this.whenElemsReady(),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'zoomTo', {
            value: () => this.zoomTo(),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'mapml2geojson', {
            value: (options = {}) => this.mapml2geojson(options),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'pasteFeature', {
            value: (feature) => this.pasteFeature(feature),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'getAlternateStyles', {
            value: (styleLinks) => this.getAlternateStyles(styleLinks),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'getOuterHTML', {
            value: () => this.getOuterHTML(),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'getMapEl', {
            value: () => this.getMapEl(),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'getProjection', {
            value: () => this.getProjection(),
            writable: true,
            configurable: true
        });
        // Expose label property on DOM element for MapML compatibility
        Object.defineProperty(this.el, 'label', {
            get: () => this.label,
            set: (val) => this.label = val,
            configurable: true,
            enumerable: true
        });
        // Expose hidden property on DOM element for MapML compatibility
        // The @Watch('hidden') decorator handles the side effects
        Object.defineProperty(this.el, 'hidden', {
            get: () => this.el.hasAttribute('hidden'),
            set: (val) => {
                if (val) {
                    this.el.setAttribute('hidden', '');
                }
                else {
                    this.el.removeAttribute('hidden');
                }
            },
            configurable: true,
            enumerable: true
        });
        // Expose extent property on DOM element for MapML compatibility
        Object.defineProperty(this.el, 'extent', {
            get: () => this.extent,
            configurable: true,
            enumerable: true
        });
        this.el._layerRegistry = this._layerRegistry;
        const doConnected = this._onAdd.bind(this);
        const doRemove = this._onRemove.bind(this);
        const registerMediaQuery = this._registerMediaQuery.bind(this);
        let mq = this.media;
        this.getMapEl()
            .whenReady()
            .then(() => {
            doRemove();
            if (mq) {
                registerMediaQuery(mq);
            }
            else {
                doConnected();
            }
        })
            .catch((error) => {
            throw new Error('Map never became ready: ' + error);
        });
    }
    _onAdd() {
        new Promise((resolve, reject) => {
            this.el.addEventListener('changestyle', (e) => {
                e.stopPropagation();
                // if user changes the style in layer control
                if (e.detail) {
                    this.src = e.detail.src;
                }
            }, { once: true });
            let base = this.el.baseURI ? this.el.baseURI : document.baseURI;
            const headers = new Headers();
            headers.append('Accept', 'text/mapml');
            if (this.src) {
                fetch(this.src, { headers: headers })
                    .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    // Save the response URL to use as base for resolving relative URLs
                    const responseUrl = response.url;
                    return response.text().then(text => ({ text, url: responseUrl }));
                })
                    .then(({ text, url: sourceUrl }) => {
                    let content = new DOMParser().parseFromString(text, 'text/xml');
                    if (content.querySelector('parsererror') ||
                        !content.querySelector('mapml-')) {
                        // cut short whenReady with the _fetchError property
                        this._fetchError = true;
                        // Expose _fetchError on DOM element for MapML compatibility
                        this.el._fetchError = this._fetchError;
                        console.log('Error fetching layer content:\n\n' + text + '\n');
                        throw new Error('Parser error');
                    }
                    // Attach the source URL to the content for later use
                    content._sourceUrl = sourceUrl;
                    return content;
                })
                    .then((content) => {
                    this._copyRemoteContentToShadowRoot(content.querySelector('mapml-'), content._sourceUrl);
                    this._copyRemoteContentToShadowRoot(content.querySelector('mapml-'));
                    let elements = this.el.shadowRoot.querySelectorAll('*');
                    let elementsReady = [];
                    for (let i = 0; i < elements.length; i++) {
                        if (elements[i].whenReady) {
                            elementsReady.push(elements[i].whenReady().catch(error => {
                                console.warn(`Element ${elements[i].tagName} failed to become ready:`, error);
                                return null; // Convert rejection to resolution so layer can still proceed
                            }));
                        }
                    }
                    return Promise.allSettled(elementsReady);
                })
                    .then(() => {
                    // may throw:
                    this._selectAlternateOrChangeProjection();
                })
                    .then(() => {
                    this._layer = mapLayer(new URL(this.src, base).href, this.el, {
                        projection: this.getProjection(),
                        opacity: this.opacityValue
                    });
                    // Expose _layer on DOM element for MapML compatibility
                    this.el._layer = this._layer;
                    this._createLayerControlHTML();
                    this._setLocalizedDefaultLabel();
                    this._attachedToMap();
                    // Process any elements that were created before layer was ready
                    this._runMutationObserver(this.el.shadowRoot.children);
                    this._bindMutationObserver();
                    this._validateDisabled();
                    // re-use 'loadedmetadata' event from HTMLMediaElement inteface, applied
                    // to MapML extent as metadata
                    // Should always be fired at the end of initialization process
                    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
                    // https://maps4html.org/web-map-doc/docs/api/layer-api#events
                    this.el.dispatchEvent(new CustomEvent('loadedmetadata', { detail: { target: this.el } }));
                    resolve(undefined);
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            else {
                let elements = this.el.querySelectorAll('*');
                let elementsReady = [];
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].whenReady)
                        elementsReady.push(elements[i].whenReady());
                }
                Promise.allSettled(elementsReady)
                    .then(() => {
                    // may throw:
                    this._selectAlternateOrChangeProjection();
                })
                    .then(() => {
                    this._layer = mapLayer(null, this.el, {
                        projection: this.getProjection(),
                        opacity: this.opacityValue
                    });
                    // Expose _layer on DOM element for MapML compatibility
                    this.el._layer = this._layer;
                    this._createLayerControlHTML();
                    this._setLocalizedDefaultLabel();
                    this._attachedToMap();
                    // Process any elements that were created before layer was ready
                    this._runMutationObserver(this.el.children);
                    this._bindMutationObserver();
                    this._validateDisabled();
                    // re-use 'loadedmetadata' event from HTMLMediaElement inteface, applied
                    // to MapML extent as metadata
                    // Should always be fired at the end of initialization process
                    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
                    // https://maps4html.org/web-map-doc/docs/api/layer-api#events
                    this.el.dispatchEvent(new CustomEvent('loadedmetadata', { detail: { target: this.el } }));
                    resolve(undefined);
                })
                    .catch((error) => {
                    reject(error);
                });
            }
        }).catch((e) => {
            if (e.message === 'changeprojection') {
                if (e.cause.href) {
                    console.log('Changing layer src to: ' + e.cause.href);
                    this.src = e.cause.href;
                }
                else if (e.cause.mapprojection) {
                    console.log('Changing map projection to match layer: ' + e.cause.mapprojection);
                    const mapEl = this.getMapEl();
                    if (mapEl) {
                        mapEl.projection = e.cause.mapprojection;
                    }
                }
            }
            else if (e.message === 'Failed to fetch') {
                // cut short whenReady with the _fetchError property
                this._fetchError = true;
                // Expose _fetchError on DOM element for MapML compatibility
                this.el._fetchError = this._fetchError;
            }
            else {
                console.log(e);
                this.el.dispatchEvent(new CustomEvent('error', { detail: { target: this.el } }));
            }
        });
    }
    _setLocalizedDefaultLabel() {
        if (!this._layer?._titleIsReadOnly && !this._layer?._title) {
            const mapEl = this.getMapEl();
            if (mapEl && mapEl.locale?.dfLayer) {
                this.label = mapEl.locale.dfLayer;
            }
        }
    }
    _selectAlternateOrChangeProjection() {
        const mapml = this.src ? this.el.shadowRoot : this.el;
        const mapEl = this.getMapEl();
        if (!mapml || !mapEl)
            return;
        const selectedAlternate = this.getProjection() !== mapEl.projection &&
            mapml.querySelector('map-link[rel=alternate][projection=' +
                mapEl.projection +
                '][href]');
        if (selectedAlternate) {
            // Use the same base resolution logic as map-link.getBase()
            // Check for map-base element first, then fall back to layer src
            let baseUrl;
            const mapBase = mapml.querySelector('map-base[href]');
            if (mapBase) {
                baseUrl = mapBase.getAttribute('href');
            }
            else if (this.src) {
                // Fallback to resolving layer's src against document base
                baseUrl = new URL(this.src, this.el.baseURI || document.baseURI).href;
            }
            else {
                baseUrl = this.el.baseURI || document.baseURI;
            }
            const url = new URL(selectedAlternate.getAttribute('href'), baseUrl).href;
            throw new Error('changeprojection', {
                cause: { href: url }
            });
        }
        const contentProjection = this.getProjection();
        if (contentProjection !== mapEl.projection &&
            mapEl.layers?.length === 1) {
            throw new Error('changeprojection', {
                cause: { mapprojection: contentProjection }
            });
        }
    }
    _copyRemoteContentToShadowRoot(mapml, sourceUrl) {
        const shadowRoot = this.el.shadowRoot;
        if (!shadowRoot || !mapml)
            return;
        const frag = document.createDocumentFragment();
        const elements = mapml.querySelectorAll('map-head > *, map-body > *');
        // Find or create a map-base element to store the source document's base URL
        let mapBase = Array.from(elements).find(el => el.nodeName === 'MAP-BASE');
        if (!mapBase && sourceUrl) {
            // Create a synthetic map-base element if none exists
            mapBase = document.createElement('map-base');
            mapBase.setAttribute('href', sourceUrl);
            frag.appendChild(mapBase);
        }
        else if (mapBase && sourceUrl) {
            // Resolve existing map-base href against the source URL
            const resolvedHref = new URL(mapBase.getAttribute('href') || '', sourceUrl).href;
            mapBase.setAttribute('href', resolvedHref);
        }
        for (let i = 0; i < elements.length; i++) {
            frag.appendChild(elements[i]);
        }
        shadowRoot.appendChild(frag);
    }
    /**
     * For "local" content, getProjection will use content of "this"
     * For "remote" content, you need to pass the shadowRoot to search through
     */
    getProjection() {
        let mapml = this.src ? this.el.shadowRoot : this.el;
        let projection = this.getMapEl().projection;
        if (mapml.querySelector('map-meta[name=projection][content]')) {
            projection =
                Util._metaContentToObject(mapml
                    .querySelector('map-meta[name=projection]')
                    .getAttribute('content')).content || projection;
        }
        else if (mapml.querySelector('map-extent[units]')) {
            const getProjectionFrom = (extents) => {
                let extentProj = extents[0].attributes.units.value;
                let isMatch = true;
                for (let i = 0; i < extents.length; i++) {
                    if (extentProj !== extents[i].attributes.units.value) {
                        isMatch = false;
                    }
                }
                return isMatch ? extentProj : null;
            };
            projection =
                getProjectionFrom(Array.from(mapml.querySelectorAll('map-extent[units]'))) || projection;
        }
        else {
            const titleElement = this.el.querySelector('map-title');
            const layerLabel = this.label || (titleElement ? titleElement.textContent : 'Unnamed');
            const message = `A projection was not assigned to the '${layerLabel}' Layer. \nPlease specify a projection for that layer using a map-meta element. \nSee more here - https://maps4html.org/web-map-doc/docs/elements/meta/`;
            if (!this.loggedMessages.has(message)) {
                console.log(message);
                this.loggedMessages.add(message);
            }
        }
        return projection;
    }
    _attachedToMap() {
        // Refactored from layer.js _attachedToMap()
        // Set i to the position of this layer element in the set of layers
        const mapEl = this.getMapEl();
        if (!mapEl || !this._layer)
            return;
        let i = 0;
        let position = 1;
        const nodes = mapEl.children;
        for (i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeName === 'MAP-LAYER' ||
                nodes[i].nodeName === 'LAYER-') {
                if (nodes[i] === this.el) {
                    position = i + 1;
                }
                else if (nodes[i]._layer) {
                    nodes[i]._layer.setZIndex(i + 1);
                }
            }
        }
        const proj = mapEl.projection ? mapEl.projection : 'OSMTILE';
        leafletSrcExports.setOptions(this._layer, {
            zIndex: position,
            mapprojection: proj,
            opacity: window.getComputedStyle(this.el).opacity
        });
        if (this.checked) {
            this._layer.addTo(mapEl._map);
            // Toggle the this.disabled attribute depending on whether the layer
            // is: same prj as map, within view/zoom of map
        }
        mapEl._map.on('moveend layeradd', this._validateDisabled, this);
        this._layer.on('add remove', this._validateDisabled, this);
        if (mapEl._layerControl) {
            this._layerControl = mapEl._layerControl;
            // Expose _layerControl on DOM element for MapML compatibility
            this.el._layerControl = this._layerControl;
        }
        // If controls option is enabled, insert the layer into the overlays array
        if (mapEl._layerControl && !this.hidden) {
            this._layerControl.addOrUpdateOverlay(this._layer, this.label);
        }
        // The mapml document associated to this layer can in theory contain many
        // link[@rel=legend] elements with different @type or other attributes;
        // currently only support a single link, don't care about type, lang etc.
        // TODO: add support for full LayerLegend object, and > one link.
        if (this._layer._legendUrl) {
            this.el.legendLinks = [
                {
                    type: 'application/octet-stream',
                    href: this._layer._legendUrl,
                    rel: 'legend',
                    lang: null,
                    hreflang: null,
                    sizes: null
                }
            ];
        }
    }
    _runMutationObserver(elementsGroup) {
        const _addStylesheetLink = (mapLink) => {
            this.whenReady().then(() => {
                this._layer.renderStyles(mapLink);
            });
        };
        const _addStyleElement = (mapStyle) => {
            this.whenReady().then(() => {
                this._layer.renderStyles(mapStyle);
            });
        };
        const _addExtentElement = (mapExtent) => {
            this.whenReady().then(() => {
                // Wait for the extent itself to be ready before recalculating bounds
                if (typeof mapExtent.whenReady === 'function') {
                    mapExtent.whenReady().then(() => {
                        // Force complete recalculation by deleting cached bounds
                        delete this._layer.bounds;
                        this._layer._calculateBounds();
                        this._validateDisabled();
                    });
                }
                else {
                    delete this._layer.bounds;
                    this._layer._calculateBounds();
                    this._validateDisabled();
                }
            });
        };
        const root = this.src ? this.el.shadowRoot : this.el;
        const pseudo = root instanceof ShadowRoot ? ':host' : ':scope';
        const _addMetaElement = (_mapMeta) => {
            this.whenReady().then(() => {
                this._layer._calculateBounds();
                this._validateDisabled();
            });
        };
        for (let i = 0; i < elementsGroup.length; ++i) {
            const element = elementsGroup[i];
            switch (element.nodeName) {
                case 'MAP-LINK':
                    if (element.link && !element.link.isConnected)
                        _addStylesheetLink(element);
                    break;
                case 'MAP-STYLE':
                    if (element.styleElement && !element.styleElement.isConnected) {
                        _addStyleElement(element);
                    }
                    break;
                case 'MAP-EXTENT':
                    _addExtentElement(element);
                    break;
                case 'MAP-META':
                    const name = element.hasAttribute('name') &&
                        (element.getAttribute('name').toLowerCase() === 'zoom' ||
                            element.getAttribute('name').toLowerCase() === 'extent');
                    if (name &&
                        element ===
                            root.querySelector(`${pseudo} > [name=${element.getAttribute('name')}]`) &&
                        element.hasAttribute('content')) {
                        _addMetaElement();
                    }
                    break;
            }
        }
    }
    /**
     * Set up a function to watch additions of child elements of map-layer or
     * map-layer.shadowRoot and invoke desired side effects via _runMutationObserver
     */
    _bindMutationObserver() {
        this._observer = new MutationObserver((mutationList) => {
            for (let mutation of mutationList) {
                if (mutation.type === 'childList') {
                    this._runMutationObserver(mutation.addedNodes);
                }
            }
        });
        this._observer.observe(this.src ? this.el.shadowRoot : this.el, {
            childList: true
        });
    }
    _validateDisabled() {
        const countTileLayers = () => {
            let totalCount = 0;
            let disabledCount = 0;
            this._layer.eachLayer((layer) => {
                if (layer instanceof MapTileLayer) {
                    totalCount++;
                    if (!layer.isVisible())
                        disabledCount++;
                }
            });
            return { totalCount, disabledCount };
        };
        const countFeatureLayers = () => {
            let totalCount = 0;
            let disabledCount = 0;
            this._layer.eachLayer((layer) => {
                if (layer instanceof MapFeatureLayer) {
                    totalCount++;
                    if (!layer.isVisible())
                        disabledCount++;
                }
            });
            return { totalCount, disabledCount };
        };
        // setTimeout is necessary to make the validateDisabled happen later than the moveend operations etc.,
        // to ensure that the validated result is correct
        setTimeout(() => {
            let layer = this._layer, map = layer?._map;
            // if there's a media query in play, check it early
            if (this._mql && !this._mql.matches) {
                this.el.setAttribute('disabled', '');
                this.disabled = true;
                return;
            }
            if (map) {
                // prerequisite: no inline and remote mapml elements exists at the same time
                const mapExtents = this.src
                    ? this.el.shadowRoot?.querySelectorAll('map-extent')
                    : this.el.querySelectorAll('map-extent');
                let extentLinksReady = [];
                if (mapExtents) {
                    for (let i = 0; i < mapExtents.length; i++) {
                        if (mapExtents[i].whenLinksReady) {
                            extentLinksReady.push(mapExtents[i].whenLinksReady());
                        }
                    }
                }
                Promise.allSettled(extentLinksReady)
                    .then(() => {
                    let disabledExtentCount = 0, totalExtentCount = 0, layerTypes = [
                        '_staticTileLayer',
                        '_mapmlvectors',
                        '_extentLayer'
                    ];
                    for (let j = 0; j < layerTypes.length; j++) {
                        let type = layerTypes[j];
                        if (this.checked) {
                            if (type === '_extentLayer' && mapExtents && mapExtents.length > 0) {
                                for (let i = 0; i < mapExtents.length; i++) {
                                    totalExtentCount++;
                                    if (mapExtents[i]._validateDisabled && mapExtents[i]._validateDisabled())
                                        disabledExtentCount++;
                                }
                            }
                            else if (type === '_mapmlvectors') {
                                // inline / static features
                                const featureLayerCounts = countFeatureLayers();
                                totalExtentCount += featureLayerCounts.totalCount;
                                disabledExtentCount += featureLayerCounts.disabledCount;
                            }
                            else {
                                // inline tiles
                                const tileLayerCounts = countTileLayers();
                                totalExtentCount += tileLayerCounts.totalCount;
                                disabledExtentCount += tileLayerCounts.disabledCount;
                            }
                        }
                    }
                    // if all extents are not visible / disabled, set layer to disabled
                    if (disabledExtentCount === totalExtentCount &&
                        disabledExtentCount !== 0) {
                        this.el.setAttribute('disabled', '');
                        this.disabled = true;
                    }
                    else {
                        this.el.removeAttribute('disabled');
                        this.disabled = false;
                    }
                    this.toggleLayerControlDisabled();
                })
                    .catch((e) => {
                    console.log(e);
                });
            }
        }, 0);
    }
    // disable/italicize layer control elements based on the map-layer.disabled property
    toggleLayerControlDisabled() {
        let input = this._layerControlCheckbox, label = this._layerControlLabel, opacityControl = this._opacityControl, opacitySlider = this._opacitySlider, styleControl = this._styles;
        if (this.disabled) {
            if (input)
                input.disabled = true;
            if (opacitySlider)
                opacitySlider.disabled = true;
            if (label)
                label.style.fontStyle = 'italic';
            if (opacityControl)
                opacityControl.style.fontStyle = 'italic';
            if (styleControl) {
                styleControl.style.fontStyle = 'italic';
                styleControl.querySelectorAll('input').forEach((i) => {
                    i.disabled = true;
                });
            }
        }
        else {
            if (input)
                input.disabled = false;
            if (opacitySlider)
                opacitySlider.disabled = false;
            if (label)
                label.style.fontStyle = 'normal';
            if (opacityControl)
                opacityControl.style.fontStyle = 'normal';
            if (styleControl) {
                styleControl.style.fontStyle = 'normal';
                styleControl.querySelectorAll('input').forEach((i) => {
                    i.disabled = false;
                });
            }
        }
    }
    queryable() {
        let content = this.src ? this.el.shadowRoot : this.el;
        return !!(content?.querySelector('map-extent[checked] > map-link[rel=query]:not([disabled])') &&
            this.checked &&
            this._layer &&
            !this.el.hasAttribute('hidden'));
    }
    getAlternateStyles(styleLinks) {
        if (styleLinks.length > 1) {
            const stylesControl = document.createElement('details');
            const stylesControlSummary = document.createElement('summary');
            const mapEl = this.getMapEl();
            stylesControlSummary.innerText = mapEl?.locale?.lmStyle || 'Style';
            stylesControl.appendChild(stylesControlSummary);
            for (let j = 0; j < styleLinks.length; j++) {
                stylesControl.appendChild(styleLinks[j].getLayerControlOption());
                leafletSrcExports.DomUtil.addClass(stylesControl, 'mapml-layer-item-style mapml-control-layers');
            }
            return stylesControl;
        }
        return null;
    }
    getOuterHTML() {
        let tempElement = this.el.cloneNode(true);
        if (this.el.hasAttribute('src')) {
            let newSrc = this._layer.getHref();
            tempElement.setAttribute('src', newSrc);
        }
        if (this.el.querySelector('map-link')) {
            let mapLinks = tempElement.querySelectorAll('map-link');
            mapLinks.forEach((mapLink) => {
                if (mapLink.hasAttribute('href')) {
                    mapLink.setAttribute('href', decodeURI(new URL(mapLink.getAttribute('href'), this.el.baseURI ? this.el.baseURI : document.baseURI).href));
                }
                else if (mapLink.hasAttribute('tref')) {
                    mapLink.setAttribute('tref', decodeURI(new URL(mapLink.getAttribute('tref'), this.el.baseURI ? this.el.baseURI : document.baseURI).href));
                }
            });
        }
        let outerLayer = tempElement.outerHTML;
        tempElement.remove();
        return outerLayer;
    }
    zoomTo() {
        this.whenReady().then(() => {
            let map = this.getMapEl()?._map, extent = this.extent, tL = extent.topLeft.pcrs, bR = extent.bottomRight.pcrs, layerBounds = leafletSrcExports.bounds(leafletSrcExports.point(tL.horizontal, tL.vertical), leafletSrcExports.point(bR.horizontal, bR.vertical)), center = map.options.crs.unproject(layerBounds.getCenter(true));
            let maxZoom = extent.zoom.maxZoom, minZoom = extent.zoom.minZoom;
            map.setView(center, Util.getMaxZoom(layerBounds, map, minZoom, maxZoom), {
                animate: false
            });
        });
    }
    pasteFeature(feature) {
        switch (typeof feature) {
            case 'string':
                feature.trim();
                if (feature.slice(0, 12) === '<map-feature' &&
                    feature.slice(-14) === '</map-feature>') {
                    this.el.insertAdjacentHTML('beforeend', feature);
                }
                break;
            case 'object':
                if (feature.nodeName?.toUpperCase() === 'MAP-FEATURE') {
                    this.el.appendChild(feature);
                }
        }
    }
    _createLayerControlHTML() {
        // Use the bound function that was set up in connectedCallback  
        // The createLayerControlHTML function was bound to this.el in connectedCallback
        if (this._boundCreateLayerControlHTML) {
            // Call the async function but don't await it (matches original layer.js behavior)
            this._boundCreateLayerControlHTML().then((result) => {
                this._layerControlHTML = result;
                // Expose _layerControlHTML on DOM element for MapML compatibility
                this.el._layerControlHTML = this._layerControlHTML;
                // Sync all layer control properties created by createLayerControlForLayer
                // These properties are set on the DOM element by the bound function and need to be
                // available on both the element and the component for future refactoring
                this._layerControlCheckbox = this.el._layerControlCheckbox;
                this._layerControlLabel = this.el._layerControlLabel;
                this._opacityControl = this.el._opacityControl;
                this._opacitySlider = this.el._opacitySlider;
                this._layerItemSettingsHTML = this.el._layerItemSettingsHTML;
                this._propertiesGroupAnatomy = this.el._propertiesGroupAnatomy;
                this._styles = this.el._styles;
                // Ensure opacity slider is synced with current opacity value
                if (this._opacitySlider && this._opacity !== undefined) {
                    this._opacitySlider.value = this._opacity.toString();
                }
            });
        }
    }
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer;
            if (this.el._layer &&
                this._layerControlHTML &&
                (!this.src || this.el.shadowRoot?.childNodes.length)) {
                resolve();
            }
            else {
                const layerElement = this.el;
                interval = setInterval(testForLayer, 200, layerElement);
                failureTimer = setTimeout(layerNotDefined, 5000);
            }
            function testForLayer(layerElement) {
                if (layerElement._layer &&
                    layerElement._layerControlHTML &&
                    (!layerElement.src || layerElement.shadowRoot?.childNodes.length)) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
                else if (layerElement._fetchError) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    reject('Error fetching layer content');
                }
            }
            function layerNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for layer to be ready');
            }
        });
    }
    /**
     * Wait for all map-extent and map-feature elements to be ready.
     * Returns a promise that resolves when all are settled.
     */
    async whenElemsReady() {
        let elemsReady = [];
        // Use shadowRoot if src is set, otherwise use this.el
        let target = this.src ? this.el.shadowRoot : this.el;
        if (!target)
            return [];
        const extents = Array.from(target.querySelectorAll('map-extent'));
        const features = Array.from(target.querySelectorAll('map-feature'));
        for (let elem of [...extents, ...features]) {
            if (typeof elem.whenReady === 'function') {
                elemsReady.push(elem.whenReady());
            }
        }
        return Promise.allSettled(elemsReady);
    }
    /**
     * Convert this MapML layer to GeoJSON FeatureCollection
     * @param options - Conversion options:
     *   - propertyFunction: Function to map <map-properties> to GeoJSON properties
     *   - transform: Whether to transform coordinates to GCRS (EPSG:4326), defaults to true
     * @returns GeoJSON FeatureCollection object
     */
    mapml2geojson(options = {}) {
        return Util.mapml2geojson(this.el, options);
    }
    render() {
        return null;
    }
    static get watchers() { return {
        "src": ["srcChanged"],
        "checked": ["checkedChanged"],
        "_opacity": ["opacityChanged"],
        "media": ["mediaChanged"],
        "hidden": ["hiddenChanged"]
    }; }
}, [257, "map-layer", {
        "src": [1537],
        "checked": [1540],
        "hidden": [1540],
        "opacity": [1026],
        "_opacity": [1026],
        "media": [1537],
        "whenReady": [64],
        "whenElemsReady": [64]
    }, undefined, {
        "src": ["srcChanged"],
        "checked": ["checkedChanged"],
        "_opacity": ["opacityChanged"],
        "media": ["mediaChanged"],
        "hidden": ["hiddenChanged"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-layer"];
    components.forEach(tagName => { switch (tagName) {
        case "map-layer":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, GcdsMapLayer);
            }
            break;
    } });
}
defineCustomElement$1();

const MapLayer = GcdsMapLayer;
const defineCustomElement = defineCustomElement$1;

export { MapLayer, defineCustomElement };
//# sourceMappingURL=map-layer.js.map

//# sourceMappingURL=map-layer.js.map