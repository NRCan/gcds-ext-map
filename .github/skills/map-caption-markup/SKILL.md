---
name: map-caption-markup
metadata:
  package: "@gcds-extensions/map"
description: Tells you how to correctly create and edit the markup for a <map-caption> element. Use it when generating MapML output markup in an HTML page, especially when generating a `<gcds-ext-map>` element, to describe the map's purpose, if possible and known.
---

This element is especially important for screen reader users to understand the purpose or subject 
of a map. It is like 'alt-text' for a map.  It is a best practice to always include a good descriptive but short map caption in a map viewer.

The `<map-caption>` element is a child of `<gcds-ext-map>` and is used to define 
a simple text string that is not visually rendered (at this time). 
The caption should be read by screen readers when the `<gcds-ext-map>` is focused, 
as it generates the `<gcds-ext-map aria-label="...">` value, if no aria-label 
has been specified by the HTML author. `<map-caption>` may be the first or last 
element child of `<gcds-ext-map>`. 
