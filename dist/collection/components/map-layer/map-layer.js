import { setOptions, DomUtil, bounds, point } from "leaflet";
import { Util } from "../utils/mapml/Util.js";
import * as MapLayerModule from "../utils/mapml/layers/MapLayer.js";
import { MapTileLayer } from "../utils/mapml/layers/MapTileLayer.js";
import { MapFeatureLayer } from "../utils/mapml/layers/MapFeatureLayer.js";
import { createLayerControlHTML } from "../utils/mapml/elementSupport/layers/createLayerControlForLayer.js";
export class GcdsMapLayer {
    /*
     * MapML Compatibility: The following properties are exposed on this.el for MapML compatibility:
     * - _layer: The MapML layer instance
     * - _layerControl: The layer control instance
     * - _layerControlHTML: The layer control HTML elements
     * - _fetchError: Boolean indicating if there was a fetch error
     * - _layerControlCheckbox: The layer control checkbox element (set by createLayerControlHTML)
     * - _opacitySlider: The opacity slider element (set by createLayerControlHTML)
     * - Other layer control elements set dynamically by createLayerControlHTML
     */
    el;
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
                    this._layer = MapLayerModule.mapLayer(new URL(this.src, base).href, this.el, {
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
                    this._layer = MapLayerModule.mapLayer(null, this.el, {
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
        setOptions(this._layer, {
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
                        _addMetaElement(element);
                    }
                    break;
                default:
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
                DomUtil.addClass(stylesControl, 'mapml-layer-item-style mapml-control-layers');
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
            let map = this.getMapEl()?._map, extent = this.extent, tL = extent.topLeft.pcrs, bR = extent.bottomRight.pcrs, layerBounds = bounds(point(tL.horizontal, tL.vertical), point(bR.horizontal, bR.vertical)), center = map.options.crs.unproject(layerBounds.getCenter(true));
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
    static get is() { return "map-layer"; }
    static get encapsulation() { return "shadow"; }
    static get properties() {
        return {
            "src": {
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
                "reflect": true,
                "attribute": "src"
            },
            "checked": {
                "type": "boolean",
                "mutable": true,
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
                "attribute": "checked"
            },
            "hidden": {
                "type": "boolean",
                "mutable": true,
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
                "attribute": "hidden",
                "defaultValue": "false"
            },
            "opacity": {
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
                "attribute": "opacity",
                "defaultValue": "1"
            },
            "_opacity": {
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
                "attribute": "_opacity"
            },
            "media": {
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
                "reflect": true,
                "attribute": "media"
            }
        };
    }
    static get methods() {
        return {
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
                    "text": "",
                    "tags": []
                }
            },
            "whenElemsReady": {
                "complexType": {
                    "signature": "() => Promise<PromiseSettledResult<unknown>[]>",
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
                    "return": "Promise<PromiseSettledResult<unknown>[]>"
                },
                "docs": {
                    "text": "Wait for all map-extent and map-feature elements to be ready.\nReturns a promise that resolves when all are settled.",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "src",
                "methodName": "srcChanged"
            }, {
                "propName": "checked",
                "methodName": "checkedChanged"
            }, {
                "propName": "_opacity",
                "methodName": "opacityChanged"
            }, {
                "propName": "media",
                "methodName": "mediaChanged"
            }, {
                "propName": "hidden",
                "methodName": "hiddenChanged"
            }];
    }
}
//# sourceMappingURL=map-layer.js.map
