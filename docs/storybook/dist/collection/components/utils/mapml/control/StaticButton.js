import { Control, DomUtil, DomEvent } from 'leaflet';

// Material Symbols `lock` (static ON — map interaction is frozen).
const LOCK_SVG =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960" fill="currentColor">' +
  '<path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/>' +
  '</svg>';

// Material Symbols `lock_open` (static OFF — map is interactive).
const LOCK_OPEN_SVG =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960" fill="currentColor">' +
  '<path d="M240-160h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM240-160v-400 400Zm0 80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h280v-80q0-83 58.5-141.5T720-920q83 0 141.5 58.5T920-720h-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80h120q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Z"/>' +
  '</svg>';

export var StaticButton = Control.extend({
  options: {
    position: 'topright'
  },
  _getLocale: function (map) {
    return map.options.mapEl && map.options.mapEl.locale
      ? map.options.mapEl.locale
      : M.options.locale;
  },
  onAdd: function (map) {
    this._mapEl = map.options.mapEl;
    this._locale = this._getLocale(map);
    let container = DomUtil.create('div', 'mapml-static-control leaflet-bar');

    let button = DomUtil.create(
      'button',
      'mapml-static-button mapml-button',
      container
    );
    button.setAttribute('type', 'button');
    this._button = button;

    DomEvent.disableClickPropagation(button);
    DomEvent.on(button, 'click', DomEvent.stop);
    DomEvent.on(button, 'click', this._toggleStatic, this);

    // Reflect programmatic / attribute-driven changes to the viewer's
    // `static` attribute back onto the button.
    this._staticObserver = new MutationObserver(() => this._updateButton());
    this._staticObserver.observe(this._mapEl, {
      attributes: true,
      attributeFilter: ['static']
    });

    this._updateButton();

    return container;
  },

  onRemove: function (map) {
    if (this._staticObserver) {
      this._staticObserver.disconnect();
      delete this._staticObserver;
    }
  },

  // Drive the viewer through its public `static` setter; the viewer's
  // attribute observer owns disabling the interaction handlers + zoom control.
  _toggleStatic: function () {
    this._mapEl.static = !this._mapEl.static;
  },

  _updateButton: function () {
    let isStatic = this._mapEl.hasAttribute('static');
    let label = this._locale.btnStatic || 'Toggle static map';
    this._button.title = label;
    this._button.setAttribute('aria-label', label);
    this._button.setAttribute('aria-pressed', String(isStatic));
    this._button.innerHTML = isStatic ? LOCK_SVG : LOCK_OPEN_SVG;
  }
});

export var staticButton = function (options) {
  return new StaticButton(options);
};
