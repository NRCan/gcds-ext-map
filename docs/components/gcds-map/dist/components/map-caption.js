import { p as proxyCustomElement, H } from './index.js';

const MapCaption = /*@__PURE__*/ proxyCustomElement(class MapCaption extends H {
    get el() { return this; }
    observer;
    connectedCallback() {
        this.textContent = this.render();
        if (this.el.parentElement.nodeName === 'GCDS-MAP') {
            // Wait a tick for Stencil to finish rendering/hydrating the element's content
            setTimeout(() => {
                // Only the first map-caption child should manage the aria-label
                const firstMapCaption = this.el.parentElement.querySelector('map-caption');
                const isFirstCaption = firstMapCaption === this.el;
                if (!isFirstCaption) {
                    // Not the first caption, don't set up observer or aria-label
                    return;
                }
                // calls MutationObserver; needed to observe changes to content between <map-caption> tags and update to aria-label
                let mapcaption = this.el.innerText;
                this.observer = new MutationObserver(() => {
                    let mapcaptionupdate = this.el.innerText;
                    if (mapcaptionupdate !== mapcaption) {
                        this.el.parentElement.setAttribute('aria-label', mapcaptionupdate);
                        mapcaption = mapcaptionupdate;
                    }
                });
                this.observer.observe(this.el, {
                    characterData: true,
                    subtree: true,
                    attributes: true,
                    childList: true
                });
                // don't change aria-label if one already exists from user  (checks when element is first created)
                if (!this.el.parentElement.hasAttribute('aria-label')) {
                    const ariaLabel = this.el.innerText;
                    this.el.parentElement.setAttribute('aria-label', ariaLabel);
                }
            }, 0);
        }
    }
    disconnectedCallback() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
    render() {
        return null;
    }
    static get is() { return "map-caption"; }
}, [256, "map-caption"]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-caption"];
    components.forEach(tagName => { switch (tagName) {
        case "map-caption":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapCaption);
            }
            break;
    } });
}
defineCustomElement();

export { MapCaption };
//# sourceMappingURL=map-caption.js.map

//# sourceMappingURL=map-caption.js.map