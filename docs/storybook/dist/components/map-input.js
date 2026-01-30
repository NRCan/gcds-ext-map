import { U as Util, l as leafletSrcExports, p as proxyCustomElement, H } from './index.js';

class ZoomInput {
    name;
    min;
    max;
    value;
    step;
    layer;
    constructor(name, min, max, value, step, layer) {
        this.name = name;
        this.min = min;
        this.max = max;
        this.value = value;
        this.step = step;
        this.layer = layer;
    }
    validateInput() {
        // name is required
        if (!this.name) {
            return false;
        }
        // min and max can not be present
        // fallback would be layer's meta, -> projection min, max
        // don't need value, map-meta max value, -> fallback is max zoom of projection
        // don't need step, defaults to 1
        return true;
    }
    getValue() {
        return this.layer._map.options.mapEl.zoom;
    }
}

class HiddenInput {
    name;
    value;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    validateInput() {
        // name is required
        // value is required
        if (!this.name || !this.value) {
            return false;
        }
        return true;
    }
    getValue() {
        return this.value;
    }
}

class WidthInput {
    name;
    layer;
    constructor(name, layer) {
        this.name = name;
        this.layer = layer;
    }
    validateInput() {
        // name is required
        if (!this.name) {
            return false;
        }
        return true;
    }
    getValue() {
        return this.layer._map.getSize().x;
    }
}

class HeightInput {
    name;
    layer;
    constructor(name, layer) {
        this.name = name;
        this.layer = layer;
    }
    validateInput() {
        // name is required
        if (!this.name) {
            return false;
        }
        return true;
    }
    getValue() {
        return this.layer._map.getSize().y;
    }
}

class LocationInput {
    name;
    position;
    axis;
    units;
    min;
    max;
    rel;
    layer;
    constructor(name, position, axis, units, min, max, rel, layer) {
        this.name = name;
        this.position = position;
        this.axis = axis;
        // if unit/cs not present, find it
        if (!units && axis && !['i', 'j'].includes(axis)) {
            this.units = Util.axisToCS(axis).toLowerCase();
        }
        else {
            this.units = units; // cs
        }
        this.min = min;
        this.max = max;
        this.rel = rel;
        this.layer = layer;
    }
    validateInput() {
        // name is required
        // axis is required
        if (!this.name || !this.axis) {
            return false;
        }
        // cs/units is only required when the axis is i/j. To differentiate between the units/cs
        if ((this.axis === 'i' || this.axis === 'j') &&
            !['map', 'tile'].includes(this.units)) {
            return false;
        }
        // check if axis match the units/cs
        if (this.units) {
            let axisCS = Util.axisToCS(this.axis);
            if (typeof axisCS === 'string' &&
                axisCS.toUpperCase() !== this.units.toUpperCase()) {
                return false;
            }
        }
        // position is not required, will default to top-left
        // min max fallbacks, map-meta -> projection
        // rel not required, default is image/extent
        return true;
    }
    _TCRSToPCRS(coords, zoom) {
        // TCRS pixel point to Projected CRS point (in meters, presumably)
        const map = this.layer._map;
        const crs = map.options.crs;
        const loc = crs.transformation.untransform(coords, crs.scale(zoom));
        return loc;
    }
    getValue(zoom, bounds) {
        // units = cs
        //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting|latitude|longitude">
        if (zoom === undefined)
            zoom = this.layer._map.getZoom();
        if (bounds === undefined)
            bounds = this.layer._map.getPixelBounds();
        if (this.units === 'pcrs' || this.units === 'gcrs') {
            switch (this.axis) {
                case 'longitude':
                case 'easting':
                    if (this.position) {
                        if (this.position.match(/.*?-left/i)) {
                            return this._TCRSToPCRS(bounds.min, zoom).x;
                        }
                        else if (this.position.match(/.*?-right/i)) {
                            return this._TCRSToPCRS(bounds.max, zoom).x;
                        }
                    }
                    else {
                        // position is not required, will default to top-left
                        return this._TCRSToPCRS(bounds.min, zoom).x;
                    }
                    break;
                case 'latitude':
                case 'northing':
                    if (this.position) {
                        if (this.position.match(/top-.*?/i)) {
                            return this._TCRSToPCRS(bounds.min, zoom).y;
                        }
                        else if (this.position.match(/bottom-.*?/i)) {
                            return this._TCRSToPCRS(bounds.max, zoom).y;
                        }
                    }
                    else {
                        // position is not required, will default to top-left
                        return this._TCRSToPCRS(bounds.min, zoom).y;
                    }
                    break;
            }
        }
        else if (this.units === 'tilematrix') {
            // Value is retrieved from the createTile method of TemplatedTileLayer, on move end.
            // Different values for each tile when filling in the map tiles on the map.
            // Currently storing all x,y,z within one object,
            // TODO: change return value as needed based on usage by map-input
            // https://github.com/Leaflet/Leaflet/blob/6994baf25f267db1c8b720c28a61e0700d0aa0e8/src/layer/tile/GridLayer.js#L652
            const center = this.layer._map.getCenter();
            const templatedTileLayer = this.layer._extentLayer._templates[0].layer;
            const pixelBounds = templatedTileLayer._getTiledPixelBounds(center);
            const tileRange = templatedTileLayer._pxBoundsToTileRange(pixelBounds);
            const obj = [];
            for (let j = tileRange.min.y; j <= tileRange.max.y; j++) {
                for (let i = tileRange.min.x; i <= tileRange.max.x; i++) {
                    const coords = new leafletSrcExports.Point(i, j);
                    coords.z = templatedTileLayer._tileZoom;
                    obj.push(coords);
                }
            }
            return obj;
        }
        else ;
        return;
    }
}

const MapInput$1 = /*@__PURE__*/ proxyCustomElement(class MapInput extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
    }
    get el() { return this; }
    // Core attributes that can be set on the element
    name;
    type;
    value;
    axis;
    units;
    position;
    rel;
    min;
    max;
    step;
    // Internal state
    input; // Stores the input class instance (ZoomInput, LocationInput, etc.)
    _layer;
    initialValue;
    getMapEl() {
        return Util.getClosest(this.el, 'gcds-map');
    }
    getLayerEl() {
        return Util.getClosest(this.el, 'map-layer,layer-');
    }
    async connectedCallback() {
        try {
            // Publish methods on element for MapML compatibility
            this.el.getMapEl = this.getMapEl.bind(this);
            this.el.getLayerEl = this.getLayerEl.bind(this);
            // await (this.el.parentElement as any).whenReady();
            // // TODO this might not be necessary, as map-extent doesn't have a _layer property afaik
            // if (this.el.parentElement.nodeName === 'MAP-EXTENT') {
            //   this._layer = (this.el.parentElement as any)._layer;
            // }
            switch (this.type) {
                case 'zoom':
                    // this could be a bug, but it's the same bug as the mapml-source zoom input
                    this.initialValue = +this.el.getAttribute('value');
                    // Publish for MapML compatibility
                    this.el.initialValue = this.initialValue;
                    this.input = new ZoomInput(this.name, this.min, this.max, this.initialValue, this.step, this._layer);
                    break;
                case 'location':
                    this.input = new LocationInput(this.name, this.position, this.axis, this.units, this.min, this.max, this.rel, this._layer);
                    break;
                case 'width':
                    this.input = new WidthInput(this.name, this._layer);
                    break;
                case 'height':
                    this.input = new HeightInput(this.name, this._layer);
                    break;
                case 'hidden':
                    this.input = new HiddenInput(this.name, this.value);
                    break;
            }
        }
        catch (reason) {
            console.log(reason, '\nin mapInput.connectedCallback');
        }
    }
    disconnectedCallback() {
        // Cleanup if needed
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity
    checkValidity() {
        if (this.input?.validateInput()) {
            return true;
        }
        else {
            const evt = new Event('invalid', {
                bubbles: true,
                cancelable: true,
                composed: true
            });
            this.el.dispatchEvent(evt);
            return false;
        }
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/reportValidity
    reportValidity() {
        if (this.input?.validateInput()) {
            return true;
        }
        else {
            const evt = new Event('invalid', {
                bubbles: true,
                cancelable: true,
                composed: true
            });
            this.el.dispatchEvent(evt);
            // If the event isn't canceled, report the problem to the user.
            // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#dom-cva-reportvalidity-dev
            console.log("Input type='" + this.type + "' is not valid!");
            return false;
        }
    }
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer;
            if (this.input) {
                resolve();
                return;
            }
            const inputElement = this;
            interval = setInterval(testForInput, 300, inputElement);
            failureTimer = setTimeout(inputNotDefined, 10000);
            function testForInput(inputElement) {
                if (inputElement.input) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
                else if (!inputElement.el.isConnected) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    reject('map-input was disconnected while waiting to be ready');
                }
            }
            function inputNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for input to be ready');
            }
        });
    }
    render() {
        return null;
    }
}, [256, "map-input", {
        "name": [513],
        "type": [513],
        "value": [1537],
        "axis": [513],
        "units": [513],
        "position": [513],
        "rel": [513],
        "min": [513],
        "max": [513],
        "step": [513],
        "whenReady": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-input"];
    components.forEach(tagName => { switch (tagName) {
        case "map-input":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapInput$1);
            }
            break;
    } });
}
defineCustomElement$1();

const MapInput = MapInput$1;
const defineCustomElement = defineCustomElement$1;

export { MapInput, defineCustomElement };
//# sourceMappingURL=map-input.js.map

//# sourceMappingURL=map-input.js.map