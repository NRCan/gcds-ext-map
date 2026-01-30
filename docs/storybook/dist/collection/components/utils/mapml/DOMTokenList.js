// Export the class directly as DOMTokenList for easy use
export class CustomDOMTokenList {
    // Private properties using TypeScript private fields
    element;
    valueSet;
    attribute;
    domain;
    domtokenlist;
    constructor(initialValue, element, attribute, domain) {
        // create donor/host div to extract DomTokenList from
        const hostingElement = document.createElement('div');
        this.domtokenlist = hostingElement.classList;
        // to check if value is being set, protects from infinite recursion
        // from attributeChangedCallback of mapml-viewer and web-map
        this.valueSet = false;
        this.domtokenlist.value = initialValue ?? '';
        this.element = element;
        this.attribute = attribute;
        this.domain = domain;
    }
    get isValueSet() {
        return this.valueSet;
    }
    get length() {
        return this.domtokenlist.length;
    }
    get value() {
        return this.domtokenlist.value;
    }
    set value(val) {
        if (val === null) {
            // when attribute is being removed
            this.domtokenlist.value = '';
        }
        else {
            this.domtokenlist.value = val.toLowerCase();
            this.valueSet = true;
            this.element.setAttribute(this.attribute, this.domtokenlist.value);
            this.valueSet = false;
        }
    }
    item(index) {
        return this.domtokenlist.item(index);
    }
    contains(token) {
        return this.domtokenlist.contains(token);
    }
    // Modified default behavior
    add(token) {
        this.domtokenlist.add(token);
        this.element.setAttribute(this.attribute, this.domtokenlist.value);
    }
    // Modified default behavior
    remove(token) {
        this.domtokenlist.remove(token);
        this.element.setAttribute(this.attribute, this.domtokenlist.value);
    }
    // Modified default behavior
    replace(oldToken, newToken) {
        const result = this.domtokenlist.replace(oldToken, newToken);
        this.element.setAttribute(this.attribute, this.domtokenlist.value);
        return result;
    }
    // Modified default behavior
    supports(token) {
        return this.domain.includes(token);
    }
    // Modified default behavior
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
    toggle(token, force) {
        const result = this.domtokenlist.toggle(token, force);
        this.element.setAttribute(this.attribute, this.domtokenlist.value);
        return result;
    }
    entries() {
        const tokenList = this.domtokenlist;
        return tokenList.entries ? tokenList.entries() : this._manualEntries();
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/forEach
    forEach(callback, thisArg) {
        if (this.domtokenlist.forEach) {
            this.domtokenlist.forEach((value, key) => callback.call(thisArg, value, key, this));
        }
        else {
            for (let i = 0; i < this.domtokenlist.length; i++) {
                callback.call(thisArg, this.domtokenlist[i], i, this);
            }
        }
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/keys
    keys() {
        const tokenList = this.domtokenlist;
        return tokenList.keys ? tokenList.keys() : this._manualKeys();
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/values
    values() {
        const tokenList = this.domtokenlist;
        return tokenList.values ? tokenList.values() : this._manualValues();
    }
    // Make it iterable
    [Symbol.iterator]() {
        return this.values();
    }
    // Fallback implementations for older browsers
    *_manualEntries() {
        for (let i = 0; i < this.domtokenlist.length; i++) {
            yield [i, this.domtokenlist[i]];
        }
    }
    *_manualKeys() {
        for (let i = 0; i < this.domtokenlist.length; i++) {
            yield i;
        }
    }
    *_manualValues() {
        for (let i = 0; i < this.domtokenlist.length; i++) {
            yield this.domtokenlist[i];
        }
    }
}
// Export for easier import
export { CustomDOMTokenList as DOMTokenList };
export default CustomDOMTokenList;
//# sourceMappingURL=DOMTokenList.js.map
