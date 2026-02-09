([Français](#polices-de-système-de-design-gc--lato))

# GC Design System Fonts - Lato

GC Design System headings use the open-source font `Lato`.

## Installation

### Install `Lato` font with CDN

#### Add the code

Use the latest version of GC Design System Fonts - Lato. Pinned versions provide stability and predictability because the code will remain consistent and won't change unexpectedly, which can be crucial for maintaining the stability of an application. However, it requires manual updating of the CDN links whenever a newer version of GC Design System Fonts - Lato is released.

To use the `Lato` font in your project, place the following code in your CSS or include the [gcds-lato.css](https://github.com/cds-snc/gcds-fonts/blob/main/fonts/lato/gcds-lato.css) file in your project. Replace `<version-number>` with the latest version number to receive corresponding updates.

```css
<!-- GC Design System Fonts - Lato -->
@font-face {
  font-family: "Lato";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/lato/gcds-lato.woff2")
      format("woff2"), url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/lato/gcds-lato.woff")
      format("woff");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Lato";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/lato/gcds-lato-italic.woff2")
      format("woff2"), url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/lato/gcds-lato-italic.woff")
      format("woff");
  font-weight: 700;
  font-style: italic;
}

/* Set "Lato" + fallback as the heading font */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Lato", sans-serif;
  font-weight: 700;
}
```

#### Automatic updates using `@latest`

Use the `@latest` version of GC Design System Fonts - Lato to receive automatic updates whenever a new version is released. **While it removes the need to manually update the CDN links, it adds the risk of introducing breaking changes to the codebase as new versions are automatically applied**.

### Install `Lato` font with npm

Navigate to the root folder of your project and run:

```js
npm install @gcds-core/fonts
```

Place the following code in your CSS and replace `path/to/node_modules` with the location where you've added the node modules:

```css
<!-- GC Design System Fonts - Lato -->
@font-face {
  font-family: "Lato";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/lato/gcds-lato.woff2")
      format("woff2"), url("path/to/node_modules/@gcds-core/fonts/fonts/lato/gcds-lato.woff")
      format("woff");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Lato";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/lato/gcds-lato-italic.woff2")
      format("woff2"), url("path/to/node_modules/@gcds-core/fonts/fonts/lato/gcds-lato-italic.woff")
      format("woff");
  font-weight: 700;
  font-style: italic;
}

/* Set "Lato" + fallback as the heading font */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Lato", sans-serif;
  font-weight: 700;
}
```

## Example

Open the [`Lato` example]() to see a list of all heading levels using the `Lato` font. You can find the code for the `Lato` example page in the [examples folder](https://github.com/cds-snc/gcds-fonts/tree/main/examples/lato).

---

# Polices de Système de design GC — Lato

Les titres de Système de design GC utilisent la police à source ouverte `Lato`.

## Installation

### Installer la police `Lato` avec le CDN

#### Ajoutez le code

Utilisez la version la plus récente de Polices de Système de design GC — Lato. Les versions épinglées offrent stabilité et prévisibilité parce que le code ne changera pas de manière inattendue, ce qui peut être crucial pour maintenir la stabilité d'une application. Toutefois, il faut mettre à jour manuellement les liens CDN chaque fois qu'une version plus récente de Polices de Système de design GC — Lato est publiée.

Pour utiliser la police `Lato` dans votre projet, placez le code suivant dans votre CSS ou incluez le fichier [gcds-lato.css](https://github.com/cds-snc/gcds-fonts/blob/main/fonts/lato/gcds-lato.css) dans votre projet. Remplacez `<version-number>` par le numéro de version le plus récent pour recevoir les mises à jour correspondantes.

```css
<!-- Polices de Système de design GC — Lato -->
@font-face {
  font-family: "Lato";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/lato/gcds-lato.woff2")
      format("woff2"), url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/lato/gcds-lato.woff")
      format("woff");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Lato";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/lato/gcds-lato-italic.woff2")
      format("woff2"), url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/lato/gcds-lato-italic.woff")
      format("woff");
  font-weight: 700;
  font-style: italic;
}

/* Set "Lato" + fallback as the heading font */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Lato", sans-serif;
  font-weight: 700;
}
```

#### Mises à jour automatiques grâce à `@latest`

Utilisez la version `@latest` de Polices de Système de design GC — Lato pour recevoir des mises à jour automatiques chaque fois qu'une nouvelle version est publiée. **Bien que cette approche vous évite la mise à jour manuelle des liens CDN, elle court le risque d'introduire des modifications qui entraînent une rupture de compatibilité avec le code base à mesure que les nouvelles versions sont automatiquement appliquées**.

### Installer la police `Lato` avec npm

Naviguez jusqu'au dossier racine de votre projet et exécutez :

```js
npm install @gcds-core/fonts
```

Placez le code suivant dans votre CSS et remplacez `path/to/node_modules` par l'emplacement où vous avez ajouté les modules de Node :

```css
<!-- Polices de Système de design GC — Lato -->
@font-face {
  font-family: "Lato";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/lato/gcds-lato.woff2")
      format("woff2"), url("path/to/node_modules/@gcds-core/fonts/fonts/lato/gcds-lato.woff")
      format("woff");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Lato";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/lato/gcds-lato-italic.woff2")
      format("woff2"), url("path/to/node_modules/@gcds-core/fonts/fonts/lato/gcds-lato-italic.woff")
      format("woff");
  font-weight: 700;
  font-style: italic;
}

/* Set "Lato" + fallback as the heading font */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Lato", sans-serif;
  font-weight: 700;
}
```

## Exemple

Ouvrez l'[exemple `Lato`]() pour afficher la liste de tous les niveaux de titre utilisant la police `Lato`. Vous trouverez le code accompagnant l'exemple `Lato` dans le dossier [exemples](https://github.com/cds-snc/gcds-fonts/tree/main/examples/lato).
