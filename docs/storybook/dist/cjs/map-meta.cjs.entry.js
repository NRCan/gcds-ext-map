'use strict';

var ContextMenu = require('./index-CW_WOSnc.js');

const MapMeta = class {
    constructor(hostRef) {
        ContextMenu.registerInstance(this, hostRef);
    }
    get el() { return ContextMenu.getElement(this); }
    name;
    content;
    nameChanged(newValue, oldValue) {
    }
    contentChanged(newValue, oldValue) {
    }
    // Validate 'cs' content
    set contentValue(val) {
        if (this.name === 'cs' &&
            val &&
            !['tcrs', 'tilematrix', 'pcrs', 'gcrs', 'map', 'tile'].includes(val)) {
            return;
        }
        this.content = val;
    }
    connectedCallback() { }
    disconnectedCallback() { }
    render() {
        return null;
    }
    static get watchers() { return {
        "name": [{
                "nameChanged": 0
            }],
        "content": [{
                "contentChanged": 0
            }]
    }; }
};

exports.map_meta = MapMeta;
