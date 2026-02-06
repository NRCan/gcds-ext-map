import { r as registerInstance, a as getElement, h } from './index-PZrWUcjo.js';

const MapGeometry = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
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
};

export { MapGeometry as map_geometry };
//# sourceMappingURL=map-geometry.entry.js.map
