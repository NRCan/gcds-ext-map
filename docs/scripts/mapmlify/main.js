// Main application logic (CORS proxy removed - now using file upload for blocked resources)

import './mapmlify-layer.js';
import { t } from './i18n.js';

// Format dimension name as WMS parameter (time/elevation unchanged, others get DIM_ prefix)
export function formatDimensionParam(dimensionName) {
  const name = dimensionName.toLowerCase();
  if (name === 'time' || name === 'elevation') {
    return dimensionName.toUpperCase();
  }
  // Check if DIM_ is already prefixed to avoid double-prefixing
  if (name.startsWith('dim_')) {
    return dimensionName.toUpperCase();
  }
  return 'DIM_' + dimensionName.toUpperCase();
}

// Transform WGS84 coordinates to Web Mercator (EPSG:3857)
export function wgs84ToWebMercator(lon, lat) {
  const x = (lon * 20037508.34) / 180;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  return { x, y };
}

// Parse ISO8601 duration string (e.g., PT10M, PT1H, P1D) and return milliseconds
function parseISO8601Duration(duration) {
  const match = duration.match(
    /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?/
  );
  if (!match) return 0;

  const years = parseInt(match[1] || 0);
  const months = parseInt(match[2] || 0);
  const days = parseInt(match[3] || 0);
  const hours = parseInt(match[4] || 0);
  const minutes = parseInt(match[5] || 0);
  const seconds = parseFloat(match[6] || 0);

  // Approximate conversion (not perfect for months/years, but works for typical WMS use)
  return (
    years * 365 * 24 * 60 * 60 * 1000 +
    months * 30 * 24 * 60 * 60 * 1000 +
    days * 24 * 60 * 60 * 1000 +
    hours * 60 * 60 * 1000 +
    minutes * 60 * 1000 +
    seconds * 1000
  );
}

// Parse ISO8601 interval notation and generate array of values
// Format: start/end/period (e.g., 2026-01-19T12:00:00Z/2026-01-22T12:00:00Z/PT1H)
function parseISO8601Interval(intervalString) {
  const parts = intervalString.trim().split('/');
  if (parts.length !== 3) {
    // Not an interval, might be discrete values (comma-separated)
    return intervalString.split(',').map((v) => v.trim());
  }

  const [startStr, endStr, periodStr] = parts;
  const startTime = new Date(startStr).getTime();
  const endTime = new Date(endStr).getTime();

  if (isNaN(startTime) || isNaN(endTime)) {
    console.warn('Invalid ISO8601 interval:', intervalString);
    return [];
  }

  // Parse the period to determine if it contains year/month components
  const periodMatch = periodStr.match(
    /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?/
  );
  if (!periodMatch) {
    console.warn('Invalid ISO8601 period:', periodStr);
    return [];
  }

  const years = parseInt(periodMatch[1] || 0);
  const months = parseInt(periodMatch[2] || 0);
  const days = parseInt(periodMatch[3] || 0);
  const hours = parseInt(periodMatch[4] || 0);
  const minutes = parseInt(periodMatch[5] || 0);
  const seconds = parseFloat(periodMatch[6] || 0);

  // Detect if original format includes milliseconds
  const hasMilliseconds = startStr.includes('.');

  const values = [];
  let currentDate = new Date(startStr);
  const endDate = new Date(endStr);

  // If period includes years or months, use date arithmetic (not milliseconds)
  if (years > 0 || months > 0) {
    while (currentDate <= endDate) {
      let isoString = currentDate.toISOString();
      if (!hasMilliseconds) {
        isoString = isoString.replace(/\.\d{3}Z$/, 'Z');
      }
      values.push(isoString);

      // Add period using date methods to handle month/year boundaries correctly
      currentDate = new Date(currentDate);
      currentDate.setUTCFullYear(currentDate.getUTCFullYear() + years);
      currentDate.setUTCMonth(currentDate.getUTCMonth() + months);
      currentDate.setUTCDate(currentDate.getUTCDate() + days);
      currentDate.setUTCHours(currentDate.getUTCHours() + hours);
      currentDate.setUTCMinutes(currentDate.getUTCMinutes() + minutes);
      currentDate.setUTCSeconds(currentDate.getUTCSeconds() + seconds);
    }
  } else {
    // For time-only periods (hours, minutes, seconds), use millisecond arithmetic
    const periodMs = parseISO8601Duration(periodStr);
    if (periodMs === 0) {
      console.warn('Invalid period duration:', periodStr);
      return [];
    }

    let currentTime = startTime;
    while (currentTime <= endTime) {
      let isoString = new Date(currentTime).toISOString();
      if (!hasMilliseconds) {
        isoString = isoString.replace(/\.\d{3}Z$/, 'Z');
      }
      values.push(isoString);
      currentTime += periodMs;
    }
  }

  return values;
}

const wmsUrlInput = document.getElementById('wms-url');
const loadBtn = document.getElementById('load-btn');
const loadFileBtn = document.getElementById('load-file-btn');
const fileInput = document.getElementById('file-input');
const serviceInfo = document.getElementById('service-info');
const serviceDetails = document.getElementById('service-details');
const noticeContainer = document.getElementById('notice-container');

let currentWmsBaseUrl = '';

// Show a gcds-notice in the notice container, replacing any previous notice
function showNotice(type, message) {
  hideNotice();
  const notice = document.createElement('gcds-notice');
  notice.setAttribute('type', type);
  notice.setAttribute('notice-title', type === 'danger' ? t('noticeError') : t('noticeWarning'));
  notice.setAttribute('notice-title-tag', 'h3');
  const text = document.createElement('gcds-text');
  text.textContent = message;
  notice.appendChild(text);
  if (noticeContainer) noticeContainer.appendChild(notice);
}

function hideNotice() {
  if (noticeContainer) noticeContainer.innerHTML = '';
}

// Load capabilities URLs from file on page load
async function loadCapabilitiesPresets() {
  try {
    const appEl = document.querySelector('.mapmlify-app');
    const capabilitiesUrl = appEl?.getAttribute('data-capabilities-url') || 'src/capabilities.txt';
    const response = await fetch(capabilitiesUrl);
    const text = await response.text();
    const lines = text.split('\n').filter((line) => line.trim());

    // Use gcds-input suggestions property instead of datalist
    const suggestions = lines.map((line) => {
      if (line.includes(',')) {
        const commaIndex = line.indexOf(',');
        const label = line.substring(0, commaIndex).trim();
        const url = line.substring(commaIndex + 1).trim();
        return { label, value: url };
      }
      return { label: line, value: line };
    });

    if (wmsUrlInput) {
      wmsUrlInput.suggestions = suggestions;
      wmsUrlInput.value = '';
    }
  } catch (error) {
    console.error('Error loading capabilities presets:', error);
  }
}

// Load presets when page loads
loadCapabilitiesPresets();

loadBtn.addEventListener('click', async () => {
  const url = wmsUrlInput.value.trim();

  if (!url) {
    showNotice('warning', t('alertEnterUrl'));
    return;
  }

  hideNotice();

  try {
    loadBtn.disabled = true;
    loadBtn.textContent = t('loading');
    // Hide file upload button in case it was shown from a previous attempt
    loadFileBtn.style.display = 'none';

    await loadWMSCapabilities(url);

    // Clear input after successful load
    wmsUrlInput.value = '';
  } catch (error) {
    console.error('Error loading WMS capabilities:', error);

    // Check if it's a CORS error (typical fetch failures are TypeError)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showNotice('warning', t('corsError'));
      loadFileBtn.style.display = 'inline-block';
    } else {
      showNotice('danger', t('loadError'));
    }
  } finally {
    loadBtn.disabled = false;
    loadBtn.textContent = t('loadService');
  }
});

loadFileBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    loadFileBtn.disabled = true;
    loadFileBtn.textContent = t('processing');

    const text = await file.text();

    // Detect if JSON or XML based on first character
    if (text.trim().startsWith('{')) {
      await processCapabilitiesJSON(text, 'file');
    } else {
      await processCapabilitiesXML(text, 'file');
    }

    // Clear file input, hide button, and dismiss any prior notice after successful load
    fileInput.value = '';
    loadFileBtn.style.display = 'none';
    wmsUrlInput.value = '';
    hideNotice();
  } catch (error) {
    console.error('Error processing capabilities file:', error);
    showNotice('danger', t('processError'));
  } finally {
    loadFileBtn.disabled = false;
    loadFileBtn.textContent = t('loadFromFile');
  }
});

function detectServiceType(xmlDoc) {
  const rootElement = xmlDoc.documentElement;
  const rootName = rootElement.localName || rootElement.nodeName;
  const namespace = rootElement.namespaceURI || '';

  if (rootName === 'Capabilities' && namespace.includes('wmts')) {
    return 'WMTS';
  } else if (
    rootName === 'WMS_Capabilities' ||
    rootName === 'WMT_MS_Capabilities'
  ) {
    return 'WMS';
  }

  return null;
}

// Detect ESRI service type from JSON
function detectESRIServiceType(jsonData) {
  // Check for MapServer
  if (jsonData.mapName !== undefined || jsonData.layers !== undefined) {
    // Check if tiled
    if (jsonData.singleFusedMapCache === true && jsonData.tileInfo) {
      return 'ESRI-MapServer-Tile';
    }
    return 'ESRI-MapServer';
  }

  // Check for ImageServer
  if (
    jsonData.pixelType !== undefined ||
    (jsonData.serviceDataType &&
      jsonData.serviceDataType.includes('esriImageService'))
  ) {
    return 'ESRI-ImageServer';
  }

  return null;
}

async function loadWMSCapabilities(url) {
  // Try direct fetch only - no CORS proxy
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  // Detect if JSON or XML based on content type or first character
  if (contentType.includes('application/json') || text.trim().startsWith('{')) {
    await processCapabilitiesJSON(text, url);
  } else {
    await processCapabilitiesXML(text, url);
  }
}

async function processCapabilitiesXML(xmlText, source) {
  // Parse XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('XML parsing error: ' + parseError.textContent);
  }

  // Detect service type
  const serviceType = detectServiceType(xmlDoc);
  console.log('Detected service type:', serviceType);

  // Store base URL (extract from URL if it's a URL, otherwise use empty string for file uploads)
  if (source !== 'file' && typeof source === 'string') {
    currentWmsBaseUrl = source.split('?')[0];
  } else {
    // For file uploads, try to extract from XML or use empty string
    const onlineResource = xmlDoc.querySelector(
      'Capability Request GetMap DCPType HTTP Get OnlineResource'
    );
    if (onlineResource) {
      const href =
        onlineResource.getAttribute('xlink:href') ||
        onlineResource.getAttribute('href');
      if (href) {
        currentWmsBaseUrl = href.split('?')[0];
      }
    }
  }

  if (serviceType === 'WMTS') {
    // Extract WMTS service information
    const serviceInfo = extractWMTSInfo(xmlDoc, currentWmsBaseUrl);
    // Display WMTS service information
    displayWMTSInfo(
      serviceInfo,
      source === 'file' ? 'file' : 'direct',
      source === 'file' ? 'file' : source
    );
  } else {
    // Extract WMS service information
    const serviceInfo = extractServiceInfo(xmlDoc, currentWmsBaseUrl);
    // Display WMS service information
    displayServiceInfo(
      serviceInfo,
      source === 'file' ? 'file' : 'direct',
      source === 'file' ? 'file' : source
    );
  }
}

// Process ESRI JSON capabilities
async function processCapabilitiesJSON(jsonText, source) {
  let jsonData;
  try {
    jsonData = JSON.parse(jsonText);
  } catch (error) {
    throw new Error('JSON parsing error: ' + error.message);
  }

  // Check for ESRI error response
  if (jsonData.error) {
    throw new Error(
      'ESRI Service Error: ' +
        (jsonData.error.message || JSON.stringify(jsonData.error))
    );
  }

  // Detect ESRI service type
  const serviceType = detectESRIServiceType(jsonData);
  console.log('Detected service type:', serviceType);

  if (!serviceType) {
    throw new Error('Unable to detect ESRI service type from JSON response');
  }

  // Store base URL (remove ?f=json or ?f=pjson if present)
  if (source !== 'file' && typeof source === 'string') {
    currentWmsBaseUrl = source.split('?')[0];
  } else {
    currentWmsBaseUrl = '';
  }

  if (
    serviceType === 'ESRI-MapServer' ||
    serviceType === 'ESRI-MapServer-Tile'
  ) {
    const serviceInfo = extractESRIMapServerInfo(jsonData, currentWmsBaseUrl);
    displayESRIMapServerInfo(
      serviceInfo,
      source === 'file' ? 'file' : 'direct',
      source === 'file' ? 'file' : source
    );
  } else if (serviceType === 'ESRI-ImageServer') {
    const serviceInfo = extractESRIImageServerInfo(jsonData, currentWmsBaseUrl);
    displayESRIImageServerInfo(
      serviceInfo,
      source === 'file' ? 'file' : 'direct',
      source === 'file' ? 'file' : source
    );
  }
}

function parseEPSGFromURN(urnString) {
  if (!urnString) return null;
  const match =
    urnString.match(/EPSG:.*:(\d+)/i) || urnString.match(/epsg[:\/-](\d+)/i);
  return match ? match[1] : null;
}

function mapTileMatrixSetToProjection(crsCode, firstTileMatrix = null) {
  const epsgMap = {
    3857: 'OSMTILE',
    900913: 'OSMTILE', // Old "Google" code for Web Mercator
    3978: 'CBMTILE',
    5936: 'APSTILE',
  };

  // EPSG:4326 requires validation - must have 2x1 tiles at zoom 0 to be WGS84
  if (crsCode === '4326' && firstTileMatrix) {
    if (
      firstTileMatrix.matrixWidth === 2 &&
      firstTileMatrix.matrixHeight === 1
    ) {
      return 'WGS84';
    }
    return null; // EPSG:4326 but not WGS84-compliant tiling scheme
  }

  return epsgMap[crsCode] || null;
}

function extractWMTSInfo(xmlDoc, baseUrl) {
  const owsNS = 'http://www.opengis.net/ows/1.1';

  function queryOWS(element, tagName) {
    return (
      element.querySelector(tagName) ||
      element.querySelector(`ows\\:${tagName}`) ||
      element.querySelector(`[localName="${tagName}"]`)
    );
  }

  function queryAllOWS(element, tagName) {
    const direct = Array.from(element.querySelectorAll(tagName));
    const prefixed = Array.from(element.querySelectorAll(`ows\\:${tagName}`));
    const localName = Array.from(
      element.querySelectorAll(`[localName="${tagName}"]`)
    );
    return [...direct, ...prefixed, ...localName].filter(
      (el, idx, arr) => arr.indexOf(el) === idx
    );
  }

  const serviceIdent = queryOWS(xmlDoc, 'ServiceIdentification');
  const title = queryOWS(serviceIdent, 'Title')?.textContent || 'N/A';
  const abstract = queryOWS(serviceIdent, 'Abstract')?.textContent || 'N/A';
  const version = xmlDoc.documentElement.getAttribute('version') || '1.0.0';

  const tileMatrixSets = {};
  const tmsElements = queryAllOWS(xmlDoc, 'TileMatrixSet');

  tmsElements.forEach((tmsEl) => {
    const identifier = queryOWS(tmsEl, 'Identifier')?.textContent;
    // Skip TileMatrixSet elements without an Identifier (these are references, not definitions)
    if (!identifier) return;

    const crsURN = queryOWS(tmsEl, 'SupportedCRS')?.textContent;
    const epsgCode = parseEPSGFromURN(crsURN);

    const tileMatrices = [];
    const tmElements = queryAllOWS(tmsEl, 'TileMatrix');
    tmElements.forEach((tm) => {
      const matrixWidth = parseInt(queryOWS(tm, 'MatrixWidth')?.textContent);
      const matrixHeight = parseInt(queryOWS(tm, 'MatrixHeight')?.textContent);
      tileMatrices.push({
        identifier: queryOWS(tm, 'Identifier')?.textContent,
        matrixWidth: matrixWidth || null,
        matrixHeight: matrixHeight || null,
      });
    });

    // Pass first TileMatrix for validation (especially for EPSG:4326)
    const firstTileMatrix = tileMatrices.length > 0 ? tileMatrices[0] : null;
    const projection = epsgCode
      ? mapTileMatrixSetToProjection(epsgCode, firstTileMatrix)
      : null;

    tileMatrixSets[identifier] = {
      identifier,
      crs: crsURN,
      epsgCode,
      projection,
      supported: !!projection,
      tileMatrices,
    };
  });

  const layers = [];
  const layerElements = queryAllOWS(xmlDoc, 'Layer');

  layerElements.forEach((layerEl) => {
    const name = queryOWS(layerEl, 'Identifier')?.textContent;
    const layerTitle = queryOWS(layerEl, 'Title')?.textContent || name;
    const layerAbstract = queryOWS(layerEl, 'Abstract')?.textContent || '';

    const wgs84BBox = queryOWS(layerEl, 'WGS84BoundingBox');
    let minx = '-180',
      miny = '-90',
      maxx = '180',
      maxy = '90';
    if (wgs84BBox) {
      const lowerCorner = queryOWS(wgs84BBox, 'LowerCorner')?.textContent.split(
        ' '
      );
      const upperCorner = queryOWS(wgs84BBox, 'UpperCorner')?.textContent.split(
        ' '
      );
      if (lowerCorner && upperCorner) {
        minx = lowerCorner[0];
        miny = lowerCorner[1];
        maxx = upperCorner[0];
        maxy = upperCorner[1];
      }
    }

    const styles = [];
    const styleElements = queryAllOWS(layerEl, 'Style');
    styleElements.forEach((styleEl) => {
      const styleName = queryOWS(styleEl, 'Identifier')?.textContent;
      const styleTitle = queryOWS(styleEl, 'Title')?.textContent || styleName;
      const isDefault = styleEl.getAttribute('isDefault') === 'true';

      // Extract LegendURL information (WMTS format uses attributes on LegendURL element)
      const legendURLs = [];
      const legendElements = styleEl.querySelectorAll('LegendURL');
      legendElements.forEach((legendEl) => {
        const href =
          legendEl.getAttribute('xlink:href') ||
          legendEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
          '';
        const width = legendEl.getAttribute('width');
        const height = legendEl.getAttribute('height');
        const format = legendEl.getAttribute('format');

        if (href) {
          legendURLs.push({ width, height, format, href });
        }
      });

      styles.push({
        name: styleName,
        title: styleTitle,
        isDefault,
        legendURLs,
      });
    });
    if (styles.length === 0) {
      styles.push({
        name: 'default',
        title: 'Default',
        isDefault: true,
        legendURLs: [],
      });
    }

    const formats = [];
    const formatElements = queryAllOWS(layerEl, 'Format');
    formatElements.forEach((fmt) => formats.push(fmt.textContent));

    const infoFormats = [];
    const infoFormatElements = queryAllOWS(layerEl, 'InfoFormat');
    infoFormatElements.forEach((fmt) => infoFormats.push(fmt.textContent));

    // Extract dimensions
    const dimensions = [];
    const dimensionElements = queryAllOWS(layerEl, 'Dimension');
    dimensionElements.forEach((dimEl) => {
      const dimName = queryOWS(dimEl, 'Identifier')?.textContent;
      const dimDefault = queryOWS(dimEl, 'Default')?.textContent;
      const dimUnits = queryOWS(dimEl, 'UOM')?.textContent;

      if (dimName) {
        // Parse all Value elements
        const valueElements = queryAllOWS(dimEl, 'Value');
        let allValues = [];

        valueElements.forEach((valEl) => {
          const valContent = valEl.textContent.trim();
          if (valContent) {
            const parsedValues = parseISO8601Interval(valContent);
            allValues = allValues.concat(parsedValues);
          }
        });

        const valueCount = allValues.length;
        const usesTemplate = valueCount > 200;

        // If using template (>200 values), only store default value
        const values = usesTemplate ? [dimDefault || allValues[0]] : allValues;

        if (values.length > 0) {
          dimensions.push({
            name: dimName,
            units: dimUnits || '',
            default: dimDefault || values[0],
            values: values,
            valueCount: valueCount,
            usesTemplate: usesTemplate,
          });
          console.log(
            'Parsed WMTS dimension:',
            dimName,
            'with',
            valueCount,
            'total values',
            usesTemplate
              ? '(using template with default only)'
              : '(full value list)'
          );
        }
      }
    });

    const tmsLinks = [];
    const tmsLinkElements = queryAllOWS(layerEl, 'TileMatrixSetLink');
    tmsLinkElements.forEach((link) => {
      const tmsId = queryOWS(link, 'TileMatrixSet')?.textContent;
      if (tmsId && tileMatrixSets[tmsId]) {
        tmsLinks.push(tileMatrixSets[tmsId]);
      }
    });

    const supportedProjections = tmsLinks
      .filter((tms) => tms.supported)
      .map((tms) => tms.projection)
      .filter((proj, idx, arr) => arr.indexOf(proj) === idx);

    if (supportedProjections.length === 0) {
      return;
    }

    const resourceURLs = {};
    const resourceElements = queryAllOWS(layerEl, 'ResourceURL');
    resourceElements.forEach((res) => {
      const resourceType = res.getAttribute('resourceType');
      const format = res.getAttribute('format');
      const template = res.getAttribute('template');
      if (!resourceURLs[resourceType]) {
        resourceURLs[resourceType] = [];
      }
      resourceURLs[resourceType].push({ format, template });
    });

    const queryable =
      infoFormats.length > 0 &&
      resourceURLs['FeatureInfo'] &&
      resourceURLs['FeatureInfo'].length > 0;

    layers.push({
      name,
      title: layerTitle,
      abstract: layerAbstract,
      bbox: { minx, miny, maxx, maxy },
      styles,
      formats,
      infoFormats,
      supportedTileMatrixSets: tmsLinks,
      supportedProjections,
      resourceURLs,
      queryable,
      licenseUrl: '',
      licenseTitle: '',
      dimensions,
    });
  });

  return {
    title,
    abstract,
    version,
    tileMatrixSets,
    layers,
    baseUrl,
  };
}

function extractServiceInfo(xmlDoc, baseUrl) {
  const service = xmlDoc.querySelector('Service');
  const version = xmlDoc.documentElement.getAttribute('version') || '1.3.0';

  // Extract service-level Attribution OnlineResource as fallback
  let serviceLicenseUrl = '';
  let serviceLicenseTitle = '';
  // Look for Attribution in the root Layer (Capability > Layer)
  const rootLayer = xmlDoc.querySelector('Capability > Layer');
  if (rootLayer) {
    const rootAttribution = rootLayer.querySelector(':scope > Attribution');
    if (rootAttribution) {
      serviceLicenseTitle =
        rootAttribution.querySelector('Title')?.textContent || '';
      const onlineResource = rootAttribution.querySelector('OnlineResource');
      if (onlineResource) {
        serviceLicenseUrl =
          onlineResource.getAttribute('xlink:href') ||
          onlineResource.getAttributeNS(
            'http://www.w3.org/1999/xlink',
            'href'
          ) ||
          '';
      }
    }
  }
  console.log(
    'Service-level license URL:',
    serviceLicenseUrl || 'none',
    'Title:',
    serviceLicenseTitle || 'none'
  );

  // Extract GetMap image formats
  const getMapFormats = [];
  const mapFormatElements = xmlDoc.querySelectorAll('GetMap > Format');
  mapFormatElements.forEach((formatEl) => {
    getMapFormats.push(formatEl.textContent);
  });

  // Extract GetFeatureInfo formats
  const getFeatureInfoFormats = [];
  const formatElements = xmlDoc.querySelectorAll('GetFeatureInfo > Format');
  formatElements.forEach((formatEl) => {
    getFeatureInfoFormats.push(formatEl.textContent);
  });

  // Extract root CRS/SRS from Capability > Layer
  const rootCRS = new Set();
  if (rootLayer) {
    rootLayer
      .querySelectorAll(':scope > CRS, :scope > SRS')
      .forEach((crsEl) => {
        rootCRS.add(crsEl.textContent.trim());
      });
  }
  console.log('Root CRS:', Array.from(rootCRS));

  // Extract layers
  const layers = [];
  const layerElements = xmlDoc.querySelectorAll('Layer > Name');
  const seenNames = new Set();

  layerElements.forEach((nameEl) => {
    const parentLayer = nameEl.closest('Layer');
    const name = nameEl.textContent;
    const title = parentLayer.querySelector(':scope > Title')?.textContent;
    const abstract =
      parentLayer.querySelector(':scope > Abstract')?.textContent;
    const queryable = parentLayer.getAttribute('queryable') === '1';

    // Skip if we've already processed this layer name
    if (!name || seenNames.has(name)) return;
    seenNames.add(name);

    // Extract styles
    const styles = [];
    const styleElements = parentLayer.querySelectorAll(':scope > Style');
    styleElements.forEach((styleEl) => {
      const styleName = styleEl.querySelector('Name')?.textContent;
      const styleTitle = styleEl.querySelector('Title')?.textContent;

      // Extract LegendURL information
      const legendURLs = [];
      const legendElements = styleEl.querySelectorAll('LegendURL');
      legendElements.forEach((legendEl) => {
        const width = legendEl.getAttribute('width');
        const height = legendEl.getAttribute('height');
        const format = legendEl.querySelector('Format')?.textContent;
        const onlineResource = legendEl.querySelector('OnlineResource');
        const href =
          onlineResource?.getAttribute('xlink:href') ||
          onlineResource?.getAttributeNS(
            'http://www.w3.org/1999/xlink',
            'href'
          ) ||
          '';

        if (href) {
          legendURLs.push({ width, height, format, href });
        }
      });

      if (styleName) {
        styles.push({
          name: styleName,
          title: styleTitle || styleName,
          legendURLs,
        });
      }
    });

    // Extract MetadataURL or Attribution OnlineResource for license link
    let licenseUrl = '';
    let licenseTitle = '';

    // Priority 1: Check for MetadataURL (layer-specific metadata)
    const metadataURL = parentLayer.querySelector(':scope > MetadataURL');
    if (metadataURL) {
      const onlineResource = metadataURL.querySelector('OnlineResource');
      if (onlineResource) {
        licenseUrl =
          onlineResource.getAttribute('xlink:href') ||
          onlineResource.getAttributeNS(
            'http://www.w3.org/1999/xlink',
            'href'
          ) ||
          '';
        const metadataType = metadataURL.getAttribute('type');
        // Append "Metadata" to type (e.g., "TC211" becomes "TC211 Metadata")
        licenseTitle = metadataType
          ? `${metadataType} Metadata`
          : 'Layer Metadata';
      }
    }

    // Priority 2: Check for Attribution OnlineResource if no MetadataURL
    if (!licenseUrl) {
      const attribution = parentLayer.querySelector(':scope > Attribution');
      if (attribution) {
        licenseTitle = attribution.querySelector('Title')?.textContent || '';
        const onlineResource = attribution.querySelector('OnlineResource');
        if (onlineResource) {
          licenseUrl =
            onlineResource.getAttribute('xlink:href') ||
            onlineResource.getAttributeNS(
              'http://www.w3.org/1999/xlink',
              'href'
            ) ||
            '';
        }
      }
    }

    // Priority 3: Use service-level license URL and title as fallback
    if (!licenseUrl && serviceLicenseUrl) {
      licenseUrl = serviceLicenseUrl;
      licenseTitle = serviceLicenseTitle;
    }

    // Extract layer-specific CRS and combine with root CRS
    const layerCRS = new Set(rootCRS);
    parentLayer
      .querySelectorAll(':scope > CRS, :scope > SRS')
      .forEach((crsEl) => {
        layerCRS.add(crsEl.textContent.trim());
      });

    // Map CRS to projections
    const supportedProjections = [];
    if (layerCRS.has('EPSG:3857')) supportedProjections.push('OSMTILE');
    if (layerCRS.has('EPSG:3978')) supportedProjections.push('CBMTILE');
    if (layerCRS.has('CRS:84') || layerCRS.has('EPSG:4326'))
      supportedProjections.push('WGS84');
    if (layerCRS.has('EPSG:5936')) supportedProjections.push('APSTILE');

    // Extract dimensions
    const dimensions = [];
    const dimensionElements =
      parentLayer.querySelectorAll(':scope > Dimension');
    dimensionElements.forEach((dimEl) => {
      const dimName = dimEl.getAttribute('name');
      const dimDefault = dimEl.getAttribute('default');
      const dimUnits = dimEl.getAttribute('units');
      const dimContent = dimEl.textContent.trim();

      if (dimName && dimContent) {
        // Parse dimension values
        const values = parseISO8601Interval(dimContent);

        if (values.length > 0) {
          dimensions.push({
            name: dimName,
            units: dimUnits || '',
            default: dimDefault || values[0],
            values: values,
          });
          console.log(
            'Parsed dimension:',
            dimName,
            'with',
            values.length,
            'values'
          );
        }
      }
    });

    // Get bounding box (try EX_GeographicBoundingBox for 1.3.0, LatLonBoundingBox for 1.1.1)
    let bbox = parentLayer.querySelector(':scope > EX_GeographicBoundingBox');
    let minx, miny, maxx, maxy;

    if (bbox) {
      minx = bbox.querySelector('westBoundLongitude')?.textContent;
      miny = bbox.querySelector('southBoundLatitude')?.textContent;
      maxx = bbox.querySelector('eastBoundLongitude')?.textContent;
      maxy = bbox.querySelector('northBoundLatitude')?.textContent;
    } else {
      bbox = parentLayer.querySelector(':scope > LatLonBoundingBox');
      if (bbox) {
        minx = bbox.getAttribute('minx');
        miny = bbox.getAttribute('miny');
        maxx = bbox.getAttribute('maxx');
        maxy = bbox.getAttribute('maxy');
      }
    }

    // Extract projection-specific BoundingBox elements
    const boundingBoxes = {};
    const bboxElements = parentLayer.querySelectorAll(':scope > BoundingBox');
    bboxElements.forEach((bboxEl) => {
      const crs = bboxEl.getAttribute('CRS') || bboxEl.getAttribute('SRS');
      if (crs) {
        boundingBoxes[crs] = {
          minx: bboxEl.getAttribute('minx'),
          miny: bboxEl.getAttribute('miny'),
          maxx: bboxEl.getAttribute('maxx'),
          maxy: bboxEl.getAttribute('maxy'),
        };
      }
    });

    if (minx && miny && maxx && maxy) {
      layers.push({
        name,
        title: title || name,
        abstract: abstract || '',
        bbox: { minx, miny, maxx, maxy },
        boundingBoxes,
        queryable,
        styles,
        licenseUrl,
        licenseTitle,
        supportedProjections,
        dimensions,
      });
      console.log(
        'Layer:',
        name,
        'Projections:',
        supportedProjections.join(', ') || 'none',
        'Dimensions:',
        dimensions.length,
        'BoundingBoxes:',
        Object.keys(boundingBoxes).join(', ') || 'none'
      );
    }
  });

  return {
    title: service?.querySelector('Title')?.textContent || 'N/A',
    abstract: service?.querySelector('Abstract')?.textContent || 'N/A',
    version,
    layers,
    baseUrl,
    getFeatureInfoFormats,
    getMapFormats,
    serviceLicenseUrl,
  };
}

export function buildWMTSTileUrl(
  template,
  layer,
  tileMatrixSet,
  style,
  format,
  zoom,
  row,
  col
) {
  if (!template) return '';

  let url = template;
  url = url.replace(/{TileMatrixSet}/g, tileMatrixSet);
  url = url.replace(/{TileMatrix}/g, zoom);
  url = url.replace(/{TileRow}/g, row);
  url = url.replace(/{TileCol}/g, col);
  url = url.replace(/{Style}/g, style);
  url = url.replace(/{style}/g, style);

  if (layer && layer.name) {
    url = url.replace(/{Layer}/g, layer.name);
    url = url.replace(/{layer}/g, layer.name);
  }

  return url;
}

function displayWMTSInfo(info, source, url) {
  const sourceNote =
    source === 'file' ? `<p><em>${t('loadedFromFile')}</em></p>` : '';
  const serviceTypeBadge =
    '<span class="service-type-badge" style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.9em; margin-left: 10px;">WMTS</span>';

  const supportedCount = Object.values(info.tileMatrixSets).filter(
    (tms) => tms.supported
  ).length;

  const urlNote =
    source !== 'file'
      ? `<p><strong>${t('loadedUrl')}</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`
      : '';

  serviceDetails.innerHTML =
    sourceNote +
    `<p><strong>${t('title')}</strong> ` +
    info.title +
    ' ' +
    serviceTypeBadge +
    `</p><p><strong>${t('version')}</strong> ` +
    info.version +
    `</p><p><strong>${t('tileMatrixSets')}</strong> ` +
    Object.keys(info.tileMatrixSets).length +
    ' (' +
    supportedCount +
    ` ${t('supported')})</p><details class="service-abstract"><summary><strong>${t('abstractLabel')}</strong></summary><p>` +
    info.abstract +
    '</p></details>' +
    urlNote +
    `<h3>${t('availableLayers')} (` +
    info.layers.length +
    ')</h3><div class="layers-list"></div>';

  serviceInfo.classList.remove('hidden');

  const layersContainer = serviceDetails.querySelector('.layers-list');
  info.layers.forEach((layer) => {
    const el = document.createElement('mapmlify-layer');
    el.layerConfig = {
      serviceType: 'WMTS',
      title: info.title,
      baseUrl: info.baseUrl || url.split('?')[0],
      version: info.version,
      layer: layer,
      tileMatrixSets: info.tileMatrixSets,
    };
    layersContainer.appendChild(el);
  });
}

function displayServiceInfo(info, source, loadedUrl) {
  const sourceNote =
    source === 'file' ? `<p><em>${t('loadedFromFile')}</em></p>` : '';
  const serviceTypeBadge =
    '<span class="service-type-badge" style="background: #2196F3; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.9em; margin-left: 10px;">WMS</span>';

  serviceDetails.innerHTML = `
    ${sourceNote}
    <p><strong>${t('title')}</strong> ${info.title} ${serviceTypeBadge}</p>
    <p><strong>${t('version')}</strong> ${info.version}</p>
    <details class="service-abstract">
      <summary><strong>${t('abstractLabel')}</strong></summary>
      <p>${info.abstract}</p>
    </details>
    ${source !== 'file' ? `<p><strong>${t('loadedUrl')}</strong> <a href="${loadedUrl}" target="_blank" rel="noopener noreferrer">${loadedUrl}</a></p>` : ''}
    <h3>${t('availableLayers')} (${info.layers.length})</h3>
    <div class="layers-list"></div>
  `;

  serviceInfo.classList.remove('hidden');

  const layersContainer = serviceDetails.querySelector('.layers-list');
  info.layers.forEach((layer) => {
    const el = document.createElement('mapmlify-layer');
    el.layerConfig = {
      serviceType: 'WMS',
      baseUrl: info.baseUrl,
      version: info.version,
      layer: layer,
      getMapFormats: info.getMapFormats,
      getFeatureInfoFormats: info.getFeatureInfoFormats,
    };
    layersContainer.appendChild(el);
  });
}

export function buildGetMapUrl(baseUrl, layer, version, styleName) {
  const { bbox } = layer;
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: version,
    REQUEST: 'GetMap',
    LAYERS: layer.name,
    WIDTH: '100',
    HEIGHT: '100',
    FORMAT: 'image/png',
  });

  // Add STYLES parameter if provided
  if (styleName) {
    params.set('STYLES', styleName);
  }

  // Use correct parameter names based on version
  if (version.startsWith('1.3')) {
    params.set('CRS', 'EPSG:4326');
    params.set('BBOX', `${bbox.miny},${bbox.minx},${bbox.maxy},${bbox.maxx}`);
  } else {
    params.set('SRS', 'EPSG:4326');
    params.set('BBOX', `${bbox.minx},${bbox.miny},${bbox.maxx},${bbox.maxy}`);
  }

  const url = `${baseUrl}?${params.toString()}`;
  // Don't use CORS proxy for GetMap - often works without CORS
  return url;
}

// ========================================
// ESRI REST API Service Functions
// ========================================

// Map ESRI WKID codes to MapML projections
function mapESRIWkidToProjection(wkid) {
  const wkidMap = {
    3857: 'OSMTILE',
    102100: 'OSMTILE', // Web Mercator (Auxiliary Sphere)
    3978: 'CBMTILE',
    4326: 'WGS84',
    5936: 'APSTILE',
  };

  return wkidMap[wkid] || null;
}

// Extract ESRI MapServer metadata
function extractESRIMapServerInfo(jsonData, baseUrl) {
  const title = jsonData.mapName || jsonData.serviceDescription || 'N/A';
  const abstract = jsonData.description || jsonData.serviceDescription || 'N/A';
  const copyrightText = jsonData.copyrightText || '';

  // Detect if this is a tiled service
  const isTiled = jsonData.singleFusedMapCache === true && jsonData.tileInfo;

  // Get spatial reference
  const spatialReference = jsonData.spatialReference || {};
  const wkid = spatialReference.latestWkid || spatialReference.wkid;
  const projection = mapESRIWkidToProjection(wkid);

  // Parse tile info if available
  let tileInfo = null;
  if (isTiled && jsonData.tileInfo) {
    const lods = jsonData.tileInfo.lods || [];
    tileInfo = {
      minZoom: lods.length > 0 ? lods[0].level : 0,
      maxZoom: lods.length > 0 ? lods[lods.length - 1].level : 18,
      origin: jsonData.tileInfo.origin,
      spatialReference: jsonData.tileInfo.spatialReference,
    };
  }

  // Parse layers
  const layers = [];
  const layersArray = jsonData.layers || [];

  layersArray.forEach((lyr) => {
    // Skip group layers (they have subLayerIds)
    if (lyr.subLayerIds && lyr.subLayerIds.length > 0) {
      return;
    }

    const extent = jsonData.fullExtent || jsonData.initialExtent || {};
    const layerExtent = lyr.extent || extent;

    // Only include layers that match the service projection
    const layerName = lyr.name || `Layer ${lyr.id}`;
    const layerTitle = lyr.name || layerName;

    layers.push({
      id: lyr.id,
      name: layerName,
      title: layerTitle,
      description: lyr.description || '',
      bbox: {
        minx: layerExtent.xmin?.toString() || '-180',
        miny: layerExtent.ymin?.toString() || '-90',
        maxx: layerExtent.xmax?.toString() || '180',
        maxy: layerExtent.ymax?.toString() || '90',
      },
      minScale: lyr.minScale,
      maxScale: lyr.maxScale,
      defaultVisibility: lyr.defaultVisibility !== false,
    });
  });

  // Parse supported image formats
  const supportedFormats = [];
  if (jsonData.supportedImageFormatTypes) {
    // supportedImageFormatTypes is a comma-separated string like "PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP"
    const formats = jsonData.supportedImageFormatTypes.split(',');
    formats.forEach((fmt) => {
      const trimmed = fmt.trim();
      if (trimmed === 'PNG32' || trimmed === 'PNG24' || trimmed === 'PNG') {
        supportedFormats.push('png');
      } else if (trimmed === 'JPG' || trimmed === 'JPEG') {
        supportedFormats.push('jpg');
      } else if (trimmed === 'GIF') {
        supportedFormats.push('gif');
      }
    });
  }
  // Remove duplicates
  const uniqueFormats = [...new Set(supportedFormats)];
  if (uniqueFormats.length === 0) {
    uniqueFormats.push('png'); // Default fallback
  }

  // Check for query capability
  const capabilities = jsonData.capabilities || '';
  const supportsQuery = capabilities.toLowerCase().includes('query');

  return {
    title,
    abstract,
    copyrightText,
    wkid,
    projection,
    isTiled,
    tileInfo,
    layers,
    supportedFormats: uniqueFormats,
    supportsQuery,
    fullExtent: jsonData.fullExtent || jsonData.initialExtent,
    baseUrl,
  };
}

// Extract ESRI ImageServer metadata
function extractESRIImageServerInfo(jsonData, baseUrl) {
  const title = jsonData.name || jsonData.serviceDescription || 'N/A';
  const abstract = jsonData.description || jsonData.serviceDescription || 'N/A';
  const copyrightText = jsonData.copyrightText || '';

  // Get spatial reference
  const spatialReference = jsonData.spatialReference || {};
  const wkid = spatialReference.latestWkid || spatialReference.wkid;
  const projection = mapESRIWkidToProjection(wkid);

  // Get extent
  const extent = jsonData.extent || {};
  const bbox = {
    minx: extent.xmin?.toString() || '-180',
    miny: extent.ymin?.toString() || '-90',
    maxx: extent.xmax?.toString() || '180',
    maxy: extent.ymax?.toString() || '90',
  };

  // Parse supported image formats
  const supportedFormats = [];
  if (jsonData.supportedImageFormatTypes) {
    const formats = jsonData.supportedImageFormatTypes.split(',');
    formats.forEach((fmt) => {
      const trimmed = fmt.trim().toLowerCase();
      if (trimmed.includes('png')) {
        supportedFormats.push('png');
      } else if (trimmed.includes('jpg') || trimmed.includes('jpeg')) {
        supportedFormats.push('jpgpng');
      } else if (trimmed.includes('tiff') || trimmed.includes('tif')) {
        supportedFormats.push('tiff');
      }
    });
  }
  const uniqueFormats = [...new Set(supportedFormats)];
  if (uniqueFormats.length === 0) {
    uniqueFormats.push('jpgpng'); // ImageServer default
  }

  // Check for query capability
  const capabilities = jsonData.capabilities || '';
  const supportsQuery =
    capabilities.toLowerCase().includes('catalog') ||
    capabilities.toLowerCase().includes('metadata');

  // Create a single "layer" representing the ImageServer
  const layer = {
    id: 0,
    name: title,
    title: title,
    description: abstract,
    bbox: bbox,
    bandCount: jsonData.bandCount || 1,
    pixelType: jsonData.pixelType || 'UNKNOWN',
    hasMultidimensions: jsonData.hasMultidimensions || false,
  };

  return {
    title,
    abstract,
    copyrightText,
    wkid,
    projection,
    layer,
    supportedFormats: uniqueFormats,
    supportsQuery,
    extent: jsonData.extent,
    baseUrl,
  };
}

// Display ESRI MapServer information
function displayESRIMapServerInfo(info, source, url) {
  if (!info.projection) {
    showNotice('danger', t('unsupportedProjection').replace('{wkid}', info.wkid));
    return;
  }

  const sourceNote =
    source === 'file' ? `<p><em>${t('loadedFromFile')}</em></p>` : '';
  const serviceTypeBadge = info.isTiled
    ? '<span class="service-type-badge" style="background: #FF9800; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.9em; margin-left: 10px;">ESRI MapServer (Tiled)</span>'
    : '<span class="service-type-badge" style="background: #FF9800; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.9em; margin-left: 10px;">ESRI MapServer</span>';

  const urlNote =
    source !== 'file'
      ? `<p><strong>${t('loadedUrl')}</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`
      : '';
  const copyrightNote = info.copyrightText
    ? `<p><strong>${t('copyright')}</strong> ${info.copyrightText}</p>`
    : '';
  const tiledNote = info.isTiled
    ? `<p><strong>${t('tileCache')}</strong> ${t('zoomLevels')} ${info.tileInfo.minZoom} - ${info.tileInfo.maxZoom}</p>`
    : '';

  serviceDetails.innerHTML = `
    ${sourceNote}
    <p><strong>${t('title')}</strong> ${info.title} ${serviceTypeBadge}</p>
    ${tiledNote}
    <details class="service-abstract">
      <summary><strong>${t('abstractLabel')}</strong></summary>
      <p>${info.abstract}</p>
    </details>
    ${copyrightNote}
    ${urlNote}
    <h3>${t('availableLayers')} (${info.layers.length})</h3>
    <div class="layers-list"></div>
  `;

  serviceInfo.classList.remove('hidden');

  const layersContainer = serviceDetails.querySelector('.layers-list');
  info.layers.forEach((layer, index) => {
    const el = document.createElement('mapmlify-layer');
    el.layerConfig = {
      serviceType: 'ESRI-MapServer',
      baseUrl: info.baseUrl,
      projection: info.projection,
      wkid: info.wkid,
      isTiled: info.isTiled,
      tileInfo: info.tileInfo,
      layers: info.layers,
      supportedFormats: info.supportedFormats,
      supportsQuery: info.supportsQuery,
      copyrightText: info.copyrightText,
      layer: layer,
      disabledCheckbox: info.isTiled && info.layers.length > 1 && index > 0,
    };
    layersContainer.appendChild(el);
  });
}

// Display ESRI ImageServer information
function displayESRIImageServerInfo(info, source, url) {
  if (!info.projection) {
    showNotice('danger', t('unsupportedProjection').replace('{wkid}', info.wkid));
    return;
  }

  const sourceNote =
    source === 'file' ? `<p><em>${t('loadedFromFile')}</em></p>` : '';
  const serviceTypeBadge =
    '<span class="service-type-badge" style="background: #9C27B0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.9em; margin-left: 10px;">ESRI ImageServer</span>';

  const urlNote =
    source !== 'file'
      ? `<p><strong>${t('loadedUrl')}</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`
      : '';
  const copyrightNote = info.copyrightText
    ? `<p><strong>${t('copyright')}</strong> ${info.copyrightText}</p>`
    : '';

  serviceDetails.innerHTML = `
    ${sourceNote}
    <p><strong>${t('title')}</strong> ${info.title} ${serviceTypeBadge}</p>
    <details class="service-abstract">
      <summary><strong>${t('abstractLabel')}</strong></summary>
      <p>${info.abstract}</p>
    </details>
    ${copyrightNote}
    ${urlNote}
    <h3>${t('availableLayers')} (1)</h3>
    <div class="layers-list"></div>
  `;

  serviceInfo.classList.remove('hidden');

  const layersContainer = serviceDetails.querySelector('.layers-list');
  const el = document.createElement('mapmlify-layer');
  el.layerConfig = {
    serviceType: 'ESRI-ImageServer',
    baseUrl: info.baseUrl,
    projection: info.projection,
    wkid: info.wkid,
    supportedFormats: info.supportedFormats,
    supportsQuery: info.supportsQuery,
    copyrightText: info.copyrightText,
    layer: info.layer,
  };
  layersContainer.appendChild(el);
}
