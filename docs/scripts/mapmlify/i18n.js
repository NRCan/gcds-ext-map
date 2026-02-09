// Localization dictionary for MapMLify
// Locale is determined from document root lang attribute

const LOCALE = document.documentElement.lang || 'en';

export const translations = {
  // main.js strings
  alertEnterUrl: {
    en: 'Please enter a capabilities URL',
    fr: 'Veuillez saisir une URL de capacités'
  },
  loading: {
    en: 'Loading...',
    fr: 'Chargement...'
  },
  corsError: {
    en: 'Failed to load WMS capabilities due to CORS restrictions.\n\nPlease download the capabilities file in another tab and use "Load from File" button.',
    fr: 'Échec du chargement des capacités WMS en raison de restrictions CORS.\n\nVeuillez télécharger le fichier de capacités dans un autre onglet et utiliser le bouton "Charger à partir d\'un fichier".'
  },
  loadError: {
    en: 'Failed to load WMS capabilities. Check console for details.',
    fr: 'Échec du chargement des capacités WMS. Consultez la console pour plus de détails.'
  },
  loadService: {
    en: 'Load Service',
    fr: 'Charger le service'
  },
  processing: {
    en: 'Processing...',
    fr: 'Traitement en cours...'
  },
  processError: {
    en: 'Failed to process capabilities file. Check console for details.',
    fr: 'Échec du traitement du fichier de capacités. Consultez la console pour plus de détails.'
  },
  loadFromFile: {
    en: 'Load from File',
    fr: 'Charger à partir d\'un fichier'
  },
  
  // mapmlify-layer.js strings
  id: {
    en: 'ID',
    fr: 'ID'
  },
  name: {
    en: 'Name',
    fr: 'Nom'
  },
  identifier: {
    en: 'Identifier',
    fr: 'Identifiant'
  },
  projection: {
    en: 'Projection:',
    fr: 'Projection :'
  },
  bands: {
    en: 'Bands:',
    fr: 'Bandes :'
  },
  pixelType: {
    en: 'Pixel Type:',
    fr: 'Type de pixel :'
  },
  abstract: {
    en: 'Abstract',
    fr: 'Résumé'
  },
  includeBounds: {
    en: 'Include Bounds',
    fr: 'Inclure les limites'
  },
  boundsTooltip: {
    en: 'disable if bounds are incorrect',
    fr: 'désactiver si les limites sont incorrectes'
  },
  query: {
    en: 'Query',
    fr: 'Interrogation'
  },
  enableQueries: {
    en: 'Enable queries',
    fr: 'Activer les interrogations'
  },
  infoFormat: {
    en: 'Info Format:',
    fr: 'Format d\'info :'
  },
  style: {
    en: 'Style:',
    fr: 'Style :'
  },
  imageFormat: {
    en: 'Image Format:',
    fr: 'Format d\'image :'
  },
  exportMode: {
    en: 'Export Mode:',
    fr: 'Mode d\'export :'
  },
  showSourceCode: {
    en: 'Show source code',
    fr: 'Afficher le code source'
  },
  hideSourceCode: {
    en: 'Hide source code',
    fr: 'Masquer le code source'
  },
  copySourceCode: {
    en: 'Copy source code',
    fr: 'Copier le code source'
  },
  copied: {
    en: 'Copied!',
    fr: 'Copié !'
  },
  fixedValue: {
    en: 'fixed value',
    fr: 'valeur fixe'
  },
  totalValues: {
    en: 'total values',
    fr: 'valeurs totales'
  },
  individualLayer: {
    en: 'Individual Layer',
    fr: 'Couche individuelle'
  },
  allLayersFused: {
    en: 'All Layers (Fused)',
    fr: 'Toutes les couches (fusionnées)'
  },
  tiledServicesTooltip: {
    en: 'Tiled services can only display all layers together',
    fr: 'Les services tuilés ne peuvent afficher que toutes les couches ensemble'
  },
  // Service info display strings
  title: {
    en: 'Title:',
    fr: 'Titre :'
  },
  version: {
    en: 'Version:',
    fr: 'Version :'
  },
  abstractLabel: {
    en: 'Abstract',
    fr: 'Résumé'
  },
  loadedUrl: {
    en: 'Loaded URL:',
    fr: 'URL chargée :'
  },
  availableLayers: {
    en: 'Available Layers',
    fr: 'Couches disponibles'
  },
  tileMatrixSets: {
    en: 'TileMatrixSets:',
    fr: 'Matrices de tuiles :'
  },
  supported: {
    en: 'supported',
    fr: 'pris en charge'
  },
  loadedFromFile: {
    en: '(Loaded from file)',
    fr: '(Chargé à partir d\'un fichier)'
  },
  copyright: {
    en: 'Copyright:',
    fr: 'Droit d\'auteur :'
  },
  tileCache: {
    en: 'Tile Cache:',
    fr: 'Cache de tuiles :'
  },
  zoomLevels: {
    en: 'Zoom levels',
    fr: 'Niveaux de zoom'
  },

  // Notice/alert replacement strings
  noticeError: {
    en: 'Error',
    fr: 'Erreur'
  },
  noticeWarning: {
    en: 'Warning',
    fr: 'Avertissement'
  },
  unsupportedProjection: {
    en: 'Unsupported projection: WKID {wkid}. MapMLify only supports EPSG:3857, 3978, 4326, and 5936.',
    fr: 'Projection non prise en charge\u00a0: WKID {wkid}. MapMLify ne prend en charge que EPSG:3857, 3978, 4326 et 5936.'
  },

  // Code showcase strings
  viewCode: {
    en: 'View code',
    fr: 'Voir le code'
  },
  hideCode: {
    en: 'Hide code',
    fr: 'Masquer le code'
  },
  copyCode: {
    en: 'Copy code',
    fr: 'Copier le code'
  },
  codeCopied: {
    en: 'Copied',
    fr: 'Copié'
  },
  codeDisplay: {
    en: 'Code display',
    fr: 'Affichage du code'
  },
  layerOptions: {
    en: 'Layer options',
    fr: 'Options de la couche'
  }
};

// Helper function to get translated string
export function t(key) {
  return translations[key]?.[LOCALE] || translations[key]?.en || key;
}

// Export locale for conditional logic if needed
export { LOCALE };
