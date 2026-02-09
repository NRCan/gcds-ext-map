import { r as registerInstance, g as getElement } from './index-BUsJ7i5g.js';

const MapMeta = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
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

export { MapMeta as map_meta };
