'use strict';

var ContextMenu = require('./index-CW_WOSnc.js');

const MapFeaturecaption = class {
    constructor(hostRef) {
        ContextMenu.registerInstance(this, hostRef);
    }
    render() {
        return null;
    }
};

exports.map_featurecaption = MapFeaturecaption;
