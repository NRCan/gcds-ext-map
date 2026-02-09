([Français](#polices-de-système-de-design-gc--noto-sans-mono))

# GC Design System Fonts - Noto Sans Mono

GC Design System code examples use the open-source font `Noto Sans Mono`.

## Installation

### Install `Noto Sans Mono` font with CDN

#### Add the code

Use the latest version of GC Design System Fonts - Noto Sans Mono. Pinned versions provide stability and predictability because the code will remain consistent and won't change unexpectedly, which can be crucial for maintaining the stability of an application. However, it requires manual updating of the CDN links whenever a newer version of GC Design System Fonts - Noto Sans Mono is released.

To use the `Noto Sans Mono` font in your project, place the following code in your CSS or include the [gcds-noto-sans-mono.css](https://github.com/cds-snc/gcds-fonts/blob/main/fonts/noto-sans-mono/gcds-noto-sans-mono.css) file in your project. Replace `<version-number>` with the latest version number to receive corresponding updates.

```css
<!-- GC Design System Fonts - Noto Sans Mono -->
@font-face {
  font-family: "Noto Sans Mono";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans-mono/gcds-noto-sans-mono.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans-mono/gcds-noto-sans-mono.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

/* Set "Noto Sans Mono" + fallback as the code font */
code {
  font-family: "Noto Sans Mono", monospace;
  font-weight: 400;
}
```

#### Automatic updates using `@latest`

Use the `@latest` version of GC Design System Fonts - Noto Sans Mono to receive automatic updates whenever a new version is released. **While it removes the need to manually update the CDN links, it adds the risk of introducing breaking changes to the codebase as new versions are automatically applied**.

### Install `Noto Sans Mono` font with npm

Navigate to the root folder of your project and run:

```js
npm install @gcds-core/fonts
```

Place the following code in your CSS and replace `path/to/node_modules` with the location where you've added the node modules:

```css
<!-- GC Design System Fonts - Noto Sans Mono -->
@font-face {
  font-family: "Noto Sans Mono";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans-mono/gcds-noto-sans-mono.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans-mono/gcds-noto-sans-mono.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

/* Set "Noto Sans Mono" + fallback as the code font */
code {
  font-family: "Noto Sans Mono", monospace;
  font-weight: 400;
}
```

## Example

Open the [`Noto Sans Mono` example]() to see a code example using the `Noto Sans Mono` font. You can find the code for the `Noto Sans Mono` example page in the [examples folder](https://github.com/cds-snc/gcds-fonts/tree/main/examples/noto-sans-mono).

---

# Polices de Système de design GC — Noto Sans Mono

Les exemples de code de Système de design GC utilisent la police à source ouverte `Noto Sans Mono`.

## Installation

### Installer la police `Noto Sans Mono` avec le CDN

#### Ajoutez le code

Utilisez la version la plus récente de Polices de Système de design GC — Noto Sans Mono. Les versions épinglées offrent stabilité et prévisibilité parce que le code ne changera pas de manière inattendue, ce qui peut être crucial pour maintenir la stabilité d'une application. Toutefois, il faut mettre à jour manuellement les liens CDN chaque fois qu'une version plus récente de Polices de Système de design GC — Noto Sans Mono est publiée.

Pour utiliser la police `Noto Sans Mono` dans votre projet, placez le code suivant dans votre CSS ou incluez le fichier [gcds-noto-sans-mono.css](https://github.com/cds-snc/gcds-fonts/blob/main/fonts/noto-sans-mono/gcds-noto-sans-mono.css) dans votre projet. Remplacez `<version-number>` par le numéro de version le plus récent pour recevoir les mises à jour correspondantes.

```css
<!-- Polices de Système de design GC — Noto Sans Mono -->
@font-face {
  font-family: "Noto Sans Mono";
  src: url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans-mono/gcds-noto-sans-mono.woff2") format("woff2"),
       url("https://cdn.design-system.canada.ca/@gcds-core/fonts@<version-number>/fonts/noto-sans-mono/gcds-noto-sans-mono.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

/* Set "Noto Sans Mono" + fallback as the code font */
code {
  font-family: "Noto Sans Mono", monospace;
  font-weight: 400;
}
```

#### Mises à jour automatiques grâce à `@latest`

Utilisez la version `@latest` de Polices de Système de design GC — Noto Sans Mono pour recevoir des mises à jour automatiques chaque fois qu'une nouvelle version est publiée. **Bien que cette approche vous évite la mise à jour manuelle des liens CDN, elle court le risque d'introduire des modifications qui entraînent une rupture de compatibilité avec le code base à mesure que les nouvelles versions sont automatiquement appliquées**.

### Installer la police `Noto Sans Mono` avec npm

Naviguez jusqu'au dossier racine de votre projet et exécutez :

```js
npm install @gcds-core/fonts
```

Placez le code suivant dans votre CSS et remplacez `path/to/node_modules` par l'emplacement où vous avez ajouté les modules de Node :

```css
<!-- Polices de Système de design GC — Noto Sans Mono -->
@font-face {
  font-family: "Noto Sans Mono";
  src: url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans-mono/gcds-noto-sans-mono.woff2") format("woff2"),
       url("path/to/node_modules/@gcds-core/fonts/fonts/noto-sans-mono/gcds-noto-sans-mono.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

/* Set "Noto Sans Mono" + fallback as the code font */
code {
  font-family: "Noto Sans Mono", monospace;
  font-weight: 400;
}
```

## Exemple

Ouvrez l'[exemple `Noto Sans Mono`]() pour voir un exemple de code utilisant la police `Noto Sans Mono`. Vous trouverez le code accompagnant l'exemple `Noto Sans Mono` dans le dossier [exemples](https://github.com/cds-snc/gcds-fonts/tree/main/examples/noto-sans-mono).
