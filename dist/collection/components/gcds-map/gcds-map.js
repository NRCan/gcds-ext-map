import { map, LatLng, control } from "leaflet";
import { Util } from "../utils/mapml/Util.js";
import { DOMTokenList } from "../utils/mapml/DOMTokenList.js";
import { locale, localeFr } from "../../generated/locale.js";
import { matchMedia } from "../utils/mapml/elementSupport/viewers/matchMedia.js";
// TODO: Import Stencil component versions when created
// import { HTMLLayerElement } from '../map-layer/map-layer.js';
// import { LayerDashElement } from '../layer-/layer-.js';
// import { HTMLMapCaptionElement } from '../map-caption/map-caption.js';
// import { HTMLFeatureElement } from '../map-feature/map-feature.js';
// import { HTMLExtentElement } from '../map-extent/map-extent.js';
// import { HTMLInputElement } from '../map-input/map-input.js';
// import { HTMLSelectElement } from '../map-select/map-select.js';
// import { HTMLLinkElement } from '../map-link/map-link.js';
// import { HTMLStyleElement } from '../map-style/map-style.js';
// import { HTMLWebMapElement } from '../web-map/web-map.js';
// import { HTMLMapAreaElement } from '../map-area/map-area.js';
import { layerControl } from "../utils/mapml/control/LayerControl.js";
// due to Stencil bundling shenanigans, the import here doesn't happen 
// (maybe because it's not actually called anywhere - the attribution control
// was auto-added and the
// attribution control doesn't get auto-added 
// Auto-added via Map.addInitHook
// import { attributionButton } from '../../utils/mapml/control/AttributionButton.js';
import { reloadButton } from "../utils/mapml/control/ReloadButton.js";
import { scaleBar } from "../utils/mapml/control/ScaleBar.js";
import { geolocationButton } from "../utils/mapml/control/GeolocationButton.js";
import { fullscreenButton } from "../utils/mapml/control/FullscreenButton.js";
import { debugOverlay } from "../utils/mapml/layers/DebugOverlay.js";
import { crosshair } from "../utils/mapml/layers/Crosshair.js";
import { featureIndexOverlay } from "../utils/mapml/layers/FeatureIndexOverlay.js";
export class GcdsMap {
    el;
    // Mirror the observedAttributes as Stencil props
    lat = 0;
    lon = 0;
    zoom = 0;
    projection = 'OSMTILE';
    // Note: width/height are NOT Stencil props - they're managed via custom properties and MutationObserver
    // @Prop() width?: string;
    // @Prop() height?: string;
    controls = false;
    static = false;
    _controlslist;
    locale;
    _controlsList;
    _source;
    _history = [];
    _historyIndex = -1;
    _traversalCall = false;
    // Private properties that mirror the original (will be set in componentDidLoad)
    _map;
    // private locale: any; // TODO: Use when implementing locale support
    _container;
    mapCaptionObserver;
    // @ts-ignore - Stored for potential cleanup, removed when map is deleted
    _featureIndexOverlay;
    _zoomControl;
    _layerControl;
    _reloadButton;
    _fullScreenControl;
    _geolocationButton;
    _scaleBar;
    _isInitialized = false;
    _debug;
    // @ts-ignore 
    _crosshair;
    _boundDropHandler;
    _boundDragoverHandler;
    // see comments below regarding attributeChangedCallback vs. getter/setter
    // usage.  Effectively, the user of the element must use the property, not
    // the getAttribute/setAttribute/removeAttribute DOM API, because the latter
    // calls don't result in the getter/setter being called (so you have to use
    // the getter/setter directly)
    controlsChanged(newValue) {
        // Mirror original controls setter logic
        if (this._map) {
            if (newValue) {
                this._showControls();
            }
            else {
                this._hideControls();
            }
        }
    }
    controlsListChanged(newValue) {
        if (this._controlsList) {
            this._controlsList.value = newValue;
            // Re-toggle controls to apply the new controlslist filtering
            if (this._map) {
                this._toggleControls();
            }
        }
    }
    get controlsList() {
        return this._controlsList;
    }
    set controlsList(value) {
        if (this._controlsList && (typeof value === 'string' || value === null)) {
            if (value) {
                this.el.setAttribute('controlslist', value);
            }
            else {
                this.el.removeAttribute('controlslist');
            }
            // DOMTokenList automatically reflects the attribute change
            // Re-toggle controls based on new attribute value
            if (this._map) {
                this._toggleControls();
            }
        }
    }
    // Note: width/height watchers removed - handled via MutationObserver instead
    // since they're not Stencil @Prop() anymore
    // Note: lat, lon, and zoom are NOT watched because in mapml-viewer, changing these
    // attributes does not change the map position/zoom. These attributes are only 
    // updated by map events to reflect the current state for external observers.
    async projectionChanged(newValue, oldValue) {
        if (newValue && this._map && this._map.options.projection !== newValue) {
            const reconnectLayers = () => {
                // save map location and zoom
                let lat = this.lat;
                let lon = this.lon;
                let zoom = this.zoom;
                // saving the lat, lon and zoom is necessary because Leaflet seems
                // to try to compensate for the change in the scales for each zoom
                // level in the crs by changing the zoom level of the map when
                // you set the map crs. So, we save the current view for use below
                // when all the layers' reconnections have settled.
                // leaflet doesn't like this: https://github.com/Leaflet/Leaflet/issues/2553
                this._map.options.crs = window.M[newValue];
                this._map.options.projection = newValue;
                let layersReady = [];
                this._map.announceMovement?.disable();
                // Get all map-layer and layer- elements and reconnect them
                const layers = this.el.querySelectorAll('map-layer,layer-');
                for (let layer of Array.from(layers)) {
                    layer.removeAttribute('disabled');
                    let reAttach = this.el.removeChild(layer);
                    this.el.appendChild(reAttach);
                    if (reAttach.whenReady) {
                        layersReady.push(reAttach.whenReady());
                    }
                }
                return Promise.allSettled(layersReady).then(() => {
                    // use the saved map location to ensure it is correct after
                    // changing the map CRS. Specifically affects projection
                    // upgrades, e.g. https://maps4html.org/experiments/custom-projections/BNG/
                    // see leaflet bug: https://github.com/Leaflet/Leaflet/issues/2553
                    // Skip restoration if there's only one layer - link traversal case where layer.zoomTo() should control zoom
                    const layers = this.el.layers;
                    if (layers.length === 1) {
                        const layer = layers[0];
                        if (layer.extent) {
                            this._map.setMinZoom(layer.extent.zoom.minZoom);
                            this._map.setMaxZoom(layer.extent.zoom.maxZoom);
                        }
                    }
                    this.zoomTo(lat, lon, zoom);
                    if (window.M.options.announceMovement)
                        this._map.announceMovement?.enable();
                    // required to delay until map-extent.disabled is correctly set
                    // which happens as a result of map-layer._validateDisabled()
                    // which happens so much we have to delay until the calls are
                    // completed
                    setTimeout(() => {
                        this.el.dispatchEvent(new CustomEvent('map-projectionchange'));
                    }, 0);
                });
            };
            const connect = reconnectLayers.bind(this);
            try {
                await this.whenProjectionDefined(newValue);
                await connect();
                if (this._map && this._map.options.projection !== oldValue) {
                    // this doesn't completely work either
                    this._resetHistory();
                }
                if (this._debug) {
                    // Toggle debug twice to refresh it with new projection
                    for (let i = 0; i < 2; i++)
                        this.toggleDebug();
                }
            }
            catch {
                throw new Error('Undefined projection: ' + newValue);
            }
        }
    }
    // Note: zoom is NOT watched because in mapml-viewer, changing the zoom attribute
    // does not change the map zoom. The zoom attribute is only updated by map events
    // to reflect the current state for external observers.
    // Note: instead of layers getter here, gcds-map.layers property is exposed via Object.defineProperty in componentDidLoad
    get extent() {
        let map = this._map, pcrsBounds = Util.pixelToPCRSBounds(map.getPixelBounds(), map.getZoom(), map.options.projection);
        let formattedExtent = Util._convertAndFormatPCRS(pcrsBounds, map.options.crs, this.projection);
        // get min/max zoom from layers at this moment
        let minZoom = Infinity, maxZoom = -Infinity;
        const layers = this.el.layers;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].extent) {
                if (layers[i].extent.zoom.minZoom < minZoom)
                    minZoom = layers[i].extent.zoom.minZoom;
                if (layers[i].extent.zoom.maxZoom > maxZoom)
                    maxZoom = layers[i].extent.zoom.maxZoom;
            }
        }
        formattedExtent.zoom = {
            minZoom: minZoom !== Infinity ? minZoom : map.getMinZoom(),
            maxZoom: maxZoom !== -Infinity ? maxZoom : map.getMaxZoom()
        };
        return formattedExtent;
    }
    // Width and height getters return computed CSS values (not attribute values)
    // This allows CSS to dominate over HTML attributes, matching mapml-viewer behavior
    getWidth() {
        return +window.getComputedStyle(this.el).width.replace('px', '');
    }
    getHeight() {
        return +window.getComputedStyle(this.el).height.replace('px', '');
    }
    staticChanged() {
        if (this._map) {
            this._toggleStatic();
        }
    }
    // Note: Stencil handles constructor automatically, but we can use componentWillLoad for initialization
    componentWillLoad() {
        // Mirror the original constructor logic
        this._source = this.el.outerHTML;
        // create an array to track the history of the map and the current index
        this._history = [];
        this._historyIndex = -1;
        this._traversalCall = false;
    }
    // Mirror the connectedCallback logic in componentDidLoad
    async connectedCallback() {
        try {
            // Sync initial history state to element for MapML controls
            this.el._history = this._history;
            this.el._historyIndex = this._historyIndex;
            // Publish width/height getters/setters to match mapml-viewer API
            // These return computed style (CSS wins over attributes)
            Object.defineProperty(this.el, 'width', {
                get: () => {
                    return +window.getComputedStyle(this.el).width.replace('px', '');
                },
                set: (val) => {
                    // Set attribute only, don't override CSS with inline styles
                    this.el.setAttribute('width', val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'height', {
                get: () => {
                    return +window.getComputedStyle(this.el).height.replace('px', '');
                },
                set: (val) => {
                    // Set attribute only, don't override CSS with inline styles  
                    this.el.setAttribute('height', val);
                },
                enumerable: true,
                configurable: true
            });
            // Ensure MapML controls are loaded and their init hooks are registered
            // BEFORE creating any maps. This is critical for proper attribution control.
            await this._ensureControlsLoaded();
            await this.whenProjectionDefined(this.projection);
            this._setLocale();
            this._initShadowRoot();
            this._controlsList = new DOMTokenList(this.el.getAttribute('controlslist'), this.el, 'controlslist', [
                'noreload',
                'nofullscreen',
                'nozoom',
                'nolayer',
                'noscale',
                'geolocation'
            ]);
            var s = window.getComputedStyle(this.el), wpx = s.width, hpx = s.height, w = this.el.hasAttribute('width')
                ? this.el.getAttribute('width')
                : parseInt(wpx.replace('px', '')), h = this.el.hasAttribute('height')
                ? this.el.getAttribute('height')
                : parseInt(hpx.replace('px', ''));
            this._changeWidth(w);
            this._changeHeight(h);
            this._createMap();
            // Mark as initialized so watchers can now run
            this._isInitialized = true;
            // Watch for attribute changes to width/height after initialization
            // This handles setAttribute() calls which don't trigger custom property setters
            const attributeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName) {
                        const newValue = this.el.getAttribute(mutation.attributeName);
                        if (mutation.attributeName === 'width' && newValue) {
                            this._changeWidth(newValue);
                        }
                        else if (mutation.attributeName === 'height' && newValue) {
                            this._changeHeight(newValue);
                        }
                    }
                });
            });
            attributeObserver.observe(this.el, {
                attributes: true,
                attributeFilter: ['width', 'height']
            });
            // Store observer for cleanup
            this.el._attributeObserver = attributeObserver;
            // https://github.com/Maps4HTML/MapML.js/issues/274
            this.el.setAttribute('role', 'application');
            this._toggleStatic();
            /*
          1. only deletes aria-label when the last (only remaining) map caption is removed
          2. only deletes aria-label if the aria-label was defined by the map caption element itself
          */
            let mapcaption = this.el.querySelector('map-caption');
            if (mapcaption !== null) {
                setTimeout(() => {
                    let ariaupdate = this.el.getAttribute('aria-label');
                    if (ariaupdate === mapcaption.innerHTML) {
                        this.mapCaptionObserver = new MutationObserver((_m) => {
                            let mapcaptionupdate = this.el.querySelector('map-caption');
                            if (mapcaptionupdate !== mapcaption) {
                                this.el.removeAttribute('aria-label');
                            }
                        });
                        this.mapCaptionObserver.observe(this.el, {
                            childList: true
                        });
                    }
                }, 0);
            }
        }
        catch (e) {
            console.log(e);
            throw new Error('Error: ' + e);
        }
    }
    _setLocale() {
        // Priority order (matching mapml-viewer behavior):
        // 1. :lang(fr) attribute in ancestry (Canadian French context)
        // 2. :lang(en) attribute in ancestry (Canadian English context)
        // 3. <map-options> locale in document head (browser/custom locale)
        if (this.el.closest(':lang(fr)') === this.el) {
            this.locale = localeFr;
        }
        else if (this.el.closest(':lang(en)') === this.el) {
            this.locale = locale;
        }
        else {
            // Check if there's a <map-options> element in the document head
            // that was placed there by the browser extension or test harness
            const mapOptions = document.head.querySelector('map-options');
            if (mapOptions && mapOptions.textContent) {
                try {
                    const options = JSON.parse(mapOptions.textContent);
                    if (options.locale) {
                        this.locale = options.locale;
                        return;
                    }
                }
                catch (e) {
                    console.warn('Failed to parse map-options:', e);
                }
            }
            // Default to English locale if no other locale specified
            this.locale = locale;
        }
    }
    _initShadowRoot() {
        let shadowRoot = this.el.shadowRoot;
        if (shadowRoot.querySelector('[aria-label="Interactive map"]'))
            return;
        // Add default :host styles AFTER Stencil's gcds-map.css loads
        // This ensures proper cascade order and allows _changeWidth/_changeHeight to modify it
        const ensureHostStyle = () => {
            // Wait for Stencil's stylesheet to load first
            if (shadowRoot.styleSheets.length === 0) {
                requestAnimationFrame(ensureHostStyle);
                return;
            }
            // Now append our :host defaults AFTER the main gcds-map.css
            let mapDefaultCSS = document.createElement('style');
            mapDefaultCSS.innerHTML =
                `:host {` +
                    `all: initial;` +
                    `display: inline-block;` +
                    `background-color: white;` +
                    `height: 150px;` +
                    `width: 300px;` +
                    `contain: layout size;` +
                    `border-width: 2px;` +
                    `border-style: inset;` +
                    `}`;
            shadowRoot.appendChild(mapDefaultCSS);
        };
        ensureHostStyle();
        this._container = document.createElement('div');
        let output = "<output role='status' aria-live='polite' aria-atomic='true' class='mapml-screen-reader-output'></output>";
        this._container.insertAdjacentHTML('beforeend', output);
        // Make the Leaflet container element programmatically identifiable
        // (https://github.com/Leaflet/Leaflet/issues/7193).
        this._container.setAttribute('role', 'region');
        this._container.setAttribute('aria-label', 'Interactive map');
        shadowRoot.appendChild(this._container);
        // Expose _container on DOM element for test access and MapML compatibility
        this.el._container = this._container;
        // Hide all (light DOM) children of the map element (equivalent to hideElementsCSS)
        let hideElementsCSS = document.createElement('style');
        hideElementsCSS.innerHTML = `gcds-map > * { display: none!important; }`;
        this.el.appendChild(hideElementsCSS);
    }
    _createMap() {
        if (!this._map) {
            this._map = map(this._container, {
                center: new LatLng(this.lat, this.lon),
                minZoom: 0,
                maxZoom: window.M[this.projection].options.resolutions.length - 1,
                projection: this.projection,
                query: true,
                contextMenu: true,
                announceMovement: true,
                featureIndex: true,
                mapEl: this.el,
                crs: window.M[this.projection],
                zoom: this.zoom,
                zoomControl: false
            });
            // Make map accessible for debugging
            this.el._map = this._map;
            window._debugMap = this._map;
            // Expose component history properties on element for MapML control compatibility
            this.el._history = this._history;
            this.el._historyIndex = this._historyIndex;
            // Expose controlsList API on element for MapML control compatibility
            // Follow standard HTML DOMTokenList behavior (like video.controlsList)
            Object.defineProperty(this.el, 'controlsList', {
                get: () => this._controlsList,
                set: (value) => {
                    // Standard behavior: property assignment updates DOMTokenList value
                    // but does NOT update HTML attribute (unlike component setter)
                    if (this._controlsList && (typeof value === 'string' || value === null)) {
                        this._controlsList.value = value || '';
                        // Trigger control visibility updates without changing HTML attribute
                        if (this._map) {
                            this._toggleControls();
                        }
                    }
                },
                configurable: true,
                enumerable: true
            });
            // Expose layers getter on element for MapML control compatibility
            Object.defineProperty(this.el, 'layers', {
                get: () => this.el.getElementsByTagName('map-layer'),
                configurable: true,
                enumerable: true
            });
            // Expose locale property on element for MapML control compatibility
            Object.defineProperty(this.el, 'locale', {
                get: () => this.locale,
                configurable: true,
                enumerable: true
            });
            // Expose extent property on element for MapML compatibility
            Object.defineProperty(this.el, 'extent', {
                get: () => this.extent,
                configurable: true,
                enumerable: true
            });
            // Expose width/height getters that return computed CSS values (not attributes)
            // This allows CSS to dominate over HTML attributes, matching mapml-viewer behavior
            Object.defineProperty(this.el, 'width', {
                get: () => this.getWidth(),
                set: (val) => {
                    // Setter changes the attribute AND applies the change immediately
                    this.el.setAttribute('width', val);
                    if (this._isInitialized) {
                        this._changeWidth(val);
                    }
                },
                configurable: true,
                enumerable: true
            });
            Object.defineProperty(this.el, 'height', {
                get: () => this.getHeight(),
                set: (val) => {
                    // Setter changes the attribute AND applies the change immediately
                    this.el.setAttribute('height', val);
                    if (this._isInitialized) {
                        this._changeHeight(val);
                    }
                },
                configurable: true,
                enumerable: true
            });
            // Expose public synchronous methods on element for MapML compatibility
            Object.defineProperty(this.el, 'zoomTo', {
                value: (lat, lon, zoom) => this.zoomTo(lat, lon, zoom),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'back', {
                value: () => this.back(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'forward', {
                value: () => this.forward(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'reload', {
                value: () => this.reload(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'toggleDebug', {
                value: () => this.toggleDebug(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'viewSource', {
                value: () => this.viewSource(),
                writable: true,
                configurable: true
            });
            // Expose matchMedia method with proper 'this' binding
            // This ensures 'this' always refers to the custom element when called
            Object.defineProperty(this.el, 'matchMedia', {
                value: (...args) => matchMedia.apply(this.el, args),
                writable: true,
                configurable: true
            });
            // Expose geojson2mapml method
            Object.defineProperty(this.el, 'geojson2mapml', {
                value: (json, options) => this.geojson2mapml(json, options),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'defineCustomProjection', {
                value: (jsonTemplate) => this.defineCustomProjection(jsonTemplate),
                writable: true,
                configurable: true
            });
            // Expose internal methods needed by MapML controls and context menu items
            this.el._toggleFullScreen = () => this._toggleFullScreen();
            this.el._toggleControls = () => this._toggleControls();
            this._addToHistory();
            this._createControls();
            this._toggleControls();
            this._crosshair = crosshair().addTo(this._map);
            if (window.M.options.featureIndexOverlayOption)
                this._featureIndexOverlay = featureIndexOverlay().addTo(this._map);
            this._setUpEvents();
        }
    }
    disconnectedCallback() {
        this._removeEvents();
        // Clean up attribute observer
        if (this.el._attributeObserver) {
            this.el._attributeObserver.disconnect();
            delete this.el._attributeObserver;
        }
        delete this._map;
        this._deleteControls();
    }
    // Helper methods that mirror the original
    async _ensureControlsLoaded() {
        // Force MapML control modules to load and register their init hooks
        // This ensures attribution and other controls work properly
        try {
            // needed because attributionButton is auto-added via Map.addInitHook and
            // if it's not referenced by code, the bundler will omit it automatically
            await import('../utils/mapml/control/AttributionButton.js');
            // Load ContextMenu handler to register init hooks
            await import('../utils/mapml/handlers/ContextMenu.js');
            await import('../utils/mapml/handlers/AnnounceMovement.js');
            await import('../utils/mapml/handlers/keyboard.js');
            // Load FeatureIndex handler to register init hooks for keyboard navigation
            await import('../utils/mapml/handlers/FeatureIndex.js');
            // TODO: other controls if needed
        }
        catch (error) {
            console.error('Failed to load MapML controls:', error);
        }
    }
    // Creates All map controls and adds them to the map, when created.
    _createControls() {
        let mapSize = this._map.getSize().y, totalSize = 0;
        this._layerControl = layerControl(null, {
            collapsed: true,
            mapEl: this.el
        }).addTo(this._map);
        this._map.on('movestart', this._layerControl.collapse, this._layerControl);
        // Expose on element for MapML compatibility
        this.el._layerControl = this._layerControl;
        let scaleValue = window.M.options.announceScale;
        if (scaleValue === 'metric') {
            scaleValue = { metric: true, imperial: false };
        }
        if (scaleValue === 'imperial') {
            scaleValue = { metric: false, imperial: true };
        }
        if (!this._scaleBar) {
            this._scaleBar = scaleBar(scaleValue).addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._scaleBar = this._scaleBar;
        }
        // Only add controls if there is enough top left vertical space
        if (!this._zoomControl && totalSize + 93 <= mapSize) {
            totalSize += 93;
            this._zoomControl = control
                .zoom({
                zoomInTitle: this.locale.btnZoomIn,
                zoomOutTitle: this.locale.btnZoomOut
            })
                .addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._zoomControl = this._zoomControl;
        }
        if (!this._reloadButton && totalSize + 49 <= mapSize) {
            totalSize += 49;
            this._reloadButton = reloadButton().addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._reloadButton = this._reloadButton;
        }
        if (!this._fullScreenControl && totalSize + 49 <= mapSize) {
            totalSize += 49;
            this._fullScreenControl = fullscreenButton().addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._fullScreenControl = this._fullScreenControl;
        }
        if (!this._geolocationButton) {
            this._geolocationButton = geolocationButton().addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._geolocationButton = this._geolocationButton;
        }
        // Expose locate method on element for MapML compatibility
        this.el.locate = this.locate.bind(this);
    }
    // Sets controls by hiding/unhiding them based on the map attribute
    _toggleControls() {
        if (this.controls === false) {
            this._hideControls();
            this._map.contextMenu.toggleContextMenuItem('Controls', 'disabled');
        }
        else {
            this._showControls();
            this._map.contextMenu.toggleContextMenuItem('Controls', 'enabled');
        }
    }
    _hideControls() {
        this._setControlsVisibility('fullscreen', true);
        this._setControlsVisibility('layercontrol', true);
        this._setControlsVisibility('reload', true);
        this._setControlsVisibility('zoom', true);
        this._setControlsVisibility('geolocation', true);
        this._setControlsVisibility('scale', true);
    }
    _showControls() {
        this._setControlsVisibility('fullscreen', false);
        this._setControlsVisibility('layercontrol', false);
        this._setControlsVisibility('reload', false);
        this._setControlsVisibility('zoom', false);
        this._setControlsVisibility('geolocation', true);
        this._setControlsVisibility('scale', false);
        // prune the controls shown if necessary
        // this logic could be embedded in _showControls
        // but would require being able to iterate the domain of supported tokens
        // for the controlslist
        if (this._controlsList) {
            this._controlsList.forEach((value) => {
                switch (value.toLowerCase()) {
                    case 'nofullscreen':
                        this._setControlsVisibility('fullscreen', true);
                        break;
                    case 'nolayer':
                        this._setControlsVisibility('layercontrol', true);
                        break;
                    case 'noreload':
                        this._setControlsVisibility('reload', true);
                        break;
                    case 'nozoom':
                        this._setControlsVisibility('zoom', true);
                        break;
                    case 'geolocation':
                        this._setControlsVisibility('geolocation', false);
                        break;
                    case 'noscale':
                        this._setControlsVisibility('scale', true);
                        break;
                }
            });
        }
        // Hide layer control if no layers (will be uncommented when layer control is implemented)
        if (this._layerControl && this._layerControl._layers.length === 0) {
            this._layerControl._container.setAttribute('hidden', '');
        }
    }
    // delete the map controls that are private properties of this custom element
    _deleteControls() {
        delete this._layerControl;
        delete this._zoomControl;
        delete this._reloadButton;
        delete this._fullScreenControl;
        delete this._geolocationButton;
        delete this._scaleBar;
    }
    // Sets the control's visibility AND all its childrens visibility,
    // for the control element based on the Boolean hide parameter
    _setControlsVisibility(control, hide) {
        let container;
        switch (control) {
            case 'zoom':
                if (this._zoomControl) {
                    container = this._zoomControl._container;
                }
                break;
            case 'reload':
                if (this._reloadButton) {
                    container = this._reloadButton._container;
                }
                break;
            case 'fullscreen':
                if (this._fullScreenControl) {
                    container = this._fullScreenControl._container;
                }
                break;
            case 'layercontrol':
                if (this._layerControl) {
                    container = this._layerControl._container;
                }
                break;
            case 'geolocation':
                if (this._geolocationButton) {
                    container = this._geolocationButton._container;
                }
                break;
            case 'scale':
                if (this._scaleBar) {
                    container = this._scaleBar._container;
                }
                break;
        }
        if (container) {
            if (hide) {
                // setting the visibility for all the children of the element
                [...container.children].forEach((childEl) => {
                    childEl.setAttribute('hidden', '');
                });
                container.setAttribute('hidden', '');
            }
            else {
                // setting the visibility for all the children of the element
                [...container.children].forEach((childEl) => {
                    childEl.removeAttribute('hidden');
                });
                container.removeAttribute('hidden');
            }
        }
    }
    _toggleStatic() {
        // Mirror the original mapml-viewer _toggleStatic behavior
        if (this._map) {
            if (this.static) {
                this._map.dragging.disable();
                this._map.touchZoom.disable();
                this._map.doubleClickZoom.disable();
                this._map.scrollWheelZoom.disable();
                this._map.boxZoom.disable();
                this._map.keyboard.disable();
                this._zoomControl.disable();
            }
            else {
                this._map.dragging.enable();
                this._map.touchZoom.enable();
                this._map.doubleClickZoom.enable();
                this._map.scrollWheelZoom.enable();
                this._map.boxZoom.enable();
                this._map.keyboard.enable();
                this._zoomControl.enable();
            }
        }
    }
    _removeEvents() {
        if (this._map) {
            this._map.off();
        }
        if (this._boundDropHandler) {
            this.el.removeEventListener('drop', this._boundDropHandler, false);
        }
        if (this._boundDragoverHandler) {
            this.el.removeEventListener('dragover', this._boundDragoverHandler, false);
        }
    }
    _setUpEvents() {
        // Store bound handlers for cleanup
        this._boundDropHandler = this._dropHandler.bind(this);
        this._boundDragoverHandler = this._dragoverHandler.bind(this);
        // Set up drag and drop handlers for layers, geojson, and mapml URLs
        this.el.addEventListener('drop', this._boundDropHandler, false);
        this.el.addEventListener('dragover', this._boundDragoverHandler, false);
        // Set up map event handlers to sync with component props
        this._map.on('moveend', function () {
            this._updateMapCenter();
            this._addToHistory();
            this.el.dispatchEvent(new CustomEvent('map-moveend', { detail: { target: this } }));
        }, this);
        this._map.on('zoom', function () {
            this.el.dispatchEvent(new CustomEvent('map-zoom', { detail: { target: this } }));
        }, this);
        this._map.on('zoomend', function () {
            this._updateMapCenter();
            this.el.dispatchEvent(new CustomEvent('zoomend', { detail: { target: this } }));
        }, this);
        // Forward geolocation events from Leaflet to custom events
        this._map.on('locationfound', function (e) {
            this.el.dispatchEvent(new CustomEvent('maplocationfound', {
                detail: { latlng: e.latlng, accuracy: e.accuracy }
            }));
        }, this);
        this._map.on('locationerror', function (e) {
            this.el.dispatchEvent(new CustomEvent('maplocationerror', {
                detail: { message: e.message, code: e.code }
            }));
        }, this);
        // Set up zoom bounds management based on layer extents
        const setMapMinAndMaxZoom = ((e) => {
            this.whenLayersReady().then(() => {
                if (e && e.layer._layerEl) {
                    this._map.setMaxZoom(this.extent.zoom.maxZoom);
                    this._map.setMinZoom(this.extent.zoom.minZoom);
                }
            });
        }).bind(this);
        this.whenLayersReady().then(() => {
            this._map.setMaxZoom(this.extent.zoom.maxZoom);
            this._map.setMinZoom(this.extent.zoom.minZoom);
            this._map.on('layeradd layerremove', setMapMinAndMaxZoom, this);
        });
        // Handle Ctrl+V paste for layers, links and geojson
        this.el.addEventListener('keydown', (e) => {
            if (e.keyCode === 86 && e.ctrlKey) {
                navigator.clipboard.readText().then((layer) => {
                    Util._pasteLayer(this.el, layer);
                });
            }
            else if (e.keyCode === 32 &&
                this.el.shadowRoot.activeElement?.nodeName !== 'INPUT') {
                // Prevent default spacebar event on map
                e.preventDefault();
                this._map.fire('keypress', { originalEvent: e });
            }
        });
    }
    _dropHandler(event) {
        event.preventDefault();
        let text = event.dataTransfer.getData('text');
        Util._pasteLayer(this.el, text);
    }
    _dragoverHandler(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }
    /**
     * Toggle debug overlay on the map
     */
    toggleDebug() {
        if (this._debug) {
            this._debug.remove();
            this._debug = undefined;
        }
        else {
            this._debug = debugOverlay().addTo(this._map);
        }
    }
    locate(options) {
        //options: https://leafletjs.com/reference.html#locate-options
        if (this._geolocationButton) {
            this._geolocationButton.stop();
        }
        if (options) {
            if (options.zoomTo) {
                options.setView = options.zoomTo;
                delete options.zoomTo;
            }
            this._map.locate(options);
        }
        else {
            this._map.locate({ setView: true, maxZoom: 16 });
        }
    }
    _changeWidth(width) {
        // Match mapml-viewer: modify the :host CSS rule, not inline styles
        // This allows light DOM CSS to override the shadow DOM default
        if (this._container) {
            this._container.style.width = width + 'px';
            // Modify the :host rule (always LAST stylesheet, first rule)
            const sheets = this.el.shadowRoot.styleSheets;
            if (sheets.length > 0) {
                sheets[sheets.length - 1].cssRules[0].style.width = width + 'px';
            }
        }
        if (this._map) {
            this._map.invalidateSize(false);
        }
    }
    _changeHeight(height) {
        // Match mapml-viewer: modify the :host CSS rule, not inline styles
        // This allows light DOM CSS to override the shadow DOM default
        if (this._container) {
            this._container.style.height = height + 'px';
            // Modify the :host rule (always LAST stylesheet, first rule)
            const sheets = this.el.shadowRoot.styleSheets;
            if (sheets.length > 0) {
                sheets[sheets.length - 1].cssRules[0].style.height = height + 'px';
            }
        }
        if (this._map) {
            this._map.invalidateSize(false);
        }
    }
    _updateMapCenter() {
        // Update component props to match map state and sync to DOM attributes
        // Note: Stencil mutable props don't automatically reflect changes back to DOM attributes
        if (this._map) {
            const center = this._map.getCenter();
            this.lat = center.lat;
            this.lon = center.lng;
            this.zoom = this._map.getZoom();
            // Manually sync the props back to DOM attributes
            this.el.setAttribute('lat', this.lat.toString());
            this.el.setAttribute('lon', this.lon.toString());
            this.el.setAttribute('zoom', this.zoom.toString());
        }
    }
    _resetHistory() {
        this._history = [];
        this._historyIndex = -1;
        this._traversalCall = false;
        // weird but ok (original comment)
        this._addToHistory();
    }
    _addToHistory() {
        // this._traversalCall tracks how many consecutive moveends to ignore from history
        // Check if we should ignore this moveend event due to programmatic navigation
        if (this._traversalCall && this._traversalCall > 0) {
            this._traversalCall--;
            return; // Don't add to history during back/forward/reload operations
        }
        let mapLocation = this._map.getPixelBounds().getCenter();
        let location = {
            zoom: this._map.getZoom(),
            x: mapLocation.x,
            y: mapLocation.y
        };
        this._historyIndex++;
        this._history.splice(this._historyIndex, 0, location);
        // Remove future history when adding new location while in middle of history
        if (this._historyIndex + 1 !== this._history.length) {
            this._history.length = this._historyIndex + 1;
        }
        // Update context menu button states based on history position
        this._updateNavigationControls();
        // Sync updated history properties to element for MapML controls
        this.el._history = this._history;
        this.el._historyIndex = this._historyIndex;
    }
    _updateNavigationControls() {
        // Centralize navigation control state management
        const canGoBack = this._historyIndex > 0;
        const canGoForward = this._historyIndex < this._history.length - 1;
        const canReload = this._historyIndex > 0;
        // Update context menu items
        this._map.contextMenu.toggleContextMenuItem('Back', canGoBack ? 'enabled' : 'disabled');
        this._map.contextMenu.toggleContextMenuItem('Forward', canGoForward ? 'enabled' : 'disabled');
        this._map.contextMenu.toggleContextMenuItem('Reload', canReload ? 'enabled' : 'disabled');
        // Update reload button
        if (canReload) {
            this._reloadButton?.enable();
        }
        else {
            this._reloadButton?.disable();
        }
    }
    /**
     * Navigate back in map history
     */
    back() {
        if (this._historyIndex <= 0)
            return;
        let curr = this._history[this._historyIndex];
        this._historyIndex--;
        let prev = this._history[this._historyIndex];
        // Set traversal call count based on operations needed
        if (prev.zoom !== curr.zoom) {
            this._traversalCall = 2; // panBy + setZoom
            let currScale = this._map.options.crs.scale(curr.zoom);
            let prevScale = this._map.options.crs.scale(prev.zoom);
            let scale = currScale / prevScale;
            this._map.panBy([prev.x * scale - curr.x, prev.y * scale - curr.y], { animate: false });
            this._map.setZoom(prev.zoom);
        }
        else {
            this._traversalCall = 1; // panBy only
            this._map.panBy([prev.x - curr.x, prev.y - curr.y]);
        }
        // Update controls immediately (don't wait for moveend)
        this._updateNavigationControls();
        // Sync to element
        this.el._historyIndex = this._historyIndex;
    }
    /**
     * Allows user to move forward in history
     */
    forward() {
        let history = this._history;
        let curr = history[this._historyIndex];
        if (this._historyIndex < history.length - 1) {
            this._map.contextMenu.toggleContextMenuItem('Back', 'enabled');
            this._historyIndex++;
            let next = history[this._historyIndex];
            // Disable forward contextmenu item when at the end of history
            if (this._historyIndex === history.length - 1) {
                this._map.contextMenu.toggleContextMenuItem('Forward', 'disabled');
            }
            if (next.zoom !== curr.zoom) {
                this._traversalCall = 2;
                let currScale = this._map.options.crs.scale(curr.zoom);
                let nextScale = this._map.options.crs.scale(next.zoom);
                let scale = currScale / nextScale;
                this._map.panBy([next.x * scale - curr.x, next.y * scale - curr.y], { animate: false });
                this._map.setZoom(next.zoom);
            }
            else {
                this._traversalCall = 1;
                this._map.panBy([next.x - curr.x, next.y - curr.y]);
            }
            // Update controls immediately (don't wait for moveend)
            this._updateNavigationControls();
            // Sync to element
            this.el._historyIndex = this._historyIndex;
        }
    }
    /**
     * Allows the user to reload/reset the map's location to its initial location
     * and reset the history to the initial state
     */
    reload() {
        if (this._history.length === 0)
            return;
        let initialLocation = this._history[0]; // Get initial location
        let curr = {
            zoom: this._map.getZoom(),
            x: this._map.getPixelBounds().getCenter().x,
            y: this._map.getPixelBounds().getCenter().y
        };
        // Reset history completely - this is the key change
        this._history = [initialLocation]; // Keep only the initial location
        this._historyIndex = 0; // Set to the only remaining entry
        // Set traversal call count based on operations needed
        if (initialLocation.zoom !== curr.zoom) {
            this._traversalCall = 2; // panBy + setZoom
            let currScale = this._map.options.crs.scale(curr.zoom);
            let initScale = this._map.options.crs.scale(initialLocation.zoom);
            let scale = currScale / initScale;
            this._map.panBy([initialLocation.x * scale - curr.x, initialLocation.y * scale - curr.y], { animate: false });
            this._map.setZoom(initialLocation.zoom);
        }
        else {
            this._traversalCall = 1; // panBy only
            this._map.panBy([initialLocation.x - curr.x, initialLocation.y - curr.y]);
        }
        // Update controls immediately - now with reset history state
        this._updateNavigationControls();
        // Sync reset history to element
        this.el._history = this._history;
        this.el._historyIndex = this._historyIndex;
        this._map.getContainer().focus();
    }
    /**
     * Internal method to toggle fullscreen (used by MapML context menu)
     */
    _toggleFullScreen() {
        this._map.toggleFullscreen();
    }
    /**
     * Open the map source in a new window
     */
    viewSource() {
        let blob = new Blob([this._source], { type: 'text/plain' }), url = URL.createObjectURL(blob);
        window.open(url);
        URL.revokeObjectURL(url);
    }
    /**
     * Zoom the map to a specific location and zoom level
     * @param lat - Latitude coordinate
     * @param lon - Longitude coordinate
     * @param zoom - Zoom level (optional, defaults to current zoom)
     */
    zoomTo(lat, lon, zoom) {
        // Ensure map is initialized before attempting to zoom
        if (!this._map) {
            console.warn('Map is not initialized. Cannot zoom to location.');
            return;
        }
        // Convert zoom to number if provided, otherwise use current zoom
        const targetZoom = (zoom !== undefined && Number.isInteger(+zoom)) ? +zoom : this.zoom;
        // Create LatLng object for the target location
        const location = new LatLng(+lat, +lon);
        // Set the map view to the new location and zoom
        this._map.setView(location, targetZoom);
        // Update the component properties to reflect the new state
        // This matches the behavior in the original mapml-viewer.js
        // this.zoom = targetZoom;
        // this.lat = location.lat;
        // this.lon = location.lng;
        // The moveend event will fire automatically and:
        // 1. Call _updateMapCenter() to sync lat/lon/zoom props
        // 2. Call _addToHistory() to update the history stack
        // 3. Update context menu button states
    }
    async whenProjectionDefined(projection) {
        // Mirror the original whenProjectionDefined logic
        return new Promise((resolve, reject) => {
            if (window.M[projection]) {
                resolve(window.M[projection]);
            }
            else {
                reject(new Error('Projection ' + projection + ' is not defined'));
            }
        });
    }
    defineCustomProjection(jsonTemplate) {
        // Delegate to the global M.defineCustomProjection API
        if (window.M && window.M.defineCustomProjection) {
            window.M.defineCustomProjection(jsonTemplate);
            const t = JSON.parse(jsonTemplate);
            return t.projection;
        }
        else {
            throw new Error('MapML API not loaded');
        }
    }
    /**
     * Promise-based method to wait until map is ready
     * Returns a promise that resolves when the map is fully initialized
     */
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer;
            if (this.el._map) {
                resolve();
            }
            else {
                let viewer = this.el;
                interval = setInterval(testForMap, 200, viewer);
                failureTimer = setTimeout(mapNotDefined, 5000);
            }
            function testForMap(viewer) {
                if (viewer._map) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
            }
            function mapNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for map to be ready');
            }
        });
    }
    /**
     * Promise-based method to wait until all layers are ready
     * Returns a promise that resolves when all child layers are fully initialized
     */
    async whenLayersReady() {
        let layersReady = [];
        // Get all map-layer child elements
        const layers = this.el.querySelectorAll('map-layer');
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (layer.whenReady) {
                layersReady.push(layer.whenReady());
            }
        }
        return Promise.allSettled(layersReady);
    }
    /**
     * Convert GeoJSON to MapML and append as a layer
     * @param json - GeoJSON object (FeatureCollection, Feature, or Geometry)
     * @param options - Conversion options:
     *   - label: Layer label (defaults to json.name, json.title, or locale default)
     *   - projection: Target projection (defaults to map's projection)
     *   - caption: Feature caption property name or function
     *   - properties: Custom properties handling (function, string, or HTMLElement)
     *   - geometryFunction: Custom geometry processing function
     * @returns The created map-layer element
     */
    geojson2mapml(json, options = {}) {
        // Use current map projection if not specified
        if (options.projection === undefined) {
            options.projection = this.projection;
        }
        // Call Util.geojson2mapml to create the layer element
        let geojsonLayer = Util.geojson2mapml(json, options);
        // Append the layer to the map
        this.el.appendChild(geojsonLayer);
        return geojsonLayer;
    }
    render() {
        return null;
    }
    static get is() { return "gcds-map"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["gcds-map.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["gcds-map.css"]
        };
    }
    static get properties() {
        return {
            "lat": {
                "type": "number",
                "mutable": true,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "lat",
                "defaultValue": "0"
            },
            "lon": {
                "type": "number",
                "mutable": true,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "lon",
                "defaultValue": "0"
            },
            "zoom": {
                "type": "number",
                "mutable": true,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "zoom",
                "defaultValue": "0"
            },
            "projection": {
                "type": "string",
                "mutable": true,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "projection",
                "defaultValue": "'OSMTILE'"
            },
            "controls": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "controls",
                "defaultValue": "false"
            },
            "static": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "static",
                "defaultValue": "false"
            },
            "_controlslist": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "controlslist"
            },
            "locale": {
                "type": "any",
                "mutable": true,
                "complexType": {
                    "original": "any",
                    "resolved": "any",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "locale"
            }
        };
    }
    static get methods() {
        return {
            "whenProjectionDefined": {
                "complexType": {
                    "signature": "(projection: string) => Promise<unknown>",
                    "parameters": [{
                            "name": "projection",
                            "type": "string",
                            "docs": ""
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<unknown>"
                },
                "docs": {
                    "text": "",
                    "tags": []
                }
            },
            "whenReady": {
                "complexType": {
                    "signature": "() => Promise<void>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Promise-based method to wait until map is ready\nReturns a promise that resolves when the map is fully initialized",
                    "tags": []
                }
            },
            "whenLayersReady": {
                "complexType": {
                    "signature": "() => Promise<PromiseSettledResult<void>[]>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "PromiseSettledResult": {
                            "location": "global",
                            "id": "global::PromiseSettledResult"
                        }
                    },
                    "return": "Promise<PromiseSettledResult<void>[]>"
                },
                "docs": {
                    "text": "Promise-based method to wait until all layers are ready\nReturns a promise that resolves when all child layers are fully initialized",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "controls",
                "methodName": "controlsChanged"
            }, {
                "propName": "_controlslist",
                "methodName": "controlsListChanged"
            }, {
                "propName": "projection",
                "methodName": "projectionChanged"
            }, {
                "propName": "static",
                "methodName": "staticChanged"
            }];
    }
}
//# sourceMappingURL=gcds-map.js.map
