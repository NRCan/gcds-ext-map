import { p as proxyCustomElement, H } from './index.js';

const MapFeaturecaption = /*@__PURE__*/ proxyCustomElement(class MapFeaturecaption extends H {
    render() {
        return null;
    }
    connectedCallback() {
        this.textContent = this.render();
    }
    static get is() { return "map-featurecaption"; }
}, [256, "map-featurecaption"]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-featurecaption"];
    components.forEach(tagName => { switch (tagName) {
        case "map-featurecaption":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapFeaturecaption);
            }
            break;
    } });
}
defineCustomElement();

export { MapFeaturecaption };
//# sourceMappingURL=map-featurecaption.js.map

//# sourceMappingURL=map-featurecaption.js.map