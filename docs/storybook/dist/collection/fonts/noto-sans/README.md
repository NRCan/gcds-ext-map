([Français](#polices-de-système-de-design-gc--noto-sans))

# GC Design System Fonts - Noto Sans

GC Design System paragraphs and other, non-heading text use the open-source font `Noto Sans`.

## Installation

### Install `Noto Sans` font with CDN

#### Add the code

Use the latest version of GC Design System Fonts - Noto Sans. Pinned versions provide stability and predictability because the code will remain consistent and won't change unexpectedly, which can be crucial for maintaining the stability of an application. However, it requires manual updating of the CDN links whenever a newer version of GC Design System Fonts - Noto Sans is released.

To use the `Noto Sans` font in your project, place the following code in your CSS or include the [gcds-noto-sans.css](https://github.com/cds-snc/gcds-fonts/blob/main/fonts/noto-sans/gcds-noto-sans.css) file in your project. Replace `<version-number>` with the latest version number to receive corresponding updates.

```css
<!-- GC Design System Fonts - Noto Sans -->
@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-light.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-light.woff") format("woff");
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-light-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-light-italic.woff") format("woff");
  font-weight: 300;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-regular.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-regular-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-regular-italic.woff") format("woff");
  font-weight: 400;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-medium.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-medium.woff") format("woff");
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-medium-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-medium-italic.woff") format("woff");
  font-weight: 500;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-semibold.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-semibold.woff") format("woff");
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-semibold-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-semibold-italic.woff") format("woff");
  font-weight: 600;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-bold.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-bold.woff") format("woff");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-bold-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-bold-italic.woff") format("woff");
  font-weight: 700;
  font-style: italic;
}

/* Set "Noto Sans" + fallback as the default body font */
body {
  font-family: "Noto Sans", sans-serif;
  font-weight: 400;
}
```

#### Automatic updates using `@latest`

Use the `@latest` version of GC Design System Fonts - Noto Sans to receive automatic updates whenever a new version is released. **While it removes the need to manually update the CDN links, it adds the risk of introducing breaking changes to the codebase as new versions are automatically applied**.

### Install `Noto Sans` font with npm

Navigate to the root folder of your project and run:

```js
npm install @gcds-core/fonts
```

Place the following code in your CSS and replace `path/to/node_modules` with the location where you've added the node modules:

```css
<!-- GC Design System Fonts - Noto Sans -->
@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-light.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-light.woff") format("woff");
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-light-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-light-italic.woff") format("woff");
  font-weight: 300;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-regular.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-regular-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-regular-italic.woff") format("woff");
  font-weight: 400;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-medium.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-medium.woff") format("woff");
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-medium-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-medium-italic.woff") format("woff");
  font-weight: 500;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-semibold.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-semibold.woff") format("woff");
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-semibold-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-semibold-italic.woff") format("woff");
  font-weight: 600;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-bold.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-bold.woff") format("woff");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-bold-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-bold-italic.woff") format("woff");
  font-weight: 700;
  font-style: italic;
}

/* Set "Noto Sans" + fallback as the default body font */
body {
  font-family: "Noto Sans", sans-serif;
  font-weight: 400;
}
```

## Example

Open the [`Noto Sans` example]() to see a list of all supported font weights for the `Noto Sans` font. You can find the code for the `Noto Sans` example page in the [examples folder](https://github.com/cds-snc/gcds-fonts/tree/main/examples/noto-sans).

---

# Polices de Système de design GC — Noto Sans

Les paragraphes de Système de design GC, ainsi que les autres éléments textuels qui ne sont pas des titres, utilisent la police à source ouverte `Noto Sans`.

## Installation

### Installer la police `Noto Sans` avec le CDN

#### Ajoutez le code

Utilisez la version la plus récente de Polices de Système de design GC — Noto Sans. Les versions épinglées offrent stabilité et prévisibilité parce que le code ne changera pas de manière inattendue, ce qui peut être crucial pour maintenir la stabilité d'une application. Toutefois, il faut mettre à jour manuellement les liens CDN chaque fois qu'une version plus récente de Polices de Système de design GC — Noto Sans est publiée.

Pour utiliser la police `Noto Sans` dans votre projet, placez le code suivant dans votre CSS ou incluez le fichier [gcds-noto-sans.css](https://github.com/cds-snc/gcds-fonts/blob/main/fonts/noto-sans/gcds-noto-sans.css) dans votre projet. Remplacez `<version-number>` par le numéro de version le plus récent pour recevoir les mises à jour correspondantes.

```css
<!-- Polices de Système de design GC — Noto Sans -->
@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-light.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-light.woff") format("woff");
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-light-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-light-italic.woff") format("woff");
  font-weight: 300;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-regular.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-regular-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-regular-italic.woff") format("woff");
  font-weight: 400;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-medium.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-medium.woff") format("woff");
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-medium-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-medium-italic.woff") format("woff");
  font-weight: 500;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-semibold.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-semibold.woff") format("woff");
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-semibold-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-semibold-italic.woff") format("woff");
  font-weight: 600;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-bold.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-bold.woff") format("woff");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-bold-italic.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans/gcds-noto-sans-bold-italic.woff") format("woff");
  font-weight: 700;
  font-style: italic;
}

/* Set "Noto Sans" + fallback as the default body font */
body {
  font-family: "Noto Sans", sans-serif;
  font-weight: 400;
}
```

#### Mises à jour automatiques grâce à `@latest`

Utilisez la version `@latest` de Polices de Système de design GC — Noto Sans pour recevoir des mises à jour automatiques chaque fois qu'une nouvelle version est publiée. **Bien que cette approche vous évite la mise à jour manuelle des liens CDN, elle court le risque d'introduire des modifications qui entraînent une rupture de compatibilité avec le code base à mesure que les nouvelles versions sont automatiquement appliquées**.

### Installer la police `Noto Sans` avec npm

Naviguez jusqu'au dossier racine de votre projet et exécutez :

```js
npm install @gcds-core/fonts
```

Placez le code suivant dans votre CSS et remplacez `path/to/node_modules` par l'emplacement où vous avez ajouté les modules de Node :

```css
<!-- Polices de Système de design GC — Noto Sans -->
@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-light.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-light.woff") format("woff");
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-light-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-light-italic.woff") format("woff");
  font-weight: 300;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-regular.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-regular-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-regular-italic.woff") format("woff");
  font-weight: 400;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-medium.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-medium.woff") format("woff");
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-medium-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-medium-italic.woff") format("woff");
  font-weight: 500;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-semibold.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-semibold.woff") format("woff");
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-semibold-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-semibold-italic.woff") format("woff");
  font-weight: 600;
  font-style: italic;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-bold.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-bold.woff") format("woff");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Noto Sans";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-bold-italic.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans/gcds-noto-sans-bold-italic.woff") format("woff");
  font-weight: 700;
  font-style: italic;
}

/* Set "Noto Sans" + fallback as the default body font */
body {
  font-family: "Noto Sans", sans-serif;
  font-weight: 400;
}
```

## Exemple

Ouvrez l'[exemple `Noto Sans`]()pour afficher la liste de toutes les graisses de police prises en charge pour la police `Noto Sans`. Vous trouverez le code accompagnant l'exemple `Noto Sans` dans le dossier [exemples](https://github.com/cds-snc/gcds-fonts/tree/main/examples/noto-sans).
