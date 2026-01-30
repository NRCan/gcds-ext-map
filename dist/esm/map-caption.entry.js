import { r as registerInstance, a as getElement } from './index-PZrWUcjo.js';

const MapCaption = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
    observer;
    connectedCallback() {
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
};

export { MapCaption as map_caption };
//# sourceMappingURL=map-caption.entry.js.map
