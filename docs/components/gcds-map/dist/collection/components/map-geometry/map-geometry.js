import { h } from "@stencil/core";
export class MapGeometry {
    el;
    cs;
    csChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            // Handle side effects if needed
        }
    }
    connectedCallback() {
        // Publish cs getter/setter on element for MapML compatibility
        Object.defineProperty(this.el, 'cs', {
            get: () => this.el.getAttribute('cs'),
            set: (val) => {
                if (['tcrs', 'tilematrix', 'pcrs', 'gcrs', 'map', 'tile'].includes(val)) {
                    this.cs = val;
                }
            },
            configurable: true,
            enumerable: true
        });
    }
    render() {
        return h("slot", { key: '419b5956ada9cc1d59880ed9168b1d539301ff85' });
    }
    static get is() { return "map-geometry"; }
    static get properties() {
        return {
            "cs": {
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
                "attribute": "cs"
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "cs",
                "methodName": "csChanged"
            }];
    }
}
//# sourceMappingURL=map-geometry.js.map
