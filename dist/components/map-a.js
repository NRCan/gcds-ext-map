import { p as proxyCustomElement, H } from './index.js';

const MapA$1 = /*@__PURE__*/ proxyCustomElement(class MapA extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
    }
    get el() { return this; }
    href;
    target;
    type;
    inplace;
}, [0, "map-a", {
        "href": [513],
        "target": [513],
        "type": [513],
        "inplace": [516]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-a"];
    components.forEach(tagName => { switch (tagName) {
        case "map-a":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapA$1);
            }
            break;
    } });
}
defineCustomElement$1();

const MapA = MapA$1;
const defineCustomElement = defineCustomElement$1;

export { MapA, defineCustomElement };
//# sourceMappingURL=map-a.js.map

//# sourceMappingURL=map-a.js.map