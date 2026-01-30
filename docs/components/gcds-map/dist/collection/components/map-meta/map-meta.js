export class MapMeta {
    el;
    name;
    content;
    nameChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            // handle side effects if needed
        }
    }
    contentChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            // handle side effects if needed
        }
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
    static get is() { return "map-meta"; }
    static get properties() {
        return {
            "name": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "name"
            },
            "content": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "content"
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "name",
                "methodName": "nameChanged"
            }, {
                "propName": "content",
                "methodName": "contentChanged"
            }];
    }
}
//# sourceMappingURL=map-meta.js.map
