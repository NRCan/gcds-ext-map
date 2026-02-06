import { r as registerInstance, a as getElement, U as Util } from './index-PZrWUcjo.js';
import { m as mapTileLayer } from './MapTileLayer-dNMHgVBV.js';
import { c as calculatePosition } from './calculatePosition-B4YLD_Og.js';

const MapTile = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
    // "Set once" properties - these are set once at connection and never change
    row;
    col;
    zoom;
    src;
    _parentEl;
    _tileLayer;
    _extent;
    // Store initial values to prevent changes after connection
    _initialRow;
    _initialCol;
    _initialZoom;
    _hasConnected = false;
    srcChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            if (this._extent)
                this._calculateExtent();
            if (this._tileLayer) {
                this._tileLayer.removeMapTile(this.el);
                this._tileLayer.addMapTile(this.el);
            }
        }
    }
    connectedCallback() {
        // Capture initial values before anything else - these won't change
        // Read from attributes first, then fall back to props
        this._initialRow = this.el.hasAttribute('row') ? +this.el.getAttribute('row') : (this.row ?? 0);
        this._initialCol = this.el.hasAttribute('col') ? +this.el.getAttribute('col') : (this.col ?? 0);
        // For zoom, check: explicit attribute -> prop -> map-meta value -> map zoom -> 0
        let zoomValue = 0;
        if (this.el.hasAttribute('zoom')) {
            zoomValue = +this.el.getAttribute('zoom');
        }
        else if (this.zoom !== undefined) {
            zoomValue = this.zoom;
        }
        else {
            // Try to get zoom from map-meta element
            const metaZoom = this._getMetaZoomValue();
            if (metaZoom !== null) {
                zoomValue = metaZoom;
            }
            else {
                zoomValue = this.getMapEl()?.zoom || 0;
            }
        }
        this._initialZoom = zoomValue;
        this._hasConnected = true;
        // Override getAttribute/setAttribute on the element to prevent row/col/zoom changes
        const originalGetAttribute = this.el.getAttribute.bind(this.el);
        const originalSetAttribute = this.el.setAttribute.bind(this.el);
        this.el.getAttribute = (name) => {
            if (this._hasConnected) {
                switch (name) {
                    case 'row':
                        return String(this._initialRow);
                    case 'col':
                        return String(this._initialCol);
                    case 'zoom':
                        return String(this._initialZoom);
                }
            }
            return originalGetAttribute(name);
        };
        this.el.setAttribute = (name, value) => {
            if (this._hasConnected) {
                switch (name) {
                    case 'row':
                    case 'col':
                    case 'zoom':
                        return; // Ignore changes to these after connection
                }
            }
            originalSetAttribute(name, value);
        };
        // Override property accessors on the element to return initial values
        Object.defineProperties(this.el, {
            row: {
                get: () => this._initialRow,
                configurable: true
            },
            col: {
                get: () => this._initialCol,
                configurable: true
            },
            zoom: {
                get: () => this._initialZoom,
                configurable: true
            }
        });
        // Find parent element (handle shadow DOM)
        const parentNode = this.el.parentNode;
        this._parentEl =
            parentNode.nodeName === 'MAP-LAYER' ||
                parentNode.nodeName === 'LAYER-' ||
                parentNode.nodeName === 'MAP-LINK'
                ? parentNode
                : parentNode.host;
        // Preload image
        const imgObj = new Image();
        imgObj.src = this.src || '';
        this._createOrGetTileLayer();
    }
    disconnectedCallback() {
        if (this._tileLayer) {
            this._tileLayer.removeMapTile(this.el);
            if (this._tileLayer._mapTiles && this._tileLayer._mapTiles.length === 0) {
                this._tileLayer.remove();
                this._tileLayer = null;
                delete this._tileLayer;
                const entry = this?._parentEl?._layerRegistry?.get(this.position);
                if (entry) {
                    entry.count--;
                    if (entry.count === 0) {
                        this._parentEl._layerRegistry.delete(this.position);
                    }
                }
            }
        }
    }
    // "Set once" property pattern for row, col, zoom
    // After connection, always return the initial values
    get rowValue() {
        return this._hasConnected ? this._initialRow : +this.row;
    }
    get colValue() {
        return this._hasConnected ? this._initialCol : +this.col;
    }
    get zoomValue() {
        return this._hasConnected ? this._initialZoom : +this.zoom;
    }
    get extent() {
        if (!this._extent)
            this._calculateExtent();
        return this._extent;
    }
    get position() {
        return calculatePosition(this.el);
    }
    isFirst() {
        return !this._parentEl._layerRegistry.has(this.position);
    }
    getPrevious() {
        if (this.isFirst())
            return null;
        return this.el.previousElementSibling;
    }
    async zoomTo() {
        const extent = this.extent;
        const map = this.getMapEl()?._map;
        if (!extent || !map)
            return;
        const xmin = extent.topLeft.pcrs.horizontal, xmax = extent.bottomRight.pcrs.horizontal, ymin = extent.bottomRight.pcrs.vertical, ymax = extent.topLeft.pcrs.vertical, bounds = window.L.bounds(window.L.point(xmin, ymin), window.L.point(xmax, ymax)), center = map.options.crs.unproject(bounds.getCenter(true)), maxZoom = extent.zoom.maxZoom, minZoom = extent.zoom.minZoom;
        map.setView(center, Util.getMaxZoom(bounds, map, minZoom, maxZoom), { animate: false });
    }
    getMapEl() {
        return Util.getClosest(this.el, 'gcds-map');
    }
    getLayerEl() {
        return Util.getClosest(this.el, 'map-layer,layer-');
    }
    _getMetaZoomValue() {
        // Look for <map-meta name="zoom" content="...value=N..."> in parent layer
        const layerEl = this.getLayerEl();
        if (!layerEl)
            return null;
        const metaZoom = layerEl.querySelector('map-meta[name="zoom"][content]');
        if (!metaZoom)
            return null;
        const content = metaZoom.getAttribute('content');
        if (!content)
            return null;
        // Parse content like "min=1,max=4,value=2"
        const valueMatch = content.match(/value=(\d+)/);
        if (valueMatch && valueMatch[1]) {
            return parseInt(valueMatch[1], 10);
        }
        return null;
    }
    getMeta(metaName) {
        const name = metaName.toLowerCase();
        if (name !== 'cs' && name !== 'zoom' && name !== 'projection')
            return;
        const sdMeta = this._parentEl?.shadowRoot?.querySelector(`map-meta[name=${name}][content]`);
        if (this._parentEl?.nodeName === 'MAP-LINK') {
            return sdMeta || this._parentEl.parentElement?.getMeta(metaName);
        }
        else {
            return this._parentEl?.src
                ? this._parentEl.shadowRoot?.querySelector(`map-meta[name=${name}][content]`)
                : this._parentEl.querySelector(`map-meta[name=${name}][content]`);
        }
    }
    async _createOrGetTileLayer() {
        if (!this._parentEl?.whenReady)
            return;
        await this._parentEl.whenReady();
        const parentElement = this._parentEl;
        if (this.isFirst()) {
            this._tileLayer = mapTileLayer({
                projection: this.getMapEl()?.projection,
                opacity: 1,
                pane: parentElement._templatedLayer?.getContainer?.() ||
                    parentElement._layer?.getContainer?.(),
                zIndex: this.position
            });
            this._tileLayer.addMapTile(this.el);
            if (parentElement._templatedLayer?.addLayer) {
                parentElement._templatedLayer.addLayer(this._tileLayer);
            }
            else {
                parentElement._layer?.addLayer?.(this._tileLayer);
            }
            // Publish _tileLayer on the element for test access
            this.el._tileLayer = this._tileLayer;
            // Add this position to the parent's _layerRegistry with layer reference and count = 1
            parentElement._layerRegistry.set(this.position, { layer: this._tileLayer, count: 1 });
        }
        else {
            // get the previously registered TileLayer for this position
            const entry = parentElement._layerRegistry.get(this.position);
            this._tileLayer = entry?.layer;
            if (entry) {
                entry.count++;
            }
            if (this._tileLayer) {
                this._tileLayer.addMapTile(this.el);
                // Publish _tileLayer on the element for test access
                this.el._tileLayer = this._tileLayer;
            }
        }
    }
    _calculateExtent() {
        const mapEl = this.getMapEl();
        if (!mapEl || !mapEl._map)
            return;
        const map = mapEl._map;
        const projection = map.options.projection;
        const tileSize = window.M[projection].options.crs.tile.bounds.max.x;
        const pixelX = this.colValue * tileSize;
        const pixelY = this.rowValue * tileSize;
        const pixelBounds = window.L.bounds(window.L.point(pixelX, pixelY), window.L.point(pixelX + tileSize, pixelY + tileSize));
        const pcrsBounds = Util.pixelToPCRSBounds(pixelBounds, this.zoomValue, projection);
        this._extent = Util._convertAndFormatPCRS(pcrsBounds, map.options.crs, projection);
        this._extent.zoom = {
            minZoom: this.zoomValue,
            maxZoom: this.zoomValue,
            minNativeZoom: this.zoomValue,
            maxNativeZoom: this.zoomValue
        };
    }
    render() {
        // This component does not render any visible DOM
        return null;
    }
    static get watchers() { return {
        "src": ["srcChanged"]
    }; }
};

export { MapTile as map_tile };
//# sourceMappingURL=map-tile.entry.js.map
