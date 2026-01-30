import { bounds as Lbounds, point as Lpoint } from "leaflet";
import { Util } from "../utils/mapml/Util.js";
import { mapExtentLayer } from "../utils/mapml/layers/MapExtentLayer.js";
import { createLayerControlExtentHTML } from "../utils/mapml/elementSupport/extents/createLayerControlForExtent.js";
import { calculatePosition } from "../utils/mapml/elementSupport/layers/calculatePosition.js";
export class GcdsMapExtent {
    el;
    checked = false;
    _label;
    opacity = 1;
    _opacity;
    hidden = false;
    units;
    disabled = false;
    // Internal getter for use within component
    get label() {
        return this._label || this.mapEl?.locale?.dfExtent || 'Sub-layer';
    }
    get opacityValue() {
        return this._opacity ?? this.opacity ?? 1.0;
    }
    mapEl;
    parentLayer;
    _map;
    _extentLayer;
    _layerControlHTML;
    _layerControlCheckbox;
    _layerControlLabel;
    _opacityControl;
    _opacitySlider;
    _selectdetails;
    _observer;
    _changeHandler;
    _boundsCalculated = false;
    unitsChanged(newValue, oldValue) {
        if (this._extentLayer && oldValue !== newValue) {
            // handle units change
        }
    }
    labelChanged() {
        if (this._layerControlHTML) {
            this._layerControlHTML.querySelector('.mapml-extent-item-name').textContent = this.label;
        }
    }
    checkedChanged() {
        if (this.parentLayer && this._extentLayer) {
            this.parentLayer
                .whenReady()
                .then(() => {
                this._handleChange();
                this._calculateBounds();
                if (this._layerControlCheckbox) {
                    this._layerControlCheckbox.checked = this.checked;
                }
            })
                .catch((error) => {
                console.log('Error while waiting on parentLayer for map-extent checked callback: ' +
                    error);
            });
        }
    }
    opacityChanged(newValue, oldValue) {
        // This watcher handles programmatic changes to the opacity property
        if (oldValue !== newValue && this._extentLayer) {
            this._opacity = newValue;
            this._extentLayer.changeOpacity(newValue);
            // Update opacity slider if it exists
            if (this._opacitySlider) {
                this._opacitySlider.value = newValue.toString();
            }
        }
    }
    hiddenChanged(newValue, oldValue) {
        // Only process hidden changes after the extent is fully initialized
        // During initial load, this will be handled in connectedCallback
        if (oldValue !== newValue && this._extentLayer && this._layerControlHTML) {
            this._applyHiddenState(newValue);
        }
    }
    _applyHiddenState(isHidden) {
        if (!this._extentLayer || !this._layerControlHTML || !this.parentLayer)
            return;
        this.parentLayer
            .whenReady()
            .then(() => {
            let extentsRootFieldset = this.parentLayer._propertiesGroupAnatomy;
            // Get all map-extent elements and filter by component property, not DOM attribute
            const allExtents = this.parentLayer.src
                ? Array.from(this.parentLayer.shadowRoot.querySelectorAll(':host > map-extent'))
                : Array.from(this.parentLayer.querySelectorAll(':scope > map-extent'));
            // Filter visible extents using component property
            const visibleExtents = allExtents.filter(extent => !extent.hidden);
            let position = visibleExtents.indexOf(this.el);
            if (isHidden) {
                // Hidden was set to true - remove from layer control (hide from user)
                this._layerControlHTML.remove();
            }
            else {
                // Hidden was set to false - add back to layer control in calculated position
                if (position === 0) {
                    extentsRootFieldset.insertAdjacentElement('afterbegin', this._layerControlHTML);
                }
                else if (position > 0) {
                    Array.from(this.parentLayer.src
                        ? this.parentLayer.shadowRoot.querySelectorAll(':host > map-extent:not([hidden])')
                        : this.parentLayer.querySelectorAll(':scope > map-extent:not([hidden])'))[position - 1]._layerControlHTML.insertAdjacentElement('afterend', this._layerControlHTML);
                }
            }
            this._validateLayerControlContainerHidden();
        })
            .catch(() => {
            console.log('Error while waiting on parentLayer for map-extent hidden callback');
        });
    }
    get extent() {
        const getExtent = (extent) => {
            return Object.assign(Util._convertAndFormatPCRS(extent._extentLayer.bounds, M[extent.units], extent.units), { zoom: extent._extentLayer.zoomBounds });
        };
        const getCalculatedExtent = (extent) => {
            extent._calculateBounds();
            return getExtent(extent);
        };
        return this._extentLayer.bounds
            ? getExtent(this)
            : getCalculatedExtent(this);
    }
    get position() {
        return calculatePosition(this.el);
    }
    getOuterHTML() {
        let tempElement = this.el.cloneNode(true);
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
        let extent = this.extent;
        let map = this.getMapEl()._map, xmin = extent.topLeft.pcrs.horizontal, xmax = extent.bottomRight.pcrs.horizontal, ymin = extent.bottomRight.pcrs.vertical, ymax = extent.topLeft.pcrs.vertical, bounds = Lbounds(Lpoint(xmin, ymin), Lpoint(xmax, ymax)), center = map.options.crs.unproject(bounds.getCenter(true)), maxZoom = extent.zoom.maxZoom, minZoom = extent.zoom.minZoom;
        map.setView(center, Util.getMaxZoom(bounds, map, minZoom, maxZoom), {
            animate: false
        });
    }
    getMapEl() {
        return Util.getClosest(this.el, 'gcds-map');
    }
    getLayerEl() {
        return Util.getClosest(this.el, 'map-layer,layer-');
    }
    async connectedCallback() {
        // Initialize default values and bind handlers
        this._opacity = this.opacityValue;
        this._changeHandler = this._handleChange.bind(this);
        this.parentLayer = this.el.parentLayer = this.getLayerEl();
        if (this.el.hasAttribute('data-moving') ||
            this.parentLayer?.hasAttribute('data-moving'))
            return;
        this.mapEl = this.getMapEl();
        // Add MapML compatibility methods to the element
        this.el.getMapEl = this.getMapEl.bind(this);
        this.el.getLayerEl = this.getLayerEl.bind(this);
        this.el.getLayerControlHTML = this.getLayerControlHTML.bind(this);
        this.el.zoomTo = this.zoomTo.bind(this);
        this.el._validateDisabled = this._validateDisabled.bind(this);
        this.el.getMeta = this.getMeta.bind(this);
        this.el.getOuterHTML = this.getOuterHTML.bind(this);
        // this is necessary for true "whenReady" being true because bounds
        // being established is pretty important.  This is different from MapML.js;
        // TODO it may be to port this idea back to MapML.js tbd.
        Object.defineProperty(this.el, '_boundsCalculated', {
            get: () => this._boundsCalculated,
            configurable: true,
            enumerable: true
        });
        // Add extent getter on element for MapML compatibility
        Object.defineProperty(this.el, 'extent', {
            get: () => {
                return this.extent;
            },
            configurable: true
        });
        // Add label getter/setter on element for MapML compatibility
        Object.defineProperty(this.el, 'label', {
            get: () => {
                return this.el.hasAttribute('label')
                    ? this.el.getAttribute('label')
                    : this.mapEl?.locale?.dfExtent || 'Sub-layer';
            },
            set: (val) => {
                if (val) {
                    this.el.setAttribute('label', val);
                    // Update internal prop to trigger watcher
                    this._label = val;
                }
            },
            configurable: true
        });
        // Initialize _label from attribute if present
        if (this.el.hasAttribute('label')) {
            this._label = this.el.getAttribute('label');
        }
        if (!this.mapEl)
            return;
        await this.mapEl.whenProjectionDefined(this.units).catch(() => {
            throw new Error('Undefined projection:' + this.units);
        });
        // when projection is changed, the parent map-layer._layer is created (so whenReady is fulfilled) but then removed,
        // then the map-extent disconnectedCallback will be triggered by map-layer._onRemove() (clear the shadowRoot)
        // even before connectedCallback is finished
        // in this case, the microtasks triggered by the fulfillment of the removed MapLayer should be stopped as well
        // !this.isConnected <=> the disconnectedCallback has run before
        if (!this.el.isConnected)
            return;
        await this.mapEl.whenReady();
        this._map = this.mapEl._map;
        this.parentLayer?.addEventListener('map-change', this._changeHandler);
        this.mapEl.addEventListener('map-projectionchange', this._changeHandler);
        this._extentLayer = mapExtentLayer({
            opacity: this.opacityValue,
            crs: M[this.units],
            zIndex: this.position,
            extentEl: this.el
        });
        // Publish to element for MapML compatibility
        this.el._extentLayer = this._extentLayer;
        // this._layerControlHTML is the fieldset for the extent in the LayerControl
        // Create layer control HTML and ensure it's captured on the component instance
        const layerControlHTML = createLayerControlExtentHTML.call(this);
        this._layerControlHTML = layerControlHTML;
        // Also ensure the DOM element reference is synced (MapML compatibility)
        this.el._layerControlHTML = layerControlHTML;
        this.el._layerControlLabel = this._layerControlLabel;
        this.el._layerControlCheckbox = this._layerControlCheckbox;
        this.el._opacityControl = this._opacityControl;
        this.el._opacitySlider = this._opacitySlider;
        this.el._selectdetails = this._selectdetails;
        // Wait for map-link elements to be ready before calculating bounds
        await this._waitForTrefLinks();
        this._calculateBounds();
        // Handle initial checked state - add extent layer to parent if checked
        this._handleChange();
        // instead of children using parents' whenReady which can be cyclic,
        // when this element is ready, run stuff that is only available after
        // initialization
        this._runMutationObserver(this.el.children);
        // make sure same thing happens when children are added
        this._bindMutationObserver();
    }
    /*
     * Set up a function to watch additions of child elements of map-extent
     * and to invoke desired side  effects of those additions via
     * _runMutationObserver
     */
    _bindMutationObserver() {
        this._observer = new MutationObserver((mutationList) => {
            for (let mutation of mutationList) {
                // Handle attribute removals for 'label'
                if (mutation.type === 'attributes' && mutation.attributeName === 'label') {
                    if (!this.el.hasAttribute('label')) {
                        this._label = this.mapEl?.locale?.dfExtent || 'Sub-layer';
                    }
                }
                // the attributes changes should be handled by attributeChangedCallback()
                if (mutation.type === 'childList') {
                    this._runMutationObserver(mutation.addedNodes);
                }
            }
        });
        // Observe both childList and attribute changes for 'label'
        this._observer.observe(this.el, {
            childList: true,
            attributes: true,
            attributeFilter: ['label']
        });
    }
    _runMutationObserver(elementsGroup) {
        const _addMetaElement = (_mapMeta) => {
            this.whenReady().then(() => {
                this._calculateBounds();
                this._validateDisabled();
            });
        };
        const _addStylesheetLink = (mapLink) => {
            this.whenReady().then(() => {
                this._extentLayer.renderStyles(mapLink);
            });
        };
        const _addStyleElement = (mapStyle) => {
            this.whenReady().then(() => {
                this._extentLayer.renderStyles(mapStyle);
            });
        };
        for (let i = 0; i < elementsGroup.length; ++i) {
            let element = elementsGroup[i];
            switch (element.nodeName) {
                case 'MAP-META':
                    const name = element.hasAttribute('name') &&
                        (element.getAttribute('name').toLowerCase() === 'zoom' ||
                            element.getAttribute('name').toLowerCase() === 'extent');
                    if (name && element.hasAttribute('content')) {
                        _addMetaElement(element);
                    }
                    break;
                case 'MAP-LINK':
                    if (element.link && !element.link.isConnected)
                        _addStylesheetLink(element);
                    break;
                case 'MAP-STYLE':
                    if (element.styleElement && !element.styleElement.isConnected) {
                        _addStyleElement(element);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    getLayerControlHTML() {
        return this._layerControlHTML;
    }
    _projectionMatch() {
        return (this.units.toUpperCase() === this._map.options.projection.toUpperCase());
    }
    _validateDisabled() {
        if (!this._extentLayer)
            return;
        let templates = this.el.querySelectorAll('map-link[rel=image],map-link[rel=tile],map-link[rel=features],map-link[rel=query]');
        const noTemplateVisible = () => {
            let totalTemplateCount = templates.length, disabledTemplateCount = 0;
            for (let j = 0; j < templates.length; j++) {
                if (!templates[j].isVisible()) {
                    disabledTemplateCount++;
                }
            }
            return disabledTemplateCount === totalTemplateCount;
        };
        if (!this._projectionMatch() || noTemplateVisible()) {
            this.el.setAttribute('disabled', '');
            this.disabled = true;
        }
        else {
            this.el.removeAttribute('disabled');
            this.disabled = false;
        }
        this.toggleLayerControlDisabled();
        this._handleChange();
        return this.disabled;
    }
    getMeta(metaName) {
        let name = metaName.toLowerCase();
        if (name !== 'extent' && name !== 'zoom' && name !== 'cs')
            return;
        return this.parentLayer.src
            ? this.el.querySelector(`:scope > map-meta[name=${name}]`) ||
                this.parentLayer.shadowRoot.querySelector(`:host > map-meta[name=${name}]`)
            : this.el.querySelector(`:scope > map-meta[name=${name}]`) ||
                this.parentLayer.querySelector(`:scope > map-meta[name=${name}]`);
    }
    // disable/italicize layer control elements based on the map-extent.disabled property
    toggleLayerControlDisabled() {
        let input = this._layerControlCheckbox, label = this._layerControlLabel, // access to the label for the specific map-extent
        opacityControl = this._opacityControl, opacitySlider = this._opacitySlider, selectDetails = this._selectdetails;
        if (this.disabled) {
            // update the status of layerControl
            input.disabled = true;
            opacitySlider.disabled = true;
            label.style.fontStyle = 'italic';
            opacityControl.style.fontStyle = 'italic';
            if (selectDetails) {
                selectDetails.forEach((i) => {
                    i.querySelectorAll('select').forEach((j) => {
                        j.disabled = true;
                        j.style.fontStyle = 'italic';
                    });
                    i.style.fontStyle = 'italic';
                });
            }
        }
        else {
            input.disabled = false;
            opacitySlider.disabled = false;
            label.style.fontStyle = 'normal';
            opacityControl.style.fontStyle = 'normal';
            if (selectDetails) {
                selectDetails.forEach((i) => {
                    i.querySelectorAll('select').forEach((j) => {
                        j.disabled = false;
                        j.style.fontStyle = 'normal';
                    });
                    i.style.fontStyle = 'normal';
                });
            }
        }
    }
    _handleChange() {
        // add _extentLayer to map if map-extent is checked, otherwise remove it
        if (this.checked && !this.disabled && this.parentLayer._layer) {
            // can be added to MapLayer LayerGroup no matter map-layer is checked or not
            this._extentLayer.addTo(this.parentLayer._layer);
            this._extentLayer.setZIndex(this.position);
        }
        else {
            this.parentLayer._layer?.removeLayer(this._extentLayer);
        }
        // change the checkbox in the layer control to match map-extent.checked
        // doesn't trigger the event handler because it's not user-caused AFAICT
    }
    _validateLayerControlContainerHidden() {
        let extentsFieldset = this.parentLayer._propertiesGroupAnatomy;
        if (!extentsFieldset)
            return;
        // Get all map-extent elements (not just non-hidden ones)
        const allExtents = this.parentLayer.src
            ? Array.from(this.parentLayer.shadowRoot.querySelectorAll(':host > map-extent'))
            : Array.from(this.parentLayer.querySelectorAll(':scope > map-extent'));
        // Count visible extents using component property, not DOM attribute
        const numberOfVisibleSublayers = allExtents.filter(extent => !extent.hidden).length;
        if (numberOfVisibleSublayers === 0) {
            extentsFieldset.setAttribute('hidden', '');
        }
        else {
            extentsFieldset.removeAttribute('hidden');
        }
    }
    disconnectedCallback() {
        // in case of projection change, the disconnectedcallback will be triggered by removing map-layer._layer even before
        // map-extent.connectedcallback is finished (because it will wait for the map-layer to be ready)
        // !this._extentLayer <=> this.connectedCallback has not yet been finished before disconnectedCallback is triggered
        if (this.el.hasAttribute('data-moving') ||
            this.parentLayer?.hasAttribute('data-moving') ||
            !this._extentLayer)
            return;
        this._validateLayerControlContainerHidden();
        // remove layer control for map-extent from layer control DOM
        // TODO: for the case of projection change, the layer control for map-extent has been created while _extentLayer has not yet been ready
        if (this._layerControlHTML) {
            this._layerControlHTML.remove();
        }
        if (this.parentLayer?._layer) {
            this.parentLayer._layer.removeLayer(this._extentLayer);
        }
        if (this.parentLayer) {
            this.parentLayer.removeEventListener('map-change', this._changeHandler);
        }
        if (this.mapEl) {
            this.mapEl.removeEventListener('map-projectionchange', this._changeHandler);
        }
        this._boundsCalculated = false;
        delete this._extentLayer;
        if (this.parentLayer?._layer)
            delete this.parentLayer._layer.bounds;
    }
    async _waitForTrefLinks() {
        // Wait only for links with explicit tref attributes to have _templateVars initialized
        // This is needed because _calculateBounds() calls link.getZoomBounds() and link.getBounds()
        // which depend on _templateVars being set
        // Links without tref would create circular dependency if we waited for them
        const templates = this.el.querySelectorAll('map-link[rel=image][tref],map-link[rel=tile][tref],map-link[rel=features][tref],map-link[rel=query][tref]');
        const linksVarsReady = [];
        for (let link of Array.from(templates)) {
            // Wait for _templateVars to be set, not for _templatedLayer to be created
            linksVarsReady.push(new Promise((resolve) => {
                if (link._templateVars) {
                    resolve();
                }
                else {
                    const checkInterval = setInterval(() => {
                        if (link._templateVars) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 10);
                    // Timeout after 1 second
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve(); // Resolve anyway to not block forever
                    }, 1000);
                }
            }));
        }
        return Promise.all(linksVarsReady);
    }
    _calculateBounds() {
        delete this._extentLayer.bounds;
        delete this._extentLayer.zoomBounds;
        if (this.parentLayer._layer)
            delete this.parentLayer._layer.bounds;
        let templates = this.el.querySelectorAll('map-link[rel=image]:not([disabled]),map-link[rel=tile]:not([disabled]),map-link[rel=features]:not([disabled]),map-link[rel=query]:not([disabled])');
        // initialize bounds from this.scope > map-meta
        let bounds = this.el.querySelector(':scope > map-meta[name=extent][content]')
            ? Util.getBoundsFromMeta(this.el) // TODO rewrite this pile of doo doo
            : undefined;
        // initialize zoom bounds from this.scope > map-meta
        let zoomBounds = this.el.querySelector(':scope > map-meta[name=zoom][content]')
            ? Util.getZoomBoundsFromMeta(this.el) // TODO rewrite this pile of doo doo
            : undefined;
        // bounds should be able to be calculated unconditionally, not depend on map-extent.checked
        for (let j = 0; j < templates.length; j++) {
            const templateZoomBounds = templates[j].getZoomBounds(), templateBounds = templates[j].getBounds();
            let zoomMax = zoomBounds && zoomBounds.hasOwnProperty('maxZoom')
                ? zoomBounds.maxZoom
                : -Infinity, zoomMin = zoomBounds && zoomBounds.hasOwnProperty('minZoom')
                ? zoomBounds.minZoom
                : Infinity, minNativeZoom = zoomBounds && zoomBounds.hasOwnProperty('minNativeZoom')
                ? zoomBounds.minNativeZoom
                : Infinity, maxNativeZoom = zoomBounds && zoomBounds.hasOwnProperty('maxNativeZoom')
                ? zoomBounds.maxNativeZoom
                : -Infinity;
            if (!zoomBounds) {
                zoomBounds = Object.assign({}, templateZoomBounds);
            }
            else {
                zoomMax = Math.max(zoomMax, templateZoomBounds.maxZoom);
                zoomMin = Math.min(zoomMin, templateZoomBounds.minZoom);
                maxNativeZoom = Math.max(maxNativeZoom, templateZoomBounds.maxNativeZoom);
                minNativeZoom = Math.min(minNativeZoom, templateZoomBounds.minNativeZoom);
                zoomBounds.minZoom = zoomMin;
                zoomBounds.maxZoom = zoomMax;
                zoomBounds.minNativeZoom = minNativeZoom;
                zoomBounds.maxNativeZoom = maxNativeZoom;
            }
            if (!bounds) {
                bounds = Lbounds(templateBounds.min, templateBounds.max);
            }
            else {
                bounds.extend(templateBounds);
            }
        }
        if (bounds) {
            this._extentLayer.bounds = bounds;
        }
        else {
            this._extentLayer.bounds = Lbounds(M[this.units].options.bounds.min, M[this.units].options.bounds.max);
        }
        if (!zoomBounds)
            zoomBounds = {};
        if (!zoomBounds.hasOwnProperty('minZoom')) {
            zoomBounds.minZoom = 0;
        }
        if (!zoomBounds.hasOwnProperty('maxZoom')) {
            zoomBounds.maxZoom = M[this.units].options.resolutions.length - 1;
        }
        if (!zoomBounds.hasOwnProperty('minNativeZoom') ||
            zoomBounds.minNativeZoom === Infinity) {
            zoomBounds.minNativeZoom = zoomBounds.minZoom;
        }
        if (!zoomBounds.hasOwnProperty('maxNativeZoom') ||
            zoomBounds.maxNativeZoom === -Infinity) {
            zoomBounds.maxNativeZoom = zoomBounds.maxZoom;
        }
        this._extentLayer.zoomBounds = zoomBounds;
        this._boundsCalculated = true;
    }
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer;
            if (this._extentLayer && this._boundsCalculated) {
                resolve();
            }
            else {
                let extentElement = this.el;
                interval = setInterval(testForExtent, 300, extentElement);
                failureTimer = setTimeout(extentNotDefined, 10000);
            }
            function testForExtent(extentElement) {
                if (extentElement._extentLayer && extentElement._boundsCalculated) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
                else if (!extentElement.isConnected) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    reject('map-extent was disconnected while waiting to be ready');
                }
            }
            function extentNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for extent to be ready');
            }
        });
    }
    render() {
        return null;
    }
    async whenLinksReady() {
        let templates = this.el.querySelectorAll('map-link[rel=image],map-link[rel=tile],map-link[rel=features],map-link[rel=query]');
        let linksReady = [];
        for (let link of Array.from(templates)) {
            linksReady.push(link.whenReady());
        }
        return Promise.allSettled(linksReady);
    }
    static get is() { return "map-extent"; }
    static get encapsulation() { return "shadow"; }
    static get properties() {
        return {
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
                "attribute": "checked",
                "defaultValue": "false"
            },
            "_label": {
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
                "attribute": "_label"
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
            "units": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "units"
            },
            "disabled": {
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
                "attribute": "disabled",
                "defaultValue": "false"
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
            "whenLinksReady": {
                "complexType": {
                    "signature": "() => Promise<PromiseSettledResult<any>[]>",
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
                    "return": "Promise<PromiseSettledResult<any>[]>"
                },
                "docs": {
                    "text": "",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "units",
                "methodName": "unitsChanged"
            }, {
                "propName": "_label",
                "methodName": "labelChanged"
            }, {
                "propName": "checked",
                "methodName": "checkedChanged"
            }, {
                "propName": "_opacity",
                "methodName": "opacityChanged"
            }, {
                "propName": "hidden",
                "methodName": "hiddenChanged"
            }];
    }
}
//# sourceMappingURL=map-extent.js.map
