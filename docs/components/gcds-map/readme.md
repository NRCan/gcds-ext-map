# `<gcds-map>`

A Government of Canada Design System (GCDS) plugin component that provides an accessible, standards-based web map viewer using [MapML](https://maps4html.org/web-map-doc/).  The main (only?) difference between this component and that documentation is the name of the root map viewer element: `<gcds-map>`

## Installation

```bash
npm install @cdssnc/gcds-map
```

### Peer Dependencies

This component requires the following peer dependencies:

```json
{
  "@cdssnc/gcds-components": "^x.x.x",
}
```

## Usage

### Basic Example

```html
<gcds-map projection="OSMTILE" lat="45.4215" lon="-75.6972" zoom="10">
  <map-layer checked src="https://geogratis.gc.ca/mapml/en/osmtile/osm/"></map-layer>
</gcds-map>
```

### With Multiple Layers

```html
<gcds-map projection="CBMTILE" lat="60.0" lon="-95.0" zoom="3" controls="true">
  <map-layer checked src="https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/"></map-layer>
  <map-layer src="https://example.com/overlay.mapml" opacity="0.7"></map-layer>
</gcds-map>
```

## Components

### gcds-map

The <gcds-map> component replaces the [MapML viewer](https://maps4html.org/web-map-doc/) for use in the GC Design System.

#### Attributes

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `projection` | `string` | `'OSMTILE'` | The coordinate reference system for the map (OSMTILE, CBMTILE, WGS84, APSTILE) |
| `lat` | `number` | - | Initial latitude center of the map |
| `lon` | `number` | - | Initial longitude center of the map |
| `zoom` | `number` | - | Initial zoom level |
| `controls` | `boolean` | `true` | Show/hide map controls |
| `controlslist` | `string` | - | Space-separated list of controls to show/hide |
| `width` | `string` | `'300px'` | Width of the map |
| `height` | `string` | `'150px'` | Height of the map |
| `static` | `boolean` | `false` | If `true` disables keyboard and pointer interaction with the map | 

### map-layer

Represents a map layer to be displayed on the map.  See [detailed documentation](https://maps4html.org/web-map-doc/docs/elements/layer/) for information about how to use this and other MapML elements.

#### Attributes

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `checked` | `boolean` | `false` | Whether the layer is visible |
| `src` | `string` | - | URL to the MapML document |
| `label` | `string` | - | Label for the layer in the layer control, if not specified by a remote MapML document |
| `hidden` | `string` | `false` | Whether the layer is included in the layer control |
| `media` | `string` | - | A map media query that controls [the presence](https://maps4html.org/web-map-doc/docs/elements/layer/#media) of the layer on the map |
| `opacity` | `string` | - | Opacity of the layer (0-1 in .1 increments) |

## Architecture

The `<gcds-map>` component replaces the usage of the `<mapml-viewer>` element. See the [documentation](https://maps4html.org/web-map-doc/) for how to use the `<mapml-viewer>`; in GCDS, you can **only** use `<gcds-map>` in its place. Light DOM `<map-layer>` children may create their own shadow roots with remote content, if the layer has a `src` attribute. Otherwise, light DOM MapML (custom element) children of `<map-layer>` are rendered according to the documentation.

## Development

### Building

```bash
npm install
npm run build && npm run start
```

### Testing

```bash
npm test
```

### Storybook

```bash
npm run build && npm run build-storybook && npm run storybook
```

## Accessibility

The `<gcds-map>` component includes several accessibility features:
- Keyboard navigation
- Screen reader support
- ARIA labels and descriptions
- Focus management

If you notice things that could be improved, please [open an issue](./issues/new).

## Browser Support

This component supports all browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES2017

## License

MIT License
