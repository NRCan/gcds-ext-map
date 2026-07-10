# `<gcds-ext-map>`

A Government of Canada Design System (GCDS) plugin component that provides an accessible, standards-based web map viewer using [MapML](https://maps4html.org/web-map-doc/). The main  difference between this component and that documentation is the name of the root map viewer element: `<gcds-ext-map>`

## Installation

Install and use locally:

```bash
npm install @gcds-extensions/gcds-ext-map
```

## Usage

### Basic Example

```html

<!-- If installed locally, per above, use node_modules folder: -->
      <script type="module" src="/node_modules/@gcds-extensions/gcds-ext-map/dist/gcds-ext-map.esm.js"></script>
      <!-- Optionally, to use the full GCDS component system, also include: -->
      <script type="module" src="/node_modules/@gcds-core/components/dist/gcds/gcds.esm.js"></script>
      <link rel="stylesheet" href="/node_modules/@gcds-core/components/dist/gcds/gcds.css">
<!--
    Else If using a CDN, use the tags below:
      <script type="module" src="https://cdn.design-system.canada.ca/@gcds-extensions/gcds-ext-map@latest/dist/gcds-ext-map.esm.js"></script>
      <link rel="stylesheet" href="https://cdn.design-system.canada.ca/@gcds-core/components@latest/dist/gcds/gcds.css">
      <script type="module" src="https://cdn.design-system.canada.ca/@gcds-core/components@latest/dist/gcds/gcds.esm.js"></script>
-->

<!-- important: use CSS to define the width and height of the map (default size is quite small!) -->
<gcds-ext-map projection="CBMTILE" lat="45.4215" lon="-75.6972" zoom="10" style="width: 60%&height: 400px">
  <map-layer checked>
    <map-title>Canada Base Map - Transportation (CBMT)</map-title>
    <map-link rel="license" href="https://open.canada.ca/en/open-government-licence-canada" title="Open Government Licence - Canada"></map-link>
    <map-link rel="suggestions" tref="https://geolocator.api.geo.ca/?q={searchTerms}&lang=en&keys=geonames"></map-link>
    <map-link rel="search" tref="https://geolocator.api.geo.ca/?q={searchTerms}&lang=en&keys=geonames"></map-link>
    <map-extent units="CBMTILE" checked hidden>
      <map-input name="z" type="zoom" value="22" min="0" max="22"></map-input>
      <map-input name="xmin" type="location" units="pcrs" position="top-left" axis="easting" min="-3262924.7" max="3823954.0"></map-input>
      <map-input name="ymin" type="location" units="pcrs" position="bottom-left" axis="northing" min="-1554977.6" max="4046262.8"></map-input>
      <map-input name="xmax" type="location" units="pcrs" position="top-right" axis="easting" min="-3262924.7" max="3823954.0"></map-input>
      <map-input name="ymax" type="location" units="pcrs" position="top-left" axis="northing" min="-1554977.6" max="4046262.8"></map-input>
      <map-input name="w" type="width"></map-input>
      <map-input name="h" type="height"></map-input>
      <map-link rel="image" tref="https://geogratis.gc.ca/maps/CBMT?SERVICE=WMS&VERSION=1.1.1&SRS=EPSG:3978&LAYERS=CBMT&BBOX={xmin},{ymin},{xmax},{ymax}&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH={w}&HEIGHT={h}&STYLES="></map-link>
    </map-extent>
  </map-layer>
</gcds-ext-map>
```

See [the map components documentation](https://nrcan.github.io/gcds-ext-map/en/components/map-components/) for further usage examples.

## Architecture

The `<gcds-ext-map>` component replaces the usage of the `<mapml-viewer>` element. See the [MapML documentation](https://maps4html.org/web-map-doc/) for how to use MapML. When using GCDS, you must use `<gcds-ext-map>` in place of `<mapml-viewer>` (it supports all the same attributes). All other MapML elements work as described.

`<gcds-ext-map>` and associated MapML children are implemented as Stencil components, like other GCDS components.  `<gcds-ext-map>` is
a self-contained component that renders map content in a shadow root, and does not expose slots for including content besides 
what is rendered on the map.

## Accessibility

The `<gcds-ext-map>` component includes several accessibility features:
- Keyboard navigation
- Screen reader support
- ARIA labels and descriptions
- Focus management

If you notice things that could be improved, please [open an issue](https://github.com/gcds-extensions/gcds-ext-map/issues/new).

## License

MIT License
