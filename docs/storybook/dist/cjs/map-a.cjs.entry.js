'use strict';

var ContextMenu = require('./index-KnvdY5iL.js');

const MapA = class {
    constructor(hostRef) {
        ContextMenu.registerInstance(this, hostRef);
    }
    get el() { return ContextMenu.getElement(this); }
    href;
    target;
    type;
    inplace;
};

exports.map_a = MapA;
