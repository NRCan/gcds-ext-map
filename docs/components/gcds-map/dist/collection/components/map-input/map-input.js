import { Util } from "../utils/mapml/Util";
import { ZoomInput } from "../utils/mapml/elementSupport/inputs/zoomInput";
import { HiddenInput } from "../utils/mapml/elementSupport/inputs/hiddenInput";
import { WidthInput } from "../utils/mapml/elementSupport/inputs/widthInput";
import { HeightInput } from "../utils/mapml/elementSupport/inputs/heightInput";
import { LocationInput } from "../utils/mapml/elementSupport/inputs/locationInput";
export class MapInput {
    el;
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
    static get is() { return "map-input"; }
    static get properties() {
        return {
            "name": {
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
                "attribute": "name"
            },
            "type": {
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
                "attribute": "type"
            },
            "value": {
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
                "attribute": "value"
            },
            "axis": {
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
                "attribute": "axis"
            },
            "units": {
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
                "attribute": "units"
            },
            "position": {
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
                "attribute": "position"
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
            "min": {
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
                "attribute": "min"
            },
            "max": {
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
                "attribute": "max"
            },
            "step": {
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
                "attribute": "step"
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
                        "MapInput": {
                            "location": "global",
                            "id": "global::MapInput"
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
}
//# sourceMappingURL=map-input.js.map
