import { Component, Element, Prop, Method } from '@stencil/core';
import { Util } from '../utils/mapml/Util';
import { ZoomInput } from '../utils/mapml/elementSupport/inputs/zoomInput';
import { HiddenInput } from '../utils/mapml/elementSupport/inputs/hiddenInput';
import { WidthInput } from '../utils/mapml/elementSupport/inputs/widthInput';
import { HeightInput } from '../utils/mapml/elementSupport/inputs/heightInput';
import { LocationInput } from '../utils/mapml/elementSupport/inputs/locationInput';

@Component({
  tag: 'map-input',
  shadow: false
})
export class MapInput {
  @Element() el: HTMLElement;

  // Core attributes that can be set on the element
  @Prop({ reflect: true }) name!: string;
  @Prop({ reflect: true }) type!: string;
  @Prop({ reflect: true, mutable: true }) value?: string;
  @Prop({ reflect: true }) axis?: string;
  @Prop({ reflect: true }) units?: string;
  @Prop({ reflect: true }) position?: string;
  @Prop({ reflect: true }) rel?: string;
  @Prop({ reflect: true }) min?: string;
  @Prop({ reflect: true }) max?: string;
  @Prop({ reflect: true }) step?: string;

  // Internal state
  input: any; // Stores the input class instance (ZoomInput, LocationInput, etc.)
  _layer: any;
  initialValue?: number;

  getMapEl() {
    return Util.getClosest(this.el, 'gcds-ext-map');
  }

  getLayerEl() {
    return Util.getClosest(this.el, 'map-layer,layer-');
  }

  async connectedCallback() {
    try {
      // Publish methods on element for MapML compatibility
      (this.el as any).getMapEl = this.getMapEl.bind(this);
      (this.el as any).getLayerEl = this.getLayerEl.bind(this);
      
      // await (this.el.parentElement as any).whenReady();
      // // TODO this might not be necessary, as map-extent doesn't have a _layer property afaik
      // if (this.el.parentElement.nodeName === 'MAP-EXTENT') {
      //   this._layer = (this.el.parentElement as any)._layer;
      // }

      switch (this.type) {
        case 'zoom':
          // this could be a bug, but it's the same bug as the MapML.js zoom input
          this.initialValue = +this.el.getAttribute('value');
          // Publish for MapML compatibility
          (this.el as any).initialValue = this.initialValue;
          this.input = new ZoomInput(
            this.name,
            this.min,
            this.max,
            this.initialValue,
            this.step,
            this._layer
          );
          break;
        case 'location':
          this.input = new LocationInput(
            this.name,
            this.position,
            this.axis,
            this.units,
            this.min,
            this.max,
            this.rel,
            this._layer
          );
          break;
        case 'width':
          this.input = new WidthInput(this.name, this._layer);
          break;
        case 'height':
          this.input = new HeightInput(this.name, this._layer);
          break;
        case 'hidden':
          this.input = new HiddenInput(this.name, this.value);
          break;
      }
    } catch (reason) {
      console.log(reason, '\nin mapInput.connectedCallback');
    }
  }

  disconnectedCallback() {
    // Cleanup if needed
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity
  checkValidity(): boolean {
    if (this.input?.validateInput()) {
      return true;
    } else {
      const evt = new Event('invalid', {
        bubbles: true,
        cancelable: true,
        composed: true
      });
      this.el.dispatchEvent(evt);
      return false;
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/reportValidity
  reportValidity(): boolean {
    if (this.input?.validateInput()) {
      return true;
    } else {
      const evt = new Event('invalid', {
        bubbles: true,
        cancelable: true,
        composed: true
      });
      this.el.dispatchEvent(evt);
      // If the event isn't canceled, report the problem to the user.
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#dom-cva-reportvalidity-dev
      console.log("Input type='" + this.type + "' is not valid!");
      return false;
    }
  }

  @Method()
  async whenReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      let interval: any, failureTimer: any;
      
      if (this.input) {
        resolve();
        return;
      }

      const inputElement = this;
      interval = setInterval(testForInput, 300, inputElement);
      failureTimer = setTimeout(inputNotDefined, 10000);

      function testForInput(inputElement: MapInput) {
        if (inputElement.input) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        } else if (!inputElement.el.isConnected) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          reject('map-input was disconnected while waiting to be ready');
        }
      }

      function inputNotDefined() {
        clearInterval(interval);
        clearTimeout(failureTimer);
        reject('Timeout reached waiting for input to be ready');
      }
    });
  }

  render() {
    return null;
  }
}
