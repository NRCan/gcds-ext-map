import { r as registerInstance, a as getElement, U as Util, M as MapFeatureLayer, f as featureRenderer, l as leafletSrcExports, p as proj4 } from './index-PZrWUcjo.js';
import { c as calculatePosition } from './calculatePosition-B4YLD_Og.js';

const MapFeature = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
    zoom;
    min;
    max;
    _featureLayer;
    _geometry;
    _groupEl;
    _observer;
    _parentEl;
    _initialZoom;
    _getFeatureExtent;
    zoomChanged(newValue, oldValue) {
        if (oldValue !== newValue && this._featureLayer) {
            this.reRender(this._featureLayer);
        }
    }
    minChanged(newValue, oldValue) {
        if (oldValue !== newValue && this._featureLayer) {
            this.reRender(this._featureLayer);
        }
    }
    maxChanged(newValue, oldValue) {
        if (oldValue !== newValue && this._featureLayer) {
            this.reRender(this._featureLayer);
        }
    }
    get zoomValue() {
        // for templated or queried features ** native zoom is only used for zoomTo() **
        let meta = {}, metaEl = this.getMeta('zoom');
        if (metaEl)
            meta = Util._metaContentToObject(metaEl.getAttribute('content'));
        if (this._parentEl?.nodeName === 'MAP-LINK') {
            // nativeZoom = zoom attribute || (sd.map-meta zoom 'value'  || 'max') || this._initialZoom
            return +(this.el.hasAttribute('zoom')
                ? this.el.getAttribute('zoom')
                : meta['value']
                    ? meta['value']
                    : meta['max']
                        ? meta['max']
                        : this._initialZoom ?? this.getMapEl()?.zoom ?? 0);
        }
        else {
            // for "static" features
            // nativeZoom zoom attribute || this._initialZoom
            return +(this.el.hasAttribute('zoom')
                ? this.el.getAttribute('zoom')
                : this._initialZoom ?? this.getMapEl()?.zoom ?? 0);
        }
    }
    get minValue() {
        // for templated or queried features
        let meta = {}, metaEl = this.getMeta('zoom');
        if (metaEl)
            meta = Util._metaContentToObject(metaEl.getAttribute('content'));
        let projectionMinZoom = 0;
        if (this._parentEl?.nodeName === 'MAP-LINK') {
            // minZoom = min attribute || sd.map-meta min zoom || map-link minZoom
            return +(this.el.hasAttribute('min')
                ? this.el.getAttribute('min')
                : meta['min']
                    ? meta['min']
                    : this._parentEl.getZoomBounds().minZoom);
        }
        else {
            // for "static" features
            // minZoom = min attribute || map-meta zoom || projection minZoom
            return +(this.el.hasAttribute('min')
                ? this.el.getAttribute('min')
                : meta['min']
                    ? meta['min']
                    : projectionMinZoom);
        }
    }
    get maxValue() {
        // for templated or queried features
        let meta = {}, metaEl = this.getMeta('zoom');
        if (metaEl)
            meta = Util._metaContentToObject(metaEl.getAttribute('content'));
        let projectionMaxZoom = this.getMapEl()?._map?.options.crs.options.resolutions.length - 1;
        if (this._parentEl?.nodeName === 'MAP-LINK') {
            // maxZoom = max attribute || sd.map-meta max zoom || map-link maxZoom
            return +(this.el.hasAttribute('max')
                ? this.el.getAttribute('max')
                : meta['max']
                    ? meta['max']
                    : this._parentEl.getZoomBounds().maxZoom);
        }
        else {
            // for "static" features
            // maxZoom = max attribute || map-meta zoom max || projection maxZoom
            return +(this.el.hasAttribute('max')
                ? this.el.getAttribute('max')
                : meta['max']
                    ? meta['max']
                    : projectionMaxZoom);
        }
    }
    get extent() {
        if (this.el.isConnected) {
            // if the feature extent is the first time to be calculated or the feature extent is changed
            if (!this._getFeatureExtent) {
                this._getFeatureExtent = this._memoizeExtent();
            }
            return this._getFeatureExtent();
        }
    }
    get position() {
        return calculatePosition(this.el);
    }
    getMapEl() {
        return Util.getClosest(this.el, 'gcds-map');
    }
    getLayerEl() {
        return Util.getClosest(this.el, 'map-layer,layer-');
    }
    async connectedCallback() {
        // set the initial zoom of the map when features connected
        // used for fallback zoom getter for static features
        this._initialZoom = this.getMapEl()?.zoom;
        this._parentEl =
            this.el.parentNode?.nodeName === 'MAP-LAYER' ||
                this.el.parentNode?.nodeName === 'LAYER-' ||
                this.el.parentNode?.nodeName === 'MAP-LINK'
                ? this.el.parentNode
                : this.el.parentNode?.host;
        if (this.getLayerEl()?.hasAttribute('data-moving') ||
            this._parentEl?.parentElement?.hasAttribute('data-moving'))
            return;
        // Publish MapML compatibility methods on element
        this.el.getMapEl = this.getMapEl.bind(this);
        this.el.getLayerEl = this.getLayerEl.bind(this);
        this.el.zoomTo = this.zoomTo.bind(this);
        this.el.getZoomToZoom = this.getZoomToZoom.bind(this);
        this.el.click = this.click.bind(this);
        this.el.focus = this.focus.bind(this);
        this.el.blur = this.blur.bind(this);
        this.el.mapml2geojson = this.mapml2geojson.bind(this);
        this.el.addFeature = this.addFeature.bind(this);
        this.el.removeFeature = this.removeFeature.bind(this);
        this.el.reRender = this.reRender.bind(this);
        Object.defineProperty(this.el, 'zoom', {
            get: () => this.zoomValue,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(this.el, 'extent', {
            get: () => this.extent,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(this.el, 'position', {
            get: () => this.position,
            configurable: true,
            enumerable: true
        });
        // Note: zoom, min, max are already exposed as @Prop with reflect: true
        // so they don't need Object.defineProperty - they're already accessible on the element
        if (this._parentEl?.nodeName === 'MAP-LAYER' ||
            this._parentEl?.nodeName === 'LAYER-' ||
            this._parentEl?.nodeName === 'MAP-LINK') {
            this._createOrGetFeatureLayer();
        }
        // Expose properties on DOM element for MapML compatibility
        Object.defineProperty(this.el, '_featureLayer', {
            get: () => this._featureLayer,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(this.el, '_geometry', {
            get: () => this._geometry,
            configurable: true,
            enumerable: true
        });
        // use observer to monitor the changes in mapFeature's subtree
        this._observer = new MutationObserver((mutationList) => {
            for (let mutation of mutationList) {
                // the attributes changes of <map-feature> element should be handled by watchers
                if (mutation.type === 'attributes' && mutation.target === this.el) {
                    return;
                }
                // re-render feature if there is any observed change
                this.reRender(this._featureLayer);
            }
        });
        this._observer.observe(this.el, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true
        });
    }
    disconnectedCallback() {
        if (this.getLayerEl()?.hasAttribute('data-moving') ||
            this._parentEl?.parentElement?.hasAttribute('data-moving'))
            return;
        this._observer?.disconnect();
        if (this._featureLayer) {
            this.removeFeature(this._featureLayer);
            // If this was the last feature in the layer, clean up the layer
            if (this._featureLayer.getLayers().length === 0) {
                if (this._featureLayer.options.renderer) {
                    // manually remove the shared renderer
                    this._featureLayer.options.renderer.remove();
                }
                this._featureLayer.remove();
                this._featureLayer = null;
                delete this._featureLayer;
            }
        }
        // Clean up the layer registry if not data-moving
        const entry = this?._parentEl?._layerRegistry?.get(this.position);
        if (entry) {
            entry.count--;
            if (entry.count === 0) {
                this._parentEl._layerRegistry.delete(this.position);
            }
        }
    }
    reRender(layerToRenderOn) {
        if (this._groupEl?.isConnected) {
            let fallbackCS = this._getFallbackCS();
            let placeholder = document.createElement('span');
            this._groupEl.insertAdjacentElement('beforebegin', placeholder);
            if (layerToRenderOn._staticFeature) {
                layerToRenderOn._removeFromFeaturesList(this._geometry);
            }
            layerToRenderOn.removeLayer(this._geometry);
            // Garbage collection needed
            this._geometry = layerToRenderOn
                .createGeometry(this.el, fallbackCS)
                .addTo(layerToRenderOn);
            // createGeometry sets _groupEl on the DOM element as a side effect
            this._groupEl = this.el._groupEl;
            placeholder.replaceWith(this._geometry.options.group);
            layerToRenderOn._validateRendering();
            delete this._getFeatureExtent;
            this._setUpEvents();
        }
    }
    removeFeature(layerToRemoveFrom) {
        layerToRemoveFrom.removeLayer(this._geometry);
        if (layerToRemoveFrom._staticFeature) {
            layerToRemoveFrom._removeFromFeaturesList(this._geometry);
        }
        layerToRemoveFrom.options.properties = null;
        delete this._geometry;
        if (this._getFeatureExtent)
            delete this._getFeatureExtent;
    }
    addFeature(layerToAddTo) {
        this._featureLayer = layerToAddTo;
        if (!this.el.querySelector('map-geometry'))
            return;
        let fallbackCS = this._getFallbackCS();
        this._geometry = layerToAddTo.createGeometry(this.el, fallbackCS);
        if (!this._geometry)
            return;
        // createGeometry sets _groupEl on the DOM element as a side effect
        this._groupEl = this.el._groupEl;
        this._geometry._layerEl = this.getLayerEl();
        layerToAddTo.addLayer(this._geometry);
        this._setUpEvents();
    }
    getPrevious() {
        if (this.isFirst()) {
            return null;
        }
        return this.el.previousElementSibling;
    }
    isFirst() {
        return !this._parentEl._layerRegistry.has(this.position);
    }
    _createOrGetFeatureLayer() {
        // Wait for parent layer to be ready before proceeding
        this._parentEl
            .whenReady()
            .then(() => {
            // Detect parent context and get the appropriate layer container
            const isMapLink = this._parentEl.nodeName === 'MAP-LINK';
            const parentLayer = isMapLink
                ? this._parentEl._templatedLayer
                : this._parentEl._layer;
            const parentElement = this._parentEl;
            if (this.isFirst() && parentLayer) {
                let map = parentElement.getMapEl()._map;
                this._featureLayer = new MapFeatureLayer(null, {
                    renderer: featureRenderer(),
                    pane: parentLayer.getContainer(),
                    ...(isMapLink && parentElement.getBounds()
                        ? { layerBounds: parentElement.getBounds() }
                        : {}),
                    ...(isMapLink ? { zoomBounds: this._getZoomBounds() } : {}),
                    ...(isMapLink ? {} : { _leafletLayer: parentElement._layer }),
                    zIndex: this.position,
                    projection: map.options.projection,
                    mapEl: parentElement.getMapEl(),
                    onEachFeature: function (properties, geometry) {
                        if (properties) {
                            const popupOptions = {
                                autoClose: false,
                                autoPan: true,
                                maxHeight: map.getSize().y * 0.5 - 50,
                                maxWidth: map.getSize().x * 0.7,
                                minWidth: 165
                            };
                            var c = document.createElement('div');
                            c.classList.add('mapml-popup-content');
                            c.insertAdjacentHTML('afterbegin', properties.innerHTML);
                            geometry.bindPopup(c, popupOptions);
                        }
                    }
                });
                leafletSrcExports.extend(this._featureLayer.options, {
                    _leafletLayer: Object.assign(this._featureLayer, {
                        _layerEl: this.getLayerEl()
                    })
                });
                // Add this position to the parent's _layerRegistry with layer reference and count = 1
                parentElement._layerRegistry.set(this.position, { layer: this._featureLayer, count: 1 });
                this.addFeature(this._featureLayer);
                // add MapFeatureLayer to appropriate parent layer
                parentLayer.addLayer(this._featureLayer);
            }
            else {
                // get the previously registered FeatureLayer for this position
                const entry = parentElement._layerRegistry.get(this.position);
                this._featureLayer = entry?.layer;
                if (entry) {
                    entry.count++;
                }
                if (this._featureLayer) {
                    this.addFeature(this._featureLayer);
                }
            }
        })
            .catch((error) => {
            console.log('Error waiting for parent layer to be ready:', error);
        });
    }
    _setUpEvents() {
        ['click', 'focus', 'blur', 'keyup', 'keydown'].forEach((name) => {
            this._groupEl.addEventListener(name, (e) => {
                if (name === 'click') {
                    let clickEv = new PointerEvent(name, { cancelable: true });
                    clickEv.originalEvent = e;
                    this.el.dispatchEvent(clickEv);
                }
                else if (name === 'keyup' || name === 'keydown') {
                    let keyEv = new KeyboardEvent(name, { cancelable: true });
                    keyEv.originalEvent = e;
                    this.el.dispatchEvent(keyEv);
                }
                else {
                    let focusEv = new FocusEvent(name, { cancelable: true });
                    focusEv.originalEvent = e;
                    this.el.dispatchEvent(focusEv);
                }
            });
        });
    }
    _getFallbackCS() {
        let csMeta;
        if (this._parentEl?.nodeName === 'MAP-LINK') {
            csMeta =
                this._parentEl.shadowRoot?.querySelector('map-meta[name=cs][content]') ||
                    this._parentEl.parentElement?.getMeta?.('cs');
        }
        else {
            let layerEl = this.getLayerEl();
            csMeta = layerEl?.src
                ? layerEl.shadowRoot?.querySelector('map-meta[name=cs][content]')
                : layerEl?.querySelector('map-meta[name=cs][content]');
        }
        return csMeta
            ? Util._metaContentToObject(csMeta.getAttribute('content')).content
            : 'gcrs';
    }
    _memoizeExtent() {
        let extentCache;
        return () => {
            if (extentCache && this._getFeatureExtent) {
                return extentCache;
            }
            else {
                // calculate feature extent
                let map = this.getMapEl()._map, geometry = this.el.querySelector('map-geometry'), cs = geometry?.getAttribute('cs') || this._getFallbackCS(), zoom = this.zoomValue, shapes = geometry?.querySelectorAll('map-point, map-linestring, map-polygon, map-multipoint, map-multilinestring'), bboxExtent = [
                    Infinity,
                    Infinity,
                    Number.NEGATIVE_INFINITY,
                    Number.NEGATIVE_INFINITY
                ];
                if (shapes) {
                    for (let shape of Array.from(shapes)) {
                        let coord = shape.querySelectorAll('map-coordinates');
                        for (let i = 0; i < coord.length; ++i) {
                            bboxExtent = this._updateExtent(shape, coord[i], bboxExtent);
                        }
                    }
                }
                let topLeft = leafletSrcExports.point(bboxExtent[0], bboxExtent[1]);
                let bottomRight = leafletSrcExports.point(bboxExtent[2], bboxExtent[3]);
                let pcrsBound = Util.boundsToPCRSBounds(leafletSrcExports.bounds(topLeft, bottomRight), zoom, map.options.projection, cs);
                if (shapes?.length === 1 &&
                    shapes[0].tagName.toUpperCase() === 'MAP-POINT') {
                    let projection = map.options.projection, maxZoom = this.el.hasAttribute('max')
                        ? +this.el.getAttribute('max')
                        : M[projection].options.resolutions.length - 1, tileCenter = M[projection].options.crs.tile.bounds.getCenter(), pixel = M[projection].transformation.transform(pcrsBound.min, M[projection].scale(+this.zoomValue || maxZoom));
                    pcrsBound = Util.pixelToPCRSBounds(leafletSrcExports.bounds(pixel.subtract(tileCenter), pixel.add(tileCenter)), this.zoomValue || maxZoom, projection);
                }
                let result = Object.assign(Util._convertAndFormatPCRS(pcrsBound, map.options.crs, map.options.projection), { zoom: this._getZoomBounds() });
                extentCache = result;
                return result;
            }
        };
    }
    _updateExtent(shape, coord, bboxExtent) {
        let data = coord.innerHTML
            .trim()
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .split(/[<>\ ]/g);
        switch (shape.tagName.toUpperCase()) {
            case 'MAP-POINT':
                bboxExtent = Util._updateExtent(bboxExtent, +data[0], +data[1]);
                break;
            case 'MAP-LINESTRING':
            case 'MAP-POLYGON':
            case 'MAP-MULTIPOINT':
            case 'MAP-MULTILINESTRING':
                for (let i = 0; i < data.length; i += 2) {
                    bboxExtent = Util._updateExtent(bboxExtent, +data[i], +data[i + 1]);
                }
                break;
        }
        return bboxExtent;
    }
    _getZoomBounds() {
        return {
            minZoom: this.minValue,
            maxZoom: this.maxValue,
            minNativeZoom: this.zoomValue,
            maxNativeZoom: this.zoomValue
        };
    }
    getZoomToZoom() {
        let tL = this.extent.topLeft.pcrs, bR = this.extent.bottomRight.pcrs, bound = leafletSrcExports.bounds(leafletSrcExports.point(tL.horizontal, tL.vertical), leafletSrcExports.point(bR.horizontal, bR.vertical));
        let projection = this.getMapEl()._map.options.projection, layerZoomBounds = this.getLayerEl().extent.zoom, minZoom = layerZoomBounds.minZoom ? layerZoomBounds.minZoom : 0, maxZoom = layerZoomBounds.maxZoom
            ? layerZoomBounds.maxZoom
            : M[projection].options.resolutions.length - 1;
        let newZoom;
        if (this.el.hasAttribute('zoom')) {
            newZoom = this.zoomValue;
        }
        else {
            newZoom = Util.getMaxZoom(bound, this.getMapEl()._map, minZoom, maxZoom);
            if (this.maxValue < newZoom) {
                newZoom = this.maxValue;
            }
            else if (this.minValue > newZoom) {
                newZoom = this.minValue;
            }
        }
        if (newZoom < minZoom) {
            newZoom = minZoom;
        }
        else if (newZoom > maxZoom) {
            newZoom = maxZoom;
        }
        return newZoom;
    }
    getMeta(metaName) {
        let name = metaName.toLowerCase();
        if (name !== 'cs' && name !== 'zoom' && name !== 'projection')
            return null;
        let sdMeta = this._parentEl?.shadowRoot?.querySelector(`map-meta[name=${name}][content]`);
        if (this._parentEl?.nodeName === 'MAP-LINK') {
            return sdMeta || this._parentEl.parentElement?.getMeta?.(metaName);
        }
        else {
            return this._parentEl?.src
                ? this._parentEl.shadowRoot?.querySelector(`map-meta[name=${name}][content]`)
                : this._parentEl?.querySelector(`map-meta[name=${name}][content]`);
        }
    }
    mapml2geojson(options) {
        let defaults = {
            propertyFunction: null,
            transform: true
        };
        options = Object.assign({}, defaults, options);
        let json = {
            type: 'Feature',
            properties: {},
            geometry: {}
        };
        let el = this.el.querySelector('map-properties');
        if (!el) {
            json.properties = null;
        }
        else if (typeof options.propertyFunction === 'function') {
            json.properties = options.propertyFunction(el);
        }
        else if (el.querySelector('table')) {
            let table = el.querySelector('table').cloneNode(true);
            json.properties = Util._table2properties(table);
        }
        else {
            json.properties = {
                prop0: el.innerHTML.replace(/(<([^>]+)>)/gi, '').replace(/\s/g, '')
            };
        }
        let source = null, dest = null, map = this.getMapEl()._map;
        if (options.transform) {
            source = new proj4.Proj(map.options.crs.code);
            dest = new proj4.Proj('EPSG:4326');
            if (map.options.crs.code === 'EPSG:3857' ||
                map.options.crs.code === 'EPSG:4326') {
                options.transform = false;
            }
        }
        let collection = this.el.querySelector('map-geometry')?.querySelector('map-geometrycollection'), shapes = this.el.querySelector('map-geometry')?.querySelectorAll('map-point, map-polygon, map-linestring, map-multipoint, map-multipolygon, map-multilinestring');
        if (collection) {
            json.geometry.type = 'GeometryCollection';
            json.geometry.geometries = [];
            if (shapes) {
                for (let shape of Array.from(shapes)) {
                    json.geometry.geometries.push(Util._geometry2geojson(shape, source, dest, options.transform));
                }
            }
        }
        else if (shapes && shapes.length > 0) {
            json.geometry = Util._geometry2geojson(shapes[0], source, dest, options.transform);
        }
        return json;
    }
    click() {
        let g = this._groupEl, rect = g.getBoundingClientRect();
        let event = new MouseEvent('click', {
            clientX: rect.x + rect.width / 2,
            clientY: rect.y + rect.height / 2,
            button: 0
        });
        let properties = this.el.querySelector('map-properties');
        if (g.getAttribute('role') === 'link') {
            for (let path of g.children) {
                path.mousedown?.call(this._geometry, event);
                path.mouseup?.call(this._geometry, event);
            }
        }
        let clickEv = new PointerEvent('click', { cancelable: true });
        clickEv.originalEvent = event;
        this.el.dispatchEvent(clickEv);
        if (properties && this.el.isConnected) {
            let geometry = this._geometry, shapes = geometry._layers;
            for (let id in shapes) {
                if (shapes[id].isPopupOpen()) {
                    shapes[id].closePopup();
                }
            }
            if (geometry.isPopupOpen()) {
                geometry.closePopup();
            }
            else if (!clickEv.originalEvent.cancelBubble) {
                geometry.openPopup();
            }
        }
    }
    focus(options) {
        this._groupEl?.focus(options);
    }
    blur() {
        if (document.activeElement?.shadowRoot?.activeElement === this._groupEl ||
            document.activeElement?.shadowRoot?.activeElement?.parentNode ===
                this._groupEl) {
            this._groupEl.blur();
            this.getMapEl()?._map?.getContainer().focus();
        }
    }
    zoomTo() {
        let extent = this.extent, map = this.getMapEl()._map;
        let tL = extent.topLeft.pcrs, bR = extent.bottomRight.pcrs, bound = leafletSrcExports.bounds(leafletSrcExports.point(tL.horizontal, tL.vertical), leafletSrcExports.point(bR.horizontal, bR.vertical)), center = map.options.crs.unproject(bound.getCenter(true));
        map.setView(center, this.getZoomToZoom(), { animate: false });
    }
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer;
            // Check if addFeature has been published (indicating connectedCallback completed)
            if (this.el.addFeature) {
                resolve();
            }
            else {
                let featureElement = this.el;
                interval = setInterval(testForFeature, 200, featureElement);
                failureTimer = setTimeout(featureNotDefined, 5000);
            }
            function testForFeature(featureElement) {
                if (featureElement.addFeature) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
            }
            function featureNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for feature to be ready');
            }
        });
    }
    render() {
        return null;
    }
    static get watchers() { return {
        "zoom": ["zoomChanged"],
        "min": ["minChanged"],
        "max": ["maxChanged"]
    }; }
};

export { MapFeature as map_feature };
//# sourceMappingURL=map-feature.entry.js.map
