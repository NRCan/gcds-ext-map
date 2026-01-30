// src/types/gcds-map.d.ts

export interface MapMLViewerElement extends HTMLElement {
  whenLayersReady: () => Promise<void>;
  layers: HTMLCollectionOf<Element>;
  defineCustomProjection: (projection: string) => void;
}

// Global HTML element types for mapml-viewer
declare global {
  interface HTMLElementTagNameMap {
    'mapml-viewer': MapMLViewerElement;
  }
  
  interface HTMLMapmlViewerElement extends MapMLViewerElement {}
}

