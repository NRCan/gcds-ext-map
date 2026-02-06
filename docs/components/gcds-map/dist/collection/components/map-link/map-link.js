import { bounds, point, DomEvent, stamp, Util as LeafletUtil } from "leaflet";
import { Util } from "../utils/mapml/Util";
import { templatedImageLayer } from "../utils/mapml/layers/TemplatedImageLayer";
import { templatedTileLayer } from "../utils/mapml/layers/TemplatedTileLayer";
import { templatedFeaturesOrTilesLayer } from "../utils/mapml/layers/TemplatedFeaturesOrTilesLayer";
import { templatedPMTilesLayer } from "../utils/mapml/layers/TemplatedPMTilesLayer";
export class MapLink {
    el;
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
        if (oldValue !== newValue) {
            // Handle side effects if needed
        }
    }
    relChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            // Handle side effects
        }
    }
    hrefChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            // Handle side effects
        }
    }
    hreflangChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            // Handle side effects
        }
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
        if (oldValue !== newValue) {
            // Handle side effects
        }
    }
    projectionChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            // Handle side effects
        }
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
            case 'license':
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
            default:
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
                    default:
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
                    default:
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
            bnds = Util.boundsToPCRSBounds(bounds(point(+content[`top-left-${axes[0]}`], +content[`top-left-${axes[1]}`]), point(+content[`bottom-right-${axes[0]}`], +content[`bottom-right-${axes[1]}`])), zoom, projection, cs);
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
        const mapBounds = bounds(point(xmin, ymin), point(xmax, ymax));
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
        const newBounds = bounds(point(xmin, ymin), point(xmax, ymax));
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
            DomEvent.stop(e);
            layerEl.dispatchEvent(new CustomEvent('changestyle', {
                detail: {
                    src: e.target.getAttribute('data-href')
                }
            }));
        };
        const styleOption = document.createElement('div');
        const styleOptionInput = styleOption.appendChild(document.createElement('input'));
        styleOptionInput.setAttribute('type', 'radio');
        styleOptionInput.setAttribute('id', 'rad-' + stamp(styleOptionInput));
        styleOptionInput.setAttribute('name', 'styles-' + stamp(styleOption));
        styleOptionInput.setAttribute('value', this.el.getAttribute('title'));
        styleOptionInput.setAttribute('data-href', new URL(this.href, this.getBase()).href);
        const styleOptionLabel = styleOption.appendChild(document.createElement('label'));
        styleOptionLabel.setAttribute('for', 'rad-' + stamp(styleOptionInput));
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
                return LeafletUtil.template(this.trefValue, obj);
            }
            else if (this.rel === 'tile') {
                return obj;
            }
            else if (this.rel === 'query') {
                // TODO
            }
            else if (this.rel === 'features') {
                // TODO
            }
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
    static get is() { return "map-link"; }
    static get encapsulation() { return "shadow"; }
    static get properties() {
        return {
            "type": {
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
                "attribute": "type"
            },
            "rel": {
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
                "attribute": "rel"
            },
            "href": {
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
                "attribute": "href"
            },
            "hreflang": {
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
                "attribute": "hreflang"
            },
            "tref": {
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
                "attribute": "tref"
            },
            "media": {
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
                "attribute": "media"
            },
            "tms": {
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
                "attribute": "tms"
            },
            "projection": {
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
                "attribute": "projection"
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
                "attribute": "disabled"
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
                        },
                        "MapLink": {
                            "location": "global",
                            "id": "global::MapLink"
                        }
                    },
                    "return": "Promise<void>"
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
                "propName": "type",
                "methodName": "typeChanged"
            }, {
                "propName": "rel",
                "methodName": "relChanged"
            }, {
                "propName": "href",
                "methodName": "hrefChanged"
            }, {
                "propName": "hreflang",
                "methodName": "hreflangChanged"
            }, {
                "propName": "tref",
                "methodName": "trefChanged"
            }, {
                "propName": "media",
                "methodName": "mediaChanged"
            }, {
                "propName": "tms",
                "methodName": "tmsChanged"
            }, {
                "propName": "projection",
                "methodName": "projectionChanged"
            }, {
                "propName": "disabled",
                "methodName": "disabledChanged"
            }];
    }
}
//# sourceMappingURL=map-link.js.map
