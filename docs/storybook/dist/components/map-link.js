import { l as leafletSrcExports, U as Util, M as MapFeatureLayer, F as FeatureRenderer, p as proxyCustomElement, H as H$1 } from './index.js';
import './p-DKgl40ry.js';
import { r as renderStyles } from './p-EYVT9Efh.js';
import { g as getDefaultExportFromCjs } from './p-B85MJLTf.js';

var ImageLayer = leafletSrcExports.ImageOverlay.extend({
  initialize: function (url, location, size, angle, container, options) {
    // (String, Point, Point, Number, Element, Object)
    this._container = container;
    this._url = url;
    // instead of calculating where the image goes, put it at 0,0
    // this._location = point(location);
    // the location for WMS requests will be the upper left-hand
    // corner of the map.  When the map is initialized, that is 0,0,
    // but as the user pans, of course the
    this._location = location;
    this._size = leafletSrcExports.point(size);
    this._angle = angle;

    leafletSrcExports.setOptions(this, options);
  },
  getEvents: function () {
    var events = {
      viewreset: this._reset
    };

    if (this._zoomAnimated && this._step <= 1) {
      events.zoomanim = this._animateZoom;
    }

    return events;
  },
  onAdd: function (map) {
    this.on({
      load: this._onImageLoad
    });

    if (!this._image) {
      this._initImage();
    }

    if (this.options.interactive) {
      leafletSrcExports.DomUtil.addClass(this._image, 'leaflet-interactive');
      this.addInteractiveTarget(this._image);
    }

    this._container.appendChild(this._image);
    this._reset();
  },
  onRemove: function () {
    leafletSrcExports.DomUtil.remove(this._image);
    if (this.options.interactive) {
      this.removeInteractiveTarget(this._image);
    }
  },
  _onImageLoad: function () {
    if (!this._image) {
      return;
    }
    this._image.loaded = +new Date();
    this._updateOpacity();
  },
  _animateZoom: function (e) {
    var scale = this._map.getZoomScale(e.zoom),
      translate = this._map
        .getPixelOrigin()
        .add(this._location)
        .multiplyBy(scale)
        .subtract(this._map._getNewPixelOrigin(e.center, e.zoom))
        .round();

    if (leafletSrcExports.Browser.any3d) {
      leafletSrcExports.DomUtil.setTransform(this._image, translate, scale);
    } else {
      leafletSrcExports.DomUtil.setPosition(this._image, translate);
    }
  },
  _reset: function (e) {
    var image = this._image,
      location = this._location,
      size = this._size;
    // TBD use the angle to establish the image rotation in CSS

    if (
      e &&
      this._step > 1 &&
      (this._overlayToRemove === undefined ||
        this._url === this._overlayToRemove)
    ) {
      return;
    }
    leafletSrcExports.DomUtil.setPosition(image, location);

    image.style.width = size.x + 'px';
    image.style.height = size.y + 'px';
  },
  _updateOpacity: function () {
    if (!this._map) {
      return;
    }

    //L.DomUtil.setOpacity(this._image, this.options.opacity);

    var now = +new Date(),
      nextFrame = false;

    var image = this._image;

    var fade = Math.min(1, (now - image.loaded) / 200);

    leafletSrcExports.DomUtil.setOpacity(image, fade);
    if (fade < 1) {
      nextFrame = true;
    }
    if (nextFrame) {
      leafletSrcExports.Util.cancelAnimFrame(this._fadeFrame);
      this._fadeFrame = leafletSrcExports.Util.requestAnimFrame(this._updateOpacity, this);
    }
    leafletSrcExports.DomUtil.addClass(image, 'leaflet-image-loaded');
  }
});
var imageLayer = function (
  url,
  location,
  size,
  angle,
  container,
  options
) {
  return new ImageLayer(url, location, size, angle, container, options);
};

var TemplatedImageLayer = leafletSrcExports.Layer.extend({
  initialize: function (template, options) {
    this._template = template;
    this._container = leafletSrcExports.DomUtil.create('div', 'leaflet-layer');
    leafletSrcExports.DomUtil.addClass(this._container, 'mapml-image-container');
    this._linkEl = options.linkEl;
    this.zoomBounds = options.zoomBounds;
    this.extentBounds = options.extentBounds;
    // get rid of unused duplicate information that can be confusing
    delete options.zoomBounds;
    delete options.extentBounds;
    leafletSrcExports.setOptions(this, leafletSrcExports.extend(options, this._setUpExtentTemplateVars(template)));
  },
  getEvents: function () {
    var events = {
      moveend: this._onMoveEnd,
      zoomstart: this._clearLayer
    };
    return events;
  },
  onAdd: function (map) {
    this._map = map;
    // TODO: set this._map by ourselves
    this.options.pane.appendChild(this._container);
    this.setZIndex(this.options.zIndex);
    this._onAdd();
  },
  redraw: function () {
    this._onMoveEnd();
  },
  isVisible: function () {
    let map = this._linkEl.getMapEl()._map;
    let mapZoom = map.getZoom();
    let mapBounds = Util.pixelToPCRSBounds(
      map.getPixelBounds(),
      mapZoom,
      map.options.projection
    );
    return (
      mapZoom <= this.zoomBounds.maxZoom &&
      mapZoom >= this.zoomBounds.minZoom &&
      this.extentBounds.overlaps(mapBounds)
    );
  },
  _clearLayer: function () {
    let containerImages = this._container.querySelectorAll('img');
    for (let i = 0; i < containerImages.length; i++) {
      this._container.removeChild(containerImages[i]);
    }
  },

  _addImage: function (bounds, zoom, loc) {
    let map = this._map;
    let overlayToRemove = this._imageOverlay;
    let src = this.getImageUrl(bounds, zoom);
    let size = map.getSize();
    this._imageOverlay = imageLayer(src, loc, size, 0, this._container);
    this._imageOverlay._step = this._template.step;
    this._imageOverlay.addTo(map);
    if (overlayToRemove) {
      this._imageOverlay._overlayToRemove = overlayToRemove._url;
      this._imageOverlay.on('load error', function () {
        map.removeLayer(overlayToRemove);
      });
    }
  },

  _scaleImage: function (bounds, zoom) {
    let obj = this;
    setTimeout(function () {
      if (!obj._map) return;
      let step = obj._template.step;
      let steppedZoom = Math.floor(zoom / step) * step;
      let scale = obj._map.getZoomScale(zoom, steppedZoom);
      let translate = bounds.min
        .multiplyBy(scale)
        .subtract(obj._map._getNewPixelOrigin(obj._map.getCenter(), zoom))
        .round();
      leafletSrcExports.DomUtil.setTransform(obj._imageOverlay._image, translate, scale);
    });
  },

  _onAdd: function () {
    let zoom = this._map.getZoom();
    let steppedZoom = zoom;
    let step = this._template.step;

    if (zoom % step !== 0) steppedZoom = Math.floor(zoom / step) * step;
    let bounds = this._map.getPixelBounds(this._map.getCenter(), steppedZoom);
    this._pixelOrigins = {};
    this._pixelOrigins[steppedZoom] = bounds.min;
    // if the map is panned before the new image layer is added,
    // the location that the layer should be added to is no longer (0,0) but need to be calculated
    let loc = this._map
      .getPixelBounds()
      .min.subtract(this._map.getPixelOrigin());
    this._addImage(bounds, steppedZoom, loc);
    if (zoom !== steppedZoom) {
      this._scaleImage(bounds, zoom);
    }
  },

  _onMoveEnd: function (e) {
    let mapZoom = this._map.getZoom();
    let history = this._map.options.mapEl._history;
    let current = history[history.length - 1];
    let previous = history[history.length - 2];
    if (!previous) previous = current;
    let step = this._template.step;
    let steppedZoom = Math.floor(mapZoom / step) * step;
    let bounds = this._map.getPixelBounds(this._map.getCenter(), steppedZoom);
    //Zooming from one step increment into a lower one
    if (
      step !== '1' &&
      (mapZoom + 1) % step === 0 &&
      current.zoom === previous.zoom - 1
    ) {
      this._addImage(bounds, steppedZoom, leafletSrcExports.point(0, 0));
      this._scaleImage(bounds, mapZoom);
      //Zooming or panning within a step increment
    } else if (e && mapZoom % step !== 0) {
      this._imageOverlay._overlayToRemove = this._imageOverlay._url;
      if (current.zoom !== previous.zoom) {
        //Zoomed from within one step increment into another
        this._addImage(bounds, steppedZoom, leafletSrcExports.point(0, 0));
        this._pixelOrigins[steppedZoom] = bounds.min;
        this._scaleImage(bounds, mapZoom);
      } else {
        // Panning within a step increment
        let pixelOrigin = this._pixelOrigins[steppedZoom];
        let loc = bounds.min.subtract(pixelOrigin);
        if (this.getImageUrl(bounds, steppedZoom) === this._imageOverlay._url)
          return;
        this._addImage(bounds, steppedZoom, loc);
        this._scaleImage(bounds, mapZoom);
      }
      // Zooming from one step decrement into a higher one
      // OR panning when mapZoom % step === 0
    } else {
      if (!this.isVisible) {
        this._clearLayer();
        return;
      }
      var map = this._map,
        loc = map.getPixelBounds().min.subtract(map.getPixelOrigin());
      this._addImage(map.getPixelBounds(), mapZoom, loc);
      this._pixelOrigins[mapZoom] = map.getPixelOrigin();
    }
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();

    return this;
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
  onRemove: function (map) {
    leafletSrcExports.DomUtil.remove(this._container);
    this._clearLayer();
  },
  getImageUrl: function (pixelBounds, zoom) {
    var obj = {};
    obj[this.options.extent.width] = this._map.getSize().x;
    obj[this.options.extent.height] = this._map.getSize().y;
    obj[this.options.extent.bottom] = this._TCRSToPCRS(pixelBounds.max, zoom).y;
    obj[this.options.extent.left] = this._TCRSToPCRS(pixelBounds.min, zoom).x;
    obj[this.options.extent.top] = this._TCRSToPCRS(pixelBounds.min, zoom).y;
    obj[this.options.extent.right] = this._TCRSToPCRS(pixelBounds.max, zoom).x;
    // hidden and other variables that may be associated
    for (var v in this.options.extent) {
      if (
        ['width', 'height', 'left', 'right', 'top', 'bottom'].indexOf(v) < 0
      ) {
        obj[v] = this.options.extent[v];
      }
    }
    return leafletSrcExports.Util.template(this._template.template, obj);
  },
  _TCRSToPCRS: function (coords, zoom) {
    // TCRS pixel point to Projected CRS point (in meters, presumably)
    var map = this._map,
      crs = map.options.crs,
      loc = crs.transformation.untransform(coords, crs.scale(zoom));
    return loc;
  },
  _setUpExtentTemplateVars: function (template) {
    // process the inputs associated to template and create an object named
    // extent with member properties as follows:
    // {width: 'widthvarname',
    //  height: 'heightvarname',
    //  left: 'leftvarname',
    //  right: 'rightvarname',
    //  top: 'topvarname',
    //  bottom: 'bottomvarname'}

    var extentVarNames = { extent: {} },
      inputs = template.values;

    for (var i = 0; i < template.values.length; i++) {
      var type = inputs[i].getAttribute('type'),
        units = inputs[i].getAttribute('units'),
        axis = inputs[i].getAttribute('axis'),
        name = inputs[i].getAttribute('name'),
        position = inputs[i].getAttribute('position'),
        select = inputs[i].tagName.toLowerCase() === 'map-select';
      if (type === 'width') {
        extentVarNames.extent.width = name;
      } else if (type === 'height') {
        extentVarNames.extent.height = name;
      } else if (
        type === 'location' &&
        (units === 'pcrs' || units === 'gcrs')
      ) {
        //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting|latitude|longitude">
        switch (axis) {
          case 'longitude':
          case 'easting':
            if (position) {
              if (position.match(/.*?-left/i)) {
                extentVarNames.extent.left = name;
              } else if (position.match(/.*?-right/i)) {
                extentVarNames.extent.right = name;
              }
            }
            break;
          case 'latitude':
          case 'northing':
            if (position) {
              if (position.match(/top-.*?/i)) {
                extentVarNames.extent.top = name;
              } else if (position.match(/bottom-.*?/i)) {
                extentVarNames.extent.bottom = name;
              }
            }
            break;
        }
      } else if (select) {
        /*jshint -W104 */
        const parsedselect = inputs[i].htmlselect;
        extentVarNames.extent[name] = function () {
          return parsedselect.value;
        };
      } else {
        /*jshint -W104 */
        const input = inputs[i];
        extentVarNames.extent[name] = function () {
          return input.getAttribute('value');
        };
      }
    }
    return extentVarNames;
  }
});
var templatedImageLayer = function (template, options) {
  return new TemplatedImageLayer(template, options);
};

var TemplatedTileLayer = leafletSrcExports.TileLayer.extend({
  // a TemplateTileLayer is similar to a TileLayer except its templates are
  // defined by the <map-extent><template/></map-extent>
  // content found in the MapML document.  As such, the client map does not
  // 'revisit' the server for more MapML content, it simply fills the map extent
  // with tiles for which it generates requests on demand (as the user pans/zooms/resizes
  // the map)
  initialize: function (template, options) {
    // _setUpTileTemplateVars needs options.crs, not available unless we set
    // options first...
    options.tms = template.tms;
    // it's critical to have this.options.minZoom, minNativeZoom, maxZoom, maxNativeZoom
    // because they are used by Leaflet Map and GridLayer, but we
    // don't need two copies of that info on our options object, so set the
    // .zoomBounds property (which is used externally), then delete the option
    // before unpacking the zoomBound object's properties onto this.options.minZ... etc.
    this.zoomBounds = Object.assign({}, options.zoomBounds);
    // unpack object to this.options.minZ... etc where minZ... are the props
    // of the this.zoomBounds object:
    leafletSrcExports.extend(options, this.zoomBounds);
    leafletSrcExports.setOptions(this, options);
    // _setup call here relies on this.options.minZ.. etc
    this._setUpTileTemplateVars(template);
    this._linkEl = options.linkEl;
    this.extentBounds = this.options.extentBounds;
    // get rid of duplicate information as it is confusing
    delete this.options.zoomBounds;
    delete this.options.extentBounds;

    this._template = template;
    this._initContainer();
    // call the parent constructor with the template tref value, per the
    // Leaflet tutorial: http://leafletjs.com/examples/extending/extending-1-classes.html#methods-of-the-parent-class
    leafletSrcExports.TileLayer.prototype.initialize.call(
      this,
      template.template,
      leafletSrcExports.extend(options, { pane: this.options.pane })
    );
  },
  onAdd: function (map) {
    this.options.pane.appendChild(this._container);
    leafletSrcExports.TileLayer.prototype.onAdd.call(this, map);
    this._handleMoveEnd();
  },

  onRemove: function () {
    leafletSrcExports.DomUtil.remove(this._container);
    // should clean up the container
    for (let child of this._container.children) {
      leafletSrcExports.DomUtil.remove(child);
    }
  },

  getEvents: function () {
    let events = leafletSrcExports.TileLayer.prototype.getEvents.call(this, this._map);
    this._parentOnMoveEnd = events.moveend;
    events.moveend = this._handleMoveEnd;
    return events;
  },

  isVisible: function () {
    let map = this._linkEl.getMapEl()._map;
    let mapZoom = map.getZoom();
    let mapBounds = Util.pixelToPCRSBounds(
      map.getPixelBounds(),
      mapZoom,
      map.options.projection
    );
    return (
      mapZoom <= this.zoomBounds.maxZoom &&
      mapZoom >= this.zoomBounds.minZoom &&
      this.extentBounds.overlaps(mapBounds)
    );
  },

  _initContainer: function () {
    if (this._container) {
      return;
    }

    this._container = leafletSrcExports.DomUtil.create('div', 'leaflet-layer', this.options.pane);
    leafletSrcExports.DomUtil.addClass(this._container, 'mapml-templated-tile-container');
    this._updateZIndex();
  },

  _handleMoveEnd: function (e) {
    if (!this.isVisible()) return;
    this._parentOnMoveEnd();
  },
  createTile: function (coords) {
    let tileGroup = document.createElement('DIV'),
      tileSize = this.getTileSize();
    leafletSrcExports.DomUtil.addClass(tileGroup, 'mapml-tile-group');
    leafletSrcExports.DomUtil.addClass(tileGroup, 'leaflet-tile');

    this._template.linkEl.dispatchEvent(
      new CustomEvent('tileloadstart', {
        detail: {
          x: coords.x,
          y: coords.y,
          zoom: coords.z,
          appendTile: (elem) => {
            tileGroup.appendChild(elem);
          }
        }
      })
    );

    if (this._template.type.startsWith('image/')) {
      let tile = leafletSrcExports.TileLayer.prototype.createTile.call(
        this,
        coords,
        function () {}
      );
      tile.width = tileSize.x;
      tile.height = tileSize.y;
      tileGroup.appendChild(tile);
    } else if (!this._url.includes(M.BLANK_TT_TREF)) {
      // tiles of type="text/mapml" will have to fetch content while creating
      // the tile here, unless there can be a callback associated to the element
      // that will render the content in the alread-placed tile
      // var tile = DomUtil.create('canvas', 'leaflet-tile');
      this._fetchTile(coords, tileGroup);
    }
    return tileGroup;
  },
  _mapmlTileReady: function (tile) {
    leafletSrcExports.DomUtil.addClass(tile, 'leaflet-tile-loaded');
  },
  // instead of being child of a pane, the TemplatedTileLayers are 'owned' by the group,
  // and so are DOM children of the group, not the pane element (the MapLayer is
  // a child of the overlay pane and always has a set of sub-layers)
  getPane: function () {
    return this.options.pane;
  },
  _fetchTile: function (coords, tile) {
    let url = this.getTileUrl(coords);
    if (url) {
      fetch(url, { redirect: 'follow' })
        .then(function (response) {
          if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
          } else {
            console.log(
              'Looks like there was a problem. Status Code: ' + response.status
            );
            return Promise.reject(response);
          }
        })
        .then(function (response) {
          return response.text();
        })
        .then((text) => {
          var parser = new DOMParser();
          return parser.parseFromString(text, 'application/xml');
        })
        .then((mapml) => {
          this._createFeatures(mapml, coords, tile);
          this._mapmlTileReady(tile);
        })
        .catch((err) => {
          console.log('Error creating tile: ' + err);
        });
    }
  },

  // TO DO: get rid of this function altogether; see TO DO below re: map-link
  // shadow root
  // _parseStylesheetAsHTML parses map-link and map-style from mapml and inserts them to the container as HTML
  _parseStylesheetAsHTML: function (mapml, base, container) {
    if (
      !(container instanceof Element) ||
      !mapml ||
      !mapml.querySelector('map-link[rel=stylesheet],map-style')
    )
      return;

    if (base instanceof Element) {
      base = base.getAttribute('href')
        ? base.getAttribute('href')
        : document.URL;
    } else if (!base || base === '' || base instanceof Object) {
      return;
    }

    var ss = [];
    var stylesheets = mapml.querySelectorAll(
      'map-link[rel=stylesheet],map-style'
    );
    for (var i = 0; i < stylesheets.length; i++) {
      if (stylesheets[i].nodeName.toUpperCase() === 'MAP-LINK') {
        var href = stylesheets[i].hasAttribute('href')
          ? new URL(stylesheets[i].getAttribute('href'), base).href
          : null;
        if (href) {
          if (!container.querySelector("link[href='" + href + "']")) {
            var linkElm = document.createElement('link');
            copyAttributes(stylesheets[i], linkElm);
            linkElm.setAttribute('href', href);
            ss.push(linkElm);
          }
        }
      } else {
        // <map-style>
        var styleElm = document.createElement('style');
        copyAttributes(stylesheets[i], styleElm);
        styleElm.textContent = stylesheets[i].textContent;
        ss.push(styleElm);
      }
    }
    // insert <link> or <style> elements after the begining  of the container
    // element, in document order as copied from original mapml document
    // note the code below assumes hrefs have been resolved and elements
    // re-parsed from xml and serialized as html elements ready for insertion
    for (var s = ss.length - 1; s >= 0; s--) {
      container.insertAdjacentElement('afterbegin', ss[s]);
    }
    function copyAttributes(source, target) {
      return Array.from(source.attributes).forEach((attribute) => {
        if (attribute.nodeName !== 'href')
          target.setAttribute(attribute.nodeName, attribute.nodeValue);
      });
    }
  },

  _createFeatures: function (markup, coords, tile) {
    // TO DO: create a shadow root for the <map-link> that hosts this layer,
    // populate it with map-tile, map-link and map-style elements that are
    // fetched.
    let stylesheets = markup.querySelector(
      'map-link[rel=stylesheet],map-style'
    );
    if (stylesheets) {
      let base =
        markup.querySelector('map-base') &&
        markup.querySelector('map-base').hasAttribute('href')
          ? new URL(markup.querySelector('map-base').getAttribute('href')).href
          : markup.URL;
      this._parseStylesheetAsHTML(markup, base, tile);
    }

    let svg = leafletSrcExports.SVG.create('svg'),
      g = leafletSrcExports.SVG.create('g'),
      tileSize = this._map.options.crs.options.crs.tile.bounds.max.x,
      xOffset = coords.x * tileSize,
      yOffset = coords.y * tileSize;

    let tileFeatures = new MapFeatureLayer(null, {
      projection: this._map.options.projection,
      tiles: true,
      layerBounds: this.extentBounds,
      zoomBounds: this.zoomBounds,
      interactive: false,
      mapEl: this._linkEl.getMapEl()
    });
    let fallback = Util.getNativeVariables(markup);
    // log the tiles in case there's more than one - was a dev issue with geoserver
    //    let tiles = markup.querySelectorAll('map-tile');
    //    for (let i = 0; i < tiles.length; i++) {
    //      let row = tiles[i].getAttribute('row'),
    //        col = tiles[i].getAttribute('col'),
    //        z = tiles[i].getAttribute('zoom');
    //      console.log(
    //        'Total tiles for row: ' +
    //          row +
    //          ', col: ' +
    //          col +
    //          ', z: ' +
    //          z +
    //          ': ' +
    //          tiles.length
    //      );
    //    }
    let currentTileSelector =
      '[row="' +
      coords.y +
      '"][col="' +
      coords.x +
      '"][zoom="' +
      coords.z +
      '"]';

    // this should select and process the features and tiles in DOM order
    let featuresOrTiles = markup.querySelectorAll(
      'map-feature:has(> map-geometry),map-tile' + currentTileSelector
    );
    for (let i = 0; i < featuresOrTiles.length; i++) {
      if (featuresOrTiles[i].nodeName === 'map-feature') {
        let feature = tileFeatures.createGeometry(
          featuresOrTiles[i],
          fallback.cs,
          coords.z
        );
        for (let featureID in feature._layers) {
          // layer is an M.Path instance
          let layer = feature._layers[featureID];
          FeatureRenderer.prototype._initPath(layer, false);
          // does something to layer
          layer._project(this._map, leafletSrcExports.point([xOffset, yOffset]), coords.z);
          // appends the guts of layer to g
          FeatureRenderer.prototype._addPath(layer, g, false);
          // updates the guts of layer that have already been appended to g
          FeatureRenderer.prototype._updateFeature(layer);
        }
      } else {
        // render tile as an svg image element
        let tile = featuresOrTiles[i];
        // No need to append to DOM, the browser will cache it
        // observed to be a bit faster than waiting until img is appended to DOM
        const imgObj = new Image();
        imgObj.src = tile.getAttribute('src');
        let img = leafletSrcExports.SVG.create('image');
        img.setAttribute('href', imgObj.src);
        g.appendChild(img);
      }
    }
    svg.setAttribute('width', tileSize.toString());
    svg.setAttribute('height', tileSize.toString());
    svg.appendChild(g);
    tile.appendChild(svg);
  },

  getTileUrl: function (coords) {
    if (
      coords.z >= this._template.tilematrix.bounds.length ||
      !this._template.tilematrix.bounds[coords.z].contains(coords)
    ) {
      return '';
    }
    var obj = {},
      linkEl = this._template.linkEl,
      zoomInput = linkEl.zoomInput;
    obj[this._template.tilematrix.col.name] = coords.x;
    obj[this._template.tilematrix.row.name] = coords.y;
    if (
      zoomInput &&
      linkEl.hasAttribute('tref') &&
      linkEl
        .getAttribute('tref')
        .includes(`{${zoomInput.getAttribute('name')}}`)
    ) {
      obj[this._template.zoom.name] = this._getZoomForUrl();
    }
    obj[this._template.pcrs.easting.left] = this._tileMatrixToPCRSPosition(
      coords,
      'top-left'
    ).x;
    obj[this._template.pcrs.easting.right] = this._tileMatrixToPCRSPosition(
      coords,
      'top-right'
    ).x;
    obj[this._template.pcrs.northing.top] = this._tileMatrixToPCRSPosition(
      coords,
      'top-left'
    ).y;
    obj[this._template.pcrs.northing.bottom] = this._tileMatrixToPCRSPosition(
      coords,
      'bottom-left'
    ).y;
    for (var v in this._template.tile) {
      if (
        ['row', 'col', 'zoom', 'left', 'right', 'top', 'bottom'].indexOf(v) < 0
      ) {
        obj[v] = this._template.tile[v];
      }
    }
    if (this._map && !this._map.options.crs.infinite) {
      let invertedY = this._globalTileRange.max.y - coords.y;
      if (this.options.tms) {
        obj[this._template.tilematrix.row.name] = invertedY;
      }
      //obj[`-${this._template.tilematrix.row.name}`] = invertedY; //leaflet has this but I dont see a use in storing row and -row as it doesnt follow that pattern
    }
    obj.r =
      this.options.detectRetina && leafletSrcExports.Browser.retina && this.options.maxZoom > 0
        ? '@2x'
        : '';
    return leafletSrcExports.Util.template(this._url, obj);
  },
  _tileMatrixToPCRSPosition: function (coords, pos) {
    // this is a tile:
    //
    //   top-left         top-center           top-right
    //      +------------------+------------------+
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      + center-left    center               + center-right
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      +------------------+------------------+
    //   bottom-left     bottom-center      bottom-right

    var map = this._map,
      crs = map.options.crs,
      tileSize = this.getTileSize(),
      nwPoint = coords.scaleBy(tileSize),
      sePoint = nwPoint.add(tileSize),
      centrePoint = nwPoint.add(Math.floor(tileSize / 2)),
      nw = crs.transformation.untransform(nwPoint, crs.scale(coords.z)),
      se = crs.transformation.untransform(sePoint, crs.scale(coords.z)),
      cen = crs.transformation.untransform(centrePoint, crs.scale(coords.z)),
      result = null;

    switch (pos) {
      case 'top-left':
        result = nw;
        break;
      case 'bottom-left':
        result = new leafletSrcExports.Point(nw.x, se.y);
        break;
      case 'center-left':
        result = new leafletSrcExports.Point(nw.x, cen.y);
        break;
      case 'top-right':
        result = new leafletSrcExports.Point(se.x, nw.y);
        break;
      case 'bottom-right':
        result = se;
        break;
      case 'center-right':
        result = new leafletSrcExports.Point(se.x, cen.y);
        break;
      case 'top-center':
        result = new leafletSrcExports.Point(cen.x, nw.y);
        break;
      case 'bottom-center':
        result = new leafletSrcExports.Point(cen.x, se.y);
        break;
      case 'center':
        result = cen;
        break;
    }
    return result;
  },
  _setUpTileTemplateVars: function (template) {
    // process the inputs associated to template and create an object named
    // tile with member properties as follows:
    // {row: 'rowvarname',
    //  col: 'colvarname',
    //  left: 'leftvarname',
    //  right: 'rightvarname',
    //  top: 'topvarname',
    //  bottom: 'bottomvarname'}
    template.tile = {};
    var inputs = template.values,
      crs = this.options.crs.options,
      east,
      north,
      row,
      col;

    for (var i = 0; i < template.values.length; i++) {
      var type = inputs[i].getAttribute('type'),
        units = inputs[i].getAttribute('units'),
        axis = inputs[i].getAttribute('axis'),
        name = inputs[i].getAttribute('name'),
        position = inputs[i].getAttribute('position'),
        select = inputs[i].tagName.toLowerCase() === 'map-select';
        inputs[i].getAttribute('value');
        var min = inputs[i].getAttribute('min'),
        max = inputs[i].getAttribute('max');
      if (type === 'location' && units === 'tilematrix') {
        switch (axis) {
          case 'column':
            col = {
              name: name,
              min: crs.crs.tilematrix.horizontal.min,
              max: crs.crs.tilematrix.horizontal.max(crs.resolutions.length - 1)
            };
            if (!isNaN(Number.parseFloat(min))) {
              col.min = Number.parseFloat(min);
            }
            if (!isNaN(Number.parseFloat(max))) {
              col.max = Number.parseFloat(max);
            }
            break;
          case 'row':
            row = {
              name: name,
              min: crs.crs.tilematrix.vertical.min,
              max: crs.crs.tilematrix.vertical.max(crs.resolutions.length - 1)
            };
            if (!isNaN(Number.parseFloat(min))) {
              row.min = Number.parseFloat(min);
            }
            if (!isNaN(Number.parseFloat(max))) {
              row.max = Number.parseFloat(max);
            }
            break;
          case 'longitude':
          case 'easting':
            if (!east) {
              east = {
                min: crs.crs.pcrs.horizontal.min,
                max: crs.crs.pcrs.horizontal.max
              };
            }
            if (!isNaN(Number.parseFloat(min))) {
              east.min = Number.parseFloat(min);
            }
            if (!isNaN(Number.parseFloat(max))) {
              east.max = Number.parseFloat(max);
            }
            if (position) {
              if (position.match(/.*?-left/i)) {
                east.left = name;
              } else if (position.match(/.*?-right/i)) {
                east.right = name;
              }
            }
            break;
          case 'latitude':
          case 'northing':
            if (!north) {
              north = {
                min: crs.crs.pcrs.vertical.min,
                max: crs.crs.pcrs.vertical.max
              };
            }
            if (!isNaN(Number.parseFloat(min))) {
              north.min = Number.parseFloat(min);
            }
            if (!isNaN(Number.parseFloat(max))) {
              north.max = Number.parseFloat(max);
            }
            if (position) {
              if (position.match(/top-.*?/i)) {
                north.top = name;
              } else if (position.match(/bottom-.*?/i)) {
                north.bottom = name;
              }
            }
            break;
          // unsuportted axis value
        }
      } else if (select) {
        /*jshint -W104 */
        const parsedselect = inputs[i].htmlselect;
        template.tile[name] = function () {
          return parsedselect.value;
        };
      } else if (type === 'hidden') {
        // needs to be a const otherwise it gets overwritten
        /*jshint -W104 */
        const input = inputs[i];
        template.tile[name] = function () {
          return input.getAttribute('value');
        };
      }
    }
    var transformation = this.options.crs.transformation,
      tileSize = this.options.crs.options.crs.tile.bounds.max.x,
      scale = leafletSrcExports.bind(this.options.crs.scale, this.options.crs),
      pcrs2tilematrix = function (c, zoom) {
        return transformation
          .transform(c, scale(zoom))
          .divideBy(tileSize)
          .floor();
      };
    if (east && north) {
      template.pcrs = {};
      template.pcrs.bounds = leafletSrcExports.bounds(
        [east.min, north.min],
        [east.max, north.max]
      );
      template.pcrs.easting = east;
      template.pcrs.northing = north;
    } else if (col && row && !isNaN(template.zoom.initialValue)) {
      // convert the tile bounds at this zoom to a pcrs bounds, then
      // go through the zoom min/max and create a tile-based bounds
      // at each zoom that applies to the col/row values that constrain what tiles
      // will be requested so that we don't generate too many 404s
      if (!template.pcrs) {
        template.pcrs = {};
        template.pcrs.easting = '';
        template.pcrs.northing = '';
      }

      template.pcrs.bounds = Util.boundsToPCRSBounds(
        leafletSrcExports.bounds(leafletSrcExports.point([col.min, row.min]), leafletSrcExports.point([col.max, row.max])),
        template.zoom.initialValue,
        this.options.crs,
        Util.axisToCS('column')
      );

      template.tilematrix = {};
      template.tilematrix.col = col;
      template.tilematrix.row = row;
    }

    if (!template.tilematrix) {
      template.tilematrix = {};
      template.tilematrix.col = {};
      template.tilematrix.row = {};
    }
    template.tilematrix.bounds = [];
    var pcrsBounds = template.pcrs.bounds;
    // the template should _always_ have a zoom, because we force it to
    // by first processing the extent to determine the zoom and if none, adding
    // one and second by copying that zoom into the set of template variable inputs
    // even if it is not referenced by one of the template's variable references
    var zmin = this.options.minNativeZoom,
      zmax = this.options.maxNativeZoom;
    for (var z = 0; z <= zmax; z++) {
      template.tilematrix.bounds[z] =
        z >= zmin
          ? leafletSrcExports.bounds(
              pcrs2tilematrix(pcrsBounds.min, z),
              pcrs2tilematrix(pcrsBounds.max, z)
            )
          : leafletSrcExports.bounds(leafletSrcExports.point([-1, -1]), leafletSrcExports.point([-1, -1]));
    }
  },
  _clampZoom: function (zoom) {
    let clamp = leafletSrcExports.GridLayer.prototype._clampZoom.call(this, zoom);
    if (this._template.step > this.options.maxNativeZoom)
      this._template.step = this.options.maxNativeZoom;

    if (zoom !== clamp) {
      zoom = clamp;
    } else {
      if (zoom % this._template.step !== 0) {
        zoom = Math.floor(zoom / this._template.step) * this._template.step;
      }
    }
    return zoom;
  }
});
var templatedTileLayer = function (template, options) {
  return new TemplatedTileLayer(template, options);
};

/**
 * LayerGroup for managing map-tile and map-feature elements retrieved via
 * <map-link rel="features" tref="..."></map-link>
 *
 * Layers in this layer group will correspond to the following MapML elements
 * retrieved by the template processing:
 *
 * <map-tile row="10" col="12" src="url1"></map-tile>  LayerGroup._layers[0] <- each set of adjacent tiles
 * <map-tile row="11" col="12" src="url2"></map-tile>  LayerGroup._layers[0] <- is a single MapTileLayer
 * <map-feature id="a"> LayerGroup._layers[1] <- each set of adjacent features
 * <map-feature id="b"> LayerGroup._layers[1] <- is a single MapFeatureLayer
 * <map-tile row="10" col="12" src="url3"></map-tile>  LayerGroup._layers[2]
 * <map-tile row="11" col="12" src="url4"></map-tile>  LayerGroup._layers[2]
 * <map-feature id="c"> LayerGroup._layers[3]
 * <map-feature id="d"> LayerGroup._layers[3]
 * etc
 *
 *
 *
 * Extends LayerGroup
 */
var TemplatedFeaturesOrTilesLayer = leafletSrcExports.LayerGroup.extend({
  initialize: function (template, options) {
    leafletSrcExports.LayerGroup.prototype.initialize.call(this, []);
    this._template = template;
    this._container = leafletSrcExports.DomUtil.create('div', 'leaflet-layer');
    leafletSrcExports.DomUtil.addClass(this._container, 'mapml-features-tiles-container');
    this.zoomBounds = options.zoomBounds;
    this.extentBounds = options.extentBounds;
    // get rid of duplicate info, it can be confusing
    delete options.zoomBounds;
    delete options.extentBounds;

    this._linkEl = options.linkEl;
    leafletSrcExports.setOptions(this, leafletSrcExports.extend(options, this._setUpTemplateVars(template)));
  },
  /**
   * @override
   * According to https://leafletjs.com/reference.html#layer-extension-methods
   * every Layer instance should override onAdd, onRemove, getEvents, getAttribution
   * and beforeAdd
   *
   * @param {Map} map - the Leaflet map to which this layer is added
   */
  onAdd: function (map) {
    this._map = map;
    // this causes the layer to actually render...
    this.options.pane.appendChild(this._container);
    this._onMoveEnd(); // load content

    // The parent method adds constituent layers to the map
    leafletSrcExports.LayerGroup.prototype.onAdd.call(this, map);
  },

  onRemove: function (map) {
    // Remove container from DOM, but don't delete it
    leafletSrcExports.DomUtil.remove(this._container);
    // clean up the container
    for (let child of this._container.children) {
      leafletSrcExports.DomUtil.remove(child);
    }

    // Remove each layer from the map, but does not clearLayers
    leafletSrcExports.LayerGroup.prototype.onRemove.call(this, map);
  },
  getContainer: function () {
    return this._container;
  },
  getEvents: function () {
    var events = {
      moveend: this._onMoveEnd
    };
    return events;
  },
  isVisible: function () {
    let map = this._linkEl.getMapEl()._map;
    let mapZoom = map.getZoom();
    let mapBounds = Util.pixelToPCRSBounds(
      map.getPixelBounds(),
      mapZoom,
      map.options.projection
    );
    return (
      mapZoom <= this.zoomBounds.maxZoom &&
      mapZoom >= this.zoomBounds.minZoom &&
      this.extentBounds.overlaps(mapBounds)
    );
  },
  redraw: function () {
    this._onMoveEnd();
  },
  _onMoveEnd: function () {
    let history = this._map.options.mapEl._history;
    let current = history[history.length - 1];
    let previous = history[history.length - 2] ?? current;
    let step = this._template.step;
    let mapZoom = this._map.getZoom();
    let steppedZoom = mapZoom;
    //If zooming out from one step interval into a lower one or panning, set the stepped zoom
    if (
      (step !== '1' &&
        (mapZoom + 1) % step === 0 &&
        current.zoom === previous.zoom - 1) ||
      current.zoom === previous.zoom ||
      Math.floor(mapZoom / step) * step !==
        Math.floor(previous.zoom / step) * step
    ) {
      steppedZoom = Math.floor(mapZoom / step) * step;
    }
    //No request needed if in a step interval (unless panning)
    else if (mapZoom % this._template.step !== 0) return;

    let scaleBounds = this._map.getPixelBounds(
      this._map.getCenter(),
      steppedZoom
    );

    const getUrl = ((zoom, bounds) => {
      if (zoom === undefined) zoom = this._map.getZoom();
      if (bounds === undefined) bounds = this._map.getPixelBounds();
      const _TCRSToPCRS = (coords, zoom) => {
        // TCRS pixel point to Projected CRS point (in meters, presumably)
        var map = this._map,
          crs = map.options.crs,
          loc = crs.transformation.untransform(coords, crs.scale(zoom));
        return loc;
      };
      var obj = {};
      if (this.options.param.zoom) {
        obj[this.options.param.zoom] = zoom;
      }
      if (this.options.param.width) {
        obj[this.options.param.width] = this._map.getSize().x;
      }
      if (this.options.param.height) {
        obj[this.options.param.height] = this._map.getSize().y;
      }
      if (this.options.param.bottom) {
        obj[this.options.param.bottom] = _TCRSToPCRS(bounds.max, zoom).y;
      }
      if (this.options.param.left) {
        obj[this.options.param.left] = _TCRSToPCRS(bounds.min, zoom).x;
      }
      if (this.options.param.top) {
        obj[this.options.param.top] = _TCRSToPCRS(bounds.min, zoom).y;
      }
      if (this.options.param.right) {
        obj[this.options.param.right] = _TCRSToPCRS(bounds.max, zoom).x;
      }
      // hidden and other variables that may be associated
      for (var v in this.options.param) {
        if (
          ['width', 'height', 'left', 'right', 'top', 'bottom', 'zoom'].indexOf(
            v
          ) < 0
        ) {
          obj[v] = this.options.param[v];
        }
      }
      return leafletSrcExports.Util.template(this._template.template, obj);
    }).bind(this);
    var url = getUrl(steppedZoom, scaleBounds);
    this._url = url;

    // do cleaning up for new request
    this.clearLayers();
    // shadow may has not yet attached to <map-extent> for the first-time rendering
    if (this._linkEl.shadowRoot) {
      this._linkEl.shadowRoot.innerHTML = '';
    }
    const removeCSS = (container) => {
      const styleElements = container.querySelectorAll(
        'link[rel=stylesheet],style'
      );
      styleElements.forEach((element) => element.remove());
    };
    removeCSS(this._container);

    //Leave the layers cleared if the layer is not visible
    if (!this.isVisible()) {
      this._url = '';
      return;
    }

    let mapml,
      headers = new Headers({
        Accept: 'text/mapml'
      }),
      linkEl = this._linkEl,
      getMapML = (url) => {
        return fetch(url, { redirect: 'follow', headers: headers })
          .then(function (response) {
            return response.text();
          })
          .then(function (text) {
            let parser = new DOMParser();
            mapml = parser.parseFromString(text, 'application/xml');
            let frag = document.createDocumentFragment();
            const legalContentQuery = `
                map-head > map-link,
                map-body > map-link,
                map-head > map-meta,
                map-body > map-meta,
                map-head > map-style,
                map-body > map-style,
                map-tile,
                map-feature
            `.trim(); // excludes map-extent
            let elements = mapml.querySelectorAll(legalContentQuery);
            for (let i = 0; i < elements.length; i++) {
              frag.appendChild(elements[i]);
            }
            linkEl.shadowRoot.appendChild(frag);
          });
      };
    const map = this._map;
    getMapML(this._url)
      .then(() => {
        // ATTENTION: different approach needed wrt mapml-source due to stencil
        // slowness - templated features are not found by the FeatureIndexOverlay 
        // unless you wait for them to be ready before firing templatedfeatureslayeradd event
        // Wait for all map-feature elements to complete their async setup
        // before firing the event to check feature index overlay
        const features = linkEl.shadowRoot.querySelectorAll('map-feature');
        const featurePromises = Array.from(features).map(feature => {
          // Each feature has a whenReady() that resolves when geometry is added
          return feature.whenReady ? feature.whenReady() : Promise.resolve();
        });
        
        Promise.all(featurePromises).then(() => {
          //Fires event for feature index overlay to check overlaps
          map.fire('templatedfeatureslayeradd');
        });
        
        this.eachLayer(function (layer) {
          if (layer._path) {
            if (layer._path.getAttribute('d') !== 'M0 0') {
              layer._path.setAttribute('tabindex', 0);
            } else {
              layer._path.removeAttribute('tabindex');
            }
            if (layer._path.childElementCount === 0) {
              let title = document.createElement('title');
              title.innerText = this._linkEl.getMapEl().locale.dfFeatureCaption;
              layer._path.appendChild(title);
            }
          }
        }, this);
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  _setUpTemplateVars: function (template) {
    // process the inputs and create an object named "param"
    // with member properties as follows:
    // {width: {name: 'widthvarname'}, // value supplied by map if necessary
    //  height: {name: 'heightvarname'}, // value supplied by map if necessary
    //  left: {name: 'leftvarname', axis: 'leftaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
    //  right: {name: 'rightvarname', axis: 'rightaxisname'}, // axis name (coordinate system of) drives the value supplied by the map
    //  top: {name: 'topvarname', axis: 'topaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
    //  bottom: {name: 'bottomvarname', axis: 'bottomaxisname'} // axis name drives (coordinate system of) the value supplied by the map
    //  zoom: {name: 'zoomvarname'}
    //  hidden: [{name: name, value: value}]}

    var templateVarNames = { param: {} },
      inputs = template.values;
    templateVarNames.param.hidden = [];
    for (var i = 0; i < inputs.length; i++) {
      // this can be removed when the spec removes the deprecated inputs...
      var type = inputs[i].getAttribute('type'),
        units = inputs[i].getAttribute('units'),
        axis = inputs[i].getAttribute('axis'),
        name = inputs[i].getAttribute('name'),
        position = inputs[i].getAttribute('position');
        inputs[i].getAttribute('value');
        var select = inputs[i].tagName.toLowerCase() === 'map-select';
      if (type === 'width') {
        templateVarNames.param.width = name;
      } else if (type === 'height') {
        templateVarNames.param.height = name;
      } else if (type === 'zoom') {
        templateVarNames.param.zoom = name;
      } else if (
        type === 'location' &&
        (units === 'pcrs' || units === 'gcrs')
      ) {
        //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting">
        switch (axis) {
          case 'x':
          case 'longitude':
          case 'easting':
            if (position) {
              if (position.match(/.*?-left/i)) {
                templateVarNames.param.left = name;
              } else if (position.match(/.*?-right/i)) {
                templateVarNames.param.right = name;
              }
            }
            break;
          case 'y':
          case 'latitude':
          case 'northing':
            if (position) {
              if (position.match(/top-.*?/i)) {
                templateVarNames.param.top = name;
              } else if (position.match(/bottom-.*?/i)) {
                templateVarNames.param.bottom = name;
              }
            }
            break;
        }
      } else if (select) {
        /*jshint -W104 */
        const parsedselect = inputs[i].htmlselect;
        templateVarNames.param[name] = function () {
          return parsedselect.value;
        };
        // projection is deprecated, make it hidden
      } else {
        /*jshint -W104 */
        const input = inputs[i];
        templateVarNames.param[name] = function () {
          return input.getAttribute('value');
        };
      }
    }
    return templateVarNames;
  },
  renderStyles
});

var templatedFeaturesOrTilesLayer = function (template, options) {
  return new TemplatedFeaturesOrTilesLayer(template, options);
};

/**
 * A standalone point geometry with useful accessor, comparison, and
 * modification methods.
 *
 * @class
 * @param {number} x the x-coordinate. This could be longitude or screen pixels, or any other sort of unit.
 * @param {number} y the y-coordinate. This could be latitude or screen pixels, or any other sort of unit.
 *
 * @example
 * const point = new Point(-77, 38);
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone() { return new Point(this.x, this.y); },

    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add(p) { return this.clone()._add(p); },

    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub(p) { return this.clone()._sub(p); },

    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint(p) { return this.clone()._multByPoint(p); },

    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint(p) { return this.clone()._divByPoint(p); },

    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {number} k factor
     * @return {Point} output point
     */
    mult(k) { return this.clone()._mult(k); },

    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {number} k factor
     * @return {Point} output point
     */
    div(k) { return this.clone()._div(k); },

    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate(a) { return this.clone()._rotate(a); },

    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround(a, p) { return this.clone()._rotateAround(a, p); },

    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {[number, number, number, number]} m transformation matrix
     * @return {Point} output point
     */
    matMult(m) { return this.clone()._matMult(m); },

    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit() { return this.clone()._unit(); },

    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp() { return this.clone()._perp(); },

    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round() { return this.clone()._round(); },

    /**
     * Return the magnitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {number} magnitude
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals(other) {
        return this.x === other.x &&
               this.y === other.y;
    },

    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {number} distance
     */
    dist(p) {
        return Math.sqrt(this.distSqr(p));
    },

    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {number} distance
     */
    distSqr(p) {
        const dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {number} angle
     */
    angle() {
        return Math.atan2(this.y, this.x);
    },

    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {number} angle
     */
    angleTo(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {number} angle
     */
    angleWith(b) {
        return this.angleWithSep(b.x, b.y);
    },

    /**
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {number} x the x-coordinate
     * @param {number} y the y-coordinate
     * @return {number} the angle in radians
     */
    angleWithSep(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    /** @param {[number, number, number, number]} m */
    _matMult(m) {
        const x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    /** @param {Point} p */
    _add(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    /** @param {Point} p */
    _sub(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    /** @param {number} k */
    _mult(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    /** @param {number} k */
    _div(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    /** @param {Point} p */
    _multByPoint(p) {
        this.x *= p.x;
        this.y *= p.y;
        return this;
    },

    /** @param {Point} p */
    _divByPoint(p) {
        this.x /= p.x;
        this.y /= p.y;
        return this;
    },

    _unit() {
        this._div(this.mag());
        return this;
    },

    _perp() {
        const y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    /** @param {number} angle */
    _rotate(angle) {
        const cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    /**
     * @param {number} angle
     * @param {Point} p
     */
    _rotateAround(angle, p) {
        const cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
            y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
        this.x = x;
        this.y = y;
        return this;
    },

    _round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    },

    constructor: Point
};

/**
 * Construct a point from an array if necessary, otherwise if the input
 * is already a Point, return it unchanged.
 * @param {Point | [number, number] | {x: number, y: number}} p input value
 * @return {Point} constructed point.
 * @example
 * // this
 * var point = Point.convert([0, 1]);
 * // is equivalent to
 * var point = new Point(0, 1);
 */
Point.convert = function (p) {
    if (p instanceof Point) {
        return /** @type {Point} */ (p);
    }
    if (Array.isArray(p)) {
        return new Point(+p[0], +p[1]);
    }
    if (p.x !== undefined && p.y !== undefined) {
        return new Point(+p.x, +p.y);
    }
    throw new Error('Expected [x, y] or {x, y} point format');
};

/**
 * A simple guard function:
 *
 * ```js
 * Math.min(Math.max(low, value), high)
 * ```
 */
function guard(low, high, value) {
  return Math.min(Math.max(low, value), high);
}

class ColorError extends Error {
  constructor(color) {
    super(`Failed to parse color: "${color}"`);
  }
}
var ColorError$1 = ColorError;

/**
 * Parses a color into red, gree, blue, alpha parts
 *
 * @param color the input color. Can be a RGB, RBGA, HSL, HSLA, or named color
 */
function parseToRgba(color) {
  if (typeof color !== 'string') throw new ColorError$1(color);
  if (color.trim().toLowerCase() === 'transparent') return [0, 0, 0, 0];
  let normalizedColor = color.trim();
  normalizedColor = namedColorRegex.test(color) ? nameToHex(color) : color;
  const reducedHexMatch = reducedHexRegex.exec(normalizedColor);
  if (reducedHexMatch) {
    const arr = Array.from(reducedHexMatch).slice(1);
    return [...arr.slice(0, 3).map(x => parseInt(r(x, 2), 16)), parseInt(r(arr[3] || 'f', 2), 16) / 255];
  }
  const hexMatch = hexRegex.exec(normalizedColor);
  if (hexMatch) {
    const arr = Array.from(hexMatch).slice(1);
    return [...arr.slice(0, 3).map(x => parseInt(x, 16)), parseInt(arr[3] || 'ff', 16) / 255];
  }
  const rgbaMatch = rgbaRegex.exec(normalizedColor);
  if (rgbaMatch) {
    const arr = Array.from(rgbaMatch).slice(1);
    return [...arr.slice(0, 3).map(x => parseInt(x, 10)), parseFloat(arr[3] || '1')];
  }
  const hslaMatch = hslaRegex.exec(normalizedColor);
  if (hslaMatch) {
    const [h, s, l, a] = Array.from(hslaMatch).slice(1).map(parseFloat);
    if (guard(0, 100, s) !== s) throw new ColorError$1(color);
    if (guard(0, 100, l) !== l) throw new ColorError$1(color);
    return [...hslToRgb(h, s, l), Number.isNaN(a) ? 1 : a];
  }
  throw new ColorError$1(color);
}
function hash(str) {
  let hash = 5381;
  let i = str.length;
  while (i) {
    hash = hash * 33 ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return (hash >>> 0) % 2341;
}
const colorToInt = x => parseInt(x.replace(/_/g, ''), 36);
const compressedColorMap = '1q29ehhb 1n09sgk7 1kl1ekf_ _yl4zsno 16z9eiv3 1p29lhp8 _bd9zg04 17u0____ _iw9zhe5 _to73___ _r45e31e _7l6g016 _jh8ouiv _zn3qba8 1jy4zshs 11u87k0u 1ro9yvyo 1aj3xael 1gz9zjz0 _3w8l4xo 1bf1ekf_ _ke3v___ _4rrkb__ 13j776yz _646mbhl _nrjr4__ _le6mbhl 1n37ehkb _m75f91n _qj3bzfz 1939yygw 11i5z6x8 _1k5f8xs 1509441m 15t5lwgf _ae2th1n _tg1ugcv 1lp1ugcv 16e14up_ _h55rw7n _ny9yavn _7a11xb_ 1ih442g9 _pv442g9 1mv16xof 14e6y7tu 1oo9zkds 17d1cisi _4v9y70f _y98m8kc 1019pq0v 12o9zda8 _348j4f4 1et50i2o _8epa8__ _ts6senj 1o350i2o 1mi9eiuo 1259yrp0 1ln80gnw _632xcoy 1cn9zldc _f29edu4 1n490c8q _9f9ziet 1b94vk74 _m49zkct 1kz6s73a 1eu9dtog _q58s1rz 1dy9sjiq __u89jo3 _aj5nkwg _ld89jo3 13h9z6wx _qa9z2ii _l119xgq _bs5arju 1hj4nwk9 1qt4nwk9 1ge6wau6 14j9zlcw 11p1edc_ _ms1zcxe _439shk6 _jt9y70f _754zsow 1la40eju _oq5p___ _x279qkz 1fa5r3rv _yd2d9ip _424tcku _8y1di2_ _zi2uabw _yy7rn9h 12yz980_ __39ljp6 1b59zg0x _n39zfzp 1fy9zest _b33k___ _hp9wq92 1il50hz4 _io472ub _lj9z3eo 19z9ykg0 _8t8iu3a 12b9bl4a 1ak5yw0o _896v4ku _tb8k8lv _s59zi6t _c09ze0p 1lg80oqn 1id9z8wb _238nba5 1kq6wgdi _154zssg _tn3zk49 _da9y6tc 1sg7cv4f _r12jvtt 1gq5fmkz 1cs9rvci _lp9jn1c _xw1tdnb 13f9zje6 16f6973h _vo7ir40 _bt5arjf _rc45e4t _hr4e100 10v4e100 _hc9zke2 _w91egv_ _sj2r1kk 13c87yx8 _vqpds__ _ni8ggk8 _tj9yqfb 1ia2j4r4 _7x9b10u 1fc9ld4j 1eq9zldr _5j9lhpx _ez9zl6o _md61fzm'.split(' ').reduce((acc, next) => {
  const key = colorToInt(next.substring(0, 3));
  const hex = colorToInt(next.substring(3)).toString(16);

  // NOTE: padStart could be used here but it breaks Node 6 compat
  // https://github.com/ricokahler/color2k/issues/351
  let prefix = '';
  for (let i = 0; i < 6 - hex.length; i++) {
    prefix += '0';
  }
  acc[key] = `${prefix}${hex}`;
  return acc;
}, {});

/**
 * Checks if a string is a CSS named color and returns its equivalent hex value, otherwise returns the original color.
 */
function nameToHex(color) {
  const normalizedColorName = color.toLowerCase().trim();
  const result = compressedColorMap[hash(normalizedColorName)];
  if (!result) throw new ColorError$1(color);
  return `#${result}`;
}
const r = (str, amount) => Array.from(Array(amount)).map(() => str).join('');
const reducedHexRegex = new RegExp(`^#${r('([a-f0-9])', 3)}([a-f0-9])?$`, 'i');
const hexRegex = new RegExp(`^#${r('([a-f0-9]{2})', 3)}([a-f0-9]{2})?$`, 'i');
const rgbaRegex = new RegExp(`^rgba?\\(\\s*(\\d+)\\s*${r(',\\s*(\\d+)\\s*', 2)}(?:,\\s*([\\d.]+))?\\s*\\)$`, 'i');
const hslaRegex = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i;
const namedColorRegex = /^[a-z]+$/i;
const roundColor = color => {
  return Math.round(color * 255);
};
const hslToRgb = (hue, saturation, lightness) => {
  let l = lightness / 100;
  if (saturation === 0) {
    // achromatic
    return [l, l, l].map(roundColor);
  }

  // formulae from https://en.wikipedia.org/wiki/HSL_and_HSV
  const huePrime = (hue % 360 + 360) % 360 / 60;
  const chroma = (1 - Math.abs(2 * l - 1)) * (saturation / 100);
  const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
  let red = 0;
  let green = 0;
  let blue = 0;
  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = secondComponent;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = secondComponent;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = secondComponent;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = secondComponent;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = secondComponent;
    blue = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    red = chroma;
    blue = secondComponent;
  }
  const lightnessModification = l - chroma / 2;
  const finalRed = red + lightnessModification;
  const finalGreen = green + lightnessModification;
  const finalBlue = blue + lightnessModification;
  return [finalRed, finalGreen, finalBlue].map(roundColor);
};

/**
 * Takes in rgba parts and returns an rgba string
 *
 * @param red The amount of red in the red channel, given in a number between 0 and 255 inclusive
 * @param green The amount of green in the red channel, given in a number between 0 and 255 inclusive
 * @param blue The amount of blue in the red channel, given in a number between 0 and 255 inclusive
 * @param alpha Percentage of opacity, given as a decimal between 0 and 1
 */
function rgba(red, green, blue, alpha) {
  return `rgba(${guard(0, 255, red).toFixed()}, ${guard(0, 255, green).toFixed()}, ${guard(0, 255, blue).toFixed()}, ${parseFloat(guard(0, 1, alpha).toFixed(3))})`;
}

/**
 * Mixes two colors together. Taken from sass's implementation.
 */
function mix(color1, color2, weight) {
  const normalize = (n, index) =>
  // 3rd index is alpha channel which is already normalized
  index === 3 ? n : n / 255;
  const [r1, g1, b1, a1] = parseToRgba(color1).map(normalize);
  const [r2, g2, b2, a2] = parseToRgba(color2).map(normalize);

  // The formula is copied from the original Sass implementation:
  // http://sass-lang.com/documentation/Sass/Script/Functions.html#mix-instance_method
  const alphaDelta = a2 - a1;
  const normalizedWeight = weight * 2 - 1;
  const combinedWeight = normalizedWeight * alphaDelta === -1 ? normalizedWeight : normalizedWeight + alphaDelta / (1 + normalizedWeight * alphaDelta);
  const weight2 = (combinedWeight + 1) / 2;
  const weight1 = 1 - weight2;
  const r = (r1 * weight1 + r2 * weight2) * 255;
  const g = (g1 * weight1 + g2 * weight2) * 255;
  const b = (b1 * weight1 + b2 * weight2) * 255;
  const a = a2 * weight + a1 * (1 - weight);
  return rgba(r, g, b, a);
}

/** @import Pbf from 'pbf' */
/** @import {Feature} from 'geojson' */

class VectorTileFeature {
    /**
     * @param {Pbf} pbf
     * @param {number} end
     * @param {number} extent
     * @param {string[]} keys
     * @param {(number | string | boolean)[]} values
     */
    constructor(pbf, end, extent, keys, values) {
        // Public

        /** @type {Record<string, number | string | boolean>} */
        this.properties = {};

        this.extent = extent;
        /** @type {0 | 1 | 2 | 3} */
        this.type = 0;

        /** @type {number | undefined} */
        this.id = undefined;

        /** @private */
        this._pbf = pbf;
        /** @private */
        this._geometry = -1;
        /** @private */
        this._keys = keys;
        /** @private */
        this._values = values;

        pbf.readFields(readFeature, this, end);
    }

    loadGeometry() {
        const pbf = this._pbf;
        pbf.pos = this._geometry;

        const end = pbf.readVarint() + pbf.pos;

        /** @type Point[][] */
        const lines = [];

        /** @type Point[] | undefined */
        let line;

        let cmd = 1;
        let length = 0;
        let x = 0;
        let y = 0;

        while (pbf.pos < end) {
            if (length <= 0) {
                const cmdLen = pbf.readVarint();
                cmd = cmdLen & 0x7;
                length = cmdLen >> 3;
            }

            length--;

            if (cmd === 1 || cmd === 2) {
                x += pbf.readSVarint();
                y += pbf.readSVarint();

                if (cmd === 1) { // moveTo
                    if (line) lines.push(line);
                    line = [];
                }

                if (line) line.push(new Point(x, y));

            } else if (cmd === 7) {

                // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
                if (line) {
                    line.push(line[0].clone()); // closePolygon
                }

            } else {
                throw new Error(`unknown command ${cmd}`);
            }
        }

        if (line) lines.push(line);

        return lines;
    }

    bbox() {
        const pbf = this._pbf;
        pbf.pos = this._geometry;

        const end = pbf.readVarint() + pbf.pos;
        let cmd = 1,
            length = 0,
            x = 0,
            y = 0,
            x1 = Infinity,
            x2 = -Infinity,
            y1 = Infinity,
            y2 = -Infinity;

        while (pbf.pos < end) {
            if (length <= 0) {
                const cmdLen = pbf.readVarint();
                cmd = cmdLen & 0x7;
                length = cmdLen >> 3;
            }

            length--;

            if (cmd === 1 || cmd === 2) {
                x += pbf.readSVarint();
                y += pbf.readSVarint();
                if (x < x1) x1 = x;
                if (x > x2) x2 = x;
                if (y < y1) y1 = y;
                if (y > y2) y2 = y;

            } else if (cmd !== 7) {
                throw new Error(`unknown command ${cmd}`);
            }
        }

        return [x1, y1, x2, y2];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {Feature}
     */
    toGeoJSON(x, y, z) {
        const size = this.extent * Math.pow(2, z),
            x0 = this.extent * x,
            y0 = this.extent * y,
            vtCoords = this.loadGeometry();

        /** @param {Point} p */
        function projectPoint(p) {
            return [
                (p.x + x0) * 360 / size - 180,
                360 / Math.PI * Math.atan(Math.exp((1 - (p.y + y0) * 2 / size) * Math.PI)) - 90
            ];
        }

        /** @param {Point[]} line */
        function projectLine(line) {
            return line.map(projectPoint);
        }

        /** @type {Feature["geometry"]} */
        let geometry;

        if (this.type === 1) {
            const points = [];
            for (const line of vtCoords) {
                points.push(line[0]);
            }
            const coordinates = projectLine(points);
            geometry = points.length === 1 ?
                {type: 'Point', coordinates: coordinates[0]} :
                {type: 'MultiPoint', coordinates};

        } else if (this.type === 2) {

            const coordinates = vtCoords.map(projectLine);
            geometry = coordinates.length === 1 ?
                {type: 'LineString', coordinates: coordinates[0]} :
                {type: 'MultiLineString', coordinates};

        } else if (this.type === 3) {
            const polygons = classifyRings(vtCoords);
            const coordinates = [];
            for (const polygon of polygons) {
                coordinates.push(polygon.map(projectLine));
            }
            geometry = coordinates.length === 1 ?
                {type: 'Polygon', coordinates: coordinates[0]} :
                {type: 'MultiPolygon', coordinates};
        } else {

            throw new Error('unknown feature type');
        }

        /** @type {Feature} */
        const result = {
            type: 'Feature',
            geometry,
            properties: this.properties
        };

        if (this.id != null) {
            result.id = this.id;
        }

        return result;
    }
}

/** @type {['Unknown', 'Point', 'LineString', 'Polygon']} */
VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

/**
 * @param {number} tag
 * @param {VectorTileFeature} feature
 * @param {Pbf} pbf
 */
function readFeature(tag, feature, pbf) {
    if (tag === 1) feature.id = pbf.readVarint();
    else if (tag === 2) readTag(pbf, feature);
    else if (tag === 3) feature.type = /** @type {0 | 1 | 2 | 3} */ (pbf.readVarint());
    // @ts-expect-error TS2341 deliberately accessing a private property
    else if (tag === 4) feature._geometry = pbf.pos;
}

/**
 * @param {Pbf} pbf
 * @param {VectorTileFeature} feature
 */
function readTag(pbf, feature) {
    const end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        // @ts-expect-error TS2341 deliberately accessing a private property
        const key = feature._keys[pbf.readVarint()];
        // @ts-expect-error TS2341 deliberately accessing a private property
        const value = feature._values[pbf.readVarint()];
        feature.properties[key] = value;
    }
}

/** classifies an array of rings into polygons with outer rings and holes
 * @param {Point[][]} rings
 */
function classifyRings(rings) {
    const len = rings.length;

    if (len <= 1) return [rings];

    const polygons = [];
    let polygon, ccw;

    for (let i = 0; i < len; i++) {
        const area = signedArea(rings[i]);
        if (area === 0) continue;

        if (ccw === undefined) ccw = area < 0;

        if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];

        } else if (polygon) {
            polygon.push(rings[i]);
        }
    }
    if (polygon) polygons.push(polygon);

    return polygons;
}

/** @param {Point[]} ring */
function signedArea(ring) {
    let sum = 0;
    for (let i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}

class VectorTileLayer {
    /**
     * @param {Pbf} pbf
     * @param {number} [end]
     */
    constructor(pbf, end) {
        // Public
        this.version = 1;
        this.name = '';
        this.extent = 4096;
        this.length = 0;

        /** @private */
        this._pbf = pbf;

        /** @private
         * @type {string[]} */
        this._keys = [];

        /** @private
         * @type {(number | string | boolean)[]} */
        this._values = [];

        /** @private
         * @type {number[]} */
        this._features = [];

        pbf.readFields(readLayer, this, end);

        this.length = this._features.length;
    }

    /** return feature `i` from this layer as a `VectorTileFeature`
     * @param {number} i
     */
    feature(i) {
        if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

        this._pbf.pos = this._features[i];

        const end = this._pbf.readVarint() + this._pbf.pos;
        return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
    }
}

/**
 * @param {number} tag
 * @param {VectorTileLayer} layer
 * @param {Pbf} pbf
 */
function readLayer(tag, layer, pbf) {
    if (tag === 15) layer.version = pbf.readVarint();
    else if (tag === 1) layer.name = pbf.readString();
    else if (tag === 5) layer.extent = pbf.readVarint();
    // @ts-expect-error TS2341 deliberately accessing a private property
    else if (tag === 2) layer._features.push(pbf.pos);
    // @ts-expect-error TS2341 deliberately accessing a private property
    else if (tag === 3) layer._keys.push(pbf.readString());
    // @ts-expect-error TS2341 deliberately accessing a private property
    else if (tag === 4) layer._values.push(readValueMessage(pbf));
}

/**
 * @param {Pbf} pbf
 */
function readValueMessage(pbf) {
    let value = null;
    const end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        const tag = pbf.readVarint() >> 3;

        value = tag === 1 ? pbf.readString() :
            tag === 2 ? pbf.readFloat() :
            tag === 3 ? pbf.readDouble() :
            tag === 4 ? pbf.readVarint64() :
            tag === 5 ? pbf.readVarint() :
            tag === 6 ? pbf.readSVarint() :
            tag === 7 ? pbf.readBoolean() : null;
    }
    if (value == null) {
        throw new Error('unknown feature value');
    }

    return value;
}

class VectorTile {
    /**
     * @param {Pbf} pbf
     * @param {number} [end]
     */
    constructor(pbf, end) {
        /** @type {Record<string, VectorTileLayer>} */
        this.layers = pbf.readFields(readTile, {}, end);
    }
}

/**
 * @param {number} tag
 * @param {Record<string, VectorTileLayer>} layers
 * @param {Pbf} pbf
 */
function readTile(tag, layers, pbf) {
    if (tag === 3) {
        const layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
        if (layer.length) layers[layer.name] = layer;
    }
}

const SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

// Threshold chosen based on both benchmarking and knowledge about browser string
// data structures (which currently switch structure types at 12 bytes or more)
const TEXT_DECODER_MIN_LENGTH = 12;
const utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8');

const PBF_VARINT  = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
const PBF_FIXED64 = 1; // 64-bit: double, fixed64, sfixed64
const PBF_BYTES   = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
const PBF_FIXED32 = 5; // 32-bit: float, fixed32, sfixed32

class Pbf {
    /**
     * @param {Uint8Array | ArrayBuffer} [buf]
     */
    constructor(buf = new Uint8Array(16)) {
        this.buf = ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf);
        this.dataView = new DataView(this.buf.buffer);
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length;
    }

    // === READING =================================================================

    /**
     * @template T
     * @param {(tag: number, result: T, pbf: Pbf) => void} readField
     * @param {T} result
     * @param {number} [end]
     */
    readFields(readField, result, end = this.length) {
        while (this.pos < end) {
            const val = this.readVarint(),
                tag = val >> 3,
                startPos = this.pos;

            this.type = val & 0x7;
            readField(tag, result, this);

            if (this.pos === startPos) this.skip(val);
        }
        return result;
    }

    /**
     * @template T
     * @param {(tag: number, result: T, pbf: Pbf) => void} readField
     * @param {T} result
     */
    readMessage(readField, result) {
        return this.readFields(readField, result, this.readVarint() + this.pos);
    }

    readFixed32() {
        const val = this.dataView.getUint32(this.pos, true);
        this.pos += 4;
        return val;
    }

    readSFixed32() {
        const val = this.dataView.getInt32(this.pos, true);
        this.pos += 4;
        return val;
    }

    // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

    readFixed64() {
        const val = this.dataView.getUint32(this.pos, true) + this.dataView.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    }

    readSFixed64() {
        const val = this.dataView.getUint32(this.pos, true) + this.dataView.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    }

    readFloat() {
        const val = this.dataView.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
    }

    readDouble() {
        const val = this.dataView.getFloat64(this.pos, true);
        this.pos += 8;
        return val;
    }

    /**
     * @param {boolean} [isSigned]
     */
    readVarint(isSigned) {
        const buf = this.buf;
        let val, b;

        b = buf[this.pos++]; val  =  b & 0x7f;        if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 7;  if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 14; if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 21; if (b < 0x80) return val;
        b = buf[this.pos];   val |= (b & 0x0f) << 28;

        return readVarintRemainder(val, isSigned, this);
    }

    readVarint64() { // for compatibility with v2.0.1
        return this.readVarint(true);
    }

    readSVarint() {
        const num = this.readVarint();
        return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
    }

    readBoolean() {
        return Boolean(this.readVarint());
    }

    readString() {
        const end = this.readVarint() + this.pos;
        const pos = this.pos;
        this.pos = end;

        if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
            // longer strings are fast with the built-in browser TextDecoder API
            return utf8TextDecoder.decode(this.buf.subarray(pos, end));
        }
        // short strings are fast with our custom implementation
        return readUtf8(this.buf, pos, end);
    }

    readBytes() {
        const end = this.readVarint() + this.pos,
            buffer = this.buf.subarray(this.pos, end);
        this.pos = end;
        return buffer;
    }

    // verbose for performance reasons; doesn't affect gzipped size

    /**
     * @param {number[]} [arr]
     * @param {boolean} [isSigned]
     */
    readPackedVarint(arr = [], isSigned) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readVarint(isSigned));
        return arr;
    }
    /** @param {number[]} [arr] */
    readPackedSVarint(arr = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readSVarint());
        return arr;
    }
    /** @param {boolean[]} [arr] */
    readPackedBoolean(arr = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readBoolean());
        return arr;
    }
    /** @param {number[]} [arr] */
    readPackedFloat(arr = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readFloat());
        return arr;
    }
    /** @param {number[]} [arr] */
    readPackedDouble(arr = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readDouble());
        return arr;
    }
    /** @param {number[]} [arr] */
    readPackedFixed32(arr = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readFixed32());
        return arr;
    }
    /** @param {number[]} [arr] */
    readPackedSFixed32(arr = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readSFixed32());
        return arr;
    }
    /** @param {number[]} [arr] */
    readPackedFixed64(arr = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readFixed64());
        return arr;
    }
    /** @param {number[]} [arr] */
    readPackedSFixed64(arr = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) arr.push(this.readSFixed64());
        return arr;
    }
    readPackedEnd() {
        return this.type === PBF_BYTES ? this.readVarint() + this.pos : this.pos + 1;
    }

    /** @param {number} val */
    skip(val) {
        const type = val & 0x7;
        if (type === PBF_VARINT) while (this.buf[this.pos++] > 0x7f) {}
        else if (type === PBF_BYTES) this.pos = this.readVarint() + this.pos;
        else if (type === PBF_FIXED32) this.pos += 4;
        else if (type === PBF_FIXED64) this.pos += 8;
        else throw new Error(`Unimplemented type: ${type}`);
    }

    // === WRITING =================================================================

    /**
     * @param {number} tag
     * @param {number} type
     */
    writeTag(tag, type) {
        this.writeVarint((tag << 3) | type);
    }

    /** @param {number} min */
    realloc(min) {
        let length = this.length || 16;

        while (length < this.pos + min) length *= 2;

        if (length !== this.length) {
            const buf = new Uint8Array(length);
            buf.set(this.buf);
            this.buf = buf;
            this.dataView = new DataView(buf.buffer);
            this.length = length;
        }
    }

    finish() {
        this.length = this.pos;
        this.pos = 0;
        return this.buf.subarray(0, this.length);
    }

    /** @param {number} val */
    writeFixed32(val) {
        this.realloc(4);
        this.dataView.setInt32(this.pos, val, true);
        this.pos += 4;
    }

    /** @param {number} val */
    writeSFixed32(val) {
        this.realloc(4);
        this.dataView.setInt32(this.pos, val, true);
        this.pos += 4;
    }

    /** @param {number} val */
    writeFixed64(val) {
        this.realloc(8);
        this.dataView.setInt32(this.pos, val & -1, true);
        this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
        this.pos += 8;
    }

    /** @param {number} val */
    writeSFixed64(val) {
        this.realloc(8);
        this.dataView.setInt32(this.pos, val & -1, true);
        this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
        this.pos += 8;
    }

    /** @param {number} val */
    writeVarint(val) {
        val = +val || 0;

        if (val > 0xfffffff || val < 0) {
            writeBigVarint(val, this);
            return;
        }

        this.realloc(4);

        this.buf[this.pos++] =           val & 0x7f  | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] =   (val >>> 7) & 0x7f;
    }

    /** @param {number} val */
    writeSVarint(val) {
        this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
    }

    /** @param {boolean} val */
    writeBoolean(val) {
        this.writeVarint(+val);
    }

    /** @param {string} str */
    writeString(str) {
        str = String(str);
        this.realloc(str.length * 4);

        this.pos++; // reserve 1 byte for short string length

        const startPos = this.pos;
        // write the string directly to the buffer and see how much was written
        this.pos = writeUtf8(this.buf, str, this.pos);
        const len = this.pos - startPos;

        if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    }

    /** @param {number} val */
    writeFloat(val) {
        this.realloc(4);
        this.dataView.setFloat32(this.pos, val, true);
        this.pos += 4;
    }

    /** @param {number} val */
    writeDouble(val) {
        this.realloc(8);
        this.dataView.setFloat64(this.pos, val, true);
        this.pos += 8;
    }

    /** @param {Uint8Array} buffer */
    writeBytes(buffer) {
        const len = buffer.length;
        this.writeVarint(len);
        this.realloc(len);
        for (let i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
    }

    /**
     * @template T
     * @param {(obj: T, pbf: Pbf) => void} fn
     * @param {T} obj
     */
    writeRawMessage(fn, obj) {
        this.pos++; // reserve 1 byte for short message length

        // write the message directly to the buffer and see how much was written
        const startPos = this.pos;
        fn(obj, this);
        const len = this.pos - startPos;

        if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    }

    /**
     * @template T
     * @param {number} tag
     * @param {(obj: T, pbf: Pbf) => void} fn
     * @param {T} obj
     */
    writeMessage(tag, fn, obj) {
        this.writeTag(tag, PBF_BYTES);
        this.writeRawMessage(fn, obj);
    }

    /**
     * @param {number} tag
     * @param {number[]} arr
     */
    writePackedVarint(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedVarint, arr);
    }
    /**
     * @param {number} tag
     * @param {number[]} arr
     */
    writePackedSVarint(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);
    }
    /**
     * @param {number} tag
     * @param {boolean[]} arr
     */
    writePackedBoolean(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);
    }
    /**
     * @param {number} tag
     * @param {number[]} arr
     */
    writePackedFloat(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedFloat, arr);
    }
    /**
     * @param {number} tag
     * @param {number[]} arr
     */
    writePackedDouble(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedDouble, arr);
    }
    /**
     * @param {number} tag
     * @param {number[]} arr
     */
    writePackedFixed32(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);
    }
    /**
     * @param {number} tag
     * @param {number[]} arr
     */
    writePackedSFixed32(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr);
    }
    /**
     * @param {number} tag
     * @param {number[]} arr
     */
    writePackedFixed64(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);
    }
    /**
     * @param {number} tag
     * @param {number[]} arr
     */
    writePackedSFixed64(tag, arr) {
        if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr);
    }

    /**
     * @param {number} tag
     * @param {Uint8Array} buffer
     */
    writeBytesField(tag, buffer) {
        this.writeTag(tag, PBF_BYTES);
        this.writeBytes(buffer);
    }
    /**
     * @param {number} tag
     * @param {number} val
     */
    writeFixed32Field(tag, val) {
        this.writeTag(tag, PBF_FIXED32);
        this.writeFixed32(val);
    }
    /**
     * @param {number} tag
     * @param {number} val
     */
    writeSFixed32Field(tag, val) {
        this.writeTag(tag, PBF_FIXED32);
        this.writeSFixed32(val);
    }
    /**
     * @param {number} tag
     * @param {number} val
     */
    writeFixed64Field(tag, val) {
        this.writeTag(tag, PBF_FIXED64);
        this.writeFixed64(val);
    }
    /**
     * @param {number} tag
     * @param {number} val
     */
    writeSFixed64Field(tag, val) {
        this.writeTag(tag, PBF_FIXED64);
        this.writeSFixed64(val);
    }
    /**
     * @param {number} tag
     * @param {number} val
     */
    writeVarintField(tag, val) {
        this.writeTag(tag, PBF_VARINT);
        this.writeVarint(val);
    }
    /**
     * @param {number} tag
     * @param {number} val
     */
    writeSVarintField(tag, val) {
        this.writeTag(tag, PBF_VARINT);
        this.writeSVarint(val);
    }
    /**
     * @param {number} tag
     * @param {string} str
     */
    writeStringField(tag, str) {
        this.writeTag(tag, PBF_BYTES);
        this.writeString(str);
    }
    /**
     * @param {number} tag
     * @param {number} val
     */
    writeFloatField(tag, val) {
        this.writeTag(tag, PBF_FIXED32);
        this.writeFloat(val);
    }
    /**
     * @param {number} tag
     * @param {number} val
     */
    writeDoubleField(tag, val) {
        this.writeTag(tag, PBF_FIXED64);
        this.writeDouble(val);
    }
    /**
     * @param {number} tag
     * @param {boolean} val
     */
    writeBooleanField(tag, val) {
        this.writeVarintField(tag, +val);
    }
}
/**
 * @param {number} l
 * @param {boolean | undefined} s
 * @param {Pbf} p
 */
function readVarintRemainder(l, s, p) {
    const buf = p.buf;
    let h, b;

    b = buf[p.pos++]; h  = (b & 0x70) >> 4;  if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 3;  if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 10; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 17; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 24; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x01) << 31; if (b < 0x80) return toNum(l, h, s);

    throw new Error('Expected varint not more than 10 bytes');
}

/**
 * @param {number} low
 * @param {number} high
 * @param {boolean} [isSigned]
 */
function toNum(low, high, isSigned) {
    return isSigned ? high * 0x100000000 + (low >>> 0) : ((high >>> 0) * 0x100000000) + (low >>> 0);
}

/**
 * @param {number} val
 * @param {Pbf} pbf
 */
function writeBigVarint(val, pbf) {
    let low, high;

    if (val >= 0) {
        low  = (val % 0x100000000) | 0;
        high = (val / 0x100000000) | 0;
    } else {
        low  = ~(-val % 0x100000000);
        high = ~(-val / 0x100000000);

        if (low ^ 0xffffffff) {
            low = (low + 1) | 0;
        } else {
            low = 0;
            high = (high + 1) | 0;
        }
    }

    if (val >= 0x10000000000000000 || val < -18446744073709552e3) {
        throw new Error('Given varint doesn\'t fit into 10 bytes');
    }

    pbf.realloc(10);

    writeBigVarintLow(low, high, pbf);
    writeBigVarintHigh(high, pbf);
}

/**
 * @param {number} high
 * @param {number} low
 * @param {Pbf} pbf
 */
function writeBigVarintLow(low, high, pbf) {
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos]   = low & 0x7f;
}

/**
 * @param {number} high
 * @param {Pbf} pbf
 */
function writeBigVarintHigh(high, pbf) {
    const lsb = (high & 0x07) << 4;

    pbf.buf[pbf.pos++] |= lsb         | ((high >>>= 3) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f;
}

/**
 * @param {number} startPos
 * @param {number} len
 * @param {Pbf} pbf
 */
function makeRoomForExtraLength(startPos, len, pbf) {
    const extraLen =
        len <= 0x3fff ? 1 :
        len <= 0x1fffff ? 2 :
        len <= 0xfffffff ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));

    // if 1 byte isn't enough for encoding message length, shift the data to the right
    pbf.realloc(extraLen);
    for (let i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}

/**
 * @param {number[]} arr
 * @param {Pbf} pbf
 */
function writePackedVarint(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
}
/**
 * @param {number[]} arr
 * @param {Pbf} pbf
 */
function writePackedSVarint(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
}
/**
 * @param {number[]} arr
 * @param {Pbf} pbf
 */
function writePackedFloat(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
}
/**
 * @param {number[]} arr
 * @param {Pbf} pbf
 */
function writePackedDouble(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
}
/**
 * @param {boolean[]} arr
 * @param {Pbf} pbf
 */
function writePackedBoolean(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
}
/**
 * @param {number[]} arr
 * @param {Pbf} pbf
 */
function writePackedFixed32(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
}
/**
 * @param {number[]} arr
 * @param {Pbf} pbf
 */
function writePackedSFixed32(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
}
/**
 * @param {number[]} arr
 * @param {Pbf} pbf
 */
function writePackedFixed64(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
}
/**
 * @param {number[]} arr
 * @param {Pbf} pbf
 */
function writePackedSFixed64(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
}

// Buffer code below from https://github.com/feross/buffer, MIT-licensed

/**
 * @param {Uint8Array} buf
 * @param {number} pos
 * @param {number} end
 */
function readUtf8(buf, pos, end) {
    let str = '';
    let i = pos;

    while (i < end) {
        const b0 = buf[i];
        let c = null; // codepoint
        let bytesPerSequence =
            b0 > 0xEF ? 4 :
            b0 > 0xDF ? 3 :
            b0 > 0xBF ? 2 : 1;

        if (i + bytesPerSequence > end) break;

        let b1, b2, b3;

        if (bytesPerSequence === 1) {
            if (b0 < 0x80) {
                c = b0;
            }
        } else if (bytesPerSequence === 2) {
            b1 = buf[i + 1];
            if ((b1 & 0xC0) === 0x80) {
                c = (b0 & 0x1F) << 0x6 | (b1 & 0x3F);
                if (c <= 0x7F) {
                    c = null;
                }
            }
        } else if (bytesPerSequence === 3) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80) {
                c = (b0 & 0xF) << 0xC | (b1 & 0x3F) << 0x6 | (b2 & 0x3F);
                if (c <= 0x7FF || (c >= 0xD800 && c <= 0xDFFF)) {
                    c = null;
                }
            }
        } else if (bytesPerSequence === 4) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            b3 = buf[i + 3];
            if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                c = (b0 & 0xF) << 0x12 | (b1 & 0x3F) << 0xC | (b2 & 0x3F) << 0x6 | (b3 & 0x3F);
                if (c <= 0xFFFF || c >= 0x110000) {
                    c = null;
                }
            }
        }

        if (c === null) {
            c = 0xFFFD;
            bytesPerSequence = 1;

        } else if (c > 0xFFFF) {
            c -= 0x10000;
            str += String.fromCharCode(c >>> 10 & 0x3FF | 0xD800);
            c = 0xDC00 | c & 0x3FF;
        }

        str += String.fromCharCode(c);
        i += bytesPerSequence;
    }

    return str;
}

/**
 * @param {Uint8Array} buf
 * @param {string} str
 * @param {number} pos
 */
function writeUtf8(buf, str, pos) {
    for (let i = 0, c, lead; i < str.length; i++) {
        c = str.charCodeAt(i); // code point

        if (c > 0xD7FF && c < 0xE000) {
            if (lead) {
                if (c < 0xDC00) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                    lead = c;
                    continue;
                } else {
                    c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                    lead = null;
                }
            } else {
                if (c > 0xDBFF || (i + 1 === str.length)) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                } else {
                    lead = c;
                }
                continue;
            }
        } else if (lead) {
            buf[pos++] = 0xEF;
            buf[pos++] = 0xBF;
            buf[pos++] = 0xBD;
            lead = null;
        }

        if (c < 0x80) {
            buf[pos++] = c;
        } else {
            if (c < 0x800) {
                buf[pos++] = c >> 0x6 | 0xC0;
            } else {
                if (c < 0x10000) {
                    buf[pos++] = c >> 0xC | 0xE0;
                } else {
                    buf[pos++] = c >> 0x12 | 0xF0;
                    buf[pos++] = c >> 0xC & 0x3F | 0x80;
                }
                buf[pos++] = c >> 0x6 & 0x3F | 0x80;
            }
            buf[pos++] = c & 0x3F | 0x80;
        }
    }
    return pos;
}

var dist;
var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __pow = Math.pow;
	var __export = (target, all) => {
	  for (var name in all)
	    __defProp(target, name, { get: all[name], enumerable: true });
	};
	var __copyProps = (to, from, except, desc) => {
	  if (from && typeof from === "object" || typeof from === "function") {
	    for (let key of __getOwnPropNames(from))
	      if (!__hasOwnProp.call(to, key) && key !== except)
	        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
	  }
	  return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var __async = (__this, __arguments, generator) => {
	  return new Promise((resolve, reject) => {
	    var fulfilled = (value) => {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var rejected = (value) => {
	      try {
	        step(generator.throw(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
	    step((generator = generator.apply(__this, __arguments)).next());
	  });
	};

	// index.ts
	var js_exports = {};
	__export(js_exports, {
	  Compression: () => Compression,
	  EtagMismatch: () => EtagMismatch,
	  FetchSource: () => FetchSource,
	  FileSource: () => FileSource,
	  PMTiles: () => PMTiles,
	  Protocol: () => Protocol,
	  ResolvedValueCache: () => ResolvedValueCache,
	  SharedPromiseCache: () => SharedPromiseCache,
	  TileType: () => TileType,
	  bytesToHeader: () => bytesToHeader,
	  findTile: () => findTile,
	  getUint64: () => getUint64,
	  leafletRasterLayer: () => leafletRasterLayer,
	  readVarint: () => readVarint,
	  tileIdToZxy: () => tileIdToZxy,
	  tileTypeExt: () => tileTypeExt,
	  zxyToTileId: () => zxyToTileId
	});
	dist = __toCommonJS(js_exports);

	// node_modules/fflate/esm/browser.js
	var u8 = Uint8Array;
	var u16 = Uint16Array;
	var i32 = Int32Array;
	var fleb = new u8([
	  0,
	  0,
	  0,
	  0,
	  0,
	  0,
	  0,
	  0,
	  1,
	  1,
	  1,
	  1,
	  2,
	  2,
	  2,
	  2,
	  3,
	  3,
	  3,
	  3,
	  4,
	  4,
	  4,
	  4,
	  5,
	  5,
	  5,
	  5,
	  0,
	  /* unused */
	  0,
	  0,
	  /* impossible */
	  0
	]);
	var fdeb = new u8([
	  0,
	  0,
	  0,
	  0,
	  1,
	  1,
	  2,
	  2,
	  3,
	  3,
	  4,
	  4,
	  5,
	  5,
	  6,
	  6,
	  7,
	  7,
	  8,
	  8,
	  9,
	  9,
	  10,
	  10,
	  11,
	  11,
	  12,
	  12,
	  13,
	  13,
	  /* unused */
	  0,
	  0
	]);
	var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
	var freb = function(eb, start) {
	  var b = new u16(31);
	  for (var i = 0; i < 31; ++i) {
	    b[i] = start += 1 << eb[i - 1];
	  }
	  var r = new i32(b[30]);
	  for (var i = 1; i < 30; ++i) {
	    for (var j = b[i]; j < b[i + 1]; ++j) {
	      r[j] = j - b[i] << 5 | i;
	    }
	  }
	  return { b, r };
	};
	var _a = freb(fleb, 2);
	var fl = _a.b;
	var revfl = _a.r;
	fl[28] = 258, revfl[258] = 28;
	var _b = freb(fdeb, 0);
	var fd = _b.b;
	var rev = new u16(32768);
	for (i = 0; i < 32768; ++i) {
	  x = (i & 43690) >> 1 | (i & 21845) << 1;
	  x = (x & 52428) >> 2 | (x & 13107) << 2;
	  x = (x & 61680) >> 4 | (x & 3855) << 4;
	  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
	}
	var x;
	var i;
	var hMap = function(cd, mb, r) {
	  var s = cd.length;
	  var i = 0;
	  var l = new u16(mb);
	  for (; i < s; ++i) {
	    if (cd[i])
	      ++l[cd[i] - 1];
	  }
	  var le = new u16(mb);
	  for (i = 1; i < mb; ++i) {
	    le[i] = le[i - 1] + l[i - 1] << 1;
	  }
	  var co;
	  {
	    co = new u16(1 << mb);
	    var rvb = 15 - mb;
	    for (i = 0; i < s; ++i) {
	      if (cd[i]) {
	        var sv = i << 4 | cd[i];
	        var r_1 = mb - cd[i];
	        var v = le[cd[i] - 1]++ << r_1;
	        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
	          co[rev[v] >> rvb] = sv;
	        }
	      }
	    }
	  }
	  return co;
	};
	var flt = new u8(288);
	for (i = 0; i < 144; ++i)
	  flt[i] = 8;
	var i;
	for (i = 144; i < 256; ++i)
	  flt[i] = 9;
	var i;
	for (i = 256; i < 280; ++i)
	  flt[i] = 7;
	var i;
	for (i = 280; i < 288; ++i)
	  flt[i] = 8;
	var i;
	var fdt = new u8(32);
	for (i = 0; i < 32; ++i)
	  fdt[i] = 5;
	var i;
	var flrm = /* @__PURE__ */ hMap(flt, 9);
	var fdrm = /* @__PURE__ */ hMap(fdt, 5);
	var max = function(a) {
	  var m = a[0];
	  for (var i = 1; i < a.length; ++i) {
	    if (a[i] > m)
	      m = a[i];
	  }
	  return m;
	};
	var bits = function(d, p, m) {
	  var o = p / 8 | 0;
	  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
	};
	var bits16 = function(d, p) {
	  var o = p / 8 | 0;
	  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
	};
	var shft = function(p) {
	  return (p + 7) / 8 | 0;
	};
	var slc = function(v, s, e) {
	  if (e == null || e > v.length)
	    e = v.length;
	  var n = new u8(e - s);
	  n.set(v.subarray(s, e));
	  return n;
	};
	var ec = [
	  "unexpected EOF",
	  "invalid block type",
	  "invalid length/literal",
	  "invalid distance",
	  "stream finished",
	  "no stream handler",
	  ,
	  "no callback",
	  "invalid UTF-8 data",
	  "extra field too long",
	  "date not in range 1980-2099",
	  "filename too long",
	  "stream finishing",
	  "invalid zip data"
	  // determined by unknown compression method
	];
	var err = function(ind, msg, nt) {
	  var e = new Error(msg || ec[ind]);
	  e.code = ind;
	  if (Error.captureStackTrace)
	    Error.captureStackTrace(e, err);
	  if (!nt)
	    throw e;
	  return e;
	};
	var inflt = function(dat, st, buf, dict) {
	  var sl = dat.length, dl = 0;
	  if (!sl || st.f && !st.l)
	    return buf || new u8(0);
	  var noBuf = !buf || st.i != 2;
	  var noSt = st.i;
	  if (!buf)
	    buf = new u8(sl * 3);
	  var cbuf = function(l2) {
	    var bl = buf.length;
	    if (l2 > bl) {
	      var nbuf = new u8(Math.max(bl * 2, l2));
	      nbuf.set(buf);
	      buf = nbuf;
	    }
	  };
	  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
	  var tbts = sl * 8;
	  do {
	    if (!lm) {
	      final = bits(dat, pos, 1);
	      var type = bits(dat, pos + 1, 3);
	      pos += 3;
	      if (!type) {
	        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
	        if (t > sl) {
	          if (noSt)
	            err(0);
	          break;
	        }
	        if (noBuf)
	          cbuf(bt + l);
	        buf.set(dat.subarray(s, t), bt);
	        st.b = bt += l, st.p = pos = t * 8, st.f = final;
	        continue;
	      } else if (type == 1)
	        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
	      else if (type == 2) {
	        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
	        var tl = hLit + bits(dat, pos + 5, 31) + 1;
	        pos += 14;
	        var ldt = new u8(tl);
	        var clt = new u8(19);
	        for (var i = 0; i < hcLen; ++i) {
	          clt[clim[i]] = bits(dat, pos + i * 3, 7);
	        }
	        pos += hcLen * 3;
	        var clb = max(clt), clbmsk = (1 << clb) - 1;
	        var clm = hMap(clt, clb);
	        for (var i = 0; i < tl; ) {
	          var r = clm[bits(dat, pos, clbmsk)];
	          pos += r & 15;
	          var s = r >> 4;
	          if (s < 16) {
	            ldt[i++] = s;
	          } else {
	            var c = 0, n = 0;
	            if (s == 16)
	              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
	            else if (s == 17)
	              n = 3 + bits(dat, pos, 7), pos += 3;
	            else if (s == 18)
	              n = 11 + bits(dat, pos, 127), pos += 7;
	            while (n--)
	              ldt[i++] = c;
	          }
	        }
	        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
	        lbt = max(lt);
	        dbt = max(dt);
	        lm = hMap(lt, lbt);
	        dm = hMap(dt, dbt);
	      } else
	        err(1);
	      if (pos > tbts) {
	        if (noSt)
	          err(0);
	        break;
	      }
	    }
	    if (noBuf)
	      cbuf(bt + 131072);
	    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
	    var lpos = pos;
	    for (; ; lpos = pos) {
	      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
	      pos += c & 15;
	      if (pos > tbts) {
	        if (noSt)
	          err(0);
	        break;
	      }
	      if (!c)
	        err(2);
	      if (sym < 256)
	        buf[bt++] = sym;
	      else if (sym == 256) {
	        lpos = pos, lm = null;
	        break;
	      } else {
	        var add = sym - 254;
	        if (sym > 264) {
	          var i = sym - 257, b = fleb[i];
	          add = bits(dat, pos, (1 << b) - 1) + fl[i];
	          pos += b;
	        }
	        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
	        if (!d)
	          err(3);
	        pos += d & 15;
	        var dt = fd[dsym];
	        if (dsym > 3) {
	          var b = fdeb[dsym];
	          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
	        }
	        if (pos > tbts) {
	          if (noSt)
	            err(0);
	          break;
	        }
	        if (noBuf)
	          cbuf(bt + 131072);
	        var end = bt + add;
	        if (bt < dt) {
	          var shift2 = dl - dt, dend = Math.min(dt, end);
	          if (shift2 + bt < 0)
	            err(3);
	          for (; bt < dend; ++bt)
	            buf[bt] = dict[shift2 + bt];
	        }
	        for (; bt < end; bt += 4) {
	          buf[bt] = buf[bt - dt];
	          buf[bt + 1] = buf[bt + 1 - dt];
	          buf[bt + 2] = buf[bt + 2 - dt];
	          buf[bt + 3] = buf[bt + 3 - dt];
	        }
	        bt = end;
	      }
	    }
	    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
	    if (lm)
	      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
	  } while (!final);
	  return bt == buf.length ? buf : slc(buf, 0, bt);
	};
	var et = /* @__PURE__ */ new u8(0);
	var gzs = function(d) {
	  if (d[0] != 31 || d[1] != 139 || d[2] != 8)
	    err(6, "invalid gzip data");
	  var flg = d[3];
	  var st = 10;
	  if (flg & 4)
	    st += (d[10] | d[11] << 8) + 2;
	  for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
	    ;
	  return st + (flg & 2);
	};
	var gzl = function(d) {
	  var l = d.length;
	  return (d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16 | d[l - 1] << 24) >>> 0;
	};
	var zls = function(d, dict) {
	  if ((d[0] & 15) != 8 || d[0] >> 4 > 7 || (d[0] << 8 | d[1]) % 31)
	    err(6, "invalid zlib data");
	  if ((d[1] >> 5 & 1) == 1)
	    err(6, "invalid zlib data: " + (d[1] & 32 ? "need" : "unexpected") + " dictionary");
	  return (d[1] >> 3 & 4) + 2;
	};
	function inflateSync(data, opts) {
	  return inflt(data, { i: 2 }, opts, opts);
	}
	function gunzipSync(data, opts) {
	  var st = gzs(data);
	  if (st + 8 > data.length)
	    err(6, "invalid gzip data");
	  return inflt(data.subarray(st, -8), { i: 2 }, new u8(gzl(data)), opts);
	}
	function unzlibSync(data, opts) {
	  return inflt(data.subarray(zls(data), -4), { i: 2 }, opts, opts);
	}
	function decompressSync(data, opts) {
	  return data[0] == 31 && data[1] == 139 && data[2] == 8 ? gunzipSync(data, opts) : (data[0] & 15) != 8 || data[0] >> 4 > 7 || (data[0] << 8 | data[1]) % 31 ? inflateSync(data, opts) : unzlibSync(data, opts);
	}
	var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
	try {
	  td.decode(et, { stream: true });
	} catch (e) {
	}

	// v2.ts
	var shift = (n, shift2) => {
	  return n * __pow(2, shift2);
	};
	var unshift = (n, shift2) => {
	  return Math.floor(n / __pow(2, shift2));
	};
	var getUint24 = (view, pos) => {
	  return shift(view.getUint16(pos + 1, true), 8) + view.getUint8(pos);
	};
	var getUint48 = (view, pos) => {
	  return shift(view.getUint32(pos + 2, true), 16) + view.getUint16(pos, true);
	};
	var compare = (tz, tx, ty, view, i) => {
	  if (tz !== view.getUint8(i))
	    return tz - view.getUint8(i);
	  const x = getUint24(view, i + 1);
	  if (tx !== x)
	    return tx - x;
	  const y = getUint24(view, i + 4);
	  if (ty !== y)
	    return ty - y;
	  return 0;
	};
	var queryLeafdir = (view, z, x, y) => {
	  const offsetLen = queryView(view, z | 128, x, y);
	  if (offsetLen) {
	    return {
	      z,
	      x,
	      y,
	      offset: offsetLen[0],
	      length: offsetLen[1],
	      isDir: true
	    };
	  }
	  return null;
	};
	var queryTile = (view, z, x, y) => {
	  const offsetLen = queryView(view, z, x, y);
	  if (offsetLen) {
	    return {
	      z,
	      x,
	      y,
	      offset: offsetLen[0],
	      length: offsetLen[1],
	      isDir: false
	    };
	  }
	  return null;
	};
	var queryView = (view, z, x, y) => {
	  let m = 0;
	  let n = view.byteLength / 17 - 1;
	  while (m <= n) {
	    const k = n + m >> 1;
	    const cmp = compare(z, x, y, view, k * 17);
	    if (cmp > 0) {
	      m = k + 1;
	    } else if (cmp < 0) {
	      n = k - 1;
	    } else {
	      return [getUint48(view, k * 17 + 7), view.getUint32(k * 17 + 13, true)];
	    }
	  }
	  return null;
	};
	var entrySort = (a, b) => {
	  if (a.isDir && !b.isDir) {
	    return 1;
	  }
	  if (!a.isDir && b.isDir) {
	    return -1;
	  }
	  if (a.z !== b.z) {
	    return a.z - b.z;
	  }
	  if (a.x !== b.x) {
	    return a.x - b.x;
	  }
	  return a.y - b.y;
	};
	var parseEntry = (dataview, i) => {
	  const zRaw = dataview.getUint8(i * 17);
	  const z = zRaw & 127;
	  return {
	    z,
	    x: getUint24(dataview, i * 17 + 1),
	    y: getUint24(dataview, i * 17 + 4),
	    offset: getUint48(dataview, i * 17 + 7),
	    length: dataview.getUint32(i * 17 + 13, true),
	    isDir: zRaw >> 7 === 1
	  };
	};
	var sortDir = (a) => {
	  const entries = [];
	  const view = new DataView(a);
	  for (let i = 0; i < view.byteLength / 17; i++) {
	    entries.push(parseEntry(view, i));
	  }
	  return createDirectory(entries);
	};
	var createDirectory = (entries) => {
	  entries.sort(entrySort);
	  const buffer = new ArrayBuffer(17 * entries.length);
	  const arr = new Uint8Array(buffer);
	  for (let i = 0; i < entries.length; i++) {
	    const entry = entries[i];
	    let z = entry.z;
	    if (entry.isDir)
	      z = z | 128;
	    arr[i * 17] = z;
	    arr[i * 17 + 1] = entry.x & 255;
	    arr[i * 17 + 2] = entry.x >> 8 & 255;
	    arr[i * 17 + 3] = entry.x >> 16 & 255;
	    arr[i * 17 + 4] = entry.y & 255;
	    arr[i * 17 + 5] = entry.y >> 8 & 255;
	    arr[i * 17 + 6] = entry.y >> 16 & 255;
	    arr[i * 17 + 7] = entry.offset & 255;
	    arr[i * 17 + 8] = unshift(entry.offset, 8) & 255;
	    arr[i * 17 + 9] = unshift(entry.offset, 16) & 255;
	    arr[i * 17 + 10] = unshift(entry.offset, 24) & 255;
	    arr[i * 17 + 11] = unshift(entry.offset, 32) & 255;
	    arr[i * 17 + 12] = unshift(entry.offset, 48) & 255;
	    arr[i * 17 + 13] = entry.length & 255;
	    arr[i * 17 + 14] = entry.length >> 8 & 255;
	    arr[i * 17 + 15] = entry.length >> 16 & 255;
	    arr[i * 17 + 16] = entry.length >> 24 & 255;
	  }
	  return buffer;
	};
	var deriveLeaf = (view, tile) => {
	  if (view.byteLength < 17)
	    return null;
	  const numEntries = view.byteLength / 17;
	  const entry = parseEntry(view, numEntries - 1);
	  if (entry.isDir) {
	    const leafLevel = entry.z;
	    const levelDiff = tile.z - leafLevel;
	    const leafX = Math.trunc(tile.x / (1 << levelDiff));
	    const leafY = Math.trunc(tile.y / (1 << levelDiff));
	    return { z: leafLevel, x: leafX, y: leafY };
	  }
	  return null;
	};
	function getHeader(source) {
	  return __async(this, null, function* () {
	    const resp = yield source.getBytes(0, 512e3);
	    const dataview = new DataView(resp.data);
	    const jsonSize = dataview.getUint32(4, true);
	    const rootEntries = dataview.getUint16(8, true);
	    const dec = new TextDecoder("utf-8");
	    const jsonMetadata = JSON.parse(
	      dec.decode(new DataView(resp.data, 10, jsonSize))
	    );
	    let tileCompression = 0 /* Unknown */;
	    if (jsonMetadata.compression === "gzip") {
	      tileCompression = 2 /* Gzip */;
	    }
	    let minzoom = 0;
	    if ("minzoom" in jsonMetadata) {
	      minzoom = +jsonMetadata.minzoom;
	    }
	    let maxzoom = 0;
	    if ("maxzoom" in jsonMetadata) {
	      maxzoom = +jsonMetadata.maxzoom;
	    }
	    let centerLon = 0;
	    let centerLat = 0;
	    let centerZoom = 0;
	    let minLon = -180;
	    let minLat = -85;
	    let maxLon = 180;
	    let maxLat = 85;
	    if (jsonMetadata.bounds) {
	      const split = jsonMetadata.bounds.split(",");
	      minLon = +split[0];
	      minLat = +split[1];
	      maxLon = +split[2];
	      maxLat = +split[3];
	    }
	    if (jsonMetadata.center) {
	      const split = jsonMetadata.center.split(",");
	      centerLon = +split[0];
	      centerLat = +split[1];
	      centerZoom = +split[2];
	    }
	    const header = {
	      specVersion: dataview.getUint16(2, true),
	      rootDirectoryOffset: 10 + jsonSize,
	      rootDirectoryLength: rootEntries * 17,
	      jsonMetadataOffset: 10,
	      jsonMetadataLength: jsonSize,
	      leafDirectoryOffset: 0,
	      leafDirectoryLength: void 0,
	      tileDataOffset: 0,
	      tileDataLength: void 0,
	      numAddressedTiles: 0,
	      numTileEntries: 0,
	      numTileContents: 0,
	      clustered: false,
	      internalCompression: 1 /* None */,
	      tileCompression,
	      tileType: 1 /* Mvt */,
	      minZoom: minzoom,
	      maxZoom: maxzoom,
	      minLon,
	      minLat,
	      maxLon,
	      maxLat,
	      centerZoom,
	      centerLon,
	      centerLat,
	      etag: resp.etag
	    };
	    return header;
	  });
	}
	function getZxy(header, source, cache, z, x, y, signal) {
	  return __async(this, null, function* () {
	    let rootDir = yield cache.getArrayBuffer(
	      source,
	      header.rootDirectoryOffset,
	      header.rootDirectoryLength,
	      header
	    );
	    if (header.specVersion === 1) {
	      rootDir = sortDir(rootDir);
	    }
	    const entry = queryTile(new DataView(rootDir), z, x, y);
	    if (entry) {
	      const resp = yield source.getBytes(entry.offset, entry.length, signal);
	      let tileData = resp.data;
	      const view = new DataView(tileData);
	      if (view.getUint8(0) === 31 && view.getUint8(1) === 139) {
	        tileData = decompressSync(new Uint8Array(tileData));
	      }
	      return {
	        data: tileData
	      };
	    }
	    const leafcoords = deriveLeaf(new DataView(rootDir), { z, x, y });
	    if (leafcoords) {
	      const leafdirEntry = queryLeafdir(
	        new DataView(rootDir),
	        leafcoords.z,
	        leafcoords.x,
	        leafcoords.y
	      );
	      if (leafdirEntry) {
	        let leafDir = yield cache.getArrayBuffer(
	          source,
	          leafdirEntry.offset,
	          leafdirEntry.length,
	          header
	        );
	        if (header.specVersion === 1) {
	          leafDir = sortDir(leafDir);
	        }
	        const tileEntry = queryTile(new DataView(leafDir), z, x, y);
	        if (tileEntry) {
	          const resp = yield source.getBytes(
	            tileEntry.offset,
	            tileEntry.length,
	            signal
	          );
	          let tileData = resp.data;
	          const view = new DataView(tileData);
	          if (view.getUint8(0) === 31 && view.getUint8(1) === 139) {
	            tileData = decompressSync(new Uint8Array(tileData));
	          }
	          return {
	            data: tileData
	          };
	        }
	      }
	    }
	    return void 0;
	  });
	}
	var v2_default = {
	  getHeader,
	  getZxy
	};

	// adapters.ts
	var leafletRasterLayer = (source, options) => {
	  let loaded = false;
	  let mimeType = "";
	  const cls = L.GridLayer.extend({
	    createTile: (coord, done) => {
	      const el = document.createElement("img");
	      const controller = new AbortController();
	      const signal = controller.signal;
	      el.cancel = () => {
	        controller.abort();
	      };
	      if (!loaded) {
	        source.getHeader().then((header) => {
	          if (header.tileType === 1 /* Mvt */) {
	            console.error(
	              "Error: archive contains MVT vector tiles, but leafletRasterLayer is for displaying raster tiles. See https://github.com/protomaps/PMTiles/tree/main/js for details."
	            );
	          } else if (header.tileType === 2) {
	            mimeType = "image/png";
	          } else if (header.tileType === 3) {
	            mimeType = "image/jpeg";
	          } else if (header.tileType === 4) {
	            mimeType = "image/webp";
	          } else if (header.tileType === 5) {
	            mimeType = "image/avif";
	          }
	        });
	        loaded = true;
	      }
	      source.getZxy(coord.z, coord.x, coord.y, signal).then((arr) => {
	        if (arr) {
	          const blob = new Blob([arr.data], { type: mimeType });
	          const imageUrl = window.URL.createObjectURL(blob);
	          el.src = imageUrl;
	          el.cancel = void 0;
	          done(void 0, el);
	        }
	      }).catch((e) => {
	        if (e.name !== "AbortError") {
	          throw e;
	        }
	      });
	      return el;
	    },
	    _removeTile: function(key) {
	      const tile = this._tiles[key];
	      if (!tile) {
	        return;
	      }
	      if (tile.el.cancel)
	        tile.el.cancel();
	      tile.el.width = 0;
	      tile.el.height = 0;
	      tile.el.deleted = true;
	      L.DomUtil.remove(tile.el);
	      delete this._tiles[key];
	      this.fire("tileunload", {
	        tile: tile.el,
	        coords: this._keyToTileCoords(key)
	      });
	    }
	  });
	  return new cls(options);
	};
	var v3compat = (v4) => (requestParameters, arg2) => {
	  if (arg2 instanceof AbortController) {
	    return v4(requestParameters, arg2);
	  }
	  const abortController = new AbortController();
	  v4(requestParameters, abortController).then(
	    (result) => {
	      return arg2(
	        void 0,
	        result.data,
	        result.cacheControl || "",
	        result.expires || ""
	      );
	    },
	    (err2) => {
	      return arg2(err2);
	    }
	  ).catch((e) => {
	    return arg2(e);
	  });
	  return { cancel: () => abortController.abort() };
	};
	var Protocol = class {
	  /**
	   * Initialize the MapLibre PMTiles protocol.
	   *
	   * * metadata: also load the metadata section of the PMTiles. required for some "inspect" functionality
	   * and to automatically populate the map attribution. Requires an extra HTTP request.
	   */
	  constructor(options) {
	    /** @hidden */
	    this.tilev4 = (params, abortController) => __async(this, null, function* () {
	      if (params.type === "json") {
	        const pmtilesUrl2 = params.url.substr(10);
	        let instance2 = this.tiles.get(pmtilesUrl2);
	        if (!instance2) {
	          instance2 = new PMTiles(pmtilesUrl2);
	          this.tiles.set(pmtilesUrl2, instance2);
	        }
	        if (this.metadata) {
	          return {
	            data: yield instance2.getTileJson(params.url)
	          };
	        }
	        const h = yield instance2.getHeader();
	        return {
	          data: {
	            tiles: [`${params.url}/{z}/{x}/{y}`],
	            minzoom: h.minZoom,
	            maxzoom: h.maxZoom,
	            bounds: [h.minLon, h.minLat, h.maxLon, h.maxLat]
	          }
	        };
	      }
	      const re = new RegExp(/pmtiles:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)/);
	      const result = params.url.match(re);
	      if (!result) {
	        throw new Error("Invalid PMTiles protocol URL");
	      }
	      const pmtilesUrl = result[1];
	      let instance = this.tiles.get(pmtilesUrl);
	      if (!instance) {
	        instance = new PMTiles(pmtilesUrl);
	        this.tiles.set(pmtilesUrl, instance);
	      }
	      const z = result[2];
	      const x = result[3];
	      const y = result[4];
	      const header = yield instance.getHeader();
	      const resp = yield instance == null ? void 0 : instance.getZxy(+z, +x, +y, abortController.signal);
	      if (resp) {
	        return {
	          data: new Uint8Array(resp.data),
	          cacheControl: resp.cacheControl,
	          expires: resp.expires
	        };
	      }
	      if (header.tileType === 1 /* Mvt */) {
	        return { data: new Uint8Array() };
	      }
	      return { data: null };
	    });
	    this.tile = v3compat(this.tilev4);
	    this.tiles = /* @__PURE__ */ new Map();
	    this.metadata = (options == null ? void 0 : options.metadata) || false;
	  }
	  /**
	   * Add a {@link PMTiles} instance to the global protocol instance.
	   *
	   * For remote fetch sources, references in MapLibre styles like pmtiles://http://...
	   * will resolve to the same instance if the URLs match.
	   */
	  add(p) {
	    this.tiles.set(p.source.getKey(), p);
	  }
	  /**
	   * Fetch a {@link PMTiles} instance by URL, for remote PMTiles instances.
	   */
	  get(url) {
	    return this.tiles.get(url);
	  }
	};

	// index.ts
	function toNum(low, high) {
	  return (high >>> 0) * 4294967296 + (low >>> 0);
	}
	function readVarintRemainder(l, p) {
	  const buf = p.buf;
	  let b = buf[p.pos++];
	  let h = (b & 112) >> 4;
	  if (b < 128)
	    return toNum(l, h);
	  b = buf[p.pos++];
	  h |= (b & 127) << 3;
	  if (b < 128)
	    return toNum(l, h);
	  b = buf[p.pos++];
	  h |= (b & 127) << 10;
	  if (b < 128)
	    return toNum(l, h);
	  b = buf[p.pos++];
	  h |= (b & 127) << 17;
	  if (b < 128)
	    return toNum(l, h);
	  b = buf[p.pos++];
	  h |= (b & 127) << 24;
	  if (b < 128)
	    return toNum(l, h);
	  b = buf[p.pos++];
	  h |= (b & 1) << 31;
	  if (b < 128)
	    return toNum(l, h);
	  throw new Error("Expected varint not more than 10 bytes");
	}
	function readVarint(p) {
	  const buf = p.buf;
	  let b = buf[p.pos++];
	  let val = b & 127;
	  if (b < 128)
	    return val;
	  b = buf[p.pos++];
	  val |= (b & 127) << 7;
	  if (b < 128)
	    return val;
	  b = buf[p.pos++];
	  val |= (b & 127) << 14;
	  if (b < 128)
	    return val;
	  b = buf[p.pos++];
	  val |= (b & 127) << 21;
	  if (b < 128)
	    return val;
	  b = buf[p.pos];
	  val |= (b & 15) << 28;
	  return readVarintRemainder(val, p);
	}
	function rotate(n, xy, rx, ry) {
	  if (ry === 0) {
	    if (rx === 1) {
	      xy[0] = n - 1 - xy[0];
	      xy[1] = n - 1 - xy[1];
	    }
	    const t = xy[0];
	    xy[0] = xy[1];
	    xy[1] = t;
	  }
	}
	function idOnLevel(z, pos) {
	  const n = __pow(2, z);
	  let rx = pos;
	  let ry = pos;
	  let t = pos;
	  const xy = [0, 0];
	  let s = 1;
	  while (s < n) {
	    rx = 1 & t / 2;
	    ry = 1 & (t ^ rx);
	    rotate(s, xy, rx, ry);
	    xy[0] += s * rx;
	    xy[1] += s * ry;
	    t = t / 4;
	    s *= 2;
	  }
	  return [z, xy[0], xy[1]];
	}
	var tzValues = [
	  0,
	  1,
	  5,
	  21,
	  85,
	  341,
	  1365,
	  5461,
	  21845,
	  87381,
	  349525,
	  1398101,
	  5592405,
	  22369621,
	  89478485,
	  357913941,
	  1431655765,
	  5726623061,
	  22906492245,
	  91625968981,
	  366503875925,
	  1466015503701,
	  5864062014805,
	  23456248059221,
	  93824992236885,
	  375299968947541,
	  1501199875790165
	];
	function zxyToTileId(z, x, y) {
	  if (z > 26) {
	    throw Error("Tile zoom level exceeds max safe number limit (26)");
	  }
	  if (x > __pow(2, z) - 1 || y > __pow(2, z) - 1) {
	    throw Error("tile x/y outside zoom level bounds");
	  }
	  const acc = tzValues[z];
	  const n = __pow(2, z);
	  let rx = 0;
	  let ry = 0;
	  let d = 0;
	  const xy = [x, y];
	  let s = n / 2;
	  while (s > 0) {
	    rx = (xy[0] & s) > 0 ? 1 : 0;
	    ry = (xy[1] & s) > 0 ? 1 : 0;
	    d += s * s * (3 * rx ^ ry);
	    rotate(s, xy, rx, ry);
	    s = s / 2;
	  }
	  return acc + d;
	}
	function tileIdToZxy(i) {
	  let acc = 0;
	  for (let z2 = 0; z2 < 27; z2++) {
	    const numTiles = (1 << z2) * (1 << z2);
	    if (acc + numTiles > i) {
	      return idOnLevel(z2, i - acc);
	    }
	    acc += numTiles;
	  }
	  throw Error("Tile zoom level exceeds max safe number limit (26)");
	}
	var Compression = /* @__PURE__ */ ((Compression2) => {
	  Compression2[Compression2["Unknown"] = 0] = "Unknown";
	  Compression2[Compression2["None"] = 1] = "None";
	  Compression2[Compression2["Gzip"] = 2] = "Gzip";
	  Compression2[Compression2["Brotli"] = 3] = "Brotli";
	  Compression2[Compression2["Zstd"] = 4] = "Zstd";
	  return Compression2;
	})(Compression || {});
	function defaultDecompress(buf, compression) {
	  return __async(this, null, function* () {
	    if (compression === 1 /* None */ || compression === 0 /* Unknown */) {
	      return buf;
	    }
	    if (compression === 2 /* Gzip */) {
	      if (typeof globalThis.DecompressionStream === "undefined") {
	        return decompressSync(new Uint8Array(buf));
	      }
	      const stream = new Response(buf).body;
	      if (!stream) {
	        throw Error("Failed to read response stream");
	      }
	      const result = stream.pipeThrough(
	        // biome-ignore lint: needed to detect DecompressionStream in browser+node+cloudflare workers
	        new globalThis.DecompressionStream("gzip")
	      );
	      return new Response(result).arrayBuffer();
	    }
	    throw Error("Compression method not supported");
	  });
	}
	var TileType = /* @__PURE__ */ ((TileType2) => {
	  TileType2[TileType2["Unknown"] = 0] = "Unknown";
	  TileType2[TileType2["Mvt"] = 1] = "Mvt";
	  TileType2[TileType2["Png"] = 2] = "Png";
	  TileType2[TileType2["Jpeg"] = 3] = "Jpeg";
	  TileType2[TileType2["Webp"] = 4] = "Webp";
	  TileType2[TileType2["Avif"] = 5] = "Avif";
	  return TileType2;
	})(TileType || {});
	function tileTypeExt(t) {
	  if (t === 1 /* Mvt */)
	    return ".mvt";
	  if (t === 2 /* Png */)
	    return ".png";
	  if (t === 3 /* Jpeg */)
	    return ".jpg";
	  if (t === 4 /* Webp */)
	    return ".webp";
	  if (t === 5 /* Avif */)
	    return ".avif";
	  return "";
	}
	var HEADER_SIZE_BYTES = 127;
	function findTile(entries, tileId) {
	  let m = 0;
	  let n = entries.length - 1;
	  while (m <= n) {
	    const k = n + m >> 1;
	    const cmp = tileId - entries[k].tileId;
	    if (cmp > 0) {
	      m = k + 1;
	    } else if (cmp < 0) {
	      n = k - 1;
	    } else {
	      return entries[k];
	    }
	  }
	  if (n >= 0) {
	    if (entries[n].runLength === 0) {
	      return entries[n];
	    }
	    if (tileId - entries[n].tileId < entries[n].runLength) {
	      return entries[n];
	    }
	  }
	  return null;
	}
	var FileSource = class {
	  constructor(file) {
	    this.file = file;
	  }
	  getKey() {
	    return this.file.name;
	  }
	  getBytes(offset, length) {
	    return __async(this, null, function* () {
	      const blob = this.file.slice(offset, offset + length);
	      const a = yield blob.arrayBuffer();
	      return { data: a };
	    });
	  }
	};
	var FetchSource = class {
	  constructor(url, customHeaders = new Headers()) {
	    this.url = url;
	    this.customHeaders = customHeaders;
	    this.mustReload = false;
	    let userAgent = "";
	    if ("navigator" in globalThis) {
	      userAgent = globalThis.navigator.userAgent || "";
	    }
	    const isWindows = userAgent.indexOf("Windows") > -1;
	    const isChromiumBased = /Chrome|Chromium|Edg|OPR|Brave/.test(userAgent);
	    this.chromeWindowsNoCache = false;
	    if (isWindows && isChromiumBased) {
	      this.chromeWindowsNoCache = true;
	    }
	  }
	  getKey() {
	    return this.url;
	  }
	  /**
	   * Mutate the custom [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) set for all requests to the remote archive.
	   */
	  setHeaders(customHeaders) {
	    this.customHeaders = customHeaders;
	  }
	  getBytes(offset, length, passedSignal, etag) {
	    return __async(this, null, function* () {
	      let controller;
	      let signal;
	      if (passedSignal) {
	        signal = passedSignal;
	      } else {
	        controller = new AbortController();
	        signal = controller.signal;
	      }
	      const requestHeaders = new Headers(this.customHeaders);
	      requestHeaders.set("range", `bytes=${offset}-${offset + length - 1}`);
	      let cache;
	      if (this.mustReload) {
	        cache = "reload";
	      } else if (this.chromeWindowsNoCache) {
	        cache = "no-store";
	      }
	      let resp = yield fetch(this.url, {
	        signal,
	        cache,
	        headers: requestHeaders
	        //biome-ignore lint: "cache" is incompatible between cloudflare workers and browser
	      });
	      if (offset === 0 && resp.status === 416) {
	        const contentRange = resp.headers.get("Content-Range");
	        if (!contentRange || !contentRange.startsWith("bytes */")) {
	          throw Error("Missing content-length on 416 response");
	        }
	        const actualLength = +contentRange.substr(8);
	        resp = yield fetch(this.url, {
	          signal,
	          cache: "reload",
	          headers: { range: `bytes=0-${actualLength - 1}` }
	          //biome-ignore lint: "cache" is incompatible between cloudflare workers and browser
	        });
	      }
	      let newEtag = resp.headers.get("Etag");
	      if (newEtag == null ? void 0 : newEtag.startsWith("W/")) {
	        newEtag = null;
	      }
	      if (resp.status === 416 || etag && newEtag && newEtag !== etag) {
	        this.mustReload = true;
	        throw new EtagMismatch(
	          `Server returned non-matching ETag ${etag} after one retry. Check browser extensions and servers for issues that may affect correct ETag headers.`
	        );
	      }
	      if (resp.status >= 300) {
	        throw Error(`Bad response code: ${resp.status}`);
	      }
	      const contentLength = resp.headers.get("Content-Length");
	      if (resp.status === 200 && (!contentLength || +contentLength > length)) {
	        if (controller)
	          controller.abort();
	        throw Error(
	          "Server returned no content-length header or content-length exceeding request. Check that your storage backend supports HTTP Byte Serving."
	        );
	      }
	      const a = yield resp.arrayBuffer();
	      return {
	        data: a,
	        etag: newEtag || void 0,
	        cacheControl: resp.headers.get("Cache-Control") || void 0,
	        expires: resp.headers.get("Expires") || void 0
	      };
	    });
	  }
	};
	function getUint64(v, offset) {
	  const wh = v.getUint32(offset + 4, true);
	  const wl = v.getUint32(offset + 0, true);
	  return wh * __pow(2, 32) + wl;
	}
	function bytesToHeader(bytes, etag) {
	  const v = new DataView(bytes);
	  const specVersion = v.getUint8(7);
	  if (specVersion > 3) {
	    throw Error(
	      `Archive is spec version ${specVersion} but this library supports up to spec version 3`
	    );
	  }
	  return {
	    specVersion,
	    rootDirectoryOffset: getUint64(v, 8),
	    rootDirectoryLength: getUint64(v, 16),
	    jsonMetadataOffset: getUint64(v, 24),
	    jsonMetadataLength: getUint64(v, 32),
	    leafDirectoryOffset: getUint64(v, 40),
	    leafDirectoryLength: getUint64(v, 48),
	    tileDataOffset: getUint64(v, 56),
	    tileDataLength: getUint64(v, 64),
	    numAddressedTiles: getUint64(v, 72),
	    numTileEntries: getUint64(v, 80),
	    numTileContents: getUint64(v, 88),
	    clustered: v.getUint8(96) === 1,
	    internalCompression: v.getUint8(97),
	    tileCompression: v.getUint8(98),
	    tileType: v.getUint8(99),
	    minZoom: v.getUint8(100),
	    maxZoom: v.getUint8(101),
	    minLon: v.getInt32(102, true) / 1e7,
	    minLat: v.getInt32(106, true) / 1e7,
	    maxLon: v.getInt32(110, true) / 1e7,
	    maxLat: v.getInt32(114, true) / 1e7,
	    centerZoom: v.getUint8(118),
	    centerLon: v.getInt32(119, true) / 1e7,
	    centerLat: v.getInt32(123, true) / 1e7,
	    etag
	  };
	}
	function deserializeIndex(buffer) {
	  const p = { buf: new Uint8Array(buffer), pos: 0 };
	  const numEntries = readVarint(p);
	  const entries = [];
	  let lastId = 0;
	  for (let i = 0; i < numEntries; i++) {
	    const v = readVarint(p);
	    entries.push({ tileId: lastId + v, offset: 0, length: 0, runLength: 1 });
	    lastId += v;
	  }
	  for (let i = 0; i < numEntries; i++) {
	    entries[i].runLength = readVarint(p);
	  }
	  for (let i = 0; i < numEntries; i++) {
	    entries[i].length = readVarint(p);
	  }
	  for (let i = 0; i < numEntries; i++) {
	    const v = readVarint(p);
	    if (v === 0 && i > 0) {
	      entries[i].offset = entries[i - 1].offset + entries[i - 1].length;
	    } else {
	      entries[i].offset = v - 1;
	    }
	  }
	  return entries;
	}
	function detectVersion(a) {
	  const v = new DataView(a);
	  if (v.getUint16(2, true) === 2) {
	    console.warn(
	      "PMTiles spec version 2 has been deprecated; please see github.com/protomaps/PMTiles for tools to upgrade"
	    );
	    return 2;
	  }
	  if (v.getUint16(2, true) === 1) {
	    console.warn(
	      "PMTiles spec version 1 has been deprecated; please see github.com/protomaps/PMTiles for tools to upgrade"
	    );
	    return 1;
	  }
	  return 3;
	}
	var EtagMismatch = class extends Error {
	};
	function getHeaderAndRoot(source, decompress) {
	  return __async(this, null, function* () {
	    const resp = yield source.getBytes(0, 16384);
	    const v = new DataView(resp.data);
	    if (v.getUint16(0, true) !== 19792) {
	      throw new Error("Wrong magic number for PMTiles archive");
	    }
	    if (detectVersion(resp.data) < 3) {
	      return [yield v2_default.getHeader(source)];
	    }
	    const headerData = resp.data.slice(0, HEADER_SIZE_BYTES);
	    const header = bytesToHeader(headerData, resp.etag);
	    const rootDirData = resp.data.slice(
	      header.rootDirectoryOffset,
	      header.rootDirectoryOffset + header.rootDirectoryLength
	    );
	    const dirKey = `${source.getKey()}|${header.etag || ""}|${header.rootDirectoryOffset}|${header.rootDirectoryLength}`;
	    const rootDir = deserializeIndex(
	      yield decompress(rootDirData, header.internalCompression)
	    );
	    return [header, [dirKey, rootDir.length, rootDir]];
	  });
	}
	function getDirectory(source, decompress, offset, length, header) {
	  return __async(this, null, function* () {
	    const resp = yield source.getBytes(offset, length, void 0, header.etag);
	    const data = yield decompress(resp.data, header.internalCompression);
	    const directory = deserializeIndex(data);
	    if (directory.length === 0) {
	      throw new Error("Empty directory is invalid");
	    }
	    return directory;
	  });
	}
	var ResolvedValueCache = class {
	  constructor(maxCacheEntries = 100, prefetch = true, decompress = defaultDecompress) {
	    this.cache = /* @__PURE__ */ new Map();
	    this.maxCacheEntries = maxCacheEntries;
	    this.counter = 1;
	    this.decompress = decompress;
	  }
	  getHeader(source) {
	    return __async(this, null, function* () {
	      const cacheKey = source.getKey();
	      const cacheValue = this.cache.get(cacheKey);
	      if (cacheValue) {
	        cacheValue.lastUsed = this.counter++;
	        const data = cacheValue.data;
	        return data;
	      }
	      const res = yield getHeaderAndRoot(source, this.decompress);
	      if (res[1]) {
	        this.cache.set(res[1][0], {
	          lastUsed: this.counter++,
	          data: res[1][2]
	        });
	      }
	      this.cache.set(cacheKey, {
	        lastUsed: this.counter++,
	        data: res[0]
	      });
	      this.prune();
	      return res[0];
	    });
	  }
	  getDirectory(source, offset, length, header) {
	    return __async(this, null, function* () {
	      const cacheKey = `${source.getKey()}|${header.etag || ""}|${offset}|${length}`;
	      const cacheValue = this.cache.get(cacheKey);
	      if (cacheValue) {
	        cacheValue.lastUsed = this.counter++;
	        const data = cacheValue.data;
	        return data;
	      }
	      const directory = yield getDirectory(
	        source,
	        this.decompress,
	        offset,
	        length,
	        header
	      );
	      this.cache.set(cacheKey, {
	        lastUsed: this.counter++,
	        data: directory
	      });
	      this.prune();
	      return directory;
	    });
	  }
	  // for v2 backwards compatibility
	  getArrayBuffer(source, offset, length, header) {
	    return __async(this, null, function* () {
	      const cacheKey = `${source.getKey()}|${header.etag || ""}|${offset}|${length}`;
	      const cacheValue = this.cache.get(cacheKey);
	      if (cacheValue) {
	        cacheValue.lastUsed = this.counter++;
	        const data = yield cacheValue.data;
	        return data;
	      }
	      const resp = yield source.getBytes(offset, length, void 0, header.etag);
	      this.cache.set(cacheKey, {
	        lastUsed: this.counter++,
	        data: resp.data
	      });
	      this.prune();
	      return resp.data;
	    });
	  }
	  prune() {
	    if (this.cache.size > this.maxCacheEntries) {
	      let minUsed = Infinity;
	      let minKey = void 0;
	      this.cache.forEach((cacheValue, key) => {
	        if (cacheValue.lastUsed < minUsed) {
	          minUsed = cacheValue.lastUsed;
	          minKey = key;
	        }
	      });
	      if (minKey) {
	        this.cache.delete(minKey);
	      }
	    }
	  }
	  invalidate(source) {
	    return __async(this, null, function* () {
	      this.cache.delete(source.getKey());
	    });
	  }
	};
	var SharedPromiseCache = class {
	  constructor(maxCacheEntries = 100, prefetch = true, decompress = defaultDecompress) {
	    this.cache = /* @__PURE__ */ new Map();
	    this.invalidations = /* @__PURE__ */ new Map();
	    this.maxCacheEntries = maxCacheEntries;
	    this.counter = 1;
	    this.decompress = decompress;
	  }
	  getHeader(source) {
	    return __async(this, null, function* () {
	      const cacheKey = source.getKey();
	      const cacheValue = this.cache.get(cacheKey);
	      if (cacheValue) {
	        cacheValue.lastUsed = this.counter++;
	        const data = yield cacheValue.data;
	        return data;
	      }
	      const p = new Promise((resolve, reject) => {
	        getHeaderAndRoot(source, this.decompress).then((res) => {
	          if (res[1]) {
	            this.cache.set(res[1][0], {
	              lastUsed: this.counter++,
	              data: Promise.resolve(res[1][2])
	            });
	          }
	          resolve(res[0]);
	          this.prune();
	        }).catch((e) => {
	          reject(e);
	        });
	      });
	      this.cache.set(cacheKey, { lastUsed: this.counter++, data: p });
	      return p;
	    });
	  }
	  getDirectory(source, offset, length, header) {
	    return __async(this, null, function* () {
	      const cacheKey = `${source.getKey()}|${header.etag || ""}|${offset}|${length}`;
	      const cacheValue = this.cache.get(cacheKey);
	      if (cacheValue) {
	        cacheValue.lastUsed = this.counter++;
	        const data = yield cacheValue.data;
	        return data;
	      }
	      const p = new Promise((resolve, reject) => {
	        getDirectory(source, this.decompress, offset, length, header).then((directory) => {
	          resolve(directory);
	          this.prune();
	        }).catch((e) => {
	          reject(e);
	        });
	      });
	      this.cache.set(cacheKey, { lastUsed: this.counter++, data: p });
	      return p;
	    });
	  }
	  // for v2 backwards compatibility
	  getArrayBuffer(source, offset, length, header) {
	    return __async(this, null, function* () {
	      const cacheKey = `${source.getKey()}|${header.etag || ""}|${offset}|${length}`;
	      const cacheValue = this.cache.get(cacheKey);
	      if (cacheValue) {
	        cacheValue.lastUsed = this.counter++;
	        const data = yield cacheValue.data;
	        return data;
	      }
	      const p = new Promise((resolve, reject) => {
	        source.getBytes(offset, length, void 0, header.etag).then((resp) => {
	          resolve(resp.data);
	          if (this.cache.has(cacheKey)) ;
	          this.prune();
	        }).catch((e) => {
	          reject(e);
	        });
	      });
	      this.cache.set(cacheKey, { lastUsed: this.counter++, data: p });
	      return p;
	    });
	  }
	  prune() {
	    if (this.cache.size >= this.maxCacheEntries) {
	      let minUsed = Infinity;
	      let minKey = void 0;
	      this.cache.forEach((cacheValue, key) => {
	        if (cacheValue.lastUsed < minUsed) {
	          minUsed = cacheValue.lastUsed;
	          minKey = key;
	        }
	      });
	      if (minKey) {
	        this.cache.delete(minKey);
	      }
	    }
	  }
	  invalidate(source) {
	    return __async(this, null, function* () {
	      const key = source.getKey();
	      if (this.invalidations.get(key)) {
	        return yield this.invalidations.get(key);
	      }
	      this.cache.delete(source.getKey());
	      const p = new Promise((resolve, reject) => {
	        this.getHeader(source).then((h) => {
	          resolve();
	          this.invalidations.delete(key);
	        }).catch((e) => {
	          reject(e);
	        });
	      });
	      this.invalidations.set(key, p);
	    });
	  }
	};
	var PMTiles = class {
	  constructor(source, cache, decompress) {
	    if (typeof source === "string") {
	      this.source = new FetchSource(source);
	    } else {
	      this.source = source;
	    }
	    if (decompress) {
	      this.decompress = decompress;
	    } else {
	      this.decompress = defaultDecompress;
	    }
	    if (cache) {
	      this.cache = cache;
	    } else {
	      this.cache = new SharedPromiseCache();
	    }
	  }
	  /**
	   * Return the header of the archive,
	   * including information such as tile type, min/max zoom, bounds, and summary statistics.
	   */
	  getHeader() {
	    return __async(this, null, function* () {
	      return yield this.cache.getHeader(this.source);
	    });
	  }
	  /** @hidden */
	  getZxyAttempt(z, x, y, signal) {
	    return __async(this, null, function* () {
	      const tileId = zxyToTileId(z, x, y);
	      const header = yield this.cache.getHeader(this.source);
	      if (header.specVersion < 3) {
	        return v2_default.getZxy(header, this.source, this.cache, z, x, y, signal);
	      }
	      if (z < header.minZoom || z > header.maxZoom) {
	        return void 0;
	      }
	      let dO = header.rootDirectoryOffset;
	      let dL = header.rootDirectoryLength;
	      for (let depth = 0; depth <= 3; depth++) {
	        const directory = yield this.cache.getDirectory(
	          this.source,
	          dO,
	          dL,
	          header
	        );
	        const entry = findTile(directory, tileId);
	        if (entry) {
	          if (entry.runLength > 0) {
	            const resp = yield this.source.getBytes(
	              header.tileDataOffset + entry.offset,
	              entry.length,
	              signal,
	              header.etag
	            );
	            return {
	              data: yield this.decompress(resp.data, header.tileCompression),
	              cacheControl: resp.cacheControl,
	              expires: resp.expires
	            };
	          }
	          dO = header.leafDirectoryOffset + entry.offset;
	          dL = entry.length;
	        } else {
	          return void 0;
	        }
	      }
	      throw Error("Maximum directory depth exceeded");
	    });
	  }
	  /**
	   * Primary method to get a single tile's bytes from an archive.
	   *
	   * Returns undefined if the tile does not exist in the archive.
	   */
	  getZxy(z, x, y, signal) {
	    return __async(this, null, function* () {
	      try {
	        return yield this.getZxyAttempt(z, x, y, signal);
	      } catch (e) {
	        if (e instanceof EtagMismatch) {
	          this.cache.invalidate(this.source);
	          return yield this.getZxyAttempt(z, x, y, signal);
	        }
	        throw e;
	      }
	    });
	  }
	  /** @hidden */
	  getMetadataAttempt() {
	    return __async(this, null, function* () {
	      const header = yield this.cache.getHeader(this.source);
	      const resp = yield this.source.getBytes(
	        header.jsonMetadataOffset,
	        header.jsonMetadataLength,
	        void 0,
	        header.etag
	      );
	      const decompressed = yield this.decompress(
	        resp.data,
	        header.internalCompression
	      );
	      const dec = new TextDecoder("utf-8");
	      return JSON.parse(dec.decode(decompressed));
	    });
	  }
	  /**
	   * Return the arbitrary JSON metadata of the archive.
	   */
	  getMetadata() {
	    return __async(this, null, function* () {
	      try {
	        return yield this.getMetadataAttempt();
	      } catch (e) {
	        if (e instanceof EtagMismatch) {
	          this.cache.invalidate(this.source);
	          return yield this.getMetadataAttempt();
	        }
	        throw e;
	      }
	    });
	  }
	  /**
	   * Construct a [TileJSON](https://github.com/mapbox/tilejson-spec) object.
	   *
	   * baseTilesUrl is the desired tiles URL, excluding the suffix `/{z}/{x}/{y}.{ext}`.
	   * For example, if the desired URL is `http://example.com/tileset/{z}/{x}/{y}.mvt`,
	   * the baseTilesUrl should be `https://example.com/tileset`.
	   */
	  getTileJson(baseTilesUrl) {
	    return __async(this, null, function* () {
	      const header = yield this.getHeader();
	      const metadata = yield this.getMetadata();
	      const ext = tileTypeExt(header.tileType);
	      return {
	        tilejson: "3.0.0",
	        scheme: "xyz",
	        tiles: [`${baseTilesUrl}/{z}/{x}/{y}${ext}`],
	        // biome-ignore lint: TileJSON spec
	        vector_layers: metadata.vector_layers,
	        attribution: metadata.attribution,
	        description: metadata.description,
	        name: metadata.name,
	        version: metadata.version,
	        bounds: [header.minLon, header.minLat, header.maxLon, header.maxLat],
	        center: [header.centerLon, header.centerLat, header.centerZoom],
	        minzoom: header.minZoom,
	        maxzoom: header.maxZoom
	      };
	    });
	  }
	};
	return dist;
}

var distExports = requireDist();

var rbush_min$1 = {exports: {}};

var rbush_min = rbush_min$1.exports;

var hasRequiredRbush_min;

function requireRbush_min () {
	if (hasRequiredRbush_min) return rbush_min$1.exports;
	hasRequiredRbush_min = 1;
	(function (module, exports) {
		!function(t,i){module.exports=i();}(rbush_min,function(){function t(t,r,e,a,h){!function t(n,r,e,a,h){for(;a>e;){if(a-e>600){var o=a-e+1,s=r-e+1,l=Math.log(o),f=.5*Math.exp(2*l/3),u=.5*Math.sqrt(l*f*(o-f)/o)*(s-o/2<0?-1:1),m=Math.max(e,Math.floor(r-s*f/o+u)),c=Math.min(a,Math.floor(r+(o-s)*f/o+u));t(n,r,m,c,h);}var p=n[r],d=e,x=a;for(i(n,e,r),h(n[a],p)>0&&i(n,e,a);d<x;){for(i(n,d,x),d++,x--;h(n[d],p)<0;)d++;for(;h(n[x],p)>0;)x--;}0===h(n[e],p)?i(n,e,x):i(n,++x,a),x<=r&&(e=x+1),r<=x&&(a=x-1);}}(t,r,e||0,a||t.length-1,h||n);}function i(t,i,n){var r=t[i];t[i]=t[n],t[n]=r;}function n(t,i){return t<i?-1:t>i?1:0}var r=function(t){ void 0===t&&(t=9),this._maxEntries=Math.max(4,t),this._minEntries=Math.max(2,Math.ceil(.4*this._maxEntries)),this.clear();};function e(t,i,n){if(!n)return i.indexOf(t);for(var r=0;r<i.length;r++)if(n(t,i[r]))return r;return  -1}function a(t,i){h(t,0,t.children.length,i,t);}function h(t,i,n,r,e){e||(e=p(null)),e.minX=1/0,e.minY=1/0,e.maxX=-1/0,e.maxY=-1/0;for(var a=i;a<n;a++){var h=t.children[a];o(e,t.leaf?r(h):h);}return e}function o(t,i){return t.minX=Math.min(t.minX,i.minX),t.minY=Math.min(t.minY,i.minY),t.maxX=Math.max(t.maxX,i.maxX),t.maxY=Math.max(t.maxY,i.maxY),t}function s(t,i){return t.minX-i.minX}function l(t,i){return t.minY-i.minY}function f(t){return (t.maxX-t.minX)*(t.maxY-t.minY)}function u(t){return t.maxX-t.minX+(t.maxY-t.minY)}function m(t,i){return t.minX<=i.minX&&t.minY<=i.minY&&i.maxX<=t.maxX&&i.maxY<=t.maxY}function c(t,i){return i.minX<=t.maxX&&i.minY<=t.maxY&&i.maxX>=t.minX&&i.maxY>=t.minY}function p(t){return {children:t,height:1,leaf:true,minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0}}function d(i,n,r,e,a){for(var h=[n,r];h.length;)if(!((r=h.pop())-(n=h.pop())<=e)){var o=n+Math.ceil((r-n)/e/2)*e;t(i,o,n,r,a),h.push(n,o,o,r);}}return r.prototype.all=function(){return this._all(this.data,[])},r.prototype.search=function(t){var i=this.data,n=[];if(!c(t,i))return n;for(var r=this.toBBox,e=[];i;){for(var a=0;a<i.children.length;a++){var h=i.children[a],o=i.leaf?r(h):h;c(t,o)&&(i.leaf?n.push(h):m(t,o)?this._all(h,n):e.push(h));}i=e.pop();}return n},r.prototype.collides=function(t){var i=this.data;if(!c(t,i))return  false;for(var n=[];i;){for(var r=0;r<i.children.length;r++){var e=i.children[r],a=i.leaf?this.toBBox(e):e;if(c(t,a)){if(i.leaf||m(t,a))return  true;n.push(e);}}i=n.pop();}return  false},r.prototype.load=function(t){if(!t||!t.length)return this;if(t.length<this._minEntries){for(var i=0;i<t.length;i++)this.insert(t[i]);return this}var n=this._build(t.slice(),0,t.length-1,0);if(this.data.children.length)if(this.data.height===n.height)this._splitRoot(this.data,n);else {if(this.data.height<n.height){var r=this.data;this.data=n,n=r;}this._insert(n,this.data.height-n.height-1,true);}else this.data=n;return this},r.prototype.insert=function(t){return t&&this._insert(t,this.data.height-1),this},r.prototype.clear=function(){return this.data=p([]),this},r.prototype.remove=function(t,i){if(!t)return this;for(var n,r,a,h=this.data,o=this.toBBox(t),s=[],l=[];h||s.length;){if(h||(h=s.pop(),r=s[s.length-1],n=l.pop(),a=true),h.leaf){var f=e(t,h.children,i);if(-1!==f)return h.children.splice(f,1),s.push(h),this._condense(s),this}a||h.leaf||!m(h,o)?r?(n++,h=r.children[n],a=false):h=null:(s.push(h),l.push(n),n=0,r=h,h=h.children[0]);}return this},r.prototype.toBBox=function(t){return t},r.prototype.compareMinX=function(t,i){return t.minX-i.minX},r.prototype.compareMinY=function(t,i){return t.minY-i.minY},r.prototype.toJSON=function(){return this.data},r.prototype.fromJSON=function(t){return this.data=t,this},r.prototype._all=function(t,i){for(var n=[];t;)t.leaf?i.push.apply(i,t.children):n.push.apply(n,t.children),t=n.pop();return i},r.prototype._build=function(t,i,n,r){var e,h=n-i+1,o=this._maxEntries;if(h<=o)return a(e=p(t.slice(i,n+1)),this.toBBox),e;r||(r=Math.ceil(Math.log(h)/Math.log(o)),o=Math.ceil(h/Math.pow(o,r-1))),(e=p([])).leaf=false,e.height=r;var s=Math.ceil(h/o),l=s*Math.ceil(Math.sqrt(o));d(t,i,n,l,this.compareMinX);for(var f=i;f<=n;f+=l){var u=Math.min(f+l-1,n);d(t,f,u,s,this.compareMinY);for(var m=f;m<=u;m+=s){var c=Math.min(m+s-1,u);e.children.push(this._build(t,m,c,r-1));}}return a(e,this.toBBox),e},r.prototype._chooseSubtree=function(t,i,n,r){for(;r.push(i),!i.leaf&&r.length-1!==n;){for(var e=1/0,a=1/0,h=void 0,o=0;o<i.children.length;o++){var s=i.children[o],l=f(s),u=(m=t,c=s,(Math.max(c.maxX,m.maxX)-Math.min(c.minX,m.minX))*(Math.max(c.maxY,m.maxY)-Math.min(c.minY,m.minY))-l);u<a?(a=u,e=l<e?l:e,h=s):u===a&&l<e&&(e=l,h=s);}i=h||i.children[0];}var m,c;return i},r.prototype._insert=function(t,i,n){var r=n?t:this.toBBox(t),e=[],a=this._chooseSubtree(r,this.data,i,e);for(a.children.push(t),o(a,r);i>=0&&e[i].children.length>this._maxEntries;)this._split(e,i),i--;this._adjustParentBBoxes(r,e,i);},r.prototype._split=function(t,i){var n=t[i],r=n.children.length,e=this._minEntries;this._chooseSplitAxis(n,e,r);var h=this._chooseSplitIndex(n,e,r),o=p(n.children.splice(h,n.children.length-h));o.height=n.height,o.leaf=n.leaf,a(n,this.toBBox),a(o,this.toBBox),i?t[i-1].children.push(o):this._splitRoot(n,o);},r.prototype._splitRoot=function(t,i){this.data=p([t,i]),this.data.height=t.height+1,this.data.leaf=false,a(this.data,this.toBBox);},r.prototype._chooseSplitIndex=function(t,i,n){for(var r,e,a,o,s,l,u,m=1/0,c=1/0,p=i;p<=n-i;p++){var d=h(t,0,p,this.toBBox),x=h(t,p,n,this.toBBox),v=(e=d,a=x,o=void 0,s=void 0,l=void 0,u=void 0,o=Math.max(e.minX,a.minX),s=Math.max(e.minY,a.minY),l=Math.min(e.maxX,a.maxX),u=Math.min(e.maxY,a.maxY),Math.max(0,l-o)*Math.max(0,u-s)),M=f(d)+f(x);v<m?(m=v,r=p,c=M<c?M:c):v===m&&M<c&&(c=M,r=p);}return r||n-i},r.prototype._chooseSplitAxis=function(t,i,n){var r=t.leaf?this.compareMinX:s,e=t.leaf?this.compareMinY:l;this._allDistMargin(t,i,n,r)<this._allDistMargin(t,i,n,e)&&t.children.sort(r);},r.prototype._allDistMargin=function(t,i,n,r){t.children.sort(r);for(var e=this.toBBox,a=h(t,0,i,e),s=h(t,n-i,n,e),l=u(a)+u(s),f=i;f<n-i;f++){var m=t.children[f];o(a,t.leaf?e(m):m),l+=u(a);}for(var c=n-i-1;c>=i;c--){var p=t.children[c];o(s,t.leaf?e(p):p),l+=u(s);}return l},r.prototype._adjustParentBBoxes=function(t,i,n){for(var r=n;r>=0;r--)o(i[r],t);},r.prototype._condense=function(t){for(var i=t.length-1,n=void 0;i>=0;i--)0===t[i].children.length?i>0?(n=t[i-1].children).splice(n.indexOf(t[i]),1):this.clear():a(t[i],this.toBBox);},r}); 
	} (rbush_min$1));
	return rbush_min$1.exports;
}

var rbush_minExports = requireRbush_min();
var Et = /*@__PURE__*/getDefaultExportFromCjs(rbush_minExports);

function potpack(boxes) {

    // calculate total box area and maximum box width
    let area = 0;
    let maxWidth = 0;

    for (const box of boxes) {
        area += box.w * box.h;
        maxWidth = Math.max(maxWidth, box.w);
    }

    // sort the boxes for insertion by height, descending
    boxes.sort((a, b) => b.h - a.h);

    // aim for a squarish resulting container,
    // slightly adjusted for sub-100% space utilization
    const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);

    // start with a single empty space, unbounded at the bottom
    const spaces = [{x: 0, y: 0, w: startWidth, h: Infinity}];

    let width = 0;
    let height = 0;

    for (const box of boxes) {
        // look through spaces backwards so that we check smaller spaces first
        for (let i = spaces.length - 1; i >= 0; i--) {
            const space = spaces[i];

            // look for empty spaces that can accommodate the current box
            if (box.w > space.w || box.h > space.h) continue;

            // found the space; add the box to its top-left corner
            // |-------|-------|
            // |  box  |       |
            // |_______|       |
            // |         space |
            // |_______________|
            box.x = space.x;
            box.y = space.y;

            height = Math.max(height, box.y + box.h);
            width = Math.max(width, box.x + box.w);

            if (box.w === space.w && box.h === space.h) {
                // space matches the box exactly; remove it
                const last = spaces.pop();
                if (i < spaces.length) spaces[i] = last;

            } else if (box.h === space.h) {
                // space matches the box height; update it accordingly
                // |-------|---------------|
                // |  box  | updated space |
                // |_______|_______________|
                space.x += box.w;
                space.w -= box.w;

            } else if (box.w === space.w) {
                // space matches the box width; update it accordingly
                // |---------------|
                // |      box      |
                // |_______________|
                // | updated space |
                // |_______________|
                space.y += box.h;
                space.h -= box.h;

            } else {
                // otherwise the box splits the space into two spaces
                // |-------|-----------|
                // |  box  | new space |
                // |_______|___________|
                // | updated space     |
                // |___________________|
                spaces.push({
                    x: space.x + box.w,
                    y: space.y,
                    w: space.w - box.w,
                    h: box.h
                });
                space.y += box.h;
                space.h -= box.h;
            }
            break;
        }
    }

    return {
        w: width, // container width
        h: height, // container height
        fill: (area / (width * height)) || 0 // space utilization
    };
}

var pt=Object.defineProperty;var C=Math.pow;var c=(a,e)=>pt(a,"name",{value:e,configurable:true});var D=(a,e,t)=>new Promise((r,n)=>{var i=o=>{try{l(t.next(o));}catch(f){n(f);}},s=o=>{try{l(t.throw(o));}catch(f){n(f);}},l=o=>o.done?r(o.value):Promise.resolve(o.value).then(i,s);l((t=t.apply(a,e)).next());});var be=class be{constructor(e,t){this.str=e!=null?e:t,this.perFeature=typeof this.str=="function"&&this.str.length===2;}get(e,t){return typeof this.str=="function"?this.str(e,t):this.str}};c(be,"StringAttr");var O=be,he=class he{constructor(e,t=1){this.value=e!=null?e:t,this.perFeature=typeof this.value=="function"&&this.value.length===2;}get(e,t){return typeof this.value=="function"?this.value(e,t):this.value}};c(he,"NumberAttr");var T=he,pe=class pe{constructor(e){var t;this.labelProps=(t=e==null?void 0:e.labelProps)!=null?t:["name"],this.textTransform=e==null?void 0:e.textTransform;}get(e,t){let r,n;typeof this.labelProps=="function"?n=this.labelProps(e,t):n=this.labelProps;for(let s of n)if(Object.prototype.hasOwnProperty.call(t.props,s)&&typeof t.props[s]=="string"){r=t.props[s];break}let i;return typeof this.textTransform=="function"?i=this.textTransform(e,t):i=this.textTransform,r&&i==="uppercase"?r=r.toUpperCase():r&&i==="lowercase"?r=r.toLowerCase():r&&i==="capitalize"&&(r=r.toLowerCase().split(" ").map(o=>o[0].toUpperCase()+o.slice(1)).join(" ")),r}};c(pe,"TextAttr");var E=pe,ge=class ge{constructor(e){var t,r;e!=null&&e.font?this.font=e.font:(this.family=(t=e==null?void 0:e.fontFamily)!=null?t:"sans-serif",this.size=(r=e==null?void 0:e.fontSize)!=null?r:12,this.weight=e==null?void 0:e.fontWeight,this.style=e==null?void 0:e.fontStyle);}get(e,t){if(this.font)return typeof this.font=="function"?this.font(e,t):this.font;let r="";this.style&&(typeof this.style=="function"?r=`${this.style(e,t)} `:r=`${this.style} `);let n="";this.weight&&(typeof this.weight=="function"?n=`${this.weight(e,t)} `:n=`${this.weight} `);let i;typeof this.size=="function"?i=this.size(e,t):i=this.size;let s;return typeof this.family=="function"?s=this.family(e,t):s=this.family,`${r}${n}${i}px ${s}`}};c(ge,"FontAttr");var N=ge,ye=class ye{constructor(e,t=[]){this.value=e!=null?e:t,this.perFeature=typeof this.value=="function"&&this.value.length===2;}get(e,t){return typeof this.value=="function"?this.value(e,t):this.value}};c(ye,"ArrayAttr");var q=ye;var gt=c((a,e,t)=>{let r=[],n,i,s,l=0,o=0,f=0,u=0,m=0,d=0,h=0,g=0,y=0,_=0,k=0,p=0;if(a.length<2)return [];if(a.length===2)return f=Math.sqrt(C(a[1].x-a[0].x,2)+C(a[1].y-a[0].y,2)),[{length:f,beginIndex:0,beginDistance:0,endIndex:2,endDistance:f}];for(u=Math.sqrt(C(a[1].x-a[0].x,2)+C(a[1].y-a[0].y,2)),l=1,o=a.length-1;l<o;l++)n=a[l-1],i=a[l],s=a[l+1],d=i.x-n.x,h=i.y-n.y,g=s.x-i.x,y=s.y-i.y,m=Math.sqrt(g*g+y*y),f+=u,_=Math.acos((d*g+h*y)/(u*m)),(_>e||f-p>t)&&(r.push({length:f-p,beginDistance:p,beginIndex:k,endIndex:l+1,endDistance:f}),k=l,p=f),u=m;return l-k>0&&r.push({length:f-p+m,beginIndex:k,beginDistance:p,endIndex:l+1,endDistance:f+m}),r},"linelabel");function Ue(a,e,t,r){let n=[];for(let i of a){let s=gt(i,Math.PI/45,e);for(let l of s)if(l.length>=e+r){let o=new Point(i[l.beginIndex].x,i[l.beginIndex].y),f=i[l.endIndex-1],u=new Point((f.x-o.x)/l.length,(f.y-o.y)/l.length);for(let m=r;m<l.length-e;m+=t)n.push({start:o.add(u.mult(m)),end:o.add(u.mult(m+e))});}}return n}c(Ue,"simpleLabel");function Ge(a,e,t,r){let n=e.x-a.x,i=e.y-a.y,s=Math.sqrt(C(e.x-a.x,2)+C(e.y-a.y,2)),l=[];for(let o=0;o<t+r;o+=2*r){let f=o*1/s;l.push({x:a.x+f*n,y:a.y+f*i});}return l}c(Ge,"lineCells");function xe(a,e){if(a.length<=e)return [a];let t=e-1,r=a.lastIndexOf(" ",t),n=a.indexOf(" ",t);if(r===-1&&n===-1)return [a];let i,s;return n===-1||r>=0&&t-r<n-t?(i=a.substring(0,r),s=a.substring(r+1,a.length)):(i=a.substring(0,n),s=a.substring(n+1,a.length)),[i,...xe(s,e)]}c(xe,"linebreak");var rt=(r=>(r[r.Point=1]="Point",r[r.Line=2]="Line",r[r.Polygon=3]="Polygon",r))(rt||{});function Y(a){return `${a.x}:${a.y}:${a.z}`}c(Y,"toIndex");var kt=c((a,e,t)=>{a.pos=e;let r=a.readVarint()+a.pos,n=1,i=0,s=0,l=0,o=1/0,f=-1/0,u=1/0,m=-1/0,d=[],h=[];for(;a.pos<r;){if(i<=0){let g=a.readVarint();n=g&7,i=g>>3;}if(i--,n===1||n===2)s+=a.readSVarint()*t,l+=a.readSVarint()*t,s<o&&(o=s),s>f&&(f=s),l<u&&(u=l),l>m&&(m=l),n===1&&(h.length>0&&d.push(h),h=[]),h.push(new Point(s,l));else if(n===7)h&&h.push(h[0].clone());else throw new Error(`unknown command ${n}`)}return h&&d.push(h),{geom:d,bbox:{minX:o,minY:u,maxX:f,maxY:m}}},"loadGeomAndBbox");function nt(a,e){let t=new VectorTile(new Pbf(a)),r=new Map;for(let[n,i]of Object.entries(t.layers)){let s=[],l=i;for(let o=0;o<l.length;o++){let f=kt(l.feature(o)._pbf,l.feature(o)._geometry,e/l.extent),u=0;for(let m of f.geom)u+=m.length;s.push({id:l.feature(o).id,geomType:l.feature(o).type,geom:f.geom,numVertices:u,bbox:f.bbox,props:l.feature(o).properties});}r.set(n,s);}return r}c(nt,"parseTile");var we=class we{constructor(e,t){typeof e=="string"?this.p=new distExports.PMTiles(e):this.p=e,this.zoomaborts=[],this.shouldCancelZooms=t;}get(e,t){return D(this,null,function*(){this.shouldCancelZooms&&(this.zoomaborts=this.zoomaborts.filter(s=>s.z!==e.z?(s.controller.abort(),false):true));let r=new AbortController;this.zoomaborts.push({z:e.z,controller:r});let n=r.signal,i=yield this.p.getZxy(e.z,e.x,e.y,n);return i?nt(i.data,t):new Map})}};c(we,"PmtilesSource");var H=we,ke=class ke{constructor(e,t){this.url=e,this.zoomaborts=[],this.shouldCancelZooms=t;}get(e,t){return D(this,null,function*(){this.shouldCancelZooms&&(this.zoomaborts=this.zoomaborts.filter(s=>s.z!==e.z?(s.controller.abort(),false):true));let r=this.url.replace("{z}",e.z.toString()).replace("{x}",e.x.toString()).replace("{y}",e.y.toString()),n=new AbortController;this.zoomaborts.push({z:e.z,controller:n});let i=n.signal;return new Promise((s,l)=>{fetch(r,{signal:i}).then(o=>o.arrayBuffer()).then(o=>{let f=nt(o,t);s(f);}).catch(o=>{l(o);});})})}};c(ke,"ZxySource");var Q=ke,_e=6378137,Qe=85.0511287798,U=_e*Math.PI,zt=c(a=>{let e=Math.PI/180,t=Math.max(Math.min(Qe,a[0]),-85.0511287798),r=Math.sin(t*e);return new Point(_e*a[1]*e,_e*Math.log((1+r)/(1-r))/2)},"project");function et(a){return a*a}c(et,"sqr");function G(a,e){return et(a.x-e.x)+et(a.y-e.y)}c(G,"dist2");function Tt(a,e,t){let r=G(e,t);if(r===0)return G(a,e);let n=((a.x-e.x)*(t.x-e.x)+(a.y-e.y)*(t.y-e.y))/r;return n=Math.max(0,Math.min(1,n)),G(a,new Point(e.x+n*(t.x-e.x),e.y+n*(t.y-e.y)))}c(Tt,"distToSegmentSquared");function tt(a,e){let t=false;for(let r=0,n=e.length-1;r<e.length;n=r++){let i=e[r].x,s=e[r].y,l=e[n].x,o=e[n].y;s>a.y!=o>a.y&&a.x<(l-i)*(a.y-s)/(o-s)+i&&(t=!t);}return t}c(tt,"isInRing");function Pt(a){let e=0;for(let t=0;t<a.length;t++){let r=(t+1)%a.length;e+=a[t].x*a[r].y,e-=a[r].x*a[t].y;}return e<0}c(Pt,"isCcw");function Lt(a,e){let t=false;for(let r of e)if(Pt(r))tt(a,r)&&(t=false);else {if(t)return  true;tt(a,r)&&(t=true);}return t}c(Lt,"pointInPolygon");function vt(a,e){let t=1/0;for(let r of e){let n=Math.sqrt(G(a,r[0]));n<t&&(t=n);}return t}c(vt,"pointMinDistToPoints");function Ct(a,e){let t=1/0;for(let r of e)for(let n=0;n<r.length-1;n++){let i=Math.sqrt(Tt(a,r[n],r[n+1]));i<t&&(t=i);}return t}c(Ct,"pointMinDistToLines");var ze=class ze{constructor(e,t){this.source=e,this.cache=new Map,this.inflight=new Map,this.tileSize=t;}get(e){return D(this,null,function*(){let t=Y(e);return new Promise((r,n)=>{let i=this.cache.get(t);if(i)i.used=performance.now(),r(i.data);else {let s=this.inflight.get(t);s?s.push({resolve:r,reject:n}):(this.inflight.set(t,[]),this.source.get(e,this.tileSize).then(l=>{this.cache.set(t,{used:performance.now(),data:l});let o=this.inflight.get(t);if(o)for(let f of o)f.resolve(l);if(this.inflight.delete(t),r(l),this.cache.size>=64){let f=1/0,u;this.cache.forEach((m,d)=>{m.used<f&&(f=m.used,u=d);}),u&&this.cache.delete(u);}}).catch(l=>{let o=this.inflight.get(t);if(o)for(let f of o)f.reject(l);this.inflight.delete(t),n(l);}));}})})}queryFeatures(e,t,r,n){let i=zt([t,e]),s=new Point((i.x+U)/(U*2),1-(i.y+U)/(U*2));s.x>1&&(s.x=s.x-Math.floor(s.x));let l=s.mult(1<<r),o=Math.floor(l.x),f=Math.floor(l.y),u=Y({z:r,x:o,y:f}),m=[],d=this.cache.get(u);if(d){let h=new Point((l.x-o)*this.tileSize,(l.y-f)*this.tileSize);for(let[g,y]of d.data.entries())for(let _ of y)_.geomType===1?vt(h,_.geom)<n&&m.push({feature:_,layerName:g}):_.geomType===2?Ct(h,_.geom)<n&&m.push({feature:_,layerName:g}):Lt(h,_.geom)&&m.push({feature:_,layerName:g});}return m}};c(ze,"TileCache");var ee=ze;var St=(r=>(r[r.Left=1]="Left",r[r.Center=2]="Center",r[r.Right=3]="Right",r))(St||{}),At=(o=>(o[o.N=1]="N",o[o.Ne=2]="Ne",o[o.E=3]="E",o[o.Se=4]="Se",o[o.S=5]="S",o[o.Sw=6]="Sw",o[o.W=7]="W",o[o.Nw=8]="Nw",o))(At||{}),zr=c((a,e,t)=>{let r=document.createElement("canvas"),n=r.getContext("2d");return r.width=a,r.height=e,n!==null&&t(r,n),r},"createPattern"),ve=class ve{constructor(e){var t;this.pattern=e.pattern,this.fill=new O(e.fill,"black"),this.opacity=new T(e.opacity,1),this.stroke=new O(e.stroke,"black"),this.width=new T(e.width,0),this.perFeature=(t=this.fill.perFeature||this.opacity.perFeature||this.stroke.perFeature||this.width.perFeature||e.perFeature)!=null?t:false,this.doStroke=false;}before(e,t){if(!this.perFeature){e.globalAlpha=this.opacity.get(t),e.fillStyle=this.fill.get(t),e.strokeStyle=this.stroke.get(t);let r=this.width.get(t);r>0&&(this.doStroke=true),e.lineWidth=r;}if(this.pattern){let r=e.createPattern(this.pattern,"repeat");r&&(e.fillStyle=r);}}draw(e,t,r,n){let i=false;if(this.perFeature){e.globalAlpha=this.opacity.get(r,n),e.fillStyle=this.fill.get(r,n);let l=this.width.get(r,n);l&&(i=true,e.strokeStyle=this.stroke.get(r,n),e.lineWidth=l);}let s=c(()=>{e.fill(),(i||this.doStroke)&&e.stroke();},"drawPath");e.beginPath();for(let l of t)for(let o=0;o<l.length;o++){let f=l[o];o===0?e.moveTo(f.x,f.y):e.lineTo(f.x,f.y);}s();}};c(ve,"PolygonSymbolizer");var P=ve;function Tr(a,e){return t=>{let r=t-a;return r>=0&&r<e.length?e[r]:0}}c(Tr,"arr");function Dt(a,e){let t=0;for(;e[t+1][0]<a;)t++;return t}c(Dt,"getStopIndex");function Ot(a,e,t){return a*(t-e)+e}c(Ot,"interpolate");function Mt(a,e,t,r){let n=r[e+1][0]-r[e][0],i=a-r[e][0];return n===0?0:t===1?i/n:(C(t,i)-1)/(C(t,n)-1)}c(Mt,"computeInterpolationFactor");function F(a,e){return t=>{if(e.length<1)return 0;if(t<=e[0][0])return e[0][1];if(t>=e[e.length-1][0])return e[e.length-1][1];let r=Dt(t,e),n=Mt(t,r,a,e);return Ot(n,e[r][1],e[r+1][1])}}c(F,"exp");function Pr(a,e){return t=>{if(e.length<1)return 0;let r=a;for(let n=0;n<e.length;n++)t>=e[n][0]&&(r=e[n][1]);return r}}c(Pr,"step");function Le(a){return F(1,a)}c(Le,"linear");var Ce=class Ce{constructor(e){var t;this.color=new O(e.color,"black"),this.width=new T(e.width),this.opacity=new T(e.opacity),this.dash=e.dash?new q(e.dash):null,this.dashColor=new O(e.dashColor,"black"),this.dashWidth=new T(e.dashWidth,1),this.lineCap=new O(e.lineCap,"butt"),this.lineJoin=new O(e.lineJoin,"miter"),this.skip=false,this.perFeature=!!((t=this.dash)!=null&&t.perFeature||this.color.perFeature||this.opacity.perFeature||this.width.perFeature||this.lineCap.perFeature||this.lineJoin.perFeature||e.perFeature);}before(e,t){this.perFeature||(e.strokeStyle=this.color.get(t),e.lineWidth=this.width.get(t),e.globalAlpha=this.opacity.get(t),e.lineCap=this.lineCap.get(t),e.lineJoin=this.lineJoin.get(t));}draw(e,t,r,n){if(this.skip)return;let i=c(()=>{this.perFeature&&(e.globalAlpha=this.opacity.get(r,n),e.lineCap=this.lineCap.get(r,n),e.lineJoin=this.lineJoin.get(r,n)),this.dash?(e.save(),this.perFeature?(e.lineWidth=this.dashWidth.get(r,n),e.strokeStyle=this.dashColor.get(r,n),e.setLineDash(this.dash.get(r,n))):e.setLineDash(this.dash.get(r)),e.stroke(),e.restore()):(e.save(),this.perFeature&&(e.lineWidth=this.width.get(r,n),e.strokeStyle=this.color.get(r,n)),e.stroke(),e.restore());},"strokePath");e.beginPath();for(let s of t)for(let l=0;l<s.length;l++){let o=s[l];l===0?e.moveTo(o.x,o.y):e.lineTo(o.x,o.y);}i();}};c(Ce,"LineSymbolizer");var M$1=Ce,Se=class Se{constructor(e){this.name=e.name,this.sheet=e.sheet,this.dpr=window.devicePixelRatio;}place(e,t,r){let i=new Point(t[0][0].x,t[0][0].y),s=this.sheet.get(this.name),l=s.w/this.dpr,o=s.h/this.dpr,f={minX:i.x-l/2,minY:i.y-o/2,maxX:i.x+l/2,maxY:i.y+o/2};return [{anchor:i,bboxes:[f],draw:c(m=>{m.globalAlpha=1,m.drawImage(this.sheet.canvas,s.x,s.y,s.w,s.h,-s.w/2/this.dpr,-s.h/2/this.dpr,s.w/2,s.h/2);},"draw")}]}};c(Se,"IconSymbolizer");var it=Se,Ae=class Ae{constructor(e){this.radius=new T(e.radius,3),this.fill=new O(e.fill,"black"),this.stroke=new O(e.stroke,"white"),this.width=new T(e.width,0),this.opacity=new T(e.opacity);}draw(e,t,r,n){e.globalAlpha=this.opacity.get(r,n);let i=this.radius.get(r,n),s=this.width.get(r,n);s>0&&(e.strokeStyle=this.stroke.get(r,n),e.lineWidth=s,e.beginPath(),e.arc(t[0][0].x,t[0][0].y,i+s/2,0,2*Math.PI),e.stroke()),e.fillStyle=this.fill.get(r,n),e.beginPath(),e.arc(t[0][0].x,t[0][0].y,i,0,2*Math.PI),e.fill();}place(e,t,r){let i=new Point(t[0][0].x,t[0][0].y),s=this.radius.get(e.zoom,r),l={minX:i.x-s,minY:i.y-s,maxX:i.x+s,maxY:i.y+s};return [{anchor:i,bboxes:[l],draw:c(f=>{this.draw(f,[[new Point(0,0)]],e.zoom,r);},"draw")}]}};c(Ae,"CircleSymbolizer");var te=Ae,De=class De{constructor(e){this.font=new N(e),this.text=new E(e),this.fill=new O(e.fill,"black"),this.background=new O(e.background,"white"),this.padding=new T(e.padding,0);}place(e,t,r){let n=this.text.get(e.zoom,r);if(!n)return;let i=this.font.get(e.zoom,r);e.scratch.font=i;let s=e.scratch.measureText(n),l=s.width,o=s.actualBoundingBoxAscent,f=s.actualBoundingBoxDescent,m=new Point(t[0][0].x,t[0][0].y),d=this.padding.get(e.zoom,r),h={minX:m.x-l/2-d,minY:m.y-o-d,maxX:m.x+l/2+d,maxY:m.y+f+d};return [{anchor:m,bboxes:[h],draw:c(y=>{y.globalAlpha=1,y.fillStyle=this.background.get(e.zoom,r),y.fillRect(-l/2-d,-o-d,l+2*d,o+f+2*d),y.fillStyle=this.fill.get(e.zoom,r),y.font=i,y.fillText(n,-l/2,0);},"draw")}]}};c(De,"ShieldSymbolizer");var at=De,Oe=class Oe{constructor(e){this.list=e;}place(e,t,r){let n=this.list[0].place(e,t,r);if(!n)return;let i=n[0],s=i.anchor,l=i.bboxes[0],o=l.maxY-l.minY,f=[{draw:i.draw,translate:{x:0,y:0}}],u=[[new Point(t[0][0].x,t[0][0].y+o)]];for(let d=1;d<this.list.length;d++)n=this.list[d].place(e,u,r),n&&(i=n[0],l=lt(l,i.bboxes[0]),f.push({draw:i.draw,translate:{x:0,y:o}}));return [{anchor:s,bboxes:[l],draw:c(d=>{for(let h of f)d.save(),d.translate(h.translate.x,h.translate.y),h.draw(d),d.restore();},"draw")}]}};c(Oe,"FlexSymbolizer");var st=Oe,lt=c((a,e)=>({minX:Math.min(a.minX,e.minX),minY:Math.min(a.minY,e.minY),maxX:Math.max(a.maxX,e.maxX),maxY:Math.max(a.maxY,e.maxY)}),"mergeBbox"),Me=class Me{constructor(e){this.list=e;}place(e,t,r){let n=this.list[0];if(!n)return;let i=n.place(e,t,r);if(!i)return;let s=i[0],l=s.anchor,o=s.bboxes[0],f=[s.draw];for(let m=1;m<this.list.length;m++){if(i=this.list[m].place(e,t,r),!i)return;s=i[0],o=lt(o,s.bboxes[0]),f.push(s.draw);}return [{anchor:l,bboxes:[o],draw:c(m=>{for(let d of f)d(m);},"draw")}]}};c(Me,"GroupSymbolizer");var re=Me,Re=class Re{constructor(e){this.symbolizer=e;}place(e,t,r){let n=t[0][0],i=this.symbolizer.place(e,[[new Point(0,0)]],r);if(!i||i.length===0)return;let s=i[0],l=s.bboxes[0],o=l.maxX-l.minX,f=l.maxY-l.minY,u={minX:n.x-o/2,maxX:n.x+o/2,minY:n.y-f/2,maxY:n.y+f/2};return [{anchor:n,bboxes:[u],draw:c(d=>{d.translate(-o/2,f/2-l.maxY),s.draw(d,{justify:2});},"draw")}]}};c(Re,"CenteredSymbolizer");var Te=Re,Fe=class Fe{constructor(e,t){this.padding=new T(e,0),this.symbolizer=t;}place(e,t,r){let n=this.symbolizer.place(e,t,r);if(!n||n.length===0)return;let i=this.padding.get(e.zoom,r);for(let s of n)for(let l of s.bboxes)l.minX-=i,l.minY-=i,l.maxX+=i,l.maxY+=i;return n}};c(Fe,"Padding");var ot=Fe,je=class je{constructor(e){this.font=new N(e),this.text=new E(e),this.fill=new O(e.fill,"black"),this.stroke=new O(e.stroke,"black"),this.width=new T(e.width,0),this.lineHeight=new T(e.lineHeight,1),this.letterSpacing=new T(e.letterSpacing,0),this.maxLineCodeUnits=new T(e.maxLineChars,15),this.justify=e.justify;}place(e,t,r){let n=this.text.get(e.zoom,r);if(!n)return;let i=this.font.get(e.zoom,r);e.scratch.font=i;let s=this.letterSpacing.get(e.zoom,r),l=xe(n,this.maxLineCodeUnits.get(e.zoom,r)),o="",f=0;for(let p of l)p.length>f&&(f=p.length,o=p);let u=e.scratch.measureText(o),m=u.width+s*(f-1),d=u.actualBoundingBoxAscent,h=u.actualBoundingBoxDescent,g=(d+h)*this.lineHeight.get(e.zoom,r),y=new Point(t[0][0].x,t[0][0].y),_={minX:y.x,minY:y.y-d,maxX:y.x+m,maxY:y.y+h+(l.length-1)*g};return [{anchor:y,bboxes:[_],draw:c((p,x)=>{p.globalAlpha=1,p.font=i,p.fillStyle=this.fill.get(e.zoom,r);let A=this.width.get(e.zoom,r),b=0;for(let v of l){let z=0;if(this.justify===2||x&&x.justify===2?z=(m-p.measureText(v).width)/2:(this.justify===3||x&&x.justify===3)&&(z=m-p.measureText(v).width),A)if(p.lineWidth=A*2,p.strokeStyle=this.stroke.get(e.zoom,r),s>0){let w=z;for(let S of v)p.strokeText(S,w,b),w+=p.measureText(S).width+s;}else p.strokeText(v,z,b);if(s>0){let w=z;for(let S of v)p.fillText(S,w,b),w+=p.measureText(S).width+s;}else p.fillText(v,z,b);b+=g;}},"draw")}]}};c(je,"TextSymbolizer");var ne=je,Xe=class Xe{constructor(e){this.centered=new Te(new ne(e));}place(e,t,r){return this.centered.place(e,t,r)}};c(Xe,"CenteredTextSymbolizer");var I=Xe,Ye=class Ye{constructor(e,t){var r,n,i;this.symbolizer=e,this.offsetX=new T(t.offsetX,0),this.offsetY=new T(t.offsetY,0),this.justify=(r=t.justify)!=null?r:void 0,this.placements=(n=t.placements)!=null?n:[2,6,8,4,1,3,5,7],this.ddValues=(i=t.ddValues)!=null?i:()=>({});}place(e,t,r){if(r.geomType!==1)return;let n=t[0][0],i=this.symbolizer.place(e,[[new Point(0,0)]],r);if(!i||i.length===0)return;let s=i[0],l=s.bboxes[0],o=this.offsetX,f=this.offsetY,u=this.justify,m=this.placements,{offsetX:d,offsetY:h,justify:g,placements:y}=this.ddValues(e.zoom,r)||{};d&&(o=new T(d,0)),h&&(f=new T(h,0)),g&&(u=g),y&&(m=y);let _=o.get(e.zoom,r),k=f.get(e.zoom,r),p=c((z,w)=>({minX:z.x+w.x+l.minX,minY:z.y+w.y+l.minY,maxX:z.x+w.x+l.maxX,maxY:z.y+w.y+l.maxY}),"getBbox"),x=new Point(_,k),A,b=c(z=>{z.translate(x.x,x.y),s.draw(z,{justify:A});},"draw"),v=c((z,w)=>{let S=p(z,w);if(!e.index.bboxCollides(S,e.order))return [{anchor:n,bboxes:[S],draw:b}]},"placeLabelInPoint");for(let z of m){let w=this.computeXaxisOffset(_,l,z),S=this.computeYaxisOffset(k,l,z);return A=this.computeJustify(u,z),x=new Point(w,S),v(n,x)}}computeXaxisOffset(e,t,r){let n=t.maxX,i=n/2;return [1,5].includes(r)?e-i:[8,7,6].includes(r)?e-n:e}computeYaxisOffset(e,t,r){let n=Math.abs(t.minY),i=t.maxY,s=(t.minY+t.maxY)/2;return [3,7].includes(r)?e-s:[8,2,1].includes(r)?e-i:[6,4,5].includes(r)?e+n:e}computeJustify(e,t){return e||([1,5].includes(t)?2:[2,3,4].includes(t)?1:3)}};c(Ye,"OffsetSymbolizer");var Pe=Ye,Ie=class Ie{constructor(e){this.symbolizer=new Pe(new ne(e),e);}place(e,t,r){return this.symbolizer.place(e,t,r)}};c(Ie,"OffsetTextSymbolizer");var ie=Ie,Rt=(r=>(r[r.Above=1]="Above",r[r.Center=2]="Center",r[r.Below=3]="Below",r))(Rt||{}),Be=class Be{constructor(e){var t;this.font=new N(e),this.text=new E(e),this.fill=new O(e.fill,"black"),this.stroke=new O(e.stroke,"black"),this.width=new T(e.width,0),this.offset=new T(e.offset,0),this.position=(t=e.position)!=null?t:1,this.maxLabelCodeUnits=new T(e.maxLabelChars,40),this.repeatDistance=new T(e.repeatDistance,250);}place(e,t,r){let n=this.text.get(e.zoom,r);if(!n||n.length>this.maxLabelCodeUnits.get(e.zoom,r))return;let i=20,s=r.bbox;if(s.maxY-s.minY<i&&s.maxX-s.minX<i)return;let l=this.font.get(e.zoom,r);e.scratch.font=l;let o=e.scratch.measureText(n),f=o.width,u=o.actualBoundingBoxAscent+o.actualBoundingBoxDescent,m=this.repeatDistance.get(e.zoom,r);e.overzoom>4&&(m*=1<<e.overzoom-4);let d=u*2,h=Ue(t,f,m,d);if(h.length===0)return;let g=[];for(let y of h){let _=y.end.x-y.start.x,k=y.end.y-y.start.y,x=Ge(y.start,y.end,f,d/2).map(b=>({minX:b.x-d/2,minY:b.y-d/2,maxX:b.x+d/2,maxY:b.y+d/2})),A=c(b=>{b.globalAlpha=1,b.rotate(Math.atan2(k,_)),_<0&&(b.scale(-1,-1),b.translate(-f,0));let v=0;this.position===3?v+=u:this.position===2&&(v+=u/2),b.translate(0,v-this.offset.get(e.zoom,r)),b.font=l;let z=this.width.get(e.zoom,r);z&&(b.lineWidth=z,b.strokeStyle=this.stroke.get(e.zoom,r),b.strokeText(n,0,0)),b.fillStyle=this.fill.get(e.zoom,r),b.fillText(n,0,0);},"draw");g.push({anchor:y.start,bboxes:x,draw:A,deduplicationKey:n,deduplicationDistance:m});}return g}};c(Be,"LineLabelSymbolizer");var $=Be;var R=c((a,e)=>{let t=a[e];return typeof t=="string"?t:""},"getString"),ct=c((a,e)=>{let t=a[e];return typeof t=="number"?t:0},"getNumber"),ae=c(a=>[{dataLayer:"earth",symbolizer:new P({fill:a.earth})},{dataLayer:"landuse",symbolizer:new P({fill:c((e,t)=>mix(a.park_a,a.park_b,Math.min(Math.max(e/12,12),0)),"fill")}),filter:c((e,t)=>{let r=R(t.props,"pmap:kind");return ["allotments","village_green","playground"].includes(r)},"filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.park_b,opacity:.7}),filter:c((e,t)=>{let r=R(t.props,"pmap:kind");return ["national_park","park","cemetery","protected_area","nature_reserve","forest","golf_course"].includes(r)},"filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.hospital}),filter:c((e,t)=>t.props["pmap:kind"]==="hospital","filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.industrial}),filter:c((e,t)=>t.props["pmap:kind"]==="industrial","filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.school}),filter:c((e,t)=>{let r=R(t.props,"pmap:kind");return ["school","university","college"].includes(r)},"filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.beach}),filter:c((e,t)=>t.props["pmap:kind"]==="beach","filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.zoo}),filter:c((e,t)=>t.props["pmap:kind"]==="zoo","filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.zoo}),filter:c((e,t)=>{let r=R(t.props,"pmap:kind");return ["military","naval_base","airfield"].includes(r)},"filter")},{dataLayer:"natural",symbolizer:new P({fill:c((e,t)=>mix(a.wood_a,a.wood_b,Math.min(Math.max(e/12,12),0)),"fill")}),filter:c((e,t)=>{let r=R(t.props,"pmap:kind");return ["wood","nature_reserve","forest"].includes(r)},"filter")},{dataLayer:"natural",symbolizer:new P({fill:c((e,t)=>mix(a.scrub_a,a.scrub_b,Math.min(Math.max(e/12,12),0)),"fill")}),filter:c((e,t)=>{let r=R(t.props,"pmap:kind");return ["scrub","grassland","grass"].includes(r)},"filter")},{dataLayer:"natural",symbolizer:new P({fill:a.scrub_b}),filter:c((e,t)=>{let r=R(t.props,"pmap:kind");return ["scrub","grassland","grass"].includes(r)},"filter")},{dataLayer:"natural",symbolizer:new P({fill:a.glacier}),filter:c((e,t)=>t.props["pmap:kind"]==="glacier","filter")},{dataLayer:"natural",symbolizer:new P({fill:a.sand}),filter:c((e,t)=>t.props["pmap:kind"]==="sand","filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.aerodrome}),filter:c((e,t)=>t.props["pmap:kind"]==="aerodrome","filter")},{dataLayer:"water",symbolizer:new P({fill:a.water})},{dataLayer:"transit",symbolizer:new M$1({color:a.runway,width:c((e,t)=>F(1.6,[[11,0],[13,4],[19,30]])(e),"width")}),filter:c((e,t)=>t.props["pmap:kind_detail"]==="runway","filter")},{dataLayer:"transit",symbolizer:new M$1({color:a.runway,width:c((e,t)=>F(1.6,[[14,0],[14.5,1],[16,6]])(e),"width")}),filter:c((e,t)=>t.props["pmap:kind_detail"]==="taxiway","filter")},{dataLayer:"transit",symbolizer:new M$1({color:a.pier,width:c((e,t)=>F(1.6,[[13,0],[13.5,0,5],[21,16]])(e),"width")}),filter:c((e,t)=>t.props["pmap:kind"]==="pier","filter")},{dataLayer:"physical_line",minzoom:14,symbolizer:new M$1({color:a.water,width:c((e,t)=>F(1.6,[[9,0],[9.5,1],[18,12]])(e),"width")}),filter:c((e,t)=>t.props["pmap:kind"]==="river","filter")},{dataLayer:"physical_line",minzoom:14,symbolizer:new M$1({color:a.water,width:.5}),filter:c((e,t)=>t.props["pmap:kind"]==="stream","filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.pedestrian}),filter:c((e,t)=>t.props["pmap:kind"]==="pedestrian","filter")},{dataLayer:"landuse",symbolizer:new P({fill:a.pier}),filter:c((e,t)=>t.props["pmap:kind"]==="pier","filter")},{dataLayer:"buildings",symbolizer:new P({fill:a.buildings,opacity:.5})},{dataLayer:"roads",symbolizer:new M$1({color:a.major,width:c((e,t)=>F(1.6,[[14,0],[20,7]])(e),"width")}),filter:c((e,t)=>{let r=R(t.props,"pmap:kind");return ["other","path"].includes(r)},"filter")},{dataLayer:"roads",symbolizer:new M$1({color:a.major,width:c((e,t)=>F(1.6,[[13,0],[18,8]])(e),"width")}),filter:c((e,t)=>t.props["pmap:kind"]==="minor_road","filter")},{dataLayer:"roads",symbolizer:new M$1({color:a.major,width:c((e,t)=>F(1.6,[[7,0],[12,1.2],[15,3],[18,13]])(e),"width")}),filter:c((e,t)=>t.props["pmap:kind"]==="medium_road","filter")},{dataLayer:"roads",symbolizer:new M$1({color:a.major,width:c((e,t)=>F(1.6,[[6,0],[12,1.6],[15,3],[18,13]])(e),"width")}),filter:c((e,t)=>t.props["pmap:kind"]==="major_road","filter")},{dataLayer:"roads",symbolizer:new M$1({color:a.major,width:c((e,t)=>F(1.6,[[3,0],[6,1.1],[12,1.6],[15,5],[18,15]])(e),"width")}),filter:c((e,t)=>t.props["pmap:kind"]==="highway","filter")},{dataLayer:"boundaries",symbolizer:new M$1({dash:[3,2],color:a.boundaries,width:1}),filter:c((e,t)=>{let r=t.props["pmap:min_admin_level"];return typeof r=="number"&&r<=2},"filter")},{dataLayer:"transit",symbolizer:new M$1({dash:[.3,.75],color:a.railway,dashWidth:c((e,t)=>F(1.6,[[4,0],[7,.15],[19,9]])(e),"dashWidth"),opacity:.5}),filter:c((e,t)=>t.props["pmap:kind"]==="rail","filter")},{dataLayer:"boundaries",symbolizer:new M$1({dash:[3,2],color:a.boundaries,width:.5}),filter:c((e,t)=>{let r=t.props["pmap:min_admin_level"];return typeof r=="number"&&r>2},"filter")}],"paintRules"),se=c(a=>{let e=["name"];return [{dataLayer:"roads",symbolizer:new $({labelProps:e,fill:a.roads_label_minor,font:"400 12px sans-serif",width:2,stroke:a.roads_label_minor_halo}),minzoom:16,filter:c((t,r)=>{let n=R(r.props,"pmap:kind");return ["minor_road","other","path"].includes(n)},"filter")},{dataLayer:"roads",symbolizer:new $({labelProps:e,fill:a.roads_label_major,font:"400 12px sans-serif",width:2,stroke:a.roads_label_major_halo}),minzoom:12,filter:c((t,r)=>{let n=R(r.props,"pmap:kind");return ["highway","major_road","medium_road"].includes(n)},"filter")},{dataLayer:"roads",symbolizer:new $({labelProps:e,fill:a.roads_label_major,font:"400 12px sans-serif",width:2,stroke:a.roads_label_major_halo}),minzoom:12,filter:c((t,r)=>{let n=R(r.props,"pmap:kind");return ["highway","major_road","medium_road"].includes(n)},"filter")},{dataLayer:"physical_point",symbolizer:new I({labelProps:e,fill:a.ocean_label,lineHeight:1.5,letterSpacing:1,font:c((t,r)=>`400 ${Le([[3,10],[10,12]])(t)}px sans-serif`,"font"),textTransform:"uppercase"}),filter:c((t,r)=>{let n=R(r.props,"pmap:kind");return ["ocean","bay","strait","fjord"].includes(n)},"filter")},{dataLayer:"physical_point",symbolizer:new I({labelProps:e,fill:a.ocean_label,lineHeight:1.5,letterSpacing:1,font:c((t,r)=>`400 ${Le([[3,0],[6,12],[10,12]])(t)}px sans-serif`,"font")}),filter:c((t,r)=>{let n=R(r.props,"pmap:kind");return ["sea","lake","water"].includes(n)},"filter")},{dataLayer:"places",symbolizer:new I({labelProps:c((t,r)=>t<6?["name:short"]:e,"labelProps"),fill:a.state_label,stroke:a.state_label_halo,width:1,lineHeight:1.5,font:c((t,r)=>t<6?"400 16px sans-serif":"400 12px sans-serif","font"),textTransform:"uppercase"}),filter:c((t,r)=>r.props["pmap:kind"]==="region","filter")},{dataLayer:"places",symbolizer:new I({labelProps:e,fill:a.country_label,lineHeight:1.5,font:c((t,r)=>("600 12px sans-serif"),"font"),textTransform:"uppercase"}),filter:c((t,r)=>r.props["pmap:kind"]==="country","filter")},{dataLayer:"places",minzoom:9,symbolizer:new I({labelProps:e,fill:a.city_label,lineHeight:1.5,font:c((t,r)=>{if(!r)return "400 12px sans-serif";let n=r.props["pmap:min_zoom"],i=400;n&&n<=5&&(i=600);let s=12,l=r.props["pmap:population_rank"];return l&&l>9&&(s=16),`${i} ${s}px sans-serif`},"font")}),sort:c((t,r)=>{let n=ct(t,"pmap:population_rank"),i=ct(r,"pmap:population_rank");return n-i},"sort"),filter:c((t,r)=>r.props["pmap:kind"]==="locality","filter")},{dataLayer:"places",maxzoom:8,symbolizer:new re([new te({radius:2,fill:a.city_circle,stroke:a.city_circle_stroke,width:1.5}),new ie({labelProps:e,fill:a.city_label,stroke:a.city_label_halo,width:1,offsetX:6,offsetY:4.5,font:c((t,r)=>"400 12px sans-serif","font")})]),filter:c((t,r)=>r.props["pmap:kind"]==="locality","filter")}]},"labelRules");var Ft={background:"#cccccc",earth:"#e0e0e0",park_a:"#cfddd5",park_b:"#9cd3b4",hospital:"#e4dad9",industrial:"#d1dde1",school:"#e4ded7",wood_a:"#d0ded0",wood_b:"#a0d9a0",pedestrian:"#e3e0d4",scrub_a:"#cedcd7",scrub_b:"#99d2bb",glacier:"#e7e7e7",sand:"#e2e0d7",beach:"#e8e4d0",aerodrome:"#dadbdf",runway:"#e9e9ed",water:"#80deea",pier:"#e0e0e0",zoo:"#c6dcdc",military:"#dcdcdc",tunnel_other_casing:"#e0e0e0",tunnel_minor_casing:"#e0e0e0",tunnel_link_casing:"#e0e0e0",tunnel_medium_casing:"#e0e0e0",tunnel_major_casing:"#e0e0e0",tunnel_highway_casing:"#e0e0e0",tunnel_other:"#d5d5d5",tunnel_minor:"#d5d5d5",tunnel_link:"#d5d5d5",tunnel_medium:"#d5d5d5",tunnel_major:"#d5d5d5",tunnel_highway:"#d5d5d5",transit_pier:"#e0e0e0",buildings:"#cccccc",minor_service_casing:"#e0e0e0",minor_casing:"#e0e0e0",link_casing:"#e0e0e0",medium_casing:"#e0e0e0",major_casing_late:"#e0e0e0",highway_casing_late:"#e0e0e0",other:"#ebebeb",minor_service:"#ebebeb",minor_a:"#ebebeb",minor_b:"#ffffff",link:"#ffffff",medium:"#f5f5f5",major_casing_early:"#e0e0e0",major:"#ffffff",highway_casing_early:"#e0e0e0",highway:"#ffffff",railway:"#a7b1b3",boundaries:"#adadad",waterway_label:"#ffffff",bridges_other_casing:"#e0e0e0",bridges_minor_casing:"#e0e0e0",bridges_link_casing:"#e0e0e0",bridges_medium_casing:"#e0e0e0",bridges_major_casing:"#e0e0e0",bridges_highway_casing:"#e0e0e0",bridges_other:"#ebebeb",bridges_minor:"#ffffff",bridges_link:"#ffffff",bridges_medium:"#f0eded",bridges_major:"#f5f5f5",bridges_highway:"#ffffff",roads_label_minor:"#91888b",roads_label_minor_halo:"#ffffff",roads_label_major:"#938a8d",roads_label_major_halo:"#ffffff",ocean_label:"#ffffff",peak_label:"#7e9aa0",subplace_label:"#8f8f8f",subplace_label_halo:"#e0e0e0",city_circle:"#ffffff",city_circle_stroke:"#a3a3a3",city_label:"#5c5c5c",city_label_halo:"#e0e0e0",state_label:"#b3b3b3",state_label_halo:"#e0e0e0",country_label:"#a3a3a3"},jt={background:"#34373d",earth:"#1f1f1f",park_a:"#232325",park_b:"#232325",hospital:"#252424",industrial:"#222222",school:"#262323",wood_a:"#202121",wood_b:"#202121",pedestrian:"#1e1e1e",scrub_a:"#222323",scrub_b:"#222323",glacier:"#1c1c1c",sand:"#212123",beach:"#28282a",aerodrome:"#1e1e1e",runway:"#333333",water:"#34373d",pier:"#222222",zoo:"#222323",military:"#242323",tunnel_other_casing:"#141414",tunnel_minor_casing:"#141414",tunnel_link_casing:"#141414",tunnel_medium_casing:"#141414",tunnel_major_casing:"#141414",tunnel_highway_casing:"#141414",tunnel_other:"#292929",tunnel_minor:"#292929",tunnel_link:"#292929",tunnel_medium:"#292929",tunnel_major:"#292929",tunnel_highway:"#292929",transit_pier:"#333333",buildings:"#111111",minor_service_casing:"#1f1f1f",minor_casing:"#1f1f1f",link_casing:"#1f1f1f",medium_casing:"#1f1f1f",major_casing_late:"#1f1f1f",highway_casing_late:"#1f1f1f",other:"#333333",minor_service:"#333333",minor_a:"#3d3d3d",minor_b:"#333333",link:"#3d3d3d",medium:"#3d3d3d",major_casing_early:"#1f1f1f",major:"#3d3d3d",highway_casing_early:"#1f1f1f",highway:"#474747",railway:"#000000",boundaries:"#5b6374",waterway_label:"#717784",bridges_other_casing:"#2b2b2b",bridges_minor_casing:"#1f1f1f",bridges_link_casing:"#1f1f1f",bridges_medium_casing:"#1f1f1f",bridges_major_casing:"#1f1f1f",bridges_highway_casing:"#1f1f1f",bridges_other:"#333333",bridges_minor:"#333333",bridges_link:"#3d3d3d",bridges_medium:"#3d3d3d",bridges_major:"#3d3d3d",bridges_highway:"#474747",roads_label_minor:"#525252",roads_label_minor_halo:"#1f1f1f",roads_label_major:"#666666",roads_label_major_halo:"#1f1f1f",ocean_label:"#717784",peak_label:"#898080",subplace_label:"#525252",subplace_label_halo:"#1f1f1f",city_circle:"#000000",city_circle_stroke:"#7a7a7a",city_label:"#7a7a7a",city_label_halo:"#212121",state_label:"#3d3d3d",state_label_halo:"#1f1f1f",country_label:"#5c5c5c"},Xt={background:"#ffffff",earth:"#ffffff",park_a:"#fcfcfc",park_b:"#fcfcfc",hospital:"#f8f8f8",industrial:"#fcfcfc",school:"#f8f8f8",wood_a:"#fafafa",wood_b:"#fafafa",pedestrian:"#fdfdfd",scrub_a:"#fafafa",scrub_b:"#fafafa",glacier:"#fcfcfc",sand:"#fafafa",beach:"#f6f6f6",aerodrome:"#fdfdfd",runway:"#efefef",water:"#dcdcdc",pier:"#f5f5f5",zoo:"#f7f7f7",military:"#fcfcfc",tunnel_other_casing:"#d6d6d6",tunnel_minor_casing:"#fcfcfc",tunnel_link_casing:"#fcfcfc",tunnel_medium_casing:"#fcfcfc",tunnel_major_casing:"#fcfcfc",tunnel_highway_casing:"#fcfcfc",tunnel_other:"#d6d6d6",tunnel_minor:"#d6d6d6",tunnel_link:"#d6d6d6",tunnel_medium:"#d6d6d6",tunnel_major:"#d6d6d6",tunnel_highway:"#d6d6d6",transit_pier:"#efefef",buildings:"#efefef",minor_service_casing:"#ffffff",minor_casing:"#ffffff",link_casing:"#ffffff",medium_casing:"#ffffff",major_casing_late:"#ffffff",highway_casing_late:"#ffffff",other:"#f5f5f5",minor_service:"#f5f5f5",minor_a:"#ebebeb",minor_b:"#f5f5f5",link:"#ebebeb",medium:"#ebebeb",major_casing_early:"#ffffff",major:"#ebebeb",highway_casing_early:"#ffffff",highway:"#ebebeb",railway:"#d6d6d6",boundaries:"#adadad",waterway_label:"#adadad",bridges_other_casing:"#ffffff",bridges_minor_casing:"#ffffff",bridges_link_casing:"#ffffff",bridges_medium_casing:"#ffffff",bridges_major_casing:"#ffffff",bridges_highway_casing:"#ffffff",bridges_other:"#f5f5f5",bridges_minor:"#f5f5f5",bridges_link:"#ebebeb",bridges_medium:"#ebebeb",bridges_major:"#ebebeb",bridges_highway:"#ebebeb",roads_label_minor:"#adadad",roads_label_minor_halo:"#ffffff",roads_label_major:"#999999",roads_label_major_halo:"#ffffff",ocean_label:"#adadad",peak_label:"#adadad",subplace_label:"#8f8f8f",subplace_label_halo:"#ffffff",city_circle:"#ffffff",city_circle_stroke:"#adadad",city_label:"#5c5c5c",city_label_halo:"#ffffff",state_label:"#b3b3b3",state_label_halo:"#ffffff",country_label:"#b8b8b8"},Yt={background:"#a3a3a3",earth:"#cccccc",park_a:"#c2c2c2",park_b:"#c2c2c2",hospital:"#d0d0d0",industrial:"#c6c6c6",school:"#d0d0d0",wood_a:"#c2c2c2",wood_b:"#c2c2c2",pedestrian:"#c4c4c4",scrub_a:"#c2c2c2",scrub_b:"#c2c2c2",glacier:"#d2d2d2",sand:"#d2d2d2",beach:"#d2d2d2",aerodrome:"#c9c9c9",runway:"#f5f5f5",water:"#a3a3a3",pier:"#b8b8b8",zoo:"#c7c7c7",military:"#bfbfbf",tunnel_other_casing:"#b8b8b8",tunnel_minor_casing:"#b8b8b8",tunnel_link_casing:"#b8b8b8",tunnel_medium_casing:"#b8b8b8",tunnel_major_casing:"#b8b8b8",tunnel_highway_casing:"#b8b8b8",tunnel_other:"#d6d6d6",tunnel_minor:"#d6d6d6",tunnel_link:"#d6d6d6",tunnel_medium:"#d6d6d6",tunnel_major:"#d6d6d6",tunnel_highway:"#d6d6d6",transit_pier:"#b8b8b8",buildings:"#e0e0e0",minor_service_casing:"#cccccc",minor_casing:"#cccccc",link_casing:"#cccccc",medium_casing:"#cccccc",major_casing_late:"#cccccc",highway_casing_late:"#cccccc",other:"#e0e0e0",minor_service:"#e0e0e0",minor_a:"#ebebeb",minor_b:"#e0e0e0",link:"#ebebeb",medium:"#ebebeb",major_casing_early:"#cccccc",major:"#ebebeb",highway_casing_early:"#cccccc",highway:"#ebebeb",railway:"#f5f5f5",boundaries:"#5c5c5c",waterway_label:"#7a7a7a",bridges_other_casing:"#cccccc",bridges_minor_casing:"#cccccc",bridges_link_casing:"#cccccc",bridges_medium_casing:"#cccccc",bridges_major_casing:"#cccccc",bridges_highway_casing:"#cccccc",bridges_other:"#e0e0e0",bridges_minor:"#e0e0e0",bridges_link:"#ebebeb",bridges_medium:"#ebebeb",bridges_major:"#ebebeb",bridges_highway:"#ebebeb",roads_label_minor:"#999999",roads_label_minor_halo:"#e0e0e0",roads_label_major:"#8f8f8f",roads_label_major_halo:"#ebebeb",ocean_label:"#7a7a7a",peak_label:"#5c5c5c",subplace_label:"#7a7a7a",subplace_label_halo:"#cccccc",city_circle:"#c2c2c2",city_circle_stroke:"#7a7a7a",city_label:"#474747",city_label_halo:"#cccccc",state_label:"#999999",state_label_halo:"#cccccc",country_label:"#858585"},It={background:"#2b2b2b",earth:"#141414",park_a:"#181818",park_b:"#181818",hospital:"#1d1d1d",industrial:"#101010",school:"#111111",wood_a:"#1a1a1a",wood_b:"#1a1a1a",pedestrian:"#191919",scrub_a:"#1c1c1c",scrub_b:"#1c1c1c",glacier:"#191919",sand:"#161616",beach:"#1f1f1f",aerodrome:"#191919",runway:"#323232",water:"#333333",pier:"#0a0a0a",zoo:"#191919",military:"#121212",tunnel_other_casing:"#101010",tunnel_minor_casing:"#101010",tunnel_link_casing:"#101010",tunnel_medium_casing:"#101010",tunnel_major_casing:"#101010",tunnel_highway_casing:"#101010",tunnel_other:"#292929",tunnel_minor:"#292929",tunnel_link:"#292929",tunnel_medium:"#292929",tunnel_major:"#292929",tunnel_highway:"#292929",transit_pier:"#0a0a0a",buildings:"#0a0a0a",minor_service_casing:"#141414",minor_casing:"#141414",link_casing:"#141414",medium_casing:"#141414",major_casing_late:"#141414",highway_casing_late:"#141414",other:"#1f1f1f",minor_service:"#1f1f1f",minor_a:"#292929",minor_b:"#1f1f1f",link:"#1f1f1f",medium:"#292929",major_casing_early:"#141414",major:"#292929",highway_casing_early:"#141414",highway:"#292929",railway:"#292929",boundaries:"#707070",waterway_label:"#707070",bridges_other_casing:"#141414",bridges_minor_casing:"#141414",bridges_link_casing:"#141414",bridges_medium_casing:"#141414",bridges_major_casing:"#141414",bridges_highway_casing:"#141414",bridges_other:"#1f1f1f",bridges_minor:"#1f1f1f",bridges_link:"#292929",bridges_medium:"#292929",bridges_major:"#292929",bridges_highway:"#292929",roads_label_minor:"#525252",roads_label_minor_halo:"#141414",roads_label_major:"#5c5c5c",roads_label_major_halo:"#141414",ocean_label:"#707070",peak_label:"#707070",subplace_label:"#5c5c5c",subplace_label_halo:"#141414",city_circle:"#000000",city_circle_stroke:"#666666",city_label:"#999999",city_label_halo:"#141414",state_label:"#3d3d3d",state_label_halo:"#141414",country_label:"#707070"},oe={light:Ft,dark:jt,white:Xt,grayscale:Yt,black:It};var ce=c((a,e,t)=>{let r=[];for(let n of a){let i=[];for(let s of n)i.push(s.clone().mult(e).add(t));r.push(i);}return r},"transformGeom"),le=c((a,e)=>{let t=1<<e;return a<0?t+a:a>=t?a%t:a},"wrap"),$e=class $e{constructor(e,t,r){this.tileCache=e,this.maxDataLevel=t,this.levelDiff=r;}dataTilesForBounds(e,t){let r=C(2,e)/C(2,Math.ceil(e)),n=[],i=1,s=this.tileCache.tileSize;if(e<this.levelDiff)i=1/(1<<this.levelDiff-e)*r,n.push({dataTile:{z:0,x:0,y:0},origin:new Point(0,0),scale:i,dim:s*i});else if(e<=this.levelDiff+this.maxDataLevel){let l=1<<this.levelDiff,o=256*r,f=Math.ceil(e)-this.levelDiff,u=Math.floor(t.minX/l/o),m=Math.floor(t.minY/l/o),d=Math.floor(t.maxX/l/o),h=Math.floor(t.maxY/l/o);for(let g=u;g<=d;g++)for(let y=m;y<=h;y++){let _=new Point(g*l*o,y*l*o);n.push({dataTile:{z:f,x:le(g,f),y:le(y,f)},origin:_,scale:r,dim:s*r});}}else {let l=1<<this.levelDiff;i=(1<<Math.ceil(e)-this.maxDataLevel-this.levelDiff)*r;let o=Math.floor(t.minX/l/256/i),f=Math.floor(t.minY/l/256/i),u=Math.floor(t.maxX/l/256/i),m=Math.floor(t.maxY/l/256/i);for(let d=o;d<=u;d++)for(let h=f;h<=m;h++){let g=new Point(d*l*256*i,h*l*256*i);n.push({dataTile:{z:this.maxDataLevel,x:le(d,this.maxDataLevel),y:le(h,this.maxDataLevel)},origin:g,scale:i,dim:s*i});}}return n}dataTileForDisplayTile(e){let t,r=1,n=this.tileCache.tileSize,i;if(e.z<this.levelDiff)t={z:0,x:0,y:0},r=1/(1<<this.levelDiff-e.z),i=new Point(0,0),n=n*r;else if(e.z<=this.levelDiff+this.maxDataLevel){let s=1<<this.levelDiff;t={z:e.z-this.levelDiff,x:Math.floor(e.x/s),y:Math.floor(e.y/s)},i=new Point(t.x*s*256,t.y*s*256);}else {r=1<<e.z-this.maxDataLevel-this.levelDiff;let s=1<<this.levelDiff;t={z:this.maxDataLevel,x:Math.floor(e.x/s/r),y:Math.floor(e.y/s/r)},i=new Point(t.x*s*r*256,t.y*s*r*256),n=n*r;}return {dataTile:t,scale:r,origin:i,dim:n}}getBbox(e,t){return D(this,null,function*(){let r=this.dataTilesForBounds(e,t);return (yield Promise.all(r.map(i=>this.tileCache.get(i.dataTile)))).map((i,s)=>{let l=r[s];return {data:i,z:e,dataTile:l.dataTile,scale:l.scale,dim:l.dim,origin:l.origin}})})}getDisplayTile(e){return D(this,null,function*(){let t=this.dataTileForDisplayTile(e);return {data:yield this.tileCache.get(t.dataTile),z:e.z,dataTile:t.dataTile,scale:t.scale,origin:t.origin,dim:t.dim}})}queryFeatures(e,t,r,n){let i=Math.round(r),s=Math.min(i-this.levelDiff,this.maxDataLevel),l=n/(1<<i-s);return this.tileCache.queryFeatures(e,t,s,l)}};c($e,"View");var Ne=$e,fe=c(a=>{let e=c(r=>{let n=r.levelDiff===void 0?1:r.levelDiff,i=r.maxDataZoom||15,s;if(typeof r.url=="string")new URL(r.url,"http://example.com").pathname.endsWith(".pmtiles")?s=new H(r.url,true):s=new Q(r.url,true);else if(r.url)s=new H(r.url,true);else throw new Error(`Invalid source ${r.url}`);let l=new ee(s,256*1<<n);return new Ne(l,i,n)},"sourceToViews"),t=new Map;if(a.sources)for(let r in a.sources)t.set(r,e(a.sources[r]));else t.set("",e(a));return t},"sourcesToViews");var Nt=c((a,e,t)=>{let n=e/256,i=Math.floor(t.minX/256),s=Math.floor(t.minY/256),l=Math.floor(t.maxX/256),o=Math.floor(t.maxY/256),f=Math.log2(n),u=[];for(let m=i;m<=l;m++){let d=m%(1<<a);for(let h=s;h<=o;h++)u.push({display:Y({z:a,x:d,y:h}),key:Y({z:a-f,x:Math.floor(d/n),y:Math.floor(h/n)})});}return u},"covering"),We=class We{constructor(e,t){this.tree=new Et,this.current=new Map,this.dim=e,this.maxLabeledTiles=t;}hasPrefix(e){for(let t of this.current.keys())if(t.startsWith(e))return  true;return  false}has(e){return this.current.has(e)}size(){return this.current.size}keys(){return this.current.keys()}searchBbox(e,t){let r=new Set;for(let n of this.tree.search(e))n.indexedLabel.order<=t&&r.add(n.indexedLabel);return r}searchLabel(e,t){let r=new Set;for(let n of e.bboxes)for(let i of this.tree.search(n))i.indexedLabel.order<=t&&r.add(i.indexedLabel);return r}bboxCollides(e,t){for(let r of this.tree.search(e))if(r.indexedLabel.order<=t)return  true;return  false}labelCollides(e,t){for(let r of e.bboxes)for(let n of this.tree.search(r))if(n.indexedLabel.order<=t)return  true;return  false}deduplicationCollides(e){if(!e.deduplicationKey||!e.deduplicationDistance)return  false;let t=e.deduplicationDistance,r={minX:e.anchor.x-t,minY:e.anchor.y-t,maxX:e.anchor.x+t,maxY:e.anchor.y+t};for(let n of this.tree.search(r))if(n.indexedLabel.deduplicationKey===e.deduplicationKey&&n.indexedLabel.anchor.dist(e.anchor)<t)return  true;return  false}makeEntry(e){this.current.get(e)&&console.log("consistency error 1");let t=new Set;this.current.set(e,t);}insert(e,t,r){let n={anchor:e.anchor,bboxes:e.bboxes,draw:e.draw,order:t,tileKey:r,deduplicationKey:e.deduplicationKey,deduplicationDistance:e.deduplicationDistance},i=this.current.get(r);if(!i){let o=new Set;this.current.set(r,o),i=o;}i.add(n);let s=false,l=false;for(let o of e.bboxes)this.tree.insert({minX:o.minX,minY:o.minY,maxX:o.maxX,maxY:o.maxY,indexedLabel:n}),o.minX<0&&(s=true),o.maxX>this.dim&&(l=true);if(s||l){let o=s?this.dim:-this.dim,f=[];for(let d of e.bboxes)f.push({minX:d.minX+o,minY:d.minY,maxX:d.maxX+o,maxY:d.maxY});let u={anchor:new Point(e.anchor.x+o,e.anchor.y),bboxes:f,draw:e.draw,order:t,tileKey:r},m=this.current.get(r);m&&m.add(u);for(let d of f)this.tree.insert({minX:d.minX,minY:d.minY,maxX:d.maxX,maxY:d.maxY,indexedLabel:u});}}pruneOrNoop(e){let t=e.split(":"),r,n=0,i=0;for(let s of this.current.keys()){let l=s.split(":");if(l[3]===t[3]){i++;let o=Math.sqrt(C(+l[0]-+t[0],2)+C(+l[1]-+t[1],2));o>n&&(n=o,r=s);}r&&i>this.maxLabeledTiles&&this.pruneKey(r);}}pruneKey(e){let t=this.current.get(e);if(!t)return;let r=[];for(let n of this.tree.all())t.has(n.indexedLabel)&&r.push(n);for(let n of r)this.tree.remove(n);this.current.delete(e);}removeLabel(e){let t=[];for(let n of this.tree.all())e===n.indexedLabel&&t.push(n);for(let n of t)this.tree.remove(n);let r=this.current.get(e.tileKey);r&&r.delete(e);}};c(We,"Index");var Je=We,He=class He{constructor(e,t,r,n,i){this.index=new Je(256*1<<e,n),this.z=e,this.scratch=t,this.labelRules=r,this.callback=i;}layout(e){let t=performance.now(),r=new Set;for(let[i,s]of e)for(let l of s){let o=`${Y(l.dataTile)}:${i}`;this.index.has(o)||(this.index.makeEntry(o),r.add(o));}let n=new Set;for(let[i,s]of this.labelRules.entries()){if(s.visible===false||s.minzoom&&this.z<s.minzoom||s.maxzoom&&this.z>s.maxzoom)continue;let l=s.dataSource||"",o=e.get(l);if(o)for(let f of o){let u=`${Y(f.dataTile)}:${l}`;if(!r.has(u))continue;let m=f.data.get(s.dataLayer);if(m===void 0)continue;let d=m;s.sort&&d.sort((g,y)=>s.sort?s.sort(g.props,y.props):0);let h={index:this.index,zoom:this.z,scratch:this.scratch,order:i,overzoom:this.z-f.dataTile.z};for(let g of d){if(s.filter&&!s.filter(this.z,g))continue;let y=ce(g.geom,f.scale,f.origin),_=s.symbolizer.place(h,y,g);if(_)for(let k of _){let p=false;if(!(k.deduplicationKey&&this.index.deduplicationCollides(k))){if(this.index.labelCollides(k,1/0)){if(!this.index.labelCollides(k,i)){let x=this.index.searchLabel(k,1/0);for(let A of x){this.index.removeLabel(A);for(let b of A.bboxes)this.findInvalidatedTiles(n,f.dim,b,u);}this.index.insert(k,i,u),p=true;}}else this.index.insert(k,i,u),p=true;if(p)for(let x of k.bboxes)(x.maxX>f.origin.x+f.dim||x.minX<f.origin.x||x.minY<f.origin.y||x.maxY>f.origin.y+f.dim)&&this.findInvalidatedTiles(n,f.dim,x,u);}}}}}for(let i of r)this.index.pruneOrNoop(i);return n.size>0&&this.callback&&this.callback(n),performance.now()-t}findInvalidatedTiles(e,t,r,n){let i=Nt(this.z,t,r);for(let s of i)s.key!==n&&this.index.hasPrefix(s.key)&&e.add(s.display);}add(e){let t=true;for(let[n,i]of e)for(let s of i)this.index.has(`${Y(s.dataTile)}:${n}`)||(t=false);return t?0:this.layout(e)}};c(He,"Labeler");var V=He,Ve=class Ve{constructor(e,t,r,n){this.labelers=new Map,this.scratch=e,this.labelRules=t,this.maxLabeledTiles=r,this.callback=n;}add(e,t){let r=this.labelers.get(e);return r||(r=new V(e,this.scratch,this.labelRules,this.maxLabeledTiles,this.callback),this.labelers.set(e,r)),r.add(t)}getIndex(e){let t=this.labelers.get(e);if(t)return t.index}};c(Ve,"Labelers");var Z=Ve;function ue(a,e,t,r,n,i,s,l,o){let f=performance.now();a.save(),a.miterLimit=2;for(let u of n){if(u.minzoom&&e<u.minzoom||u.maxzoom&&e>u.maxzoom)continue;let m=t.get(u.dataSource||"");if(m)for(let d of m){let h=d.data.get(u.dataLayer);if(h===void 0)continue;u.symbolizer.before&&u.symbolizer.before(a,d.z);let g=d.origin,y=d.dim,_=d.scale;if(a.save(),l){a.beginPath();let k=Math.max(g.x-s.x,i.minX-s.x),p=Math.max(g.y-s.y,i.minY-s.y),x=Math.min(g.x-s.x+y,i.maxX-s.x),A=Math.min(g.y-s.y+y,i.maxY-s.y);a.rect(k,p,x-k,A-p),a.clip();}a.translate(g.x-s.x,g.y-s.y);for(let k of h){let p=k.geom,x=k.bbox;x.maxX*_+g.x<i.minX||x.minX*_+g.x>i.maxX||x.minY*_+g.y>i.maxY||x.maxY*_+g.y<i.minY||u.filter&&!u.filter(d.z,k)||(_!==1&&(p=ce(p,_,new Point(0,0))),u.symbolizer.draw(a,p,d.z,k));}a.restore();}}if(l&&(a.beginPath(),a.rect(i.minX-s.x,i.minY-s.y,i.maxX-i.minX,i.maxY-i.minY),a.clip()),r){let u=r.searchBbox(i,1/0);for(let m of u)if(a.save(),a.translate(m.anchor.x-s.x,m.anchor.y-s.y),m.draw(a),a.restore(),o){a.lineWidth=.5,a.strokeStyle=o,a.fillStyle=o,a.globalAlpha=1,a.fillRect(m.anchor.x-s.x-2,m.anchor.y-s.y-2,4,4);for(let d of m.bboxes)a.strokeRect(d.minX-s.x,d.minY-s.y,d.maxX-d.minX,d.maxY-d.minY);}}return a.restore(),performance.now()-f}c(ue,"paint");var K=6378137,ft=85.0511287798,j=K*Math.PI,mt=c(a=>{let e=Math.PI/180,t=Math.max(Math.min(ft,a.y),-85.0511287798),r=Math.sin(t*e);return new Point(K*a.x*e,K*Math.log((1+r)/(1-r))/2)},"project"),Jt=c(a=>{let e=180/Math.PI;return {lat:(2*Math.atan(Math.exp(a.y/K))-Math.PI/2)*e,lng:a.x*e/K}},"unproject"),Wt=c((a,e)=>t=>{let r=mt(t);return new Point((r.x+j)/(j*2),1-(r.y+j)/(j*2)).mult(C(2,e)*256).sub(a)},"instancedProject"),Ht=c((a,e)=>t=>{let r=new Point(t.x,t.y).add(a).div(C(2,e)*256),n=new Point(r.x*(j*2)-j,(1-r.y)*(j*2)-j);return Jt(n)},"instancedUnproject"),ut=c((a,e)=>{let t=e*(360/a);return Math.log2(t/256)},"getZoom"),Ze=class Ze{constructor(e){if(e.theme){let t=oe[e.theme];this.paintRules=ae(t),this.labelRules=se(t),this.backgroundColor=t.background;}else this.paintRules=e.paintRules||[],this.labelRules=e.labelRules||[],this.backgroundColor=e.backgroundColor;this.views=fe(e),this.debug=e.debug||"";}drawContext(e,t,r,n,i){return D(this,null,function*(){let s=mt(n),o=new Point((s.x+j)/(j*2),1-(s.y+j)/(j*2)).clone().mult(C(2,i)*256).sub(new Point(t/2,r/2)),f={minX:o.x,minY:o.y,maxX:o.x+t,maxY:o.y+r},u=[];for(let[p,x]of this.views){let A=x.getBbox(i,f);u.push({key:p,promise:A});}let m=yield Promise.all(u.map(p=>p.promise.then(x=>({status:"fulfilled",value:x,key:p.key}),x=>({status:"rejected",value:[],reason:x,key:p.key})))),d=new Map;for(let p of m)p.status==="fulfilled"&&d.set(p.key,p.value);let h=performance.now(),g=new V(i,e,this.labelRules,16,void 0);g.add(d);this.backgroundColor&&(e.save(),e.fillStyle=this.backgroundColor,e.fillRect(0,0,t,r),e.restore());let _=this.paintRules;ue(e,i,d,g.index,_,f,o,true,this.debug);if(this.debug){e.save(),e.translate(-o.x,-o.y),e.strokeStyle=this.debug,e.fillStyle=this.debug,e.font="12px sans-serif";let p=0;for(let[x,A]of d){for(let b of A){e.strokeRect(b.origin.x,b.origin.y,b.dim,b.dim);let v=b.dataTile;e.fillText(`${x+(x?" ":"")+v.z} ${v.x} ${v.y}`,b.origin.x+4,b.origin.y+14*(1+p));}p++;}e.restore();}return {elapsed:performance.now()-h,project:Wt(o,i),unproject:Ht(o,i)}})}drawCanvas(i,s,l){return D(this,arguments,function*(e,t,r,n={}){let o=window.devicePixelRatio,f=e.clientWidth,u=e.clientHeight;e.width===f*o&&e.height===u*o||(e.width=f*o,e.height=u*o),n.lang&&(e.lang=n.lang);let m=e.getContext("2d");if(!m){console.error("Failed to initialize canvas2d context.");return}return m.setTransform(o,0,0,o,0,0),this.drawContext(m,f,u,t,r)})}drawContextBounds(e,t,r,n,i){return D(this,null,function*(){let s=r.x-t.x,l=new Point((t.x+r.x)/2,(t.y+r.y)/2);return this.drawContext(e,n,i,l,ut(s,n))})}drawCanvasBounds(s,l,o,f){return D(this,arguments,function*(e,t,r,n,i={}){let u=r.x-t.x,m=new Point((t.x+r.x)/2,(t.y+r.y)/2);return this.drawCanvas(e,m,ut(u,n),i)})}};c(Ze,"Static");var dt=Ze;var Zt=c(a=>new Promise(e=>{setTimeout(()=>{e();},a);}),"timer"),Kt=c(a=>a.then(e=>({status:"fulfilled",value:e}),e=>({status:"rejected",reason:e})),"reflect"),Pn=c((a={})=>{let t=class t extends L.GridLayer{constructor(n={}){if(n.noWrap&&!n.bounds&&(n.bounds=[[-90,-180],[90,180]]),n.attribution==null&&(n.attribution='<a href="https://protomaps.com">Protomaps</a> \xA9 <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'),super(n),n.theme){let s=oe[n.theme];this.paintRules=ae(s),this.labelRules=se(s),this.backgroundColor=s.background;}else this.paintRules=n.paintRules||[],this.labelRules=n.labelRules||[],this.backgroundColor=n.backgroundColor;this.lastRequestedZ=void 0,this.tasks=n.tasks||[],this.views=fe(n),this.debug=n.debug;let i=document.createElement("canvas").getContext("2d");this.scratch=i,this.onTilesInvalidated=s=>{for(let l of s)this.rerenderTile(l);},this.labelers=new Z(this.scratch,this.labelRules,16,this.onTilesInvalidated),this.tileSize=256*window.devicePixelRatio,this.tileDelay=n.tileDelay||3,this.lang=n.lang;}renderTile(n,i,s,l=()=>{}){return D(this,null,function*(){this.lastRequestedZ=n.z;let o=[];for(let[w,S]of this.views){let de=S.getDisplayTile(n);o.push({key:w,promise:de});}let f=yield Promise.all(o.map(w=>w.promise.then(S=>({status:"fulfilled",value:S,key:w.key}),S=>({status:"rejected",reason:S,key:w.key})))),u=new Map;for(let w of f)w.status==="fulfilled"?u.set(w.key,[w.value]):w.reason.name==="AbortError"||console.error(w.reason);if(i.key!==s||this.lastRequestedZ!==n.z||(yield Promise.all(this.tasks.map(Kt)),i.key!==s)||this.lastRequestedZ!==n.z)return;let m=this.labelers.add(n.z,u);if(i.key!==s||this.lastRequestedZ!==n.z)return;let d=this.labelers.getIndex(n.z);if(!this._map)return;let h=this._map.getCenter().wrap(),g=this._getTiledPixelBounds(h),_=this._pxBoundsToTileRange(g).getCenter(),k=n.distanceTo(_)*this.tileDelay;if(yield Zt(k),i.key!==s||this.lastRequestedZ!==n.z)return;let p=16,x={minX:256*n.x-p,minY:256*n.y-p,maxX:256*(n.x+1)+p,maxY:256*(n.y+1)+p},A=new Point(256*n.x,256*n.y);i.width=this.tileSize,i.height=this.tileSize;let b=i.getContext("2d");if(!b){console.error("Failed to get Canvas context");return}b.setTransform(this.tileSize/256,0,0,this.tileSize/256,0,0),b.clearRect(0,0,256,256),this.backgroundColor&&(b.save(),b.fillStyle=this.backgroundColor,b.fillRect(0,0,256,256),b.restore());let v=0,z=this.paintRules;if(v=ue(b,n.z,u,this.xray?null:d,z,x,A,false,this.debug),this.debug){b.save(),b.fillStyle=this.debug,b.font="600 12px sans-serif",b.fillText(`${n.z} ${n.x} ${n.y}`,4,14),b.font="12px sans-serif";let w=28;for(let[S,de]of u){let me=de[0].dataTile;b.fillText(`${S+(S?" ":"")+me.z} ${me.x} ${me.y}`,4,w),w+=14;}b.font="600 10px sans-serif",v>8&&(b.fillText(`${v.toFixed()} ms paint`,4,w),w+=14),m>8&&b.fillText(`${m.toFixed()} ms layout`,4,w),b.strokeStyle=this.debug,b.lineWidth=.5,b.beginPath(),b.moveTo(0,0),b.lineTo(0,256),b.stroke(),b.lineWidth=.5,b.beginPath(),b.moveTo(0,0),b.lineTo(256,0),b.stroke(),b.restore();}l();})}rerenderTile(n){for(let i in this._tiles){let s=this._wrapCoords(this._keyToTileCoords(i));n===this._tileCoordsToKey(s)&&this.renderTile(s,this._tiles[i].el,n);}}queryTileFeaturesDebug(n,i,s=16){let l=new Map;for(let[o,f]of this.views)l.set(o,f.queryFeatures(n,i,this._map.getZoom(),s));return l}clearLayout(){this.labelers=new Z(this.scratch,this.labelRules,16,this.onTilesInvalidated);}rerenderTiles(){for(let n in this._tiles){let i=this._wrapCoords(this._keyToTileCoords(n)),s=this._tileCoordsToKey(i);this.renderTile(i,this._tiles[n].el,s);}}createTile(n,i){let s=L.DomUtil.create("canvas","leaflet-tile");s.lang=this.lang;let l=this._tileCoordsToKey(n);return s.key=l,this.renderTile(n,s,l,()=>{i(void 0,s);}),s}_removeTile(n){let i=this._tiles[n];i&&(i.el.removed=true,i.el.key=void 0,L.DomUtil.removeClass(i.el,"leaflet-tile-loaded"),i.el.width=i.el.height=0,L.DomUtil.remove(i.el),delete this._tiles[n],this.fire("tileunload",{tile:i.el,coords:this._keyToTileCoords(n)}));}};c(t,"LeafletLayer");let e=t;return new e(a)},"leafletLayer");var Sn=c((a,e,t)=>{let r=new FontFace(a,`url(${e})`,{weight:t});return document.fonts.add(r),r.load()},"Font"),bt=c(a=>D(void 0,null,function*(){return new Promise((e,t)=>{let r=new Image;r.onload=()=>e(r),r.onerror=()=>t("Invalid SVG"),r.src=a;})}),"mkimg"),Ut=`
<svg width="20px" height="20px" viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <rect width="50" height="50" fill="#cccccc"/>
    <g transform="translate(5,5)">
        <path fill="none" stroke="#666666" stroke-width="7" d="m11,12a8.5,8 0 1,1 17,0q0,4-4,6t-4.5,4.5-.4,4v.2m0,3v7"/>
    </g>
</svg>
`,Ke=class Ke{constructor(e){this.src=e,this.canvas=document.createElement("canvas"),this.mapping=new Map,this.missingBox={x:0,y:0,w:0,h:0};}load(){return D(this,null,function*(){let e=this.src,t=window.devicePixelRatio;e.endsWith(".html")&&(e=yield (yield fetch(e)).text());let r=new window.DOMParser().parseFromString(e,"text/html"),n=Array.from(r.body.children),i=yield bt(`data:image/svg+xml;base64,${btoa(Ut)}`),s=[{w:i.width*t,h:i.height*t,img:i,id:""}],l=new XMLSerializer;for(let u of n){let d=`data:image/svg+xml;base64,${btoa(l.serializeToString(u))}`,h=yield bt(d);s.push({w:h.width*t,h:h.height*t,img:h,id:u.id});}let o=potpack(s);this.canvas.width=o.w,this.canvas.height=o.h;let f=this.canvas.getContext("2d");if(f)for(let u of s)u.x!==void 0&&u.y!==void 0&&(f.drawImage(u.img,u.x,u.y,u.w,u.h),u.id?this.mapping.set(u.id,{x:u.x,y:u.y,w:u.w,h:u.h}):this.missingBox={x:u.x,y:u.y,w:u.w,h:u.h});return this})}get(e){let t=this.mapping.get(e);return t||(t=this.missingBox),t}};c(Ke,"Sheet");var ht=Ke;

var protomapsL = /*#__PURE__*/Object.freeze({
  __proto__: null,
  CenteredSymbolizer: Te,
  CenteredTextSymbolizer: I,
  CircleSymbolizer: te,
  FlexSymbolizer: st,
  Font: Sn,
  GeomType: rt,
  GroupSymbolizer: re,
  IconSymbolizer: it,
  Index: Je,
  Justify: St,
  Labeler: V,
  Labelers: Z,
  LineLabelPlacement: Rt,
  LineLabelSymbolizer: $,
  LineSymbolizer: M$1,
  OffsetSymbolizer: Pe,
  OffsetTextSymbolizer: ie,
  Padding: ot,
  PmtilesSource: H,
  PolygonSymbolizer: P,
  Sheet: ht,
  ShieldSymbolizer: at,
  Static: dt,
  TextPlacements: At,
  TextSymbolizer: ne,
  TileCache: ee,
  View: Ne,
  ZxySource: Q,
  arr: Tr,
  covering: Nt,
  createPattern: zr,
  exp: F,
  getZoom: ut,
  isCcw: Pt,
  isInRing: tt,
  labelRules: se,
  leafletLayer: Pn,
  linear: Le,
  paint: ue,
  paintRules: ae,
  pointInPolygon: Lt,
  pointMinDistToLines: Ct,
  pointMinDistToPoints: vt,
  sourcesToViews: fe,
  step: Pr,
  toIndex: Y,
  transformGeom: ce,
  wrap: le
});

// window.L as defined below is required for protomaps-leaflet <= 4.0.1
const Leaflet = { GridLayer: leafletSrcExports.GridLayer, DomUtil: leafletSrcExports.DomUtil };
window.L = Leaflet;
window.protomapsL = protomapsL;

var TemplatedPMTilesLayer = leafletSrcExports.Layer.extend({
  initialize: function (template, options) {
    /* structure of this._template:
      {
        template: decodeURI(new URL(template, this.getBase())),
        linkEl: (map-link),
        rel: (map-link@rel),
        type: (map-link@type),
        values: [map-input],
        inputsReady: Promise.allSettled(inputsReady),
        zoom: (map-input@type=zoom),
        projection: (map-extent@units),
        tms: true/false,
        step: step
      }
    */
    this._template = template;
    this._container = leafletSrcExports.DomUtil.create(
      'div',
      'leaflet-layer mapml-pmtiles-container'
    );
    this._pmtilesOptions = {
      pane: this._container,
      maxDataZoom: template.zoom?.max ?? 15,
      url: this._mapInputNamesToProtomapsUrl(template),
      noWrap: true
    };

    let paintRules = options?.pmtilesRules?.get(this._template.template);
    if (paintRules?.rules) {
      leafletSrcExports.extend(this._pmtilesOptions, {
        paintRules: paintRules.rules.PAINT_RULES
      });
      leafletSrcExports.extend(this._pmtilesOptions, {
        labelRules: paintRules.rules.LABEL_RULES
      });
      if (paintRules.sheet) {
        leafletSrcExports.extend(this._pmtilesOptions, { tasks: [paintRules.sheet.load()] });
      }
    } else if (paintRules?.theme?.theme) {
      leafletSrcExports.extend(this._pmtilesOptions, { theme: paintRules.theme.theme });
    } else {
      console.warn(
        'pmtiles symbolizer rules or theme not found for map-link@tref ->  ' +
          this._template.template
      );
    }
    this.zoomBounds = options.zoomBounds;
    this.extentBounds = options.extentBounds;
    // get rid of duplicate info, it can be confusing
    delete options.zoomBounds;
    delete options.extentBounds;
    this._linkEl = options.linkEl;
    leafletSrcExports.setOptions(this, options);
  },
  /**
   *
   * @param {type} template
   * @returns {url compatible with protomaps-leaflet {z},{x},{y}}
   */
  _mapInputNamesToProtomapsUrl: function (template) {
    // protomaps requires hard-coded URL template variables {z}, {x} and {y}
    // MapML allows you to set your own variable names, so we have to map the
    // names you use for zoom, column and row to the {z}, {x} and {y} variables,
    // and then replace the variable names used in the template with the
    // corresponding {z}, {x} and {y} strings for protomaps
    let url = template.template;
    let re = new RegExp(
      template.zoom?.name ? '{' + template.zoom.name + '}' : '{z}',
      'ig'
    );
    url = url.replace(re, '{z}');
    let rowName = template.values.find(
      (i) => i.type === 'location' && i.axis === 'row'
    )?.name;
    re = new RegExp(rowName ? '{' + rowName + '}' : '{y}', 'ig');
    url = url.replace(re, '{y}');
    let colName = template.values.find(
      (i) => i.type === 'location' && i.axis === 'column'
    )?.name;
    re = new RegExp(colName ? '{' + colName + '}' : '{x}', 'ig');
    url = url.replace(re, '{x}');
    return url;
  },
  onAdd: function (map) {
    this._map = map;
    this.options.pane.appendChild(this._container);
    this.setZIndex(this.options.zIndex);
    this._pmtilesLayer = Pn(this._pmtilesOptions)
      .addTo(map);
  },
  onRemove: function (map) {
    this._pmtilesLayer.remove();
    leafletSrcExports.DomUtil.remove(this._container);
  },
  isVisible: function () {
    if (this._template.projection !== 'OSMTILE') return false;
    let map = this._linkEl.getMapEl()._map;
    let mapZoom = map.getZoom();
    let mapBounds = Util.pixelToPCRSBounds(
      map.getPixelBounds(),
      mapZoom,
      map.options.projection
    );
    return (
      mapZoom <= this.zoomBounds.maxZoom &&
      mapZoom >= this.zoomBounds.minZoom &&
      this.extentBounds.overlaps(mapBounds)
    );
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    if (
      this._container &&
      this.options.zIndex !== undefined &&
      this.options.zIndex !== null
    ) {
      this._container.style.zIndex = this.options.zIndex;
    }
    return this;
  }
});
var templatedPMTilesLayer = function (template, options) {
  return new TemplatedPMTilesLayer(template, options);
};

const MapLink$1 = /*@__PURE__*/ proxyCustomElement(class MapLink extends H$1 {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    // Core attributes - using getters/setters pattern from MapML
    type;
    // Getter that provides default value without reflecting it to the DOM attribute
    get typeValue() {
        return this.type || 'image/*';
    }
    rel;
    href;
    hreflang;
    tref;
    // Getter that provides default value (matching MapML behavior)
    get trefValue() {
        return this.tref || M.BLANK_TT_TREF;
    }
    media;
    tms;
    projection;
    disabled;
    _templatedLayer;
    _templateVars;
    _alternate;
    _styleOption;
    _stylesheetHost;
    _pmtilesRules;
    _mql;
    _changeHandler;
    // the layer registry is a semi-private Map stored on each map-link and map-layer element
    // structured as follows: position -> {layer: layerInstance, count: number}
    // where layer is either a MapTileLayer or a MapFeatureLayer, 
    // and count is the number of tiles or features in that layer
    _layerRegistry = new Map();
    parentExtent;
    mapEl;
    zoomInput;
    zIndex;
    link;
    typeChanged(newValue, oldValue) {
    }
    relChanged(newValue, oldValue) {
    }
    hrefChanged(newValue, oldValue) {
    }
    hreflangChanged(newValue, oldValue) {
    }
    trefChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            this._initTemplateVars();
        }
    }
    mediaChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            this._registerMediaQuery(newValue);
        }
    }
    tmsChanged(newValue, oldValue) {
    }
    projectionChanged(newValue, oldValue) {
    }
    disabledChanged(newValue) {
        if (newValue) {
            this._disableLink();
        }
        else {
            this._enableLink();
        }
    }
    get extent() {
        return this._templateVars
            ? Object.assign(Util._convertAndFormatPCRS(this.getBounds(), M[this.parentExtent.units], this.parentExtent.units), { zoom: this.getZoomBounds() })
            : null;
    }
    getMapEl() {
        return Util.getClosest(this.el, 'gcds-map');
    }
    getLayerEl() {
        return Util.getClosest(this.el, 'map-layer,layer-');
    }
    getBase() {
        // Look for map-base element in the shadow root (for remote content)
        const shadowRoot = this.el.getRootNode();
        if (shadowRoot instanceof ShadowRoot) {
            const mapBase = shadowRoot.querySelector('map-base[href]');
            if (mapBase) {
                return mapBase.getAttribute('href');
            }
            // Fallback: resolve against the layer's src
            const layer = shadowRoot.host;
            return new URL(layer.src, layer.baseURI).href;
        }
        // Light DOM: check for map-base or use element's baseURI
        const mapBase = this.el.getRootNode().querySelector('map-base[href]');
        return mapBase ? mapBase.getAttribute('href') : this.el.baseURI;
    }
    async connectedCallback() {
        if (this.getLayerEl()?.hasAttribute('data-moving') ||
            (this.parentExtent && this.parentExtent.hasAttribute('data-moving')))
            return;
        this.el._layerRegistry = this._layerRegistry;
        // Publish MapML compatibility methods on element
        // Note: Methods decorated with @Method() (whenReady) 
        // are automatically available on the element
        this.el.getMapEl = this.getMapEl.bind(this);
        this.el.getLayerEl = this.getLayerEl.bind(this);
        this.el.zoomTo = this.zoomTo.bind(this);
        this.el.getZoomBounds = this.getZoomBounds.bind(this);
        this.el.getBounds = this.getBounds.bind(this);
        this.el.isVisible = this.isVisible.bind(this);
        this.el.getLayerControlOption = this.getLayerControlOption.bind(this);
        // Expose extent property on DOM element for MapML compatibility
        Object.defineProperty(this.el, 'extent', {
            get: () => this.extent,
            configurable: true,
            enumerable: true
        });
        switch (this.rel?.toLowerCase()) {
            case 'tile':
            case 'image':
            case 'features':
            case 'query':
                if (!this.disabled) {
                    this._initTemplateVars();
                    await this._createTemplatedLink();
                }
                break;
            case 'style':
            case 'self':
            case 'style self':
            case 'self style':
                this._createSelfOrStyleLink();
                break;
            case 'zoomin':
            case 'zoomout':
                break;
            case 'legend':
                break;
            case 'stylesheet':
                if (!this.disabled) {
                    this._createStylesheetLink();
                }
                break;
            case 'alternate':
                this._createAlternateLink();
                break;
        }
        await this._registerMediaQuery(this.media);
    }
    disconnectedCallback() {
        switch (this.rel?.toLowerCase()) {
            case 'stylesheet':
                if (this._stylesheetHost) {
                    this.link?.remove();
                }
                break;
        }
        this._layerRegistry.clear();
    }
    _disableLink() {
        switch (this.rel?.toLowerCase()) {
            case 'tile':
            case 'image':
            case 'features':
                if (this._templatedLayer &&
                    this.parentExtent?._extentLayer?.hasLayer(this._templatedLayer)) {
                    this.parentExtent._extentLayer.removeLayer(this._templatedLayer);
                    delete this._templatedLayer;
                    if (this.el.shadowRoot) {
                        this.el.shadowRoot.innerHTML = '';
                    }
                    this.getLayerEl()?._validateDisabled();
                }
                break;
            case 'query':
                delete this._templateVars;
                if (this.el.shadowRoot) {
                    this.el.shadowRoot.innerHTML = '';
                }
                this.getLayerEl()?._validateDisabled();
                break;
            case 'stylesheet':
                delete this._pmtilesRules;
                delete this._stylesheetHost;
                if (this.link) {
                    this.link.remove();
                    delete this.link;
                }
                break;
        }
    }
    async _enableLink() {
        switch (this.rel?.toLowerCase()) {
            case 'tile':
            case 'image':
            case 'features':
            case 'query':
                this._initTemplateVars();
                await this._createTemplatedLink();
                this.getLayerEl()?._validateDisabled();
                break;
            case 'stylesheet':
                this._createStylesheetLink();
                break;
        }
    }
    async _registerMediaQuery(mq) {
        if (!this._changeHandler) {
            this._changeHandler = () => {
                this.disabled = !this._mql.matches;
            };
        }
        if (mq) {
            const map = this.getMapEl();
            if (!map)
                return;
            await map.whenReady();
            if (this._mql) {
                this._mql.removeEventListener('change', this._changeHandler);
            }
            this._mql = map.matchMedia(mq);
            this._changeHandler();
            this._mql.addEventListener('change', this._changeHandler);
        }
        else if (this._mql) {
            this._mql.removeEventListener('change', this._changeHandler);
            delete this._mql;
            this.disabled = false;
        }
    }
    _createAlternateLink() {
        if (this.href && this.projection)
            this._alternate = true;
    }
    _createStylesheetLink() {
        if (this.type === 'application/pmtiles+stylesheet') {
            const pmtilesStyles = new URL(this.href, this.getBase()).href;
            // Use webpackIgnore magic comment to prevent storybook Webpack from analyzing this dynamic import
            import(/* webpackIgnore: true */ pmtilesStyles)
                .then((module) => module.pmtilesRulesReady)
                .then((initializedRules) => {
                this._pmtilesRules = initializedRules;
                this.el._pmtilesRules = initializedRules;
            })
                .catch((reason) => {
                console.error('Error importing pmtiles symbolizer rules or theme: \n' + reason);
            });
        }
        else {
            this._stylesheetHost =
                this.el.getRootNode() instanceof ShadowRoot
                    ? this.el.getRootNode().host
                    : this.el.parentElement;
            if (this._stylesheetHost === undefined)
                return;
            this.link = document.createElement('link');
            this.el.link = this.link;
            this.link.mapLink = this.el;
            this.link.setAttribute('href', new URL(this.href, this.getBase()).href);
            this._copyAttributes(this.el, this.link);
            // Explicitly set disabled based on the property value, not the attribute
            // (which may be stale during re-enabling)
            this.link.disabled = this.disabled || false;
            // Try to render immediately if parent is ready
            // If parent isn't ready yet, the parent's mutation observer will pick this up
            // and render it after the parent becomes ready
            if (this._stylesheetHost._layer) {
                this._stylesheetHost._layer.renderStyles(this.el);
            }
            else if (this._stylesheetHost._templatedLayer) {
                this._stylesheetHost._templatedLayer.renderStyles(this.el);
            }
            else if (this._stylesheetHost._extentLayer) {
                this._stylesheetHost._extentLayer.renderStyles(this.el);
            }
            // If none of the above exist yet, the parent's mutation observer
            // or initialization will call renderStyles when it's ready
        }
    }
    _copyAttributes(source, target) {
        Array.from(source.attributes).forEach((attribute) => {
            // Don't copy href, media, or disabled - these are handled separately
            if (attribute.nodeName !== 'href' &&
                attribute.nodeName !== 'media' &&
                attribute.nodeName !== 'disabled')
                target.setAttribute(attribute.nodeName, attribute.nodeValue);
        });
    }
    // Create templated layer based on rel type
    async _createTemplatedLink() {
        // conditions check
        // the tms and type attributes are optional, may need to be checked in future
        this.parentExtent =
            this.el.parentNode?.nodeName.toUpperCase() === 'MAP-EXTENT'
                ? this.el.parentNode
                : this.el.parentNode?.host;
        if (this.disabled || !this.parentExtent) {
            return;
        }
        try {
            await this.parentExtent.whenReady();
            await this._templateVars?.inputsReady;
        }
        catch (error) {
            console.log('Error while creating templated link: ' + error);
            return;
        }
        this.mapEl = this.getMapEl();
        // create the layer type appropriate to the rel value
        this.zIndex = Array.from(this.parentExtent.querySelectorAll('map-link[rel=image],map-link[rel=tile],map-link[rel=features]')).indexOf(this.el);
        if ((this.rel === 'tile' && this.type === 'application/pmtiles') ||
            this.type === 'application/vnd.mapbox-vector-tile') {
            const s = 'map-link[rel="stylesheet"][type="application/pmtiles+stylesheet"]:not([disabled])';
            let pmtilesStylesheetLink = this.getLayerEl()?.src
                ? this.el.closest('map-extent')?.querySelector(s) ??
                    this.el.getRootNode().querySelector(':host > ' + s)
                : Util.getClosest(this.el, 'map-extent:has(' +
                    s +
                    '),map-layer:has(' +
                    s +
                    '),layer-:has(' +
                    s +
                    ')')?.querySelector(s);
            if (pmtilesStylesheetLink) {
                await pmtilesStylesheetLink.whenReady();
                const options = {
                    zoomBounds: this.getZoomBounds(),
                    extentBounds: this.getBounds(),
                    crs: M[this.parentExtent.units],
                    zIndex: this.zIndex,
                    pane: this.parentExtent._extentLayer.getContainer(),
                    linkEl: this.el,
                    pmtilesRules: pmtilesStylesheetLink?._pmtilesRules
                };
                this._templatedLayer = templatedPMTilesLayer(this._templateVars, options).addTo(this.parentExtent._extentLayer);
                // Publish for MapML compatibility
                this.el._templatedLayer = this._templatedLayer;
            }
            else {
                console.warn('Stylesheet not found for ' + this._templateVars.template);
            }
        }
        else if (this.rel === 'tile') {
            this._templatedLayer = templatedTileLayer(this._templateVars, {
                zoomBounds: this.getZoomBounds(),
                extentBounds: this.getBounds(),
                crs: M[this.parentExtent.units],
                errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                zIndex: this.zIndex,
                pane: this.parentExtent._extentLayer.getContainer(),
                linkEl: this.el
            }).addTo(this.parentExtent._extentLayer);
            // Publish for MapML compatibility
            this.el._templatedLayer = this._templatedLayer;
        }
        else if (this.rel === 'image') {
            this._templatedLayer = templatedImageLayer(this._templateVars, {
                zoomBounds: this.getZoomBounds(),
                extentBounds: this.getBounds(),
                zIndex: this.zIndex,
                pane: this.parentExtent._extentLayer.getContainer(),
                linkEl: this.el
            }).addTo(this.parentExtent._extentLayer);
            // Publish for MapML compatibility
            this.el._templatedLayer = this._templatedLayer;
        }
        else if (this.rel === 'features') {
            // map-feature retrieved by link will be stored in shadowRoot owned by link
            if (!this.el.shadowRoot) {
                this.el.attachShadow({ mode: 'open' });
            }
            // Use the FeaturesTilesLayerGroup to handle both map-feature and map-tile elements
            this._templatedLayer = templatedFeaturesOrTilesLayer(this._templateVars, {
                zoomBounds: this.getZoomBounds(),
                extentBounds: this.getBounds(),
                zIndex: this.zIndex,
                pane: this.parentExtent._extentLayer.getContainer(),
                linkEl: this.el,
                projection: this.mapEl._map.options.projection
            }).addTo(this.parentExtent._extentLayer);
            // Publish for MapML compatibility
            this.el._templatedLayer = this._templatedLayer;
        }
        else if (this.rel === 'query') {
            if (!this.el.shadowRoot) {
                this.el.attachShadow({ mode: 'open' });
            }
            Object.assign(this._templateVars, this._setupQueryVars(this._templateVars));
            Object.assign(this._templateVars, { extentBounds: this.getBounds() });
        }
    }
    _setupQueryVars(template) {
        // process the inputs associated to template and create an object named
        // query with member properties as follows:
        // {width: 'widthvarname',
        //  height: 'heightvarname',
        //  left: 'leftvarname',
        //  right: 'rightvarname',
        //  top: 'topvarname',
        //  bottom: 'bottomvarname'
        //  i: 'ivarname'
        //  j: 'jvarname'}
        //  x: 'xvarname' x being the tcrs x axis
        //  y: 'yvarname' y being the tcrs y axis
        //  z: 'zvarname' zoom
        //  title: link title
        const queryVarNames = { query: {} };
        const inputs = template.values;
        for (let i = 0; i < template.values.length; i++) {
            const type = inputs[i].getAttribute('type');
            const units = inputs[i].getAttribute('units');
            const axis = inputs[i].getAttribute('axis');
            const name = inputs[i].getAttribute('name');
            const position = inputs[i].getAttribute('position');
            const rel = inputs[i].getAttribute('rel');
            const select = inputs[i].tagName.toLowerCase() === 'map-select';
            if (type === 'width') {
                queryVarNames.query.width = name;
            }
            else if (type === 'height') {
                queryVarNames.query.height = name;
            }
            else if (type === 'location') {
                switch (axis) {
                    case 'x':
                    case 'y':
                    case 'column':
                    case 'row':
                        queryVarNames.query[axis] = name;
                        break;
                    case 'longitude':
                    case 'easting':
                        if (position) {
                            if (position.match(/.*?-left/i)) {
                                if (rel === 'pixel') {
                                    queryVarNames.query.pixelleft = name;
                                }
                                else if (rel === 'tile') {
                                    queryVarNames.query.tileleft = name;
                                }
                                else {
                                    queryVarNames.query.mapleft = name;
                                }
                            }
                            else if (position.match(/.*?-right/i)) {
                                if (rel === 'pixel') {
                                    queryVarNames.query.pixelright = name;
                                }
                                else if (rel === 'tile') {
                                    queryVarNames.query.tileright = name;
                                }
                                else {
                                    queryVarNames.query.mapright = name;
                                }
                            }
                        }
                        else {
                            queryVarNames.query[axis] = name;
                        }
                        break;
                    case 'latitude':
                    case 'northing':
                        if (position) {
                            if (position.match(/top-.*?/i)) {
                                if (rel === 'pixel') {
                                    queryVarNames.query.pixeltop = name;
                                }
                                else if (rel === 'tile') {
                                    queryVarNames.query.tiletop = name;
                                }
                                else {
                                    queryVarNames.query.maptop = name;
                                }
                            }
                            else if (position.match(/bottom-.*?/i)) {
                                if (rel === 'pixel') {
                                    queryVarNames.query.pixelbottom = name;
                                }
                                else if (rel === 'tile') {
                                    queryVarNames.query.tilebottom = name;
                                }
                                else {
                                    queryVarNames.query.mapbottom = name;
                                }
                            }
                        }
                        else {
                            queryVarNames.query[axis] = name;
                        }
                        break;
                    case 'i':
                        if (units === 'tile') {
                            queryVarNames.query.tilei = name;
                        }
                        else {
                            queryVarNames.query.mapi = name;
                        }
                        break;
                    case 'j':
                        if (units === 'tile') {
                            queryVarNames.query.tilej = name;
                        }
                        else {
                            queryVarNames.query.mapj = name;
                        }
                        break;
                    // unsupported axis value
                }
            }
            else if (type === 'zoom') {
                //<input name="..." type="zoom" value="0" min="0" max="17">
                queryVarNames.query.zoom = name;
            }
            else if (select) {
                const parsedselect = inputs[i].htmlselect;
                queryVarNames.query[name] = function () {
                    return parsedselect.value;
                };
            }
            else {
                const input = inputs[i];
                queryVarNames.query[name] = function () {
                    return input.getAttribute('value');
                };
            }
        }
        return queryVarNames;
    }
    _initTemplateVars() {
        const varNamesRe = new RegExp('(?:{)(.*?)(?:})', 'g');
        const zoomInput = this.el.parentElement?.querySelector('map-input[type="zoom" i]');
        let includesZoom = false;
        let linkedZoomInput;
        let template = this.trefValue;
        if (template === M.BLANK_TT_TREF) {
            const mapInputs = this.el.parentElement?.querySelectorAll('map-input');
            if (mapInputs) {
                mapInputs.forEach((i) => {
                    template += `{${i.getAttribute('name')}}`;
                });
            }
        }
        this.zoomInput = zoomInput;
        // Publish for MapML compatibility
        this.el.zoomInput = zoomInput;
        let v;
        const vcount = template.match(varNamesRe) || [];
        const inputs = [];
        const inputsReady = [];
        while ((v = varNamesRe.exec(template)) !== null) {
            const varName = v[1];
            const inp = this.el.parentElement?.querySelector(`map-input[name=${varName}],map-select[name=${varName}]`);
            if (inp) {
                inputs.push(inp);
                inputsReady.push(inp.whenReady());
                if (inp.hasAttribute('type') &&
                    inp.getAttribute('type').toLowerCase() === 'zoom') {
                    linkedZoomInput = inp;
                    includesZoom = true;
                }
            }
            else {
                console.log('input with name=' +
                    varName +
                    ' not found for template variable of same name');
            }
        }
        if (template && vcount.length === inputs.length) {
            if (!includesZoom && zoomInput) {
                inputs.push(zoomInput);
                inputsReady.push(zoomInput.whenReady());
                linkedZoomInput = zoomInput;
            }
            const step = zoomInput ? zoomInput.getAttribute('step') : 1;
            // Validate step: if not set, is '0', or not a number, default to 1
            let validStep = step;
            if (!step || step === '0' || isNaN(step))
                validStep = 1;
            this._templateVars = {
                template: decodeURI(new URL(template, this.getBase()).href),
                linkEl: this.el,
                rel: this.rel,
                type: this.typeValue,
                values: inputs,
                inputsReady: Promise.allSettled(inputsReady),
                zoom: linkedZoomInput,
                projection: this.el.parentElement?.getAttribute('units'),
                tms: this.tms,
                step: validStep
            };
            // Publish for MapML compatibility
            this.el._templateVars = this._templateVars;
        }
    }
    // Stub implementations for bounds methods - to be completed
    getZoomBounds() {
        return this._getZoomBounds(this._templateVars?.zoom);
    }
    _getZoomBounds(zoomInput) {
        const zoomBounds = {};
        const meta = this.el.parentElement?.getMeta?.('zoom');
        const metaMin = meta
            ? +Util._metaContentToObject(meta.getAttribute('content'))?.min
            : null;
        zoomBounds.minZoom =
            metaMin || (zoomInput ? +zoomInput.getAttribute('min') : 0);
        zoomBounds.minNativeZoom = zoomInput
            ? +zoomInput.getAttribute('min')
            : zoomBounds.minZoom;
        const metaMax = meta
            ? +Util._metaContentToObject(meta.getAttribute('content'))?.max
            : null;
        zoomBounds.maxZoom =
            metaMax ||
                (zoomInput
                    ? +zoomInput.getAttribute('max')
                    : M[this.el.parentElement?.getAttribute('units')]?.options.resolutions.length - 1);
        zoomBounds.maxNativeZoom = zoomInput
            ? +zoomInput.getAttribute('max')
            : zoomBounds.maxZoom;
        return zoomBounds;
    }
    getBounds() {
        const template = this._templateVars;
        if (!template)
            return null;
        const inputs = template.values;
        const projection = this.el.parentElement?.getAttribute('units');
        const boundsUnit = {};
        boundsUnit.name = M.FALLBACK_CS;
        let bnds = M[projection].options.crs.tilematrix.bounds(0);
        let locInputs = false;
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].getAttribute('type') === 'location') {
                if (!inputs[i].getAttribute('max') || !inputs[i].getAttribute('min'))
                    continue;
                const max = +inputs[i].getAttribute('max');
                const min = +inputs[i].getAttribute('min');
                switch (inputs[i].getAttribute('axis')?.toLowerCase()) {
                    case 'x':
                    case 'longitude':
                    case 'column':
                    case 'easting':
                        boundsUnit.name = Util.axisToCS(inputs[i].getAttribute('axis').toLowerCase());
                        bnds.min.x = min;
                        bnds.max.x = max;
                        boundsUnit.horizontalAxis = inputs[i]
                            .getAttribute('axis')
                            .toLowerCase();
                        break;
                    case 'y':
                    case 'latitude':
                    case 'row':
                    case 'northing':
                        boundsUnit.name = Util.axisToCS(inputs[i].getAttribute('axis').toLowerCase());
                        bnds.min.y = min;
                        bnds.max.y = max;
                        boundsUnit.verticalAxis = inputs[i]
                            .getAttribute('axis')
                            .toLowerCase();
                        break;
                }
            }
        }
        if (boundsUnit.horizontalAxis &&
            boundsUnit.verticalAxis &&
            ((boundsUnit.horizontalAxis === 'x' && boundsUnit.verticalAxis === 'y') ||
                (boundsUnit.horizontalAxis === 'longitude' &&
                    boundsUnit.verticalAxis === 'latitude') ||
                (boundsUnit.horizontalAxis === 'column' &&
                    boundsUnit.verticalAxis === 'row') ||
                (boundsUnit.horizontalAxis === 'easting' &&
                    boundsUnit.verticalAxis === 'northing'))) {
            locInputs = true;
        }
        if (locInputs) {
            const zoomValue = this._templateVars.zoom?.hasAttribute('value')
                ? +this._templateVars.zoom.getAttribute('value')
                : 0;
            bnds = Util.boundsToPCRSBounds(bnds, zoomValue, projection, boundsUnit.name);
        }
        else if (!locInputs) {
            bnds = this.getFallbackBounds(projection);
        }
        return bnds;
    }
    getFallbackBounds(projection) {
        let bnds;
        let zoom = 0;
        const metaExtent = this.el.parentElement?.getMeta?.('extent');
        if (metaExtent) {
            const content = Util._metaContentToObject(metaExtent.getAttribute('content'));
            let cs;
            zoom = content.zoom || zoom;
            const metaKeys = Object.keys(content);
            for (let i = 0; i < metaKeys.length; i++) {
                if (!metaKeys[i].includes('zoom')) {
                    cs = Util.axisToCS(metaKeys[i].split('-')[2]);
                    break;
                }
            }
            const axes = Util.csToAxes(cs);
            bnds = Util.boundsToPCRSBounds(leafletSrcExports.bounds(leafletSrcExports.point(+content[`top-left-${axes[0]}`], +content[`top-left-${axes[1]}`]), leafletSrcExports.point(+content[`bottom-right-${axes[0]}`], +content[`bottom-right-${axes[1]}`])), zoom, projection, cs);
        }
        else {
            const crs = M[projection];
            bnds = crs?.options.crs.pcrs.bounds;
        }
        return bnds;
    }
    isVisible() {
        if (this.disabled)
            return false;
        let isVisible = false;
        const map = this.getMapEl();
        const mapZoom = map?.zoom;
        const extent = map?.extent;
        if (!extent)
            return false;
        const xmin = extent.topLeft.pcrs.horizontal;
        const xmax = extent.bottomRight.pcrs.horizontal;
        const ymin = extent.bottomRight.pcrs.vertical;
        const ymax = extent.topLeft.pcrs.vertical;
        const mapBounds = leafletSrcExports.bounds(leafletSrcExports.point(xmin, ymin), leafletSrcExports.point(xmax, ymax));
        if (this._templatedLayer) {
            isVisible = this._templatedLayer.isVisible();
        }
        else if (this.rel === 'query') {
            const minZoom = this.extent?.zoom.minZoom;
            const maxZoom = this.extent?.zoom.maxZoom;
            const withinZoomBounds = (z) => {
                return minZoom <= z && z <= maxZoom;
            };
            const linkBounds = this.getBounds();
            if (linkBounds?.overlaps(mapBounds) && withinZoomBounds(mapZoom)) {
                isVisible = true;
            }
        }
        return isVisible;
    }
    zoomTo() {
        const extent = this.extent;
        if (!extent)
            return;
        const map = this.getMapEl()._map;
        const xmin = extent.topLeft.pcrs.horizontal;
        const xmax = extent.bottomRight.pcrs.horizontal;
        const ymin = extent.bottomRight.pcrs.vertical;
        const ymax = extent.topLeft.pcrs.vertical;
        const newBounds = leafletSrcExports.bounds(leafletSrcExports.point(xmin, ymin), leafletSrcExports.point(xmax, ymax));
        const center = map.options.crs.unproject(newBounds.getCenter(true));
        const maxZoom = extent.zoom.maxZoom;
        const minZoom = extent.zoom.minZoom;
        map.setView(center, Util.getMaxZoom(newBounds, map, minZoom, maxZoom), {
            animate: false
        });
    }
    _createSelfOrStyleLink() {
        const layerEl = this.getLayerEl();
        const changeStyle = function (e) {
            leafletSrcExports.DomEvent.stop(e);
            layerEl.dispatchEvent(new CustomEvent('changestyle', {
                detail: {
                    src: e.target.getAttribute('data-href')
                }
            }));
        };
        const styleOption = document.createElement('div');
        const styleOptionInput = styleOption.appendChild(document.createElement('input'));
        styleOptionInput.setAttribute('type', 'radio');
        styleOptionInput.setAttribute('id', 'rad-' + leafletSrcExports.stamp(styleOptionInput));
        styleOptionInput.setAttribute('name', 'styles-' + leafletSrcExports.stamp(styleOption));
        styleOptionInput.setAttribute('value', this.el.getAttribute('title'));
        styleOptionInput.setAttribute('data-href', new URL(this.href, this.getBase()).href);
        const styleOptionLabel = styleOption.appendChild(document.createElement('label'));
        styleOptionLabel.setAttribute('for', 'rad-' + leafletSrcExports.stamp(styleOptionInput));
        styleOptionLabel.innerText = this.el.getAttribute('title');
        if (this.rel === 'style self' || this.rel === 'self style') {
            styleOptionInput.checked = true;
        }
        this._styleOption = styleOption;
        styleOptionInput.addEventListener('click', changeStyle.bind(this));
    }
    getLayerControlOption() {
        return this._styleOption;
    }
    resolve() {
        if (this.trefValue !== M.BLANK_TT_TREF) {
            const obj = {};
            const inputs = this.el.parentElement?.querySelectorAll('map-input');
            if (this.rel === 'image') {
                for (let i = 0; i < inputs.length; i++) {
                    const inp = inputs[i];
                    obj[inp.getAttribute('name')] = inp.value;
                }
                return leafletSrcExports.Util.template(this.trefValue, obj);
            }
            else if (this.rel === 'tile') {
                return obj;
            }
            else ;
        }
    }
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer, ready;
            switch (this.rel?.toLowerCase()) {
                case 'tile':
                case 'image':
                case 'features':
                    ready = '_templatedLayer';
                    if (this.disabled)
                        resolve();
                    break;
                case 'style':
                case 'self':
                case 'style self':
                case 'self style':
                    ready = '_styleOption';
                    break;
                case 'query':
                    ready = 'shadowRoot';
                    if (this.disabled)
                        resolve();
                    break;
                case 'alternate':
                    ready = '_alternate';
                    break;
                case 'stylesheet':
                    if (this.type === 'application/pmtiles+stylesheet') {
                        ready = '_pmtilesRules';
                    }
                    else {
                        ready = '_stylesheetHost';
                    }
                    break;
                case 'zoomin':
                case 'zoomout':
                case 'legend':
                case 'license':
                    resolve();
                    return;
                default:
                    resolve();
                    return;
            }
            if (this[ready]) {
                resolve();
                return;
            }
            interval = setInterval(testForLinkReady, 300, this);
            failureTimer = setTimeout(linkNotDefined, 1000);
            function testForLinkReady(linkElement) {
                if (linkElement.el[ready]) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
                else if (!linkElement.el.isConnected) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    reject('map-link was disconnected while waiting to be ready');
                }
            }
            function linkNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for link to be ready');
            }
        });
    }
    render() {
        return null;
    }
    static get watchers() { return {
        "type": ["typeChanged"],
        "rel": ["relChanged"],
        "href": ["hrefChanged"],
        "hreflang": ["hreflangChanged"],
        "tref": ["trefChanged"],
        "media": ["mediaChanged"],
        "tms": ["tmsChanged"],
        "projection": ["projectionChanged"],
        "disabled": ["disabledChanged"]
    }; }
}, [257, "map-link", {
        "type": [513],
        "rel": [513],
        "href": [513],
        "hreflang": [513],
        "tref": [513],
        "media": [513],
        "tms": [516],
        "projection": [513],
        "disabled": [1540],
        "whenReady": [64]
    }, undefined, {
        "type": ["typeChanged"],
        "rel": ["relChanged"],
        "href": ["hrefChanged"],
        "hreflang": ["hreflangChanged"],
        "tref": ["trefChanged"],
        "media": ["mediaChanged"],
        "tms": ["tmsChanged"],
        "projection": ["projectionChanged"],
        "disabled": ["disabledChanged"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-link"];
    components.forEach(tagName => { switch (tagName) {
        case "map-link":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapLink$1);
            }
            break;
    } });
}
defineCustomElement$1();

const MapLink = MapLink$1;
const defineCustomElement = defineCustomElement$1;

export { MapLink, defineCustomElement };
//# sourceMappingURL=map-link.js.map

//# sourceMappingURL=map-link.js.map