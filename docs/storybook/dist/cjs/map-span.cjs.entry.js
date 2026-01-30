'use strict';

var ContextMenu = require('./index-CvEoZNXZ.js');

const MapSpan = class {
    constructor(hostRef) {
        ContextMenu.registerInstance(this, hostRef);
    }
    get el() { return ContextMenu.getElement(this); }
    connectedCallback() { }
    disconnectedCallback() { }
};

exports.map_span = MapSpan;
//# sourceMappingURL=map-span.entry.cjs.js.map
