import { p as proxyCustomElement, H } from './index.js';

const MapSelect$1 = /*@__PURE__*/ proxyCustomElement(class MapSelect extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
    }
    get el() { return this; }
    name;
    selectDetails;
    htmlSelect;
    connectedCallback() {
        this._createLayerControlForSelect();
        // Publish as lowercase to match MapML source compatibility
        this.el.selectdetails = this.selectDetails;
        this.el.htmlselect = this.htmlSelect;
    }
    disconnectedCallback() { }
    nameChanged(newValue, oldValue) {
    }
    _createLayerControlForSelect() {
        this.htmlSelect = this.transcribe();
        const selectdetails = document.createElement('details');
        selectdetails.className = 'mapml-layer-item-details mapml-control-layers';
        const selectsummary = document.createElement('summary');
        const selectSummaryLabel = document.createElement('label');
        selectSummaryLabel.innerText = this.name || '';
        if (this.el.hasAttribute('id'))
            selectSummaryLabel.setAttribute('for', this.el.getAttribute('id'));
        selectsummary.appendChild(selectSummaryLabel);
        selectdetails.appendChild(selectsummary);
        selectdetails.appendChild(this.htmlSelect);
        this.selectDetails = selectdetails;
        // Add change event listener to trigger redraw
        this.htmlSelect.addEventListener('change', () => {
            this.el.parentElement?._extentLayer?.redraw?.();
        });
    }
    transcribe() {
        const select = document.createElement('select');
        const elementAttrNames = this.el.getAttributeNames();
        for (let i = 0; i < elementAttrNames.length; i++) {
            select.setAttribute(elementAttrNames[i], this.el.getAttribute(elementAttrNames[i]));
        }
        // Use querySelectorAll to get actual DOM children (this.el.children is a FakeNodeList in Stencil)
        const options = this.el.querySelectorAll('map-option');
        for (let i = 0; i < options.length; i++) {
            const option = document.createElement('option');
            const optionAttrNames = options[i].getAttributeNames();
            for (let j = 0; j < optionAttrNames.length; j++) {
                option.setAttribute(optionAttrNames[j], options[i].getAttribute(optionAttrNames[j]));
            }
            option.innerHTML = options[i].innerHTML;
            select.appendChild(option);
        }
        return select;
    }
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer;
            if (this.selectDetails) {
                resolve();
            }
            else {
                const selectElement = this;
                interval = setInterval(testForSelect, 300, selectElement);
                failureTimer = setTimeout(selectNotDefined, 10000);
            }
            function testForSelect(selectElement) {
                if (selectElement.selectDetails) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
                else if (!selectElement.el.isConnected) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    reject('map-select was disconnected while waiting to be ready');
                }
            }
            function selectNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for map-select to be ready');
            }
        });
    }
    render() {
        // Render the details/summary/select structure
        return null;
    }
    static get watchers() { return {
        "name": ["nameChanged"]
    }; }
}, [256, "map-select", {
        "name": [513],
        "whenReady": [64]
    }, undefined, {
        "name": ["nameChanged"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["map-select"];
    components.forEach(tagName => { switch (tagName) {
        case "map-select":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MapSelect$1);
            }
            break;
    } });
}
defineCustomElement$1();

const MapSelect = MapSelect$1;
const defineCustomElement = defineCustomElement$1;

export { MapSelect, defineCustomElement };
//# sourceMappingURL=map-select.js.map

//# sourceMappingURL=map-select.js.map