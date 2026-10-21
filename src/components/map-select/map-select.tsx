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
import { Component, Prop, Element, Watch, Method } from '@stencil/core';

@Component({
  tag: 'map-select',
  shadow: false
})
export class MapSelect {
  @Element() el: HTMLElement;

  @Prop({ reflect: true }) name?: string;

  selectDetails?: HTMLElement;
  htmlSelect?: HTMLSelectElement;

  connectedCallback() {
    this._createLayerControlForSelect();
    // Publish as lowercase to match MapML source compatibility
    (this.el as any).selectdetails = this.selectDetails;
    (this.el as any).htmlselect = this.htmlSelect;
  }

  disconnectedCallback() {}

  @Watch('name')
  nameChanged(newValue: string, oldValue: string) {
    if (oldValue !== newValue) {
      // handle side effects if needed
    }
  }

  private _createLayerControlForSelect() {
    this.htmlSelect = this.transcribe();
    const selectdetails = document.createElement('details');
    selectdetails.className = 'mapml-layer-item-details mapml-control-layers';
    const selectsummary = document.createElement('summary');
    const selectSummaryLabel = document.createElement('label');
    selectSummaryLabel.innerText = this.name || '';
    if (this.el.hasAttribute('id')) selectSummaryLabel.setAttribute('for', this.el.getAttribute('id'));
    selectsummary.appendChild(selectSummaryLabel);
    selectdetails.appendChild(selectsummary);
    selectdetails.appendChild(this.htmlSelect);
    this.selectDetails = selectdetails;
    // Add change event listener to trigger redraw
    this.htmlSelect.addEventListener('change', () => {
      (this.el.parentElement as any)?._extentLayer?.redraw?.();
    });
  }

  private transcribe(): HTMLSelectElement {
    const select = document.createElement('select');
    const elementAttrNames = this.el.getAttributeNames();
    for (let i = 0; i < elementAttrNames.length; i++) {
      select.setAttribute(elementAttrNames[i], this.el.getAttribute(elementAttrNames[i])!);
    }
    // Use querySelectorAll to get actual DOM children (this.el.children is a FakeNodeList in Stencil)
    const options = this.el.querySelectorAll('map-option');
    for (let i = 0; i < options.length; i++) {
      const option = document.createElement('option');
      const optionAttrNames = options[i].getAttributeNames();
      for (let j = 0; j < optionAttrNames.length; j++) {
        option.setAttribute(optionAttrNames[j], options[i].getAttribute(optionAttrNames[j])!);
      }
      // textContent (not innerHTML) so that a malicious option body
      // cannot inject markup into the layer control.
      option.textContent = options[i].textContent;
      select.appendChild(option);
    }
    return select;
  }

  @Method()
  async whenReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      let interval: any, failureTimer: any;
      if (this.selectDetails) {
        resolve();
      } else {
        const selectElement = this;
        interval = setInterval(testForSelect, 300, selectElement);
        failureTimer = setTimeout(selectNotDefined, 10000);
      }
      function testForSelect(selectElement: MapSelect) {
        if (selectElement.selectDetails) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        } else if (!selectElement.el.isConnected) {
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
}
