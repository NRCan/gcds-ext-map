import { r as registerInstance, a as getElement } from './index-PZrWUcjo.js';

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
        "name": ["nameChanged"],
        "content": ["contentChanged"]
    }; }
};

export { MapMeta as map_meta };
//# sourceMappingURL=map-meta.entry.js.map
