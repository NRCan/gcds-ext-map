---
name: gcds-ext-map-markup
metadata:
  package: "@gcds-extensions/map"
description: Tells you how to correctly create and edit the markup for a <gcds-ext-map> element. Use it when generating MapML output markup in an HTML page.
---

The `<gcds-ext-map>` element is the main element you can use to put a custom Web map on your page.  To create a (really) simple Web map, you might use it like this:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A Simple Web Map[tm]</title>
  <script type="module" src="node_modules/@gcds-extensions/map/dist/gcds-ext-map/gcds-ext-map.esm.js"></script>
  <style>
    html, body {
    height: 100%; /* These styles are required if you wish to use a % based
                     height value on the gcds-ext-map element. */
    }
  </style>
</head>
<body>
  <gcds-ext-map projection="OSMTILE" zoom="0" lat="0.0" lon="0.0" controls>
    <map-caption>It is a best practice to include a map caption</map-caption>
    <map-layer label="OpenStreetMap" src="node_modules/@gcds-extensions/map/dist/gcds-ext-map/assets/mapml/en/osmtile/osm" checked></map-layer>
  </gcds-ext-map>
</body>
</html>    
```

Note that for the above example to run properly on your own site, you need to install the `<gcds-ext-map>` package (`npm install @gcds-extensions/map`), which places the component's code and its bundled base map assets under `node_modules/@gcds-extensions/map/dist/gcds-ext-map/`. The example above references both the component script and a bundled OpenStreetMap base map layer (`.../assets/mapml/en/osmtile/osm`) using paths relative to a page served from your project root. Your own site's paths will depend on how you structure and serve your folders. Using the bundled assets (rather than a remote URL) keeps the map working offline and avoids cross-origin restrictions.

`<gcds-ext-map>` is an "[autonomous custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)" in HTML.  You can distinguish an autonomous custom element from a "native" HTML element by the "-" anywhere in the element name. Autonomous custom elements are supported by all modern browsers, but don't work in old browsers (e.g. Internet Explorer and old Edge).

The `<gcds-ext-map>` element has several attributes to control the presentation and initial location of the map.  

## Attributes

### `projection`

`projection` - an enumerated attribute. Case-sensitive values are: "`OSMTILE`", "`WGS84`", "`CBMTILE`" and "`APSTILE`".  
The default projection is `OSMTILE`.

  - `OSMTILE` corresponds to the widely-used "Web Mercator" projected coordinate reference system, implying a "tile pyramid" zoom range from 0 to 23 (minimum tile size ~2.4m).

  - `WGS84` provides an implementation of the "pseudo plate carrée" projected coordinate reference system, wherein the easting and northing axis units are decimal degrees (not meters). In `WGS84`, zoom level 0 contains two tiles that each cover a hemisphere of Earth's surface. `WGS84` is defined with 21 zoom levels (0 to 20).  

  - `CBMTILE` is the de facto standard grid layout for the Canadian Geospatial Data Infrastructure (CGDI), defined by Natural Resources Canada, and is based on the Lambert Conformal Conic projection (EPSG:3978). Zoom levels are based on a numeric map scale denominator (e.g. 10000 corresponding to a map scale of 1:10,000), with a particular pixel resolution selected, and as a result, successive zoom levels' tiles do not nest exactly (as they do in `OSMTILE`, `WGS84` and `APSTILE`). 

  - `APSTILE` is based on the Alaska Polar Stereographic (EPSG:5936) projected coordinate reference system, and has 20 zoom levels (0 to 19).

  - other projections are possible, using the [Custom Projections API](../../api/gcds-ext-map-api/#definecustomprojectionoptions).

---

### `zoom`

`zoom` - a non-negative integer.  The value establishes the _initial_ zoom level of the map, and is required. The value is updated when the map stops moving. For a smaller scale view of the world, use a lower value.  Use larger values for larger scales (smaller area maps). The maximum value depends on the particular `projection` and data source. Many map data sources have limited zoom levels available.

---

### `lat`

`lat` - a real number latitude. The value establishes the _initial_ latitude of the of the center of the map, and is required. The value is updated when the map stops moving. Latitudes on Earth range from -90.0 (south) to 90.0 (north).  Many projections are not able to display all latitudes, and most projections have a limited range of locations where distortion is controlled or limited. In particular, OSMTILE (Web Mercator) can only display content between the latitude range -84 to 84.

---

### `lon`

`lon` - a real number longitude. The value establishes the _initial_ longitude of the of the center of the map, and is required. The value is updated when the map stops moving. Longitudes on Earth range from -180.0 (west) to 180.0 (east). Similar comments related to distortion apply to those for latitude. Be careful, this attribute is named "lon" NOT "long", and if you use "long" your map won't work properly.

---

### `controls`

`controls` - a "boolean" attribute. Turns map controls on (if present) or off (if omitted). In HTML "boolean" attributes don't have values of "true" or "false" per se - they have the implied value of "true" if the attribute exists, and an implied value of "false" if the attribute is not present.  Sometimes the default map controls may not be useful for your map, so you may turn them off and design your own.

---

### `controlslist`

`controlslist` - an enumerated attribute, possible values are: "`nofullscreen`", "`nolayer`", "`noreload`", "`noscale`", "`nozoom`", "`geolocation`", "`search`" and "`static`".  The `no*` tokens let you prune the set of controls automatically presented (when you have used the `controls` boolean attribute), while unlike the `no*` tokens (which hide default controls), the `geolocation`, `search` and `static` tokens are **opt-in**. `geolocation`, `search` and `static` add location, search and static controls to the map, respectively. The search control is `disabled` by default, and becomes enabled only when at least one `checked` [`<map-layer>`](../layer/) contains a [`<map-link rel="search">`](../link/) element.

---

### `height`

`height` - the height of the map, in pixels. Must be an integer without a unit.

---

### `width`

`width` - the width of the map, in pixels. Must be an integer without a unit.

---

### `static`

`static` - a "boolean" attribute. It disables the keyboard interaction, and the zooming and dragging features with the map when it is 
present. When it is not present or removed, these features are enabled again.  A lock control button can be added to the top-right controls area (just below the layer control) 
by specifying the `static` token value for the `controlslist` attribute or `controlsList` 
DOMTokenList property.
