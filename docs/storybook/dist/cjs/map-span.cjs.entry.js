'use strict';

var ContextMenu = require('./index-X9jUT3OZ.js');

const MapSpan = class {
    constructor(hostRef) {
        ContextMenu.registerInstance(this, hostRef);
    }
    get el() { return ContextMenu.getElement(this); }
    connectedCallback() { }
    disconnectedCallback() { }
};

exports.map_span = MapSpan;
