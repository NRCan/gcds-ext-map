import { p as proxyCustomElement, H } from './index.js';

const MapSpan = /*@__PURE__*/ proxyCustomElement(class MapSpan extends H {
    get el() { return this; }
    connectedCallback() { }
    disconnectedCallback() { }
    static get is() { return "map-span"; }
}, [0, "map-span"]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-span"];
    components.forEach(tagName => { switch (tagName) {
        case "map-span":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapSpan);
            }
            break;
    } });
}
defineCustomElement();

export { MapSpan };
//# sourceMappingURL=map-span.js.map

//# sourceMappingURL=map-span.js.map