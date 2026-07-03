// Detect the locale from the iframe URL's ?lang= query param so that story
// assets (and the code shown in "Show Code") match the surrounding page's
// language. Defaults to 'en' when the param is absent or unrecognized.
const lang =
  new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : '',
  ).get('lang') === 'fr'
    ? 'fr'
    : 'en';

const LAYER_OPTIONS: [string, string, string][] = [
  [`./dist/gcds-map/assets/mapml/${lang}/cbmtile/toporama`, 'Toporama', 'Toporama'],
  [`./dist/gcds-map/assets/mapml/${lang}/cbmtile/cbmt`, 'Canada Base Map - Transportation', 'Carte de base du Canada - Transport'],
  [`./dist/gcds-map/assets/mapml/${lang}/osmtile/osm`, 'OpenStreetMap', 'OpenStreetMap'],
  [`./dist/gcds-map/assets/mapml/${lang}/apstile/arctic`, 'Arctic Ocean Basemap MapML Service', "Service MapML de la carte de base de l'océan Arctique"]
];

// Build a mapping object so we can show titles in the dropdown but store the URL as the actual value
const layerMap = LAYER_OPTIONS.reduce((obj, [url, titleEn, titleFr]) => {
  obj[lang === 'fr' ? titleFr : titleEn] = url;
  return obj;
}, {});

export default {
  title: 'Components/Map',

  argTypes: {
    lat: {
      name: 'lat',
      control: { type: 'number' },
      description: 'A decimal number between +/- 90. Positive numbers are north of the equator. Latitudes which are meaningful depend on the projection system used. | Un nombre décimal entre +/- 90. Les nombres positifs sont au nord de l\'équateur. Les latitudes significatives dépendent du système de projection utilisé.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' }
      }
    },
    lon: {
      name: 'lon',
      control: { type: 'number', min: -180.0, max: +180.0 },
      description: 'A decimal number between +/- 180. Positive numbers are east of the meridian at Greenwich, UK. Longitudes which are meaningful depend on the projection system used. | Un nombre décimal entre +/- 180. Les nombres positifs sont à l\'est du méridien de Greenwich, R.-U. Les longitudes significatives dépendent du système de projection utilisé.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' }
      }
    },
    zoom: {
      name: 'zoom',
      control: { type: 'number' },
      description: 'A non-negative integer, up to 26, used as a proxy for map scale. The map scale associated to a zoom value depends on the tiled coordinate reference system. | Un entier non négatif, jusqu\'à 26, utilisé comme indicateur de l\'échelle de la carte. L\'échelle associée à une valeur de zoom dépend du système de référence de coordonnées tuilé.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' }
      }
    },
    projection: {
      name: 'projection',
      control: { type: 'select' },
      options: ['OSMTILE', 'CBMTILE','APSTILE', 'WGS84'],
      description: 'A case-sensitive string token identifier of a standard or custom MapML tiled coordinate reference system. The ":" character is not allowed. | Un identifiant de jeton de chaîne sensible à la casse d\'un système de référence de coordonnées tuilé MapML standard ou personnalisé. Le caractère « : » n\'est pas autorisé.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'OSMTILE' }
      }
    },
    layer: {
      name: '\<map-layer\>',
      control: 'select',
      options: Object.keys(layerMap),
      mapping: layerMap,
      description: 'Layers are specified by one or more \<map-layer\> elements. | Les couches sont spécifiées par un ou plusieurs éléments \<map-layer\>.',
      table: {
        type: { summary: 'element' },
        defaultValue: { summary: '-' }
      }
    },
    lang: {
      name: 'lang',
      control: { type: 'select' },
      options: ['en', 'fr'],
      description: 'The language of the map viewer user interface. May be specified on any ancestor element, especially \<html lang=\>. | La langue de l\'interface utilisateur du visualiseur de carte. Peut être spécifiée sur tout élément ancêtre, en particulier \<html lang=\>.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'en' },
      },
    },
    controls: {
      name: 'controls',
      control: 'boolean',
      description: 'Enables or removes optional map controls. | Active ou supprime les contrôles de carte facultatifs.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    static: {
      name: 'static',
      control: 'boolean',
      description: 'Disables map events and most interactive behaviour. Typically used in conjunction with controls attribute. | Désactive les événements de la carte et la plupart des comportements interactifs. Généralement utilisé conjointement avec l\'attribut controls.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    controlslist: {
      name: 'controlslist',
      control: 'multi-select',
      options: ['geolocation', 'search', 'nofullscreen', 'nozoom', 'nolayer', 'noreload', 'noscale'],
      description: 'Space-separated list of case-insensitive string tokens of control name or "no"+control name. | Liste de jetons de chaîne insensibles à la casse séparés par des espaces, composée du nom du contrôle ou de « no » + le nom du contrôle.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    caption: {
      name: '\<map-caption\>',
      control: { type: 'text' },
      description: 'A string describing the purpose of the map. The \<map-caption\> element can be used to provide a screen reader-friendly caption or title for the map. | Une chaîne décrivant l\'objectif de la carte. L\'élément \<map-caption\> peut être utilisé pour fournir un titre ou une légende accessible aux lecteurs d\'écran.',
      table: {
        type: { summary: 'element' },
        defaultValue: { summary: '-' },
      },
    }
  }
};

// spacing and indentation is visually significant in the template (it's visible in the
// "Show Code" disclosure widget; don't change it without testing the result...)
const TemplateBasic = (args) => {
  return `<gcds-map lat="${args.lat}" lon="${args.lon}" zoom="${args.zoom}" lang="${args.lang}" projection="${args.projection}"${args.controls ? ' controls' : ''}${args.static ? ' static' : ''}${args.controlslist.length > 0  ? ` controlslist="${args.controlslist.join(' ')}"` : ''}>

  <map-caption>${args.caption}</map-caption>

  <map-layer src="${args.layer}" ${`checked`}></map-layer>

</gcds-map>`;
};

export const Default: any = TemplateBasic.bind({});
Default.args = {
  lat: 48.474287,
  lon: -123.390541,
  zoom: 11,
  projection: 'OSMTILE',
  controls: true,
  static: false,
  lang: lang,
  controlslist: ['geolocation', 'search'],
  layer: `./dist/gcds-map/assets/mapml/${lang}/osmtile/cbmt`,
  caption: lang === 'fr' ? 'Une carte de Victoria, Canada' : 'A map of Victoria, Canada'
};

export const HiddenBasemap = (args) => {
  return `<gcds-map lat="${args.lat}" lon="${args.lon}" zoom="${args.zoom}" projection="${args.projection}"${args.controls ? ' controls' : ''}>

  <map-layer src="${args.layer}" checked hidden></map-layer>

  <map-layer src="./dist/gcds-map/assets/mapml/${lang}/osmtile/current_conditions" checked></map-layer>

</gcds-map>`;
};
HiddenBasemap.args = {
  lat: 53.087426, 
  lon: -91.275330,
  zoom: 4,
  projection: 'OSMTILE',
  controls: true,
  layer: `./dist/gcds-map/assets/mapml/${lang}/osmtile/cbmt`,
  caption: lang === 'fr' ? 'Conditions météorologiques actuelles au Canada' : "Canada's current weather conditions"
};

export const Playground = args => `<gcds-map lat="${args.lat}" lon="${args.lon}" zoom="${args.zoom}" lang="${args.lang}" projection="${args.projection}"${args.controls ? ' controls' : ''}${args.static ? ' static' : ''}${args.controlslist.length > 0  ? ` controlslist="${args.controlslist.join(' ')}"` : ''}>

  <map-layer src="${args.layer}" checked hidden></map-layer>

  <map-layer src="./dist/gcds-map/assets/mapml/${lang}/osmtile/current_conditions" checked></map-layer>

</gcds-map>`;

Playground.args = {
  lat: 53.087426,
  lon: -91.275330,
  zoom: 4,
  projection: 'OSMTILE',
  controls: true,
  static: false,
  lang: lang,
  controlslist: ['geolocation', 'search'],
  layer: `./dist/gcds-map/assets/mapml/${lang}/osmtile/cbmt`,
  caption: lang === 'fr' ? 'Conditions météorologiques actuelles au Canada' : "Canada's current weather conditions"
};

export const GeoJSON2MapMLExample = {
  render: (args, { loaded }) => {
    const container = document.createElement('div');
    container.innerHTML = `<gcds-map id="np" lat="${args.lat}" lon="${args.lon}" zoom="${args.zoom}" lang="${args.lang}" projection="${args.projection}"${args.controls ? ' controls' : ''}${args.static ? ' static' : ''}${args.controlslist.length > 0  ? ` controlslist="${args.controlslist.join(' ')}"` : ''}>
  <map-layer src="${args.layer}" checked hidden></map-layer>
</gcds-map>`;

    const mapEl = container.querySelector('#np');
    
    // Add the GeoJSON layer after the map is ready
    customElements.whenDefined('gcds-map').then(async () => {
      // Wait for map to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { geoJsonData } = loaded;
      if (!geoJsonData) return;

      const mapmlGlobal = window as any;
      if (typeof mapmlGlobal.M === 'undefined') {
        console.log('M not found! Unable to generate GeoJSON example layer.');
        return;
      }

      // Configure MapML options for the geojson2mapml api
      let provOptions = { 
        projection: "OSMTILE",
        label: lang === 'fr' ? 'Provinces et territoires du Canada' : 'Provinces and Territories of Canada', 
        caption: lang === 'fr' ? 'PRFNAME' : 'PRENAME',
        geometryFunction: function (g, f) {
          if (g.nodeName === "MAP-MULTIPOLYGON") {
            let polys = g.querySelectorAll("map-polygon");
            for (let i=0; i < polys.length; i++) {
              polys[i].setAttribute("class", "h");
            }
          } else {
            g.setAttribute("class", "h");
          }
          switch (f.properties.PRUID) {
            case '10': g.className = 'canada nl'; break;
            case '11': g.className = 'canada pei'; break;
            case '12': g.className = 'canada ns'; break;
            case '13': g.className = 'canada nb'; break;
            case '24': g.className = 'canada qc'; break;
            case '35': g.className = 'canada on'; break;
            case '46': g.className = 'canada mb'; break;
            case '47': g.className = 'canada sk'; break;
            case '48': g.className = 'canada ab'; break;
            case '59': g.className = 'canada bc'; break;
            case '60': g.className = 'canada yk'; break;
            case '61': g.className = 'canada nwt'; break;
            case '62': g.className = 'canada nt'; break;
          }
          return g;
        }
      };

      // Convert GeoJSON to MapML
      let provs = mapmlGlobal.M.geojson2mapml(geoJsonData, provOptions);

      // Post-process the layer
      const features = provs.querySelectorAll('map-feature');
      features.forEach(feature => {
        const taggedGeometry = feature.querySelector('.canada');
        feature.setAttribute('class', taggedGeometry.getAttribute('class'));
        taggedGeometry.removeAttribute('class');
      });

      provs.setAttribute('media','(0 < map-zoom < 7)');
      provs.setAttribute('opacity', '0.65');

      let mapStyle = document.createElement('map-style');
      mapStyle.innerHTML = `.canada { fill-opacity: 0.7; stroke-width: 1; stroke: white; stroke-opacity: 1; stroke-dasharray: 3; } 
            .bc { fill: #ffdeb2; stroke: #e6c8a1; } .ab { fill: #facad6; stroke: #e8708e; } .sk { fill: #b5ffe4; stroke: #9ad9c2;} .mb { fill: #e6e6fa;  stroke: #cdcdde; } 
            .on { fill: #facad6; stroke: #e8708e; } .qc { fill: #b5ffe4; stroke: #9ad9c2;} .nb { fill: #ffdeb2; } .pei { fill: #e6e6fa; stroke: #cdcdde;} 
            .ns { fill: #facad6;  stroke: #e8708e; } .nl { fill: #ebc798; stroke: #d0a368; } 
            .yk { fill: #ebc798; stroke: #d0a368; } .nwt { fill: #e6e6fa; stroke: #cdcdde; } .nt { fill: #ffdeb2; stroke: #e6c8a1; }`;

      provs.insertAdjacentElement('afterbegin', mapStyle);
      mapEl.appendChild(provs);
      console.log('Added GeoJSON layer to map');
    });

    return container.firstElementChild;
  },
  args: {
  lat: 53.087426,
  lon: -91.275330,
  zoom: 4,
  projection: 'OSMTILE',
  controls: true,
  static: false,
  lang: lang,
  controlslist: ['geolocation', 'search'],
  layer: `./dist/gcds-map/assets/mapml/${lang}/osmtile/cbmt`,
  caption: lang === 'fr' ? 'Provinces et territoires du Canada en GeoJSON stylisé' : "Canada's Provinces and Territories in styled GeoJSON"
  },
  loaders: [
  async () => {
    try {
      const response = await fetch('./dist/gcds-map/assets/canada.json');
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const geoJsonData = await response.json();

      // Return the data for use in the story
      return { geoJsonData };
    } catch (error) {
      console.error('Error loading GeoJSON data:', error);
      return { geoJsonData: null, error };
    }
  }
  ],
  parameters: {
    docs: {
      source: {
        type: 'code',
        language: 'html',
        code: `<gcds-map id="np" lat="53.087426" lon="-91.275330" zoom="4" lang="${lang}" projection="OSMTILE" controls controlslist="geolocation">

  <map-caption>${lang === 'fr' ? 'Provinces et territoires du Canada en GeoJSON stylisé' : "Canada's Provinces and Territories in styled GeoJSON"}</map-caption>

  <map-layer src="./dist/gcds-map/assets/mapml/${lang}/osmtile/cbmt" checked hidden></map-layer>

  <!-- ${lang === 'fr' ? 'cette couche est créée via javascript, en utilisant les fonctions de l’API M.geojson2mapml' : 'this layer created via javascript, using M.geojson2mapml API functions'} -->
  <map-layer label="${lang === 'fr' ? 'Provinces et territoires du Canada' : 'Provinces and territories of Canada'}" checked media="(0 < map-zoom < 7)" opacity="0.65">
    <map-style>
     .canada { fill-opacity: 0.7; stroke-width: 1; stroke: white; stroke-opacity: 1; stroke-dasharray: 3; } 
     .bc { fill: #ffdeb2; stroke: #e6c8a1; } .ab { fill: #facad6; stroke: #e8708e; } 
     .sk { fill: #b5ffe4; stroke: #9ad9c2;} .mb { fill: #e6e6fa;  stroke: #cdcdde; } 
     .on { fill: #facad6; stroke: #e8708e; } .qc { fill: #b5ffe4; stroke: #9ad9c2;} 
     .nb { fill: #ffdeb2; } .pei { fill: #e6e6fa; stroke: #cdcdde;} 
     .ns { fill: #facad6;  stroke: #e8708e; } .nl { fill: #ebc798; stroke: #d0a368; } 
     .yk { fill: #ebc798; stroke: #d0a368; } .nwt { fill: #e6e6fa; stroke: #cdcdde; } 
     .nt { fill: #ffdeb2; stroke: #e6c8a1; }
    </map-style>
    <map-meta name="extent" content="top-left-longitude=-141.01143, top-left-latitude=41.71096, bottom-right-longitude=-52.61941,bottom-right-latitude=83.13505"></map-meta>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-meta name="cs" content="gcrs"></map-meta>
    <map-feature class="canada nl">
      <map-featurecaption>${lang === 'fr' ? 'Terre-Neuve-et-Labrador' : 'Newfoundland and Labrador'}</map-featurecaption>
      <map-geometry>...</map-geometry>
      <map-properties>...</map-properties>
    </map-feature>
    ... etc ...
  </map-layer>

</gcds-map>`
      }
    }
  }
};

export const DarkMode = {
  render: (args) => `<gcds-map lat="${args.lat}" lon="${args.lon}" zoom="${args.zoom}" lang="${args.lang}" projection="${args.projection}"${args.controls ? ' controls' : ''}${args.static ? ' static' : ''}${args.controlslist.length > 0  ? ` controlslist="${args.controlslist.join(' ')}"` : ''}>

  <map-layer media="(prefers-color-scheme: dark)" src="./dist/gcds-map/assets/mapml/${lang}/osmtile/dark.mapml" checked></map-layer>

  <map-layer media="(prefers-color-scheme: light)" src="./dist/gcds-map/assets/mapml/${lang}/osmtile/light.mapml" checked></map-layer>

</gcds-map>`,
  args: {
  lat: 53.087426, 
  lon: -91.275330,
  zoom: 4,
  projection: 'OSMTILE',
  controls: true,
  static: false,
  lang: lang,
  controlslist: ['geolocation', 'search'],
  caption: lang === 'fr' ? "OpenStreetMap au format d'archive pmtiles, démontrant les cartes en mode clair et sombre" : "OpenStreetMap in pmtiles archive format, demonstrating light and dark mode maps"
  }
};

