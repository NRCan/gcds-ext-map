import { p as proxyCustomElement, H } from './index.js';

const MapProperties = /*@__PURE__*/ proxyCustomElement(class MapProperties extends H {
    render() {
        return null;
    }
    connectedCallback() {
        this.textContent = this.render();
    }
    static get is() { return "map-properties"; }
}, [257, "map-properties"]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-properties"];
    components.forEach(tagName => { switch (tagName) {
        case "map-properties":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapProperties);
            }
            break;
    } });
}
defineCustomElement();

export { MapProperties };
//# sourceMappingURL=map-properties.js.map

//# sourceMappingURL=map-properties.js.map