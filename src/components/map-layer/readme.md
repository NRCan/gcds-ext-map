# map-layer Component

Refactored from MapML.js `src/map-layer.js` and `layer.js`.

## Overview

The `map-layer` component represents a layer in a MapML map. It extends the `BaseLayerElement` functionality and provides:

- Layer content loading (local or remote via `src`)
- Layer visibility and opacity controls
- Media query support for responsive layers
- Integration with map layer controls

## Usage

```html
<!-- Basic layer -->
<map-layer label="My Layer" checked>
  <!-- Local MapML content -->
  <map-feature>...</map-feature>
</map-layer>

<!-- Remote layer -->
<map-layer src="https://example.com/layer.mapml" label="Remote Layer" checked></map-layer>

<!-- Layer with opacity -->
<map-layer src="layer.mapml" label="Semi-transparent" opacity="0.5" checked></map-layer>

<!-- Responsive layer -->
<map-layer src="mobile.mapml" media="(max-width: 768px)" label="Mobile Layer" checked></map-layer>
```

## Integration with gcds-map

The `map-layer` component must be used within a `gcds-map` component:

```html
<gcds-map lat="45.4215" lon="-75.6972" zoom="10" projection="OSMTILE" controls>
  <map-layer src="canada-base.mapml" label="Canada Base" checked></map-layer>
  <map-layer src="population.mapml" label="Population Data" opacity="0.7"></map-layer>
</gcds-map>
```

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type      | Default     |
| ---------- | ---------- | ----------- | --------- | ----------- |
| `_opacity` | `_opacity` |             | `number`  | `undefined` |
| `checked`  | `checked`  |             | `boolean` | `undefined` |
| `hidden`   | `hidden`   |             | `boolean` | `false`     |
| `media`    | `media`    |             | `string`  | `undefined` |
| `opacity`  | `opacity`  |             | `number`  | `1`         |
| `src`      | `src`      |             | `string`  | `undefined` |


## Methods

### `whenElemsReady() => Promise<PromiseSettledResult<unknown>[]>`

Wait for all map-extent and map-feature elements to be ready.
Returns a promise that resolves when all are settled.

#### Returns

Type: `Promise<PromiseSettledResult<unknown>[]>`



### `whenReady() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
