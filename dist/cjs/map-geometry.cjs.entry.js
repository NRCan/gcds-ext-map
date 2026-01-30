'use strict';

var ContextMenu = require('./index-CvEoZNXZ.js');

const MapGeometry = class {
    constructor(hostRef) {
        ContextMenu.registerInstance(this, hostRef);
    }
    get el() { return ContextMenu.getElement(this); }
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
        return ContextMenu.h("slot", { key: '419b5956ada9cc1d59880ed9168b1d539301ff85' });
    }
    static get watchers() { return {
        "cs": ["csChanged"]
    }; }
};

exports.map_geometry = MapGeometry;
//# sourceMappingURL=map-geometry.entry.cjs.js.map
