---
name: gcds-map-page-markup
metadata:
  package: "@gcds-extensions/map"
description: Tells you how to build a complete, accessible, bilingual (English + French) Government of Canada web page — based on the GC Design System (GCDS) "Basic page" template — that embeds a <gcds-ext-map> CBMTILE map using the bundled, language-specific Canada Base Map - Transportation (CBMT) assets. Use it when a user asks for a whole HTML page or web site (not just a bare map element) that presents a map of Canada inside GCDS header/footer chrome, or asks for a bilingual GCDS map page.
---

This skill shows how to wrap a `<gcds-ext-map>` map in a **complete, standards-compliant Government of Canada page** using the GC Design System (GCDS) "Basic page" template, and how to ship it as a **bilingual** (English + French) site. Use it when you need the whole page — header, footer, breadcrumbs, language toggle, main content region — not just the map element on its own. For the attributes of the map element itself, see the `gcds-ext-map-markup` skill; for the layer element, see `map-layer-markup`; for the accessible caption, see `map-caption-markup`.

The map produced by this skill:

- uses the **`CBMTILE`** projection (the Canadian standard grid, EPSG:3978, Lambert Conformal Conic);
- shows the **Canada Base Map - Transportation (CBMT)** layer;
- loads the **language-specific**, **bundled** CBMT asset that ships inside the installed package, so the map works offline and matches the page language.

## Prerequisites — install the packages

```bash
npm install @gcds-extensions/map @gcds-core/components
```

- `@gcds-extensions/map` provides the `<gcds-ext-map>` component **and** the bundled base map assets under `node_modules/@gcds-extensions/map/dist/gcds-ext-map/`.
- `@gcds-core/components` provides the GCDS components (`<gcds-header>`, `<gcds-footer>`, `<gcds-container>`, etc.) used by the Basic page template.

All paths in the examples below are **relative to the served page** and assume this project layout, served from the project root:

```
your-project/
  index.html            <- language-selection splash
  en/index.html         <- English map page
  fr/index.html         <- French map page
  node_modules/
    @gcds-core/components/dist/gcds/...
    @gcds-extensions/map/dist/gcds-ext-map/...
```

Because the pages live one folder deep (`en/`, `fr/`), they reference `node_modules` with `../node_modules/...`. The root splash page uses `node_modules/...`. Adjust these paths to match how you actually structure and serve your folders. Using the **bundled** assets (rather than a remote URL) keeps the map working offline and avoids cross-origin restrictions.

## The CBMT base map assets (language-specific)

The Canada Base Map - Transportation (CBMT) layer ships in both official languages, under the `CBMTILE` folder:

| Language | `<map-layer src="...">` value |
| --- | --- |
| English | `node_modules/@gcds-extensions/map/dist/gcds-ext-map/assets/mapml/en/cbmtile/cbmt` |
| French  | `node_modules/@gcds-extensions/map/dist/gcds-ext-map/assets/mapml/fr/cbmtile/cbmt` |

Always pair the asset language with the page's `lang`: the English page loads `.../en/cbmtile/cbmt`, the French page loads `.../fr/cbmtile/cbmt`.

Other CBMTILE layers ship alongside CBMT in the same `en/cbmtile/` and `fr/cbmtile/` folders — for example `toporama`, `canvec`, `cbmtsimple`, `cbmtgeom`, and `current_conditions` — should you want a different base map. This skill uses `cbmt`.

## Viewport presets

`lat`, `lon`, and `zoom` set the initial view (they update as the user pans/zooms). For a whole-of-Canada CBMTILE view, use:

| View | `lat` | `lon` | `zoom` |
| --- | --- | --- | --- |
| All of Canada | `62.0` | `-87.0` | `4` |
| Ottawa (capital, closer) | `45.4215` | `-75.6972` | `10` |

## English page — `en/index.html`

```html
<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="A map of Canada rendered with the Canada Base Map (Transportation) in the CBMTILE projection."
    />
    <title>Map of Canada</title>

    <!-- GC Design System (bundled node_modules assets) -->
    <link rel="stylesheet" href="../node_modules/@gcds-core/components/dist/gcds/gcds.css" />
    <script type="module" src="../node_modules/@gcds-core/components/dist/gcds/gcds.esm.js"></script>

    <!-- gcds-ext-map component (bundled node_modules assets) -->
    <script type="module" src="../node_modules/@gcds-extensions/map/dist/gcds-ext-map/gcds-ext-map.esm.js"></script>

    <!-- The map has a small default size; give it an explicit size. -->
    <style>
      gcds-ext-map { display: block; width: 100%; height: 500px; }
    </style>
  </head>

  <body>
    <!-- Header: lang-href points to the French page; skip-to-href matches the main container id. -->
    <gcds-header lang-href="../fr/index.html" skip-to-href="#main-content">
      <gcds-search slot="search"></gcds-search>
      <gcds-breadcrumbs slot="breadcrumb">
        <gcds-breadcrumbs-item href="../index.html">Home</gcds-breadcrumbs-item>
        <gcds-breadcrumbs-item href="#">Map of Canada</gcds-breadcrumbs-item>
      </gcds-breadcrumbs>
    </gcds-header>

    <gcds-container id="main-content" layout="page" tag="main">
      <section>
        <gcds-heading tag="h1">Map of Canada</gcds-heading>
        <gcds-text>
          This page shows an interactive map of Canada using the Canada Base Map
          — Transportation (CBMT) layer in the CBMTILE projection (EPSG:3978,
          Lambert Conformal Conic).
        </gcds-text>
      </section>

      <section>
        <gcds-heading tag="h2">Interactive map</gcds-heading>
        <gcds-ext-map
          projection="CBMTILE"
          lat="62.14906" 
          lon="-87.31064" 
          zoom="4" 
          controls
          static
          controlslist="static search"
        >
          <map-caption>Map of Canada — Canada Base Map (Transportation), CBMTILE projection</map-caption>
          <map-layer
            label="Canada Base Map - Transportation (CBMT)"
            src="../node_modules/@gcds-extensions/map/dist/gcds-ext-map/assets/mapml/en/cbmtile/cbmt"
            checked
          ></map-layer>
        </gcds-ext-map>
      </section>

      <gcds-date-modified>2025-10-01</gcds-date-modified>
    </gcds-container>

    <gcds-footer display="full"></gcds-footer>
  </body>
</html>
```

## French page — `fr/index.html`

Same structure, with `lang="fr"`, French content, the French CBMT asset (`.../fr/cbmtile/cbmt`), and `lang-href` pointing back to the English page.

```html
<!DOCTYPE html>
<html dir="ltr" lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Une carte du Canada affichée avec la Carte de base du Canada (Transport) dans la projection CBMTILE."
    />
    <title>Carte du Canada</title>

    <!-- Système de design GC (ressources locales node_modules) -->
    <link rel="stylesheet" href="../node_modules/@gcds-core/components/dist/gcds/gcds.css" />
    <script type="module" src="../node_modules/@gcds-core/components/dist/gcds/gcds.esm.js"></script>

    <!-- Composant gcds-ext-map (ressources locales node_modules) -->
    <script type="module" src="../node_modules/@gcds-extensions/map/dist/gcds-ext-map/gcds-ext-map.esm.js"></script>

    <style>
      gcds-ext-map { display: block; width: 100%; height: 500px; }
    </style>
  </head>

  <body>
    <gcds-header lang-href="../en/index.html" skip-to-href="#main-content">
      <gcds-search slot="search"></gcds-search>
      <gcds-breadcrumbs slot="breadcrumb">
        <gcds-breadcrumbs-item href="../index.html">Accueil</gcds-breadcrumbs-item>
        <gcds-breadcrumbs-item href="#">Carte du Canada</gcds-breadcrumbs-item>
      </gcds-breadcrumbs>
    </gcds-header>

    <gcds-container id="main-content" layout="page" tag="main">
      <section>
        <gcds-heading tag="h1">Carte du Canada</gcds-heading>
        <gcds-text>
          Cette page présente une carte interactive du Canada à partir de la
          couche Carte de base du Canada — Transport (CBCT) dans la projection
          CBMTILE (EPSG:3978, projection conique conforme de Lambert).
        </gcds-text>
      </section>

      <section>
        <gcds-heading tag="h2">Carte interactive</gcds-heading>
        <gcds-ext-map
          projection="CBMTILE"
          lat="62.14906" 
          lon="-87.31064" 
          zoom="4" 
          controls
          static
          controlslist="static search"
        >
          <map-caption>Carte du Canada — Carte de base du Canada (Transport), projection CBMTILE</map-caption>
          <map-layer
            hidden
            label="Carte de base du Canada - Transport (CBCT)"
            src="../node_modules/@gcds-extensions/map/dist/gcds-ext-map/assets/mapml/fr/cbmtile/cbmt"
            checked
          ></map-layer>
        </gcds-ext-map>
      </section>

      <gcds-date-modified>2025-10-01</gcds-date-modified>
    </gcds-container>

    <gcds-footer display="full"></gcds-footer>
  </body>
</html>
```

## Language-selection splash — `index.html`

The Government of Canada convention is a small language-selection page at the site root that links to the English and French versions. This splash is a **generic GCDS convention** (not part of the map component); it is included here for completeness.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Map of Canada / Carte du Canada</title>
    <link rel="stylesheet" href="node_modules/@gcds-core/components/dist/gcds/gcds.css" />
    <script type="module" src="node_modules/@gcds-core/components/dist/gcds/gcds.esm.js"></script>
  </head>
  <body>
    <gcds-container size="lg" centered padding="400" tag="main">
      <gcds-heading tag="h1" lang="en">Map of Canada</gcds-heading>
      <gcds-heading tag="h1" lang="fr">Carte du Canada</gcds-heading>
      <gcds-grid columns="1fr 1fr" gap="300">
        <gcds-button type="link" href="en/index.html" lang="en">English</gcds-button>
        <gcds-button type="link" href="fr/index.html" lang="fr">Français</gcds-button>
      </gcds-grid>
    </gcds-container>
  </body>
</html>
```

## Key rules

- **Match asset language to page language.** The `en` page loads `.../en/cbmtile/cbmt`; the `fr` page loads `.../fr/cbmtile/cbmt`. Also set `<html lang="en">` / `<html lang="fr">` accordingly.
- **Wire the language toggle.** `<gcds-header lang-href="...">` on each page points to the other language's page, so the header's language toggle works.
- **Connect skip-to-main.** `<gcds-header skip-to-href="#main-content">` must match the `id` of the `<gcds-container ... id="main-content">` that holds the main content.
- **Give the map a size.** `<gcds-ext-map>` renders very small by default; set an explicit `width`/`height` in CSS (or via the `width`/`height` attributes).
- **Include a `<map-caption>`.** It is the map's accessible name (like alt-text for a map) — see `map-caption-markup`.
- **`controlslist="search"`** enables the search box; it becomes usable because the bundled CBMT layer contains a `<map-link rel="search">`.
- **Keep the two language pages structurally identical.** Same headings, sections, and layout — only the human language, `lang`, `lang-href`, and the asset language differ.
- **Update `<gcds-date-modified>`** to the page's last-changed date, in `YYYY-MM-DD` format.

## Serving the site

Serve from the project **root** so that `node_modules` is reachable from the pages:

```bash
npx http-server . -p 8080 -c-1
# then open http://localhost:8080/            (splash)
#           http://localhost:8080/en/index.html
#           http://localhost:8080/fr/index.html
```

## References

- GC Design System — Basic page template: <https://design-system.canada.ca/en/page-templates/basic/>
- Canonical template source (GCDS-owned; may evolve): <https://github.com/cds-snc/gcds-examples/tree/main/templates>
- The GCDS page shell (`<gcds-header>`, `<gcds-footer>`, `<gcds-container>`, `<gcds-date-modified>`) is owned and documented by the GC Design System; this skill embeds a known-good snapshot so you do not have to fetch it, but consult the source above if the shell has changed.
