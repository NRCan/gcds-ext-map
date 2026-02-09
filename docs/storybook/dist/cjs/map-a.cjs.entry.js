'use strict';

var ContextMenu = require('./index-CW_WOSnc.js');

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
