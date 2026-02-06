import { r as registerInstance, a as getElement } from './index-PZrWUcjo.js';

const MapStyle = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
    media;
    _mql;
    _changeHandler;
    _observer;
    styleElement;
    _stylesheetHost;
    async mediaChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            await this._registerMediaQuery(newValue);
        }
    }
    getMapEl() {
        return window.M?.Util?.getClosest?.(this.el, 'gcds-map') || this.el.closest('gcds-map');
    }
    _connect() {
        this.styleElement = document.createElement('style');
        this.styleElement.mapStyle = this.el;
        this.styleElement.textContent = this.el.textContent;
        this._copyAttributes(this.el, this.styleElement);
        // Expose styleElement as a public property on the element
        Object.defineProperty(this.el, 'styleElement', {
            get: () => this.styleElement,
            configurable: true,
            enumerable: true
        });
        if (!this._stylesheetHost)
            return;
        // Try to render via layer's renderStyles method
        // Note: If layer is not yet ready, the layer will call renderStyles
        // on all map-style children when it finishes initialization
        if (this._stylesheetHost._layer) {
            this._stylesheetHost._layer.renderStyles?.(this.el);
        }
        else if (this._stylesheetHost._templatedLayer) {
            this._stylesheetHost._templatedLayer.renderStyles?.(this.el);
        }
        else if (this._stylesheetHost._extentLayer) {
            this._stylesheetHost._extentLayer.renderStyles?.(this.el);
        }
        this._observer = new MutationObserver(() => {
            this.styleElement.textContent = this.el.textContent;
        });
        this._observer.observe(this.el, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    _disconnect() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = undefined;
        }
        if (this._stylesheetHost && this.styleElement) {
            this.styleElement.remove();
            this.styleElement = undefined;
        }
    }
    _copyAttributes(source, target) {
        Array.from(source.attributes).forEach((attribute) => {
            if (attribute.nodeName !== 'media' && attribute.nodeName !== 'data-testid') {
                target.setAttribute(attribute.nodeName, attribute.nodeValue);
            }
        });
    }
    async _registerMediaQuery(mq) {
        if (!this._changeHandler) {
            this._changeHandler = () => {
                this._disconnect();
                if (this._mql && this._mql.matches) {
                    this._connect();
                }
            };
        }
        if (mq) {
            const map = this.getMapEl();
            if (!map)
                return;
            if (typeof map.whenReady === 'function')
                await map.whenReady();
            if (this._mql) {
                this._mql.removeEventListener('change', this._changeHandler);
            }
            this._mql = map.matchMedia(mq);
            this._changeHandler();
            this._mql.addEventListener('change', this._changeHandler);
        }
        else if (this._mql) {
            this._mql.removeEventListener('change', this._changeHandler);
            this._mql = undefined;
            this._disconnect();
            this._connect();
        }
    }
    async connectedCallback() {
        this._stylesheetHost = this.el.getRootNode() instanceof ShadowRoot
            ? this.el.getRootNode().host
            : this.el.parentElement;
        if (!this._stylesheetHost)
            return;
        if (this.media) {
            await this._registerMediaQuery(this.media);
        }
        else {
            this._connect();
        }
    }
    disconnectedCallback() {
        this._disconnect();
    }
    static get watchers() { return {
        "media": ["mediaChanged"]
    }; }
};

export { MapStyle as map_style };
//# sourceMappingURL=map-style.entry.js.map
