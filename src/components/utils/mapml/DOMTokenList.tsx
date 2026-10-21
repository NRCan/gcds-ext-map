/*
 * This file includes material copied from or derived from MapML.js
 * <https://github.com/Maps4HTML/MapML.js>.
 * Copyright 2015-2024 Canada Centre for Mapping and Earth Observation,
 * Natural Resources Canada, and the MapML.js contributors.
 * Licensed under the W3C Software and Document License
 * <http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document>.
 * SPDX-License-Identifier: W3C-20150513
 *
 * Modified by Natural Resources Canada for @gcds-extensions/map.
 * See the NOTICE file in the root of this distribution for the full notice,
 * which must be retained in all copies and derivative works.
 */
// Export the class directly as DOMTokenList for easy use
export class CustomDOMTokenList {
  // Private properties using TypeScript private fields
  private element: HTMLElement;
  private valueSet: boolean;
  private attribute: string;
  private domain: string[];
  private domtokenlist: globalThis.DOMTokenList;

  constructor(initialValue: string | null, element: HTMLElement, attribute: string, domain: string[]) {
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

  get isValueSet(): boolean {
    return this.valueSet;
  }

  get length(): number {
    return this.domtokenlist.length;
  }

  get value(): string {
    return this.domtokenlist.value;
  }

  set value(val: string | null) {
    if (val === null) {
      // when attribute is being removed
      this.domtokenlist.value = '';
    } else {
      this.domtokenlist.value = val.toLowerCase();
      this.valueSet = true;
      this.element.setAttribute(this.attribute, this.domtokenlist.value);
      this.valueSet = false;
    }
  }

  item(index: number): string | null {
    return this.domtokenlist.item(index);
  }

  contains(token: string): boolean {
    return this.domtokenlist.contains(token);
  }

  // Modified default behavior
  add(token: string): void {
    this.domtokenlist.add(token);
    this.element.setAttribute(this.attribute, this.domtokenlist.value);
  }

  // Modified default behavior
  remove(token: string): void {
    this.domtokenlist.remove(token);
    this.element.setAttribute(this.attribute, this.domtokenlist.value);
  }

  // Modified default behavior
  replace(oldToken: string, newToken: string): boolean {
    const result = this.domtokenlist.replace(oldToken, newToken);
    this.element.setAttribute(this.attribute, this.domtokenlist.value);
    return result;
  }

  // Modified default behavior
  supports(token: string): boolean {
    return this.domain.includes(token);
  }

  // Modified default behavior
  // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
  toggle(token: string, force?: boolean): boolean {
    const result = this.domtokenlist.toggle(token, force);
    this.element.setAttribute(this.attribute, this.domtokenlist.value);
    return result;
  }

  entries(): IterableIterator<[number, string]> {
    const tokenList = this.domtokenlist as any;
    return tokenList.entries ? tokenList.entries() : this._manualEntries();
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/forEach
  forEach(callback: (value: string, key: number, parent: CustomDOMTokenList) => void, thisArg?: any): void {
    if (this.domtokenlist.forEach) {
      this.domtokenlist.forEach((value, key) => callback.call(thisArg, value, key, this));
    } else {
      for (let i = 0; i < this.domtokenlist.length; i++) {
        callback.call(thisArg, this.domtokenlist[i], i, this);
      }
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/keys
  keys(): IterableIterator<number> {
    const tokenList = this.domtokenlist as any;
    return tokenList.keys ? tokenList.keys() : this._manualKeys();
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/values
  values(): IterableIterator<string> {
    const tokenList = this.domtokenlist as any;
    return tokenList.values ? tokenList.values() : this._manualValues();
  }

  // Make it iterable
  [Symbol.iterator](): IterableIterator<string> {
    return this.values();
  }

  // Fallback implementations for older browsers
  private *_manualEntries(): IterableIterator<[number, string]> {
    for (let i = 0; i < this.domtokenlist.length; i++) {
      yield [i, this.domtokenlist[i]];
    }
  }

  private *_manualKeys(): IterableIterator<number> {
    for (let i = 0; i < this.domtokenlist.length; i++) {
      yield i;
    }
  }

  private *_manualValues(): IterableIterator<string> {
    for (let i = 0; i < this.domtokenlist.length; i++) {
      yield this.domtokenlist[i];
    }
  }

  // Support array-like indexing
  [index: number]: string;
}

// Export for easier import
export { CustomDOMTokenList as DOMTokenList };
export default CustomDOMTokenList;