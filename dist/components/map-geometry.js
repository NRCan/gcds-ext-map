import { p as proxyCustomElement, H, h } from './index.js';

const MapGeometry$1 = /*@__PURE__*/ proxyCustomElement(class MapGeometry extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
    }
    get el() { return this; }
    cs;
    csChanged(newValue, oldValue) {
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
    static get watchers() { return {
        "cs": ["csChanged"]
    }; }
}, [260, "map-geometry", {
        "cs": [1537]
    }, undefined, {
        "cs": ["csChanged"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-geometry"];
    components.forEach(tagName => { switch (tagName) {
        case "map-geometry":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapGeometry$1);
            }
            break;
    } });
}
defineCustomElement$1();

const MapGeometry = MapGeometry$1;
const defineCustomElement = defineCustomElement$1;

export { MapGeometry, defineCustomElement };
//# sourceMappingURL=map-geometry.js.map

//# sourceMappingURL=map-geometry.js.map