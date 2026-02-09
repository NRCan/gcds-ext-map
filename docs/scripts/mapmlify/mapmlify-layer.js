// <mapmlify-layer> custom element
// Encapsulates the layer controls, preview, and viewer lifecycle for a single layer.
// Usage: const el = document.createElement('mapmlify-layer');
//        el.layerConfig = { serviceType, layer, ... };

import {
  formatDimensionParam,
  wgs84ToWebMercator,
  buildWMTSTileUrl,
  buildGetMapUrl,
} from './main.js';
import { t, LOCALE } from './i18n.js';

class MapmlifyLayer extends HTMLElement {
  static #idCounter = 0;
  #config = null;

  // Internal UI state
  #viewerActive = false;
  #queryEnabled = false;
  #boundsEnabled = true;
  #selectedStyle = '';
  #selectedImageFormat = '';
  #selectedProjection = '';
  #selectedQueryFormat = '';
  #selectedExportMode = 'individual';
  #dimensionStates = []; // [{enabled, value}]

  // DOM references (set during render, avoids querySelector overhead)
  #layerCheckbox = null;
  #boundsCheckbox = null;
  #viewerContainer = null;
  #sourceCodeEl = null;
  #sourceCodeRaw = '';
  #sourceCodeVisible = false;
  #moveendHandler = null;
  #lazyLoadObserver = null;
  #layerToggleHandler = null;

  set layerConfig(value) {
    this.#config = value;
    if (this.isConnected) {
      this.#initDefaults();
      this.#render();
    }
  }
  get layerConfig() {
    return this.#config;
  }

  connectedCallback() {
    if (this.#config) {
      this.#initDefaults();
      this.#render();
      this.#setupLazyLoading();
    }
  }

  disconnectedCallback() {
    this.#removeViewer();
    if (this.#lazyLoadObserver) {
      this.#lazyLoadObserver.disconnect();
      this.#lazyLoadObserver = null;
    }
  }

  #setupLazyLoading() {
    // Lazy-load map previews: Auto-check the layer checkbox when it scrolls into viewport
    // This prevents loading hundreds/thousands of maps simultaneously on large services
    const options = {
      root: null, // viewport
      rootMargin: '100px', // Start loading slightly before entering viewport
      threshold: 0.1, // Trigger when 10% visible
    };

    this.#lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && this.#layerCheckbox) {
          // Check if already active
          const isActive = Array.isArray(this.#layerCheckbox.value)
            ? this.#layerCheckbox.value.includes('active')
            : false;
          if (!isActive) {
            // Auto-check the checkbox to load the preview
            this.#layerCheckbox.value = ['active'];
            if (this.#layerToggleHandler) this.#layerToggleHandler(true);
          }
          
          // Disconnect after first trigger - we only want to load once
          this.#lazyLoadObserver.disconnect();
          this.#lazyLoadObserver = null;
        }
      });
    }, options);

    // Start observing this element
    this.#lazyLoadObserver.observe(this);
  }

  #initDefaults() {
    const c = this.#config;
    const layer = c.layer;
    const st = c.serviceType;

    // Style default
    if (st === 'WMS' || st === 'WMTS') {
      const defaultStyle =
        layer.styles?.find((s) => s.isDefault) || layer.styles?.[0];
      this.#selectedStyle = defaultStyle?.name ?? '';
    }

    // Image format default
    if (st === 'WMS') {
      const fmts = c.getMapFormats || [];
      this.#selectedImageFormat =
        fmts.find((f) => f.includes('png')) || fmts[0] || 'image/png';
    } else if (st === 'WMTS') {
      const fmts = layer.formats || [];
      this.#selectedImageFormat =
        fmts.find((f) => f.includes('png')) || fmts[0] || 'image/png';
    } else if (st === 'ESRI-MapServer') {
      this.#selectedImageFormat =
        c.supportedFormats?.find((f) => f === 'png') ||
        c.supportedFormats?.[0] ||
        'png';
    } else if (st === 'ESRI-ImageServer') {
      this.#selectedImageFormat = c.supportedFormats?.[0] || 'jpgpng';
    }

    // Projection default
    if (st === 'WMS' || st === 'WMTS') {
      const projs = layer.supportedProjections || [];
      this.#selectedProjection = projs.includes('OSMTILE')
        ? 'OSMTILE'
        : projs[0] || 'OSMTILE';
    } else {
      this.#selectedProjection = c.projection || 'OSMTILE';
    }

    // Query format default (smart selection based on priority)
    if (st === 'WMS') {
      this.#selectedQueryFormat = this.#selectBestQueryFormat(
        c.getFeatureInfoFormats || []
      );
    } else if (st === 'WMTS') {
      this.#selectedQueryFormat = this.#selectBestQueryFormat(
        layer.infoFormats || []
      );
    }

    // Dimension defaults
    const dims = layer.dimensions || [];
    this.#dimensionStates = dims.map((dim) => ({
      enabled: true,
      value: dim.default,
    }));

    this.#boundsEnabled = this.#hasMatchingBounds(this.#selectedProjection);
    // Query enabled by default if layer is queryable
    this.#queryEnabled = this.#layerIsQueryable();
    this.#viewerActive = false;
    this.#sourceCodeVisible = false;
    this.#selectedExportMode = 'individual';
  }

  // ─── DOM RENDERING ──────────────────────────────────────
  #render() {
    const c = this.#config;
    if (!c) return;

    const layer = c.layer;
    const st = c.serviceType;

    // Clear previous content
    this.innerHTML = '';

    // Set data attributes on the host element
    this.classList.add('layer-item');
    this.setAttribute('data-service-type', st);

    // ── Controls panel ──
    const controls = document.createElement('div');
    controls.className = 'layer-controls';

    // Header (checkbox + layer title)
    const header = document.createElement('div');
    header.className = 'layer-header';

    const cbId = `layer-toggle-${MapmlifyLayer.#idCounter++}`;
    const cb = document.createElement('gcds-checkboxes');
    cb.name = 'layer-toggle';
    cb.legend = layer.title;
    cb.hideLegend = true;
    cb.options = [{ id: cbId, label: layer.title, value: 'active' }];
    if (c.disabledCheckbox) {
      cb.disabled = true;
      cb.hint = t('tiledServicesTooltip');
    }
    this.#layerCheckbox = cb;

    const handleLayerToggle = (checked) => {
      if (checked) {
        this.#viewerActive = true;
        this.#createViewer();
      } else {
        this.#viewerActive = false;
        this.#removeViewer();
      }
    };
    this.#layerToggleHandler = handleLayerToggle;

    cb.addEventListener('gcdsChange', (e) => {
      const isChecked = Array.isArray(e.detail) ? e.detail.includes('active') : false;
      handleLayerToggle(isChecked);
    });

    header.appendChild(cb);
    controls.appendChild(header);

    // Layer name / identifier
    const nameLine = document.createElement('div');
    nameLine.className = 'layer-name';
    const nameLabel = document.createElement('span');
    nameLabel.className = 'layer-name-label';
    const nameValue = document.createElement('span');
    if (st === 'ESRI-MapServer') {
      nameLabel.textContent = `${t('id')}: `;
      nameValue.textContent = `${layer.id} | ${t('name')}: ${layer.name}`;
    } else if (st === 'WMTS') {
      nameLabel.textContent = `${t('identifier')}: `;
      nameValue.textContent = layer.name;
    } else {
      nameLabel.textContent = `${t('name')}: `;
      nameValue.textContent = layer.name;
    }
    nameLine.append(nameLabel, nameValue);
    controls.appendChild(nameLine);

    // Projection selector (WMS/WMTS with multiple projections, or ESRI read-only)
    if (
      (st === 'WMS' || st === 'WMTS') &&
      layer.supportedProjections?.length > 0
    ) {
      controls.appendChild(
        this.#buildSelect(
          t('projection'),
          'projection-select',
          layer.supportedProjections.map((p) => ({ value: p, label: p })),
          this.#selectedProjection,
          (val) => {
            this.#selectedProjection = val;
            this.#boundsEnabled = this.#hasMatchingBounds(val);
            if (this.#boundsCheckbox) {
              const cbId = this.#boundsCheckbox.options?.[0]?.id;
              if (cbId) {
                this.#boundsCheckbox.options = [{ ...this.#boundsCheckbox.options[0], checked: this.#boundsEnabled }];
              }
              this.#boundsCheckbox.value = this.#boundsEnabled ? ['enabled'] : [];
            }
            this.#onControlChange();
          }
        )
      );
    } else if (st === 'ESRI-MapServer' || st === 'ESRI-ImageServer') {
      const projDiv = document.createElement('div');
      projDiv.className = 'projection-selector';
      projDiv.innerHTML = `<label>${t('projection')}</label><span>${this.#esc(c.projection)} (WKID: ${c.wkid})</span>`;
      controls.appendChild(projDiv);
    }

    // Raster properties (ImageServer only)
    let rasterPropsEl = null;
    if (st === 'ESRI-ImageServer' && layer.bandCount) {
      rasterPropsEl = document.createElement('div');
      rasterPropsEl.className = 'raster-props';
      rasterPropsEl.innerHTML = `<p><strong>${t('bands')}</strong> ${layer.bandCount} | <strong>${t('pixelType')}</strong> ${this.#esc(layer.pixelType)}</p>`;
      controls.appendChild(rasterPropsEl);
    }

    // Abstract (appended full-width to this element later)
    let abstractEl = null;
    if (layer.abstract || layer.description) {
      abstractEl = document.createElement('gcds-details');
      abstractEl.className = 'layer-abstract';
      abstractEl.setAttribute('details-title', t('abstract'));
      const p = document.createElement('p');
      p.textContent = layer.abstract || layer.description;
      abstractEl.appendChild(p);
    }

    // ── Collapsible layer options ──
    const optionsDetails = document.createElement('gcds-details');
    optionsDetails.setAttribute('details-title', t('layerOptions'));
    optionsDetails.className = 'layer-options';

    // Bounds toggle
    this.#boundsCheckbox = this.#buildCheckbox(
      t('includeBounds'),
      'bounds',
      this.#boundsEnabled,
      t('boundsTooltip'),
      (val) => {
        this.#boundsEnabled = val;
        this.#onControlChange();
      }
    );
    optionsDetails.appendChild(this.#boundsCheckbox);

    // Query toggle
    const hasQuery = this.#layerIsQueryable();
    if (hasQuery) {
      const queryDiv = document.createElement('div');
      queryDiv.className = 'query-format-selector';

      queryDiv.appendChild(
        this.#buildCheckbox(
          t('query'),
          'query',
          this.#queryEnabled,
          t('enableQueries'),
          (val) => {
            this.#queryEnabled = val;
            this.#onQueryChange();
          }
        )
      );

      // Info format dropdown (WMS / WMTS)
      if (st === 'WMS' && c.getFeatureInfoFormats?.length > 0) {
        queryDiv.appendChild(
          this.#buildSelect(
            t('infoFormat'),
            'query-format-select',
            this.#sortQueryFormats(c.getFeatureInfoFormats).map((f) => ({ value: f, label: f })),
            this.#selectedQueryFormat,
            (val) => {
              this.#selectedQueryFormat = val;
              this.#onQueryChange();
            }
          )
        );
      } else if (st === 'WMTS' && layer.infoFormats?.length > 0) {
        queryDiv.appendChild(
          this.#buildSelect(
            t('infoFormat'),
            'query-format-select',
            this.#sortQueryFormats(layer.infoFormats).map((f) => ({ value: f, label: f })),
            this.#selectedQueryFormat,
            (val) => {
              this.#selectedQueryFormat = val;
              this.#onQueryChange();
            }
          )
        );
      }
      optionsDetails.appendChild(queryDiv);
    }

    // Style selector
    if (
      (st === 'WMS' || st === 'WMTS') &&
      layer.styles?.length > (st === 'WMTS' ? 1 : 0)
    ) {
      optionsDetails.appendChild(
        this.#buildSelect(
          t('style'),
          'style-select',
          layer.styles.map((s) => ({ value: s.name, label: s.title })),
          this.#selectedStyle,
          (val) => {
            this.#selectedStyle = val;
            this.#onControlChange();
          }
        )
      );
    }

    // Export mode selector (ESRI MapServer dynamic only)
    if (st === 'ESRI-MapServer' && !c.isTiled) {
      optionsDetails.appendChild(
        this.#buildSelect(
          t('exportMode'),
          'export-mode-select',
          [
            { value: 'individual', label: t('individualLayer') },
            { value: 'fused', label: t('allLayersFused') },
          ],
          this.#selectedExportMode,
          (val) => {
            this.#selectedExportMode = val;
            this.#onControlChange();
          }
        )
      );
    }

    // Image format selector
    if (st === 'WMS' && c.getMapFormats?.length > 0) {
      optionsDetails.appendChild(
        this.#buildSelect(
          t('imageFormat'),
          'format-select',
          c.getMapFormats.map((f) => ({ value: f, label: f })),
          this.#selectedImageFormat,
          (val) => {
            this.#selectedImageFormat = val;
            this.#onControlChange();
          }
        )
      );
    } else if (st === 'WMTS' && layer.formats?.length > 0) {
      optionsDetails.appendChild(
        this.#buildSelect(
          t('imageFormat'),
          'format-select',
          layer.formats.map((f) => ({ value: f, label: f })),
          this.#selectedImageFormat,
          (val) => {
            this.#selectedImageFormat = val;
            this.#onControlChange();
          }
        )
      );
    } else if (
      st === 'ESRI-MapServer' &&
      !c.isTiled &&
      c.supportedFormats?.length > 0
    ) {
      optionsDetails.appendChild(
        this.#buildSelect(
          t('imageFormat'),
          'format-select',
          c.supportedFormats.map((f) => ({ value: f, label: f })),
          this.#selectedImageFormat,
          (val) => {
            this.#selectedImageFormat = val;
            this.#onControlChange();
          }
        )
      );
    } else if (st === 'ESRI-ImageServer' && c.supportedFormats?.length > 0) {
      optionsDetails.appendChild(
        this.#buildSelect(
          t('imageFormat'),
          'format-select',
          c.supportedFormats.map((f) => ({ value: f, label: f })),
          this.#selectedImageFormat,
          (val) => {
            this.#selectedImageFormat = val;
            this.#onControlChange();
          }
        )
      );
    }

    // Dimension selectors (WMS / WMTS)
    const dims = layer.dimensions || [];
    dims.forEach((dim, dimIdx) => {
      if (dim.usesTemplate) {
        // Fixed-value dimension (too many values)
        const info = document.createElement('div');
        info.className = 'dimension-info';
        info.innerHTML = `<strong>${this.#esc(dim.name)}:</strong> ${this.#esc(dim.default)} <em>(${t('fixedValue')} - ${dim.valueCount} ${t('totalValues')})</em>`;
        optionsDetails.appendChild(info);
      } else {
        const dimDiv = document.createElement('div');
        dimDiv.className = 'dimension-selector';

        const dcb = this.#buildCheckbox(
          dim.name,
          `dimension-${dimIdx}`,
          this.#dimensionStates[dimIdx].enabled,
          null,
          (val) => {
            this.#dimensionStates[dimIdx].enabled = val;
            this.#onControlChange();
          }
        );
        dcb.setAttribute('data-dimension-name', dim.name);

        const dsel = this.#buildSelect(
          dim.name,
          `dimension-select-${dimIdx}`,
          dim.values.map((v) => ({ value: v, label: v })),
          this.#dimensionStates[dimIdx].value,
          (val) => {
            this.#dimensionStates[dimIdx].value = val;
            this.#onControlChange();
          }
        );
        dsel.setAttribute('data-dimension-name', dim.name);
        // Hide the select label since dimension name is already shown on checkbox
        dsel.hideLabel = true;

        dimDiv.append(dcb, dsel);
        optionsDetails.appendChild(dimDiv);
      }
    });

    // optionsDetails appended full-width to this element later

    // Source code buttons
    const codeShowcase = document.createElement('div');
    codeShowcase.className = 'code-showcase';

    const sourceTextareaId = `source-${MapmlifyLayer.#idCounter++}`;

    // Source code display (right side, under map) — uses <pre><code> with Prism highlighting
    const sourcePre = document.createElement('pre');
    sourcePre.className = 'source-code-display language-html';
    sourcePre.id = sourceTextareaId;
    sourcePre.setAttribute('aria-hidden', 'true');
    sourcePre.setAttribute('tabindex', '-1');
    sourcePre.setAttribute('aria-label', `${t('codeDisplay')} - ${layer.title}`);
    sourcePre.style.display = 'none';
    const sourceCode = document.createElement('code');
    sourceCode.className = 'language-html';
    sourcePre.appendChild(sourceCode);
    this.#sourceCodeEl = sourcePre;

    const btnContainer = document.createElement('div');

    const viewBtn = document.createElement('gcds-button');
    viewBtn.className = 'showcase-view-button';
    viewBtn.setAttribute('button-type', 'button');
    viewBtn.setAttribute('button-role', 'secondary');
    viewBtn.setAttribute('size', 'small');
    viewBtn.setAttribute('aria-label', `${t('viewCode')} - ${layer.title}`);
    viewBtn.setAttribute('aria-controls', sourceTextareaId);
    viewBtn.setAttribute('aria-expanded', 'false');
    viewBtn.textContent = t('viewCode');
    viewBtn.addEventListener('click', () => {
      const isHidden = sourcePre.getAttribute('aria-hidden') === 'true';
      sourcePre.setAttribute('aria-hidden', String(!isHidden));
      viewBtn.setAttribute('aria-expanded', String(isHidden));
      if (isHidden) {
        sourcePre.setAttribute('tabindex', '0');
        this.#sourceCodeVisible = true;
        this.#updateSourceCode();
      } else {
        sourcePre.setAttribute('tabindex', '-1');
        sourcePre.style.display = 'none';
        this.#sourceCodeVisible = false;
      }
      viewBtn.textContent = this.#sourceCodeVisible ? t('hideCode') : t('viewCode');
    });

    const copyBtn = document.createElement('gcds-button');
    copyBtn.className = 'showcase-copy-button';
    copyBtn.setAttribute('button-type', 'button');
    copyBtn.setAttribute('button-role', 'secondary');
    copyBtn.setAttribute('size', 'small');
    copyBtn.setAttribute('lang', LOCALE);
    copyBtn.textContent = t('copyCode');
    copyBtn.addEventListener('click', () => {
      if (!this.#sourceCodeRaw) return;
      navigator.clipboard.writeText(this.#sourceCodeRaw).then(
        () => {
          copyBtn.textContent = t('codeCopied');
          setTimeout(() => {
            copyBtn.textContent = t('copyCode');
          }, 1500);
        },
        () => {
          // Fallback: select the pre text so user can Ctrl+C
          const range = document.createRange();
          range.selectNodeContents(sourcePre);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      );
    });

    btnContainer.append(viewBtn, copyBtn);
    codeShowcase.appendChild(btnContainer);

    // Insert buttons right after projection (before raster props if present)
    if (rasterPropsEl) {
      controls.insertBefore(codeShowcase, rasterPropsEl);
    } else {
      controls.appendChild(codeShowcase);
    }
    this.appendChild(controls);

    // ── Viewer panel ──
    const container = document.createElement('div');
    container.className = 'layer-viewer-container';
    this.#viewerContainer = container;

    this.appendChild(container);

    // ── Full-width elements below the controls + map row ──
    this.appendChild(sourcePre);
    if (abstractEl) this.appendChild(abstractEl);
    this.appendChild(optionsDetails);

  }

  // ─── CONTROL CHANGE HANDLERS ──────────────────────────

  // Check if the layer has a bounding box in a CRS that matches the given projection.
  // Returns false when only a WGS 84 fallback would be used for heavily-projected
  // coordinate systems (CBMTILE, APSTILE), because the geographic bounds can be
  // misleading and restrict querying to the wrong area.
  #hasMatchingBounds(projection) {
    const c = this.#config;
    const st = c.serviceType;
    const layer = c.layer;

    if (st === 'WMS') {
      if (!layer.boundingBoxes) return false;
      const crsMap = {
        OSMTILE: ['EPSG:3857', 'MapML:OSMTILE'],
        CBMTILE: ['EPSG:3978', 'MapML:CBMTILE'],
        WGS84: ['EPSG:4326', 'CRS:84', 'MapML:WGS84'],
        APSTILE: ['EPSG:5936', 'MapML:APSTILE'],
      };
      const keys = crsMap[projection] || [];
      for (const key of keys) {
        if (layer.boundingBoxes[key]) return true;
      }
      // WGS84 fallback is acceptable for OSMTILE (reliable transform) and WGS84
      if (projection === 'OSMTILE' || projection === 'WGS84') {
        return !!layer.bbox;
      }
      return false;
    }

    if (st === 'WMTS') {
      // WMTS bbox is always WGS 84; only a reliable match for OSMTILE/WGS84
      if (projection === 'OSMTILE' || projection === 'WGS84') {
        return !!layer.bbox;
      }
      return false;
    }

    // ESRI services: bbox is in the native CRS, always matches
    return !!layer.bbox;
  }

  #onControlChange() {
    if (!this.#viewerActive) return;
    this.#removeViewer();
    this.#createViewer();
  }

  #onQueryChange() {
    if (!this.#viewerActive) return;
    this.#updateQueryInViewer();
    this.#updateSourceCode();
  }

  // ─── VIEWER LIFECYCLE ──────────────────────────────────

  #createViewer() {
    const c = this.#config;
    const layer = c.layer;
    const container = this.#viewerContainer;
    if (!container) return;

    const projection = this.#selectedProjection;

    // Create gcds-ext-map
    const viewer = document.createElement('gcds-ext-map');
    viewer.setAttribute('projection', projection);
    viewer.setAttribute('controls', '');

    // Determine zoom and center
    const { bbox } = layer;
    const centerLat = (parseFloat(bbox.miny) + parseFloat(bbox.maxy)) / 2;
    const centerLon = (parseFloat(bbox.minx) + parseFloat(bbox.maxx)) / 2;

    if (c.serviceType === 'WMTS') {
      viewer.setAttribute('zoom', '2');
    } else if (c.serviceType === 'ESRI-MapServer' && c.isTiled) {
      viewer.setAttribute('zoom', '2');
    } else {
      viewer.setAttribute('zoom', '0');
    }

    if (
      (c.serviceType === 'ESRI-MapServer' ||
        c.serviceType === 'ESRI-ImageServer') &&
      c.wkid !== 4326
    ) {
      viewer.setAttribute('lat', '45');
      viewer.setAttribute('lon', '-75');
    } else {
      viewer.setAttribute('lat', centerLat.toString());
      viewer.setAttribute('lon', centerLon.toString());
    }

    // Add basemap
    if (projection !== 'WGS84') {
      viewer.appendChild(this.#buildBasemapLayer(projection));
    }

    // Add data layer
    this.#addDataLayerToViewer(viewer);

    // Insert viewer before the source code display so it appears above it
    if (this.#sourceCodeEl && this.#sourceCodeEl.parentNode === container) {
      container.insertBefore(viewer, this.#sourceCodeEl);
    } else {
      container.appendChild(viewer);
    }

    // Listen for moveend to update source code
    this.#moveendHandler = () => this.#updateSourceCode();
    viewer.addEventListener('map-moveend', this.#moveendHandler);
    // Initial serialization
    this.#updateSourceCode();
  }

  #removeViewer() {
    const container = this.#viewerContainer;
    if (!container) return;

    const viewer = container.querySelector('gcds-ext-map');
    if (viewer) {
      if (this.#moveendHandler) {
        viewer.removeEventListener('map-moveend', this.#moveendHandler);
        this.#moveendHandler = null;
      }
      viewer.remove();
    }

    // Clear source code
    if (this.#sourceCodeEl) {
      const codeEl = this.#sourceCodeEl.querySelector('code');
      if (codeEl) codeEl.textContent = '';
      this.#sourceCodeRaw = '';
    }
  }

  // ─── BASEMAP ────────────────────────────────────────────

  #buildBasemapLayer(projection) {
    const baseLayer = document.createElement('map-layer');
    const baseExtent = document.createElement('map-extent');
    baseExtent.setAttribute('checked', '');

    const configs = {
      OSMTILE: {
        label: 'Canada Base Map',
        licenseHref: 'https://open.canada.ca/en/open-government-licence-canada',
        licenseTitle: 'Open Government Licence - Canada',
        zoom: { min: '0', max: '15', value: '15' },
        tiles: [
          'https://geoappext.nrcan.gc.ca/arcgis/rest/services/BaseMaps/CBMT_CBCT_GEOM_3857/MapServer/tile/{z}/{y}/{x}?m4h=t',
          'https://geoappext.nrcan.gc.ca/arcgis/rest/services/BaseMaps/CBMT_TXT_3857/MapServer/tile/{z}/{y}/{x}?m4h=t',
        ],
      },
      CBMTILE: {
        label: 'Canada Base Map - Transportation',
        licenseHref: 'https://open.canada.ca/en/open-government-licence-canada',
        licenseTitle: 'Open Government Licence - Canada',
        zoom: { min: '0', max: '17', value: '17' },
        extent:
          'top-left-easting=-5388605, top-left-northing=7005413, bottom-right-easting=3895643, bottom-right-northing=-4427255',
        tiles: [
          'https://geoappext.nrcan.gc.ca/arcgis/rest/services/BaseMaps/CBMT3978/MapServer/tile/{z}/{y}/{x}?m4h=t',
        ],
      },
      APSTILE: {
        label: 'Arctic Ocean Basemap MapML Service',
        licenseHref: 'https://www.esri.com/legal/software-license',
        licenseTitle:
          'Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, HERE, Geonames.org, and other contributors',
        zoom: { min: '0', max: '10', value: '10' },
        tiles: [
          'https://server.arcgisonline.com/arcgis/rest/services/Polar/Arctic_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
        ],
      },
    };

    const cfg = configs[projection];
    if (!cfg) return baseLayer;

    baseLayer.setAttribute('label', cfg.label);
    baseLayer.setAttribute('checked', '');
    baseExtent.setAttribute('units', projection);

    if (cfg.extent) {
      const meta = document.createElement('map-meta');
      meta.setAttribute('name', 'extent');
      meta.setAttribute('content', cfg.extent);
      baseExtent.appendChild(meta);
    }

    const lic = document.createElement('map-link');
    lic.setAttribute('rel', 'license');
    lic.setAttribute('href', cfg.licenseHref);
    lic.setAttribute('title', cfg.licenseTitle);
    baseExtent.appendChild(lic);

    const zoom = document.createElement('map-input');
    zoom.setAttribute('name', 'z');
    zoom.setAttribute('type', 'zoom');
    zoom.setAttribute('min', cfg.zoom.min);
    zoom.setAttribute('max', cfg.zoom.max);
    zoom.setAttribute('value', cfg.zoom.value);
    baseExtent.appendChild(zoom);

    const y = document.createElement('map-input');
    y.setAttribute('name', 'y');
    y.setAttribute('type', 'location');
    y.setAttribute('units', 'tilematrix');
    y.setAttribute('axis', 'row');
    baseExtent.appendChild(y);

    const x = document.createElement('map-input');
    x.setAttribute('name', 'x');
    x.setAttribute('type', 'location');
    x.setAttribute('units', 'tilematrix');
    x.setAttribute('axis', 'column');
    baseExtent.appendChild(x);

    cfg.tiles.forEach((tref) => {
      const link = document.createElement('map-link');
      link.setAttribute('rel', 'tile');
      link.setAttribute('tref', tref);
      baseExtent.appendChild(link);
    });

    baseLayer.appendChild(baseExtent);
    return baseLayer;
  }

  // ─── DATA LAYER BUILDING ───────────────────────────────

  #addDataLayerToViewer(viewer) {
    const st = this.#config.serviceType;
    if (st === 'WMS') this.#addWMSLayer(viewer);
    else if (st === 'WMTS') this.#addWMTSLayer(viewer);
    else if (st === 'ESRI-MapServer') this.#addESRIMapServerLayer(viewer);
    else if (st === 'ESRI-ImageServer') this.#addESRIImageServerLayer(viewer);
  }

  // ── WMS ──

  #addWMSLayer(viewer) {
    const c = this.#config;
    const layer = c.layer;
    const version = c.version;
    const viewerProjection = viewer.getAttribute('projection') || 'OSMTILE';
    const { bbox } = layer;
    const styleName = this.#selectedStyle;
    const imgFormat = this.#selectedImageFormat;
    const includeBounds = this.#boundsEnabled;
    const queryEnabled = this.#queryEnabled;
    const selectedFormat = this.#selectedQueryFormat;

    // Map projection to CRS
    const { projectionCode, units } = this.#projectionToCRS(viewerProjection);

    // Determine bounding box
    let extentBbox = null;
    let extentCRS = null;

    if (layer.boundingBoxes) {
      const crsMap = {
        OSMTILE: ['EPSG:3857', 'MapML:OSMTILE'],
        CBMTILE: ['EPSG:3978', 'MapML:CBMTILE'],
        WGS84: ['EPSG:4326', 'CRS:84', 'MapML:WGS84'],
        APSTILE: ['EPSG:5936', 'MapML:APSTILE'],
      };
      const keys = crsMap[viewerProjection] || [];
      for (const key of keys) {
        if (layer.boundingBoxes[key]) {
          extentBbox = layer.boundingBoxes[key];
          extentCRS = key.startsWith('MapML:')
            ? `EPSG:${key === 'MapML:WGS84' ? '4326' : key === 'MapML:OSMTILE' ? '3857' : key === 'MapML:CBMTILE' ? '3978' : '5936'}`
            : key;
          break;
        }
      }
    }

    if (!extentBbox) {
      if (viewerProjection === 'OSMTILE') {
        const minCoords = wgs84ToWebMercator(
          parseFloat(bbox.minx),
          parseFloat(bbox.miny)
        );
        const maxCoords = wgs84ToWebMercator(
          parseFloat(bbox.maxx),
          parseFloat(bbox.maxy)
        );
        extentBbox = {
          minx: minCoords.x.toString(),
          miny: minCoords.y.toString(),
          maxx: maxCoords.x.toString(),
          maxy: maxCoords.y.toString(),
        };
        extentCRS = 'EPSG:3857';
      } else {
        extentBbox = bbox;
        extentCRS = 'EPSG:4326';
      }
    }

    const mapLayer = document.createElement('map-layer');
    mapLayer.setAttribute('label', layer.title);
    mapLayer.setAttribute('checked', '');
    mapLayer.setAttribute('data-wms-layer', layer.name);

    // Bounds meta
    if (includeBounds && extentBbox) {
      const meta = document.createElement('map-meta');
      meta.setAttribute('name', 'extent');
      const isGeo = extentCRS === 'EPSG:4326' || extentCRS === 'CRS:84';
      const content = isGeo
        ? `top-left-longitude=${extentBbox.minx}, top-left-latitude=${extentBbox.maxy}, bottom-right-longitude=${extentBbox.maxx}, bottom-right-latitude=${extentBbox.miny}`
        : `top-left-easting=${extentBbox.minx}, top-left-northing=${extentBbox.maxy}, bottom-right-easting=${extentBbox.maxx}, bottom-right-northing=${extentBbox.miny}`;
      meta.setAttribute('content', content);
      mapLayer.appendChild(meta);
    }

    // License
    if (layer.licenseUrl) {
      const lic = document.createElement('map-link');
      lic.setAttribute('rel', 'license');
      lic.setAttribute('href', layer.licenseUrl);
      if (layer.licenseTitle)
        lic.setAttribute('title', `${layer.licenseTitle} for ${layer.title}`);
      mapLayer.appendChild(lic);
    }

    // Legend
    if (layer.styles?.length > 0 && styleName) {
      const style = layer.styles.find((s) => s.name === styleName);
      if (style?.legendURLs?.length > 0) {
        const legend = style.legendURLs[0];
        const ll = document.createElement('map-link');
        ll.setAttribute('rel', 'legend');
        ll.setAttribute('href', legend.href);
        if (style.title) ll.setAttribute('title', style.title);
        if (legend.width) ll.setAttribute('width', legend.width);
        if (legend.height) ll.setAttribute('height', legend.height);
        mapLayer.appendChild(ll);
      }
    }

    // Extent
    const mapExtent = document.createElement('map-extent');
    mapExtent.setAttribute('units', units);
    mapExtent.setAttribute('checked', '');

    // Location/size inputs
    const inputs = [
      {
        name: 'xmin',
        type: 'location',
        units: 'pcrs',
        axis: 'easting',
        position: 'top-left',
      },
      {
        name: 'ymin',
        type: 'location',
        units: 'pcrs',
        axis: 'northing',
        position: 'bottom-left',
      },
      {
        name: 'xmax',
        type: 'location',
        units: 'pcrs',
        axis: 'easting',
        position: 'bottom-right',
      },
      {
        name: 'ymax',
        type: 'location',
        units: 'pcrs',
        axis: 'northing',
        position: 'top-right',
      },
      { name: 'w', type: 'width', min: '1', max: '10000' },
      { name: 'h', type: 'height', min: '1', max: '10000' },
      { name: 'i', type: 'location', units: 'map', axis: 'i' },
      { name: 'j', type: 'location', units: 'map', axis: 'j' },
    ];
    this.#appendMapInputs(mapExtent, inputs);

    // Style selector
    if (layer.styles?.length > 0) {
      const mapSelect = document.createElement('map-select');
      mapSelect.setAttribute('id', 'style-selector');
      mapSelect.setAttribute('name', 'style');
      layer.styles.forEach((style) => {
        const opt = document.createElement('map-option');
        opt.setAttribute('value', style.name);
        opt.textContent = style.title;
        if (style.name === styleName) opt.setAttribute('selected', '');
        mapSelect.appendChild(opt);
      });
      mapExtent.appendChild(mapSelect);
    }

    // Dimension selectors
    this.#appendDimensionSelectors(mapExtent, layer);

    // Image link
    const mapLink = document.createElement('map-link');
    mapLink.setAttribute('rel', 'image');

    let tref = `${c.baseUrl}?SERVICE=WMS&VERSION=${version}&REQUEST=GetMap&LAYERS=${encodeURIComponent(layer.name)}&WIDTH={w}&HEIGHT={h}&FORMAT=${encodeURIComponent(imgFormat)}`;
    if (
      imgFormat.toLowerCase().includes('png') ||
      imgFormat.toLowerCase().includes('gif')
    ) {
      tref += '&TRANSPARENT=TRUE';
    }
    if (styleName) tref += '&STYLES={style}';

    // Dimension params
    (layer.dimensions || []).forEach((dim, dimIdx) => {
      if (this.#dimensionStates[dimIdx].enabled) {
        tref += `&${formatDimensionParam(dim.name)}={${dim.name}}`;
      }
    });

    if (version.startsWith('1.3')) {
      tref += `&CRS=${projectionCode}`;
      tref +=
        projectionCode === 'EPSG:4326'
          ? '&BBOX={ymin},{xmin},{ymax},{xmax}'
          : '&BBOX={xmin},{ymin},{xmax},{ymax}';
    } else {
      tref += `&SRS=${projectionCode}`;
      tref += '&BBOX={xmin},{ymin},{xmax},{ymax}';
    }
    mapLink.setAttribute('tref', tref);
    mapExtent.appendChild(mapLink);

    // Query link
    if (queryEnabled && layer.queryable) {
      mapExtent.appendChild(
        this.#buildWMSQueryLink(
          layer,
          version,
          projectionCode,
          selectedFormat,
          styleName,
          imgFormat
        )
      );
    }

    mapLayer.appendChild(mapExtent);
    viewer.appendChild(mapLayer);
  }

  #buildWMSQueryLink(
    layer,
    version,
    projectionCode,
    infoFormat,
    styleName,
    imageFormat
  ) {
    const c = this.#config;
    const queryLink = document.createElement('map-link');
    queryLink.setAttribute('rel', 'query');
    queryLink.setAttribute('data-query-link', 'true');

    const imgFormat = imageFormat || 'image/png';
    let tref = `${c.baseUrl}?SERVICE=WMS&VERSION=${version}&REQUEST=GetFeatureInfo&LAYERS=${encodeURIComponent(layer.name)}&QUERY_LAYERS=${encodeURIComponent(layer.name)}&WIDTH={w}&HEIGHT={h}&FORMAT=${encodeURIComponent(imgFormat)}`;
    if (
      imgFormat.toLowerCase().includes('png') ||
      imgFormat.toLowerCase().includes('gif')
    ) {
      tref += '&TRANSPARENT=TRUE';
    }
    tref += `&INFO_FORMAT=${encodeURIComponent(infoFormat)}`;

    if (styleName) {
      if (styleName.toLowerCase().startsWith('default-')) {
        tref += '&STYLES=';
      } else {
        tref += '&STYLES={style}';
      }
    }

    // Dimension params
    (layer.dimensions || []).forEach((dim, dimIdx) => {
      if (this.#dimensionStates[dimIdx].enabled) {
        tref += `&${formatDimensionParam(dim.name)}={${dim.name}}`;
      }
    });

    if (version.startsWith('1.3')) {
      tref += `&CRS=${projectionCode}`;
      tref +=
        projectionCode === 'EPSG:4326'
          ? '&BBOX={ymin},{xmin},{ymax},{xmax}'
          : '&BBOX={xmin},{ymin},{xmax},{ymax}';
    } else {
      tref += `&SRS=${projectionCode}`;
      tref += '&BBOX={xmin},{ymin},{xmax},{ymax}';
    }

    tref += version.startsWith('1.3') ? '&I={i}&J={j}' : '&X={i}&Y={j}';

    queryLink.setAttribute('tref', tref);
    return queryLink;
  }

  // ── WMTS ──

  #addWMTSLayer(viewer) {
    const c = this.#config;
    const layer = c.layer;
    const viewerProjection = viewer.getAttribute('projection') || 'OSMTILE';
    const { bbox } = layer;
    const styleName =
      this.#selectedStyle || (layer.styles?.[0]?.name ?? 'default');
    const imgFormat =
      this.#selectedImageFormat || layer.formats?.[0] || 'image/png';
    const includeBounds = this.#boundsEnabled;
    const queryEnabled = this.#queryEnabled;
    const selectedFormat = this.#selectedQueryFormat;

    const tileMatrixSet = layer.supportedTileMatrixSets.find(
      (tms) => tms.projection === viewerProjection
    );
    if (!tileMatrixSet) return;

    const mapLayer = document.createElement('map-layer');
    mapLayer.setAttribute('label', layer.title);
    mapLayer.setAttribute('checked', '');
    mapLayer.setAttribute('data-wmts-layer', layer.name);
    mapLayer.setAttribute('data-service-type', 'WMTS');

    // Bounds
    if (includeBounds && bbox) {
      const meta = document.createElement('map-meta');
      meta.setAttribute('name', 'extent');
      meta.setAttribute(
        'content',
        `top-left-longitude=${bbox.minx}, top-left-latitude=${bbox.maxy}, bottom-right-longitude=${bbox.maxx}, bottom-right-latitude=${bbox.miny}`
      );
      mapLayer.appendChild(meta);
    }

    // License
    const licenseLink = document.createElement('map-link');
    licenseLink.setAttribute('rel', 'license');
    if (layer.licenseUrl) {
      licenseLink.setAttribute('href', layer.licenseUrl);
      if (layer.licenseTitle)
        licenseLink.setAttribute(
          'title',
          `${layer.licenseTitle} for ${layer.title}`
        );
    } else if (c.baseUrl) {
      licenseLink.setAttribute(
        'href',
        c.baseUrl + '?SERVICE=WMTS&REQUEST=GetCapabilities'
      );
      if (c.title) licenseLink.setAttribute('title', c.title);
    }
    if (licenseLink.getAttribute('href')) mapLayer.appendChild(licenseLink);

    // Legend
    if (layer.styles?.length > 0 && styleName) {
      const style = layer.styles.find((s) => s.name === styleName);
      if (style?.legendURLs?.length > 0) {
        const legend = style.legendURLs[0];
        const ll = document.createElement('map-link');
        ll.setAttribute('rel', 'legend');
        ll.setAttribute('href', legend.href);
        if (style.title) ll.setAttribute('title', style.title);
        if (legend.width) ll.setAttribute('width', legend.width);
        if (legend.height) ll.setAttribute('height', legend.height);
        mapLayer.appendChild(ll);
      }
    }

    // Extent
    const mapExtent = document.createElement('map-extent');
    mapExtent.setAttribute('units', viewerProjection);
    mapExtent.setAttribute('checked', '');

    // Zoom levels
    let minZoom = '0',
      maxZoom = '18';
    if (tileMatrixSet.tileMatrices?.length > 0) {
      const firstId = tileMatrixSet.tileMatrices[0].identifier;
      const lastId =
        tileMatrixSet.tileMatrices[tileMatrixSet.tileMatrices.length - 1]
          .identifier;
      const firstMatch = firstId?.match(/:(\d+)$/);
      const lastMatch = lastId?.match(/:(\d+)$/);
      if (firstMatch && lastMatch) {
        minZoom = firstMatch[1];
        maxZoom = lastMatch[1];
      } else {
        minZoom = firstId || '0';
        maxZoom = lastId || '18';
      }
    }

    const zoomInput = document.createElement('map-input');
    zoomInput.setAttribute('name', 'z');
    zoomInput.setAttribute('type', 'zoom');
    zoomInput.setAttribute('min', minZoom);
    zoomInput.setAttribute('max', maxZoom);
    mapExtent.appendChild(zoomInput);

    this.#appendMapInputs(mapExtent, [
      { name: 'x', type: 'location', units: 'tilematrix', axis: 'column' },
      { name: 'y', type: 'location', units: 'tilematrix', axis: 'row' },
    ]);

    if (queryEnabled && layer.queryable) {
      this.#appendMapInputs(mapExtent, [
        { name: 'i', type: 'location', units: 'tile', axis: 'i' },
        { name: 'j', type: 'location', units: 'tile', axis: 'j' },
      ]);
    }

    // Style selector in map-extent
    if (layer.styles?.length > 1) {
      const mapSelect = document.createElement('map-select');
      mapSelect.setAttribute('id', 'style-selector');
      mapSelect.setAttribute('name', 'style');
      layer.styles.forEach((style) => {
        const opt = document.createElement('map-option');
        opt.setAttribute('value', style.name);
        opt.textContent = style.title;
        if (style.name === styleName) opt.setAttribute('selected', '');
        mapSelect.appendChild(opt);
      });
      mapExtent.appendChild(mapSelect);
    }

    // Dimension selectors
    this.#appendDimensionSelectors(mapExtent, layer);

    // Tile link
    const tileMatrixReplacement = this.#getTileMatrixReplacement(tileMatrixSet);
    const tileResources = layer.resourceURLs['tile'] || [];
    const tileResource =
      tileResources.find((r) => r.format === imgFormat) || tileResources[0];
    if (tileResource) {
      const mapLink = document.createElement('map-link');
      mapLink.setAttribute('rel', 'tile');
      let tref = this.#buildWMTSTref(
        tileResource.template,
        tileMatrixSet,
        tileMatrixReplacement,
        styleName,
        layer
      );
      mapLink.setAttribute('tref', tref);
      mapExtent.appendChild(mapLink);
    }

    // Query link
    if (queryEnabled && layer.queryable) {
      const queryResources = layer.resourceURLs['FeatureInfo'] || [];
      const queryResource =
        queryResources.find((r) => r.format === selectedFormat) ||
        queryResources[0];
      if (queryResource) {
        const queryLink = document.createElement('map-link');
        queryLink.setAttribute('rel', 'query');
        queryLink.setAttribute('data-query-link', 'true');
        let qtref = this.#buildWMTSQueryTref(
          queryResource.template,
          tileMatrixSet,
          tileMatrixReplacement,
          styleName,
          selectedFormat,
          layer
        );
        queryLink.setAttribute('tref', qtref);
        mapExtent.appendChild(queryLink);
      }
    }

    mapLayer.appendChild(mapExtent);
    viewer.appendChild(mapLayer);
  }

  #buildWMTSTref(
    template,
    tileMatrixSet,
    tileMatrixReplacement,
    styleName,
    layer
  ) {
    let tref = template;
    tref = tref.replace(/{TileMatrixSet}/g, tileMatrixSet.identifier);
    tref = tref.replace(/{TileMatrix}/g, tileMatrixReplacement);
    tref = tref.replace(/{TileRow}/g, '{y}');
    tref = tref.replace(/{TileCol}/g, '{x}');
    tref = tref.replace(/{Style}/g, styleName);
    tref = tref.replace(/{style}/g, styleName);

    (layer.dimensions || []).forEach((dim) => {
      const pat = new RegExp('\\{' + dim.name + '\\}', 'g');
      tref = dim.usesTemplate
        ? tref.replace(pat, dim.default)
        : tref.replace(pat, '{' + dim.name + '}');
    });
    return tref;
  }

  #buildWMTSQueryTref(
    template,
    tileMatrixSet,
    tileMatrixReplacement,
    styleName,
    selectedFormat,
    layer
  ) {
    let qtref = template;
    qtref = qtref.replace(/{TileMatrixSet}/g, tileMatrixSet.identifier);
    qtref = qtref.replace(/{TileMatrix}/g, tileMatrixReplacement);
    qtref = qtref.replace(/{TileRow}/g, '{y}');
    qtref = qtref.replace(/{TileCol}/g, '{x}');
    qtref = qtref.replace(/{Style}/g, styleName);
    qtref = qtref.replace(/{style}/g, styleName);
    qtref = qtref.replace(/{I}/g, '{i}');
    qtref = qtref.replace(/{J}/g, '{j}');
    qtref = qtref.replace(/{InfoFormat}/g, selectedFormat);
    qtref = qtref.replace(/{infoformat}/g, selectedFormat);

    (layer.dimensions || []).forEach((dim) => {
      const pat = new RegExp('\\{' + dim.name + '\\}', 'g');
      qtref = dim.usesTemplate
        ? qtref.replace(pat, dim.default)
        : qtref.replace(pat, '{' + dim.name + '}');
    });
    return qtref;
  }

  #getTileMatrixReplacement(tileMatrixSet) {
    if (tileMatrixSet.tileMatrices?.length > 0) {
      const firstId = tileMatrixSet.tileMatrices[0].identifier;
      const lastId =
        tileMatrixSet.tileMatrices[tileMatrixSet.tileMatrices.length - 1]
          .identifier;
      const firstMatch = firstId?.match(/^(.+):(\d+)$/);
      const lastMatch = lastId?.match(/^(.+):(\d+)$/);
      if (firstMatch && lastMatch && firstMatch[1] === lastMatch[1]) {
        return firstMatch[1] + ':{z}';
      }
    }
    return '{z}';
  }

  // ── ESRI MapServer ──

  #addESRIMapServerLayer(viewer) {
    const c = this.#config;
    const layer = c.layer;
    const viewerProjection = viewer.getAttribute('projection') || 'OSMTILE';
    const { bbox } = layer;
    const queryEnabled = this.#queryEnabled;
    const selectedFormat = this.#selectedImageFormat;
    const exportMode = this.#selectedExportMode;
    const includeBounds = this.#boundsEnabled;

    const mapLayer = document.createElement('map-layer');
    mapLayer.setAttribute('label', layer.title);
    mapLayer.setAttribute('checked', '');
    mapLayer.setAttribute('data-esri-layer', layer.name);
    mapLayer.setAttribute('data-service-type', 'ESRI-MapServer');

    // Bounds
    if (includeBounds && bbox) {
      const meta = document.createElement('map-meta');
      meta.setAttribute('name', 'extent');
      const content =
        c.wkid === 4326
          ? `top-left-longitude=${bbox.minx}, top-left-latitude=${bbox.maxy}, bottom-right-longitude=${bbox.maxx}, bottom-right-latitude=${bbox.miny}`
          : `top-left-easting=${bbox.minx}, top-left-northing=${bbox.maxy}, bottom-right-easting=${bbox.maxx}, bottom-right-northing=${bbox.miny}`;
      meta.setAttribute('content', content);
      mapLayer.appendChild(meta);
    }

    // Copyright
    if (c.copyrightText) {
      const lic = document.createElement('map-link');
      lic.setAttribute('rel', 'license');
      lic.setAttribute('title', c.copyrightText);
      lic.setAttribute('href', '#');
      mapLayer.appendChild(lic);
    }

    const mapExtent = document.createElement('map-extent');
    mapExtent.setAttribute('units', viewerProjection);
    mapExtent.setAttribute('checked', '');

    if (c.isTiled) {
      // Tiled service
      const minZoom = c.tileInfo ? c.tileInfo.minZoom.toString() : '0';
      const maxZoom = c.tileInfo ? c.tileInfo.maxZoom.toString() : '18';

      const zoomInput = document.createElement('map-input');
      zoomInput.setAttribute('name', 'z');
      zoomInput.setAttribute('type', 'zoom');
      zoomInput.setAttribute('min', minZoom);
      zoomInput.setAttribute('max', maxZoom);
      mapExtent.appendChild(zoomInput);

      this.#appendMapInputs(mapExtent, [
        { name: 'x', type: 'location', units: 'tilematrix', axis: 'column' },
        { name: 'y', type: 'location', units: 'tilematrix', axis: 'row' },
      ]);

      const tileLink = document.createElement('map-link');
      tileLink.setAttribute('rel', 'tile');
      tileLink.setAttribute('tref', `${c.baseUrl}/tile/{z}/{y}/{x}`);
      mapExtent.appendChild(tileLink);
    } else {
      // Dynamic service
      this.#appendMapInputs(mapExtent, [
        {
          name: 'xmin',
          type: 'location',
          units: 'pcrs',
          axis: 'easting',
          position: 'top-left',
        },
        {
          name: 'ymin',
          type: 'location',
          units: 'pcrs',
          axis: 'northing',
          position: 'bottom-left',
        },
        {
          name: 'xmax',
          type: 'location',
          units: 'pcrs',
          axis: 'easting',
          position: 'bottom-right',
        },
        {
          name: 'ymax',
          type: 'location',
          units: 'pcrs',
          axis: 'northing',
          position: 'top-right',
        },
        { name: 'w', type: 'width', min: '1', max: '10000' },
        { name: 'h', type: 'height', min: '1', max: '10000' },
      ]);

      if (queryEnabled) {
        this.#appendMapInputs(mapExtent, [
          { name: 'i', type: 'location', units: 'map', axis: 'i' },
          { name: 'j', type: 'location', units: 'map', axis: 'j' },
        ]);
      }

      // Image link
      let layersParam;
      if (exportMode === 'fused') {
        const allIds = c.layers.map((l) => l.id).join(',');
        layersParam = `show:${allIds}`;
      } else {
        layersParam = `show:${layer.id}`;
      }

      const formatMap = { png: 'png32', jpg: 'jpg', gif: 'gif' };
      const esriFormat = formatMap[selectedFormat] || 'png32';

      const imageLink = document.createElement('map-link');
      imageLink.setAttribute('rel', 'image');
      imageLink.setAttribute(
        'tref',
        `${c.baseUrl}/export?bbox={xmin},{ymin},{xmax},{ymax}&bboxSR=${c.wkid}&size={w},{h}&imageSR=${c.wkid}&format=${esriFormat}&transparent=true&f=image&layers=${encodeURIComponent(layersParam)}`
      );
      mapExtent.appendChild(imageLink);

      // Query link
      if (queryEnabled && c.supportsQuery) {
        const queryLink = document.createElement('map-link');
        queryLink.setAttribute('rel', 'query');
        queryLink.setAttribute('data-query-link', 'true');
        queryLink.setAttribute(
          'tref',
          `${c.baseUrl}/identify?geometry={i},{j}&geometryType=esriGeometryPoint&sr=${c.wkid}&layers=all:${layer.id}&tolerance=5&mapExtent={xmin},{ymin},{xmax},{ymax}&imageDisplay={w},{h},96&returnGeometry=true&f=json`
        );
        mapExtent.appendChild(queryLink);
      }
    }

    mapLayer.appendChild(mapExtent);
    viewer.appendChild(mapLayer);
  }

  // ── ESRI ImageServer ──

  #addESRIImageServerLayer(viewer) {
    const c = this.#config;
    const layer = c.layer;
    const viewerProjection = viewer.getAttribute('projection') || 'OSMTILE';
    const { bbox } = layer;
    const queryEnabled = this.#queryEnabled;
    const selectedFormat = this.#selectedImageFormat;
    const includeBounds = this.#boundsEnabled;

    const mapLayer = document.createElement('map-layer');
    mapLayer.setAttribute('label', layer.title);
    mapLayer.setAttribute('checked', '');
    mapLayer.setAttribute('data-esri-layer', layer.name);
    mapLayer.setAttribute('data-service-type', 'ESRI-ImageServer');

    // Bounds
    if (includeBounds && bbox) {
      const meta = document.createElement('map-meta');
      meta.setAttribute('name', 'extent');
      const content =
        c.wkid === 4326
          ? `top-left-longitude=${bbox.minx}, top-left-latitude=${bbox.maxy}, bottom-right-longitude=${bbox.maxx}, bottom-right-latitude=${bbox.miny}`
          : `top-left-easting=${bbox.minx}, top-left-northing=${bbox.maxy}, bottom-right-easting=${bbox.maxx}, bottom-right-northing=${bbox.miny}`;
      meta.setAttribute('content', content);
      mapLayer.appendChild(meta);
    }

    // Copyright
    if (c.copyrightText) {
      const lic = document.createElement('map-link');
      lic.setAttribute('rel', 'license');
      lic.setAttribute('title', c.copyrightText);
      lic.setAttribute('href', '#');
      mapLayer.appendChild(lic);
    }

    const mapExtent = document.createElement('map-extent');
    mapExtent.setAttribute('units', viewerProjection);
    mapExtent.setAttribute('checked', '');

    this.#appendMapInputs(mapExtent, [
      {
        name: 'xmin',
        type: 'location',
        units: 'pcrs',
        axis: 'easting',
        position: 'top-left',
      },
      {
        name: 'ymin',
        type: 'location',
        units: 'pcrs',
        axis: 'northing',
        position: 'bottom-left',
      },
      {
        name: 'xmax',
        type: 'location',
        units: 'pcrs',
        axis: 'easting',
        position: 'bottom-right',
      },
      {
        name: 'ymax',
        type: 'location',
        units: 'pcrs',
        axis: 'northing',
        position: 'top-right',
      },
      { name: 'w', type: 'width', min: '1', max: '10000' },
      { name: 'h', type: 'height', min: '1', max: '10000' },
    ]);

    if (queryEnabled) {
      this.#appendMapInputs(mapExtent, [
        { name: 'i', type: 'location', units: 'map', axis: 'i' },
        { name: 'j', type: 'location', units: 'map', axis: 'j' },
      ]);
    }

    // Image link
    const formatMap = { png: 'png', jpgpng: 'jpgpng', tiff: 'tiff' };
    const esriFormat = formatMap[selectedFormat] || 'jpgpng';

    const imageLink = document.createElement('map-link');
    imageLink.setAttribute('rel', 'image');
    imageLink.setAttribute(
      'tref',
      `${c.baseUrl}/exportImage?bbox={xmin},{ymin},{xmax},{ymax}&bboxSR=${c.wkid}&size={w},{h}&imageSR=${c.wkid}&format=${esriFormat}&pixelType=U8&noData=0&interpolation=RSP_BilinearInterpolation&f=image`
    );
    mapExtent.appendChild(imageLink);

    // Query link
    if (queryEnabled && c.supportsQuery) {
      const queryLink = document.createElement('map-link');
      queryLink.setAttribute('rel', 'query');
      queryLink.setAttribute('data-query-link', 'true');
      queryLink.setAttribute(
        'tref',
        `${c.baseUrl}/identify?geometry={i},{j}&geometryType=esriGeometryPoint&sr=${c.wkid}&tolerance=5&mapExtent={xmin},{ymin},{xmax},{ymax}&imageDisplay={w},{h},96&returnGeometry=false&returnCatalogItems=true&f=json`
      );
      mapExtent.appendChild(queryLink);
    }

    mapLayer.appendChild(mapExtent);
    viewer.appendChild(mapLayer);
  }

  // ─── QUERY UPDATE (partial, no rebuild) ─────────────────

  #updateQueryInViewer() {
    const st = this.#config.serviceType;
    const container = this.#viewerContainer;
    if (!container) return;
    const viewer = container.querySelector('gcds-ext-map');
    if (!viewer) return;

    if (st === 'WMS') this.#updateWMSQuery(viewer);
    else if (st === 'WMTS') this.#updateWMTSQuery(viewer);
    else if (st === 'ESRI-MapServer') this.#updateESRIMapServerQuery(viewer);
    else if (st === 'ESRI-ImageServer')
      this.#updateESRIImageServerQuery(viewer);
  }

  #updateWMSQuery(viewer) {
    const layer = this.#config.layer;
    const mapLayer = viewer.querySelector(
      `map-layer[data-wms-layer="${layer.name}"]`
    );
    if (!mapLayer) return;
    const mapExtent = mapLayer.querySelector('map-extent');
    const existing = mapExtent.querySelector(
      'map-link[data-query-link="true"]'
    );

    if (this.#queryEnabled) {
      if (existing) existing.remove();
      const viewerProjection = viewer.getAttribute('projection') || 'OSMTILE';
      const { projectionCode } = this.#projectionToCRS(viewerProjection);
      const queryLink = this.#buildWMSQueryLink(
        layer,
        this.#config.version,
        projectionCode,
        this.#selectedQueryFormat,
        this.#selectedStyle,
        this.#selectedImageFormat
      );
      mapExtent.appendChild(queryLink);
    } else if (existing) {
      existing.remove();
    }
  }

  #updateWMTSQuery(viewer) {
    const layer = this.#config.layer;
    const mapLayer = viewer.querySelector(
      'map-layer[data-service-type="WMTS"]'
    );
    if (!mapLayer) return;
    const mapExtent = mapLayer.querySelector('map-extent');
    if (!mapExtent) return;

    const existing = mapExtent.querySelector(
      'map-link[data-query-link="true"]'
    );
    const existingI = mapExtent.querySelector('map-input[name="i"]');
    const existingJ = mapExtent.querySelector('map-input[name="j"]');

    if (this.#queryEnabled && layer.queryable) {
      if (existing) existing.remove();
      if (existingI) existingI.remove();
      if (existingJ) existingJ.remove();

      this.#appendMapInputs(mapExtent, [
        { name: 'i', type: 'location', units: 'tile', axis: 'i' },
        { name: 'j', type: 'location', units: 'tile', axis: 'j' },
      ]);

      const tileMatrixSet = layer.supportedTileMatrixSets.find(
        (tms) => tms.projection === this.#selectedProjection
      );
      if (!tileMatrixSet) return;

      const queryResources = layer.resourceURLs['FeatureInfo'] || [];
      const queryResource =
        queryResources.find((r) => r.format === this.#selectedQueryFormat) ||
        queryResources[0];
      if (queryResource) {
        const tileMatrixReplacement =
          this.#getTileMatrixReplacement(tileMatrixSet);
        const queryLink = document.createElement('map-link');
        queryLink.setAttribute('rel', 'query');
        queryLink.setAttribute('data-query-link', 'true');
        queryLink.setAttribute(
          'tref',
          this.#buildWMTSQueryTref(
            queryResource.template,
            tileMatrixSet,
            tileMatrixReplacement,
            this.#selectedStyle,
            this.#selectedQueryFormat,
            layer
          )
        );
        mapExtent.appendChild(queryLink);
      }
    } else {
      if (existing) existing.remove();
      if (existingI) existingI.remove();
      if (existingJ) existingJ.remove();
    }
  }

  #updateESRIMapServerQuery(viewer) {
    const c = this.#config;
    const layer = c.layer;
    const mapLayer = viewer.querySelector(
      'map-layer[data-service-type="ESRI-MapServer"]'
    );
    if (!mapLayer) return;
    const mapExtent = mapLayer.querySelector('map-extent');
    if (!mapExtent) return;

    // No query for tiled services
    if (mapExtent.querySelector('map-link[rel="tile"]')) return;

    const existing = mapExtent.querySelector(
      'map-link[data-query-link="true"]'
    );
    const existingI = mapExtent.querySelector('map-input[name="i"]');
    const existingJ = mapExtent.querySelector('map-input[name="j"]');

    if (this.#queryEnabled && c.supportsQuery) {
      if (existing) existing.remove();
      if (existingI) existingI.remove();
      if (existingJ) existingJ.remove();

      this.#appendMapInputs(mapExtent, [
        { name: 'i', type: 'location', units: 'map', axis: 'i' },
        { name: 'j', type: 'location', units: 'map', axis: 'j' },
      ]);

      const queryLink = document.createElement('map-link');
      queryLink.setAttribute('rel', 'query');
      queryLink.setAttribute('data-query-link', 'true');
      queryLink.setAttribute(
        'tref',
        `${c.baseUrl}/identify?geometry={i},{j}&geometryType=esriGeometryPoint&sr=${c.wkid}&layers=all:${layer.id}&tolerance=5&mapExtent={xmin},{ymin},{xmax},{ymax}&imageDisplay={w},{h},96&returnGeometry=true&f=json`
      );
      mapExtent.appendChild(queryLink);
    } else {
      if (existing) existing.remove();
      if (existingI) existingI.remove();
      if (existingJ) existingJ.remove();
    }
  }

  #updateESRIImageServerQuery(viewer) {
    const c = this.#config;
    const mapLayer = viewer.querySelector(
      'map-layer[data-service-type="ESRI-ImageServer"]'
    );
    if (!mapLayer) return;
    const mapExtent = mapLayer.querySelector('map-extent');
    if (!mapExtent) return;

    const existing = mapExtent.querySelector(
      'map-link[data-query-link="true"]'
    );
    const existingI = mapExtent.querySelector('map-input[name="i"]');
    const existingJ = mapExtent.querySelector('map-input[name="j"]');

    if (this.#queryEnabled && c.supportsQuery) {
      if (existing) existing.remove();
      if (existingI) existingI.remove();
      if (existingJ) existingJ.remove();

      this.#appendMapInputs(mapExtent, [
        { name: 'i', type: 'location', units: 'map', axis: 'i' },
        { name: 'j', type: 'location', units: 'map', axis: 'j' },
      ]);

      const queryLink = document.createElement('map-link');
      queryLink.setAttribute('rel', 'query');
      queryLink.setAttribute('data-query-link', 'true');
      queryLink.setAttribute(
        'tref',
        `${c.baseUrl}/identify?geometry={i},{j}&geometryType=esriGeometryPoint&sr=${c.wkid}&tolerance=5&mapExtent={xmin},{ymin},{xmax},{ymax}&imageDisplay={w},{h},96&returnGeometry=false&returnCatalogItems=true&f=json`
      );
      mapExtent.appendChild(queryLink);
    } else {
      if (existing) existing.remove();
      if (existingI) existingI.remove();
      if (existingJ) existingJ.remove();
    }
  }

  // ─── SHARED HELPERS ───────────────────────────────────

  // Select best query format based on priority:
  // 1. text/mapml
  // 2. application/json, application/geo+json, application/geojson, or geojson
  // 3. text/html
  // 4. text/plain
  // 5. first format in list (fallback)
  #selectBestQueryFormat(formats) {
    if (!formats || formats.length === 0) return 'text/html';

    // Check for text/mapml (highest priority)
    const mapml = formats.find((f) => f.toLowerCase() === 'text/mapml');
    if (mapml) return mapml;

    // Check for application/json, application/geo+json, application/geojson, or geojson
    const json = formats.find(
      (f) =>
        f.toLowerCase() === 'application/json' ||
        f.toLowerCase() === 'application/geo+json' ||
        f.toLowerCase() === 'application/geojson' ||
        f.toLowerCase() === 'geojson'
    );
    if (json) return json;

    // Check for text/html
    const html = formats.find((f) => f.toLowerCase() === 'text/html');
    if (html) return html;

    // Check for text/plain
    const plain = formats.find((f) => f.toLowerCase() === 'text/plain');
    if (plain) return plain;

    // Fallback to first format
    return formats[0];
  }

  // Sort query formats so preferred formats appear first in the dropdown
  #sortQueryFormats(formats) {
    const priority = [
      'text/mapml',
      'application/json',
      'application/geo+json',
      'application/geojson',
      'geojson',
    ];
    return [...formats].sort((a, b) => {
      const ai = priority.indexOf(a.toLowerCase());
      const bi = priority.indexOf(b.toLowerCase());
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
    });
  }

  #layerIsQueryable() {
    const c = this.#config;
    const st = c.serviceType;
    const layer = c.layer;
    if (st === 'WMS') return !!layer.queryable;
    if (st === 'WMTS') {
      const queryResources = layer.resourceURLs?.['FeatureInfo'] || [];
      return layer.queryable && queryResources.length > 0;
    }
    if (st === 'ESRI-MapServer') return c.supportsQuery && !c.isTiled;
    if (st === 'ESRI-ImageServer') return !!c.supportsQuery;
    return false;
  }

  #projectionToCRS(projection) {
    const map = {
      OSMTILE: { projectionCode: 'EPSG:3857', units: 'OSMTILE' },
      CBMTILE: { projectionCode: 'EPSG:3978', units: 'CBMTILE' },
      WGS84: { projectionCode: 'EPSG:4326', units: 'WGS84' },
      APSTILE: { projectionCode: 'EPSG:5936', units: 'APSTILE' },
    };
    return map[projection] || map.OSMTILE;
  }

  #appendMapInputs(parent, inputs) {
    inputs.forEach((inp) => {
      const el = document.createElement('map-input');
      el.setAttribute('name', inp.name);
      el.setAttribute('type', inp.type);
      if (inp.position) el.setAttribute('position', inp.position);
      if (inp.axis) el.setAttribute('axis', inp.axis);
      if (inp.min) el.setAttribute('min', inp.min);
      if (inp.max) el.setAttribute('max', inp.max);
      if (inp.units) el.setAttribute('units', inp.units);
      parent.appendChild(el);
    });
  }

  #appendDimensionSelectors(mapExtent, layer) {
    (layer.dimensions || []).forEach((dim, dimIdx) => {
      if (dim.usesTemplate) return; // Fixed-value dimensions are baked into URL
      if (!this.#dimensionStates[dimIdx].enabled) return;

      const selectedValue = this.#dimensionStates[dimIdx].value;

      const mapSelect = document.createElement('map-select');
      mapSelect.setAttribute('id', `${dim.name}-selector`);
      mapSelect.setAttribute('name', dim.name);
      dim.values.forEach((value) => {
        const opt = document.createElement('map-option');
        opt.setAttribute('value', value);
        opt.textContent = value;
        if (value === selectedValue) opt.setAttribute('selected', '');
        mapSelect.appendChild(opt);
      });
      mapExtent.appendChild(mapSelect);
    });
  }

  // ── UI Builder Helpers ──

  #buildSelect(labelText, name, options, selectedValue, onChange) {
    const sel = document.createElement('gcds-select');
    sel.setAttribute('select-id', `${name}-${MapmlifyLayer.#idCounter++}`);
    sel.setAttribute('label', labelText);
    sel.setAttribute('name', name);
    options.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === selectedValue) o.setAttribute('selected', '');
      sel.appendChild(o);
    });
    sel.addEventListener('gcdsChange', (e) => {
      onChange(e.detail ?? sel.value);
    });
    return sel;
  }

  #buildCheckbox(labelText, name, checked, hint, onChange) {
    const cbId = `${name}-${MapmlifyLayer.#idCounter++}`;
    const cb = document.createElement('gcds-checkboxes');
    cb.name = name;
    cb.legend = labelText;
    cb.hideLegend = true;
    cb.options = [{ id: cbId, label: labelText, value: 'enabled', checked: !!checked, hint: hint || undefined }];
    if (checked) cb.value = ['enabled'];
    cb.addEventListener('gcdsChange', (e) => {
      const isChecked = Array.isArray(e.detail) ? e.detail.includes('enabled') : false;
      onChange(isChecked);
    });
    return cb;
  }

  #esc(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  // ─── SOURCE CODE ──────────────────────────────────────

  #updateSourceCode() {
    if (!this.#sourceCodeVisible) return;
    const viewer = this.#viewerContainer?.querySelector('gcds-ext-map');
    if (!viewer || !this.#sourceCodeEl) return;
    const raw = this.#serializeViewer(viewer);
    this.#sourceCodeRaw = raw;
    const codeEl = this.#sourceCodeEl.querySelector('code');
    codeEl.textContent = raw;
    // Apply Prism syntax highlighting if available
    if (typeof Prism !== 'undefined') {
      Prism.highlightElement(codeEl);
    }
    this.#sourceCodeEl.style.display = 'block';
  }

  #serializeViewer(viewer) {
    // Use outerHTML + DOMParser to bypass Stencil's patched cloneNode /
    // querySelectorAll which drop slotted content (e.g. map-option children)
    const html = viewer.outerHTML;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const clone = doc.body.firstElementChild;
    // Sync live attributes (zoom, lat, lon) from the viewer
    clone.setAttribute('zoom', viewer.getAttribute('zoom'));
    clone.setAttribute('lat', viewer.getAttribute('lat'));
    clone.setAttribute('lon', viewer.getAttribute('lon'));
    // Remove dynamic style elements injected by gcds-ext-map
    clone.querySelectorAll('style').forEach((s) => s.remove());
    // Strip Stencil.js runtime artifacts (hydrated class, internal attributes)
    clone.querySelectorAll('.hydrated').forEach((el) => {
      el.classList.remove('hydrated');
      if (el.className === '') el.removeAttribute('class');
    });
    if (clone.classList?.contains('hydrated')) {
      clone.classList.remove('hydrated');
      if (clone.className === '') clone.removeAttribute('class');
    }
    // Remove Stencil internal attributes (s-id, c-id, etc.)
    const stencilAttrs = ['s-id', 'c-id'];
    clone.querySelectorAll('*').forEach((el) => {
      stencilAttrs.forEach((attr) => el.removeAttribute(attr));
    });
    stencilAttrs.forEach((attr) => clone.removeAttribute(attr));
    return this.#prettyPrint(clone);
  }

  #prettyPrint(node, indent = '') {
    const INDENT = '  ';
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      return text ? indent + text + '\n' : '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    let attrs = '';
    for (const attr of node.attributes) {
      attrs += ` ${attr.name}="${attr.value}"`;
    }

    if (!node.childNodes.length) {
      return `${indent}<${tag}${attrs}></${tag}>\n`;
    }

    // Single text child
    if (
      node.childNodes.length === 1 &&
      node.firstChild.nodeType === Node.TEXT_NODE
    ) {
      const text = node.firstChild.textContent.trim();
      return `${indent}<${tag}${attrs}>${text}</${tag}>\n`;
    }

    let result = `${indent}<${tag}${attrs}>\n`;
    for (const child of node.childNodes) {
      result += this.#prettyPrint(child, indent + INDENT);
    }
    result += `${indent}</${tag}>\n`;
    return result;
  }

  // ─── PUBLIC API ────────────────────────────────────────

  getMapMLMarkup() {
    const viewer = this.#viewerContainer?.querySelector('gcds-ext-map');
    if (!viewer) return null;
    return this.#serializeViewer(viewer);
  }
}

customElements.define('mapmlify-layer', MapmlifyLayer);

export { MapmlifyLayer };
