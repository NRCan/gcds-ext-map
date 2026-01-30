import { p as proxyCustomElement, H } from './index.js';

const MapMeta$1 = /*@__PURE__*/ proxyCustomElement(class MapMeta extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
    }
    get el() { return this; }
    name;
    content;
    nameChanged(newValue, oldValue) {
    }
    contentChanged(newValue, oldValue) {
    }
    // Validate 'cs' content
    set contentValue(val) {
        if (this.name === 'cs' &&
            val &&
            !['tcrs', 'tilematrix', 'pcrs', 'gcrs', 'map', 'tile'].includes(val)) {
            return;
        }
        this.content = val;
    }
    connectedCallback() { }
    disconnectedCallback() { }
    render() {
        return null;
    }
    static get watchers() { return {
        "name": ["nameChanged"],
        "content": ["contentChanged"]
    }; }
}, [256, "map-meta", {
        "name": [513],
        "content": [513]
    }, undefined, {
        "name": ["nameChanged"],
        "content": ["contentChanged"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-meta"];
    components.forEach(tagName => { switch (tagName) {
        case "map-meta":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapMeta$1);
            }
            break;
    } });
}
defineCustomElement$1();

const MapMeta = MapMeta$1;
const defineCustomElement = defineCustomElement$1;

export { MapMeta, defineCustomElement };
//# sourceMappingURL=map-meta.js.map

//# sourceMappingURL=map-meta.js.map