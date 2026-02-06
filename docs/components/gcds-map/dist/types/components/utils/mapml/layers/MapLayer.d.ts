/**
 * TypeScript definitions for MapLayer
 * Corresponds to src/components/utils/mapml/layers/MapLayer.js
 */

import { LayerGroup, LayerOptions } from 'leaflet';

export interface MapLayerOptions extends LayerOptions {
  zIndex?: number;
  opacity?: string | number;
  projection?: string;
  mapprojection?: string;
}

export interface MapLayerElement extends HTMLElement {
  src?: string;
  readonly shadowRoot: ShadowRoot | null;
  _opacity?: number;
  _opacitySlider?: HTMLInputElement;
  _layerControlHTML?: HTMLElement;
}

export interface MapLayer extends LayerGroup {
  options: MapLayerOptions;
  _href?: string;
  _layerEl: MapLayerElement;
  _content: HTMLElement | ShadowRoot;
  _container: HTMLDivElement;
  _title?: string;
  _titleIsReadOnly?: boolean;
  _legendUrl?: string;
  bounds?: any;
  zoomBounds?: any;

  // Methods
  getContainer(): HTMLDivElement;
  setZIndex(zIndex: number): this;
  getHref(): string;
  changeOpacity(opacity: number): void;
  titleIsReadOnly(): boolean;
  setName(newName: string): void;
  getName(): string;
  getBase(): string;
  renderStyles(): void;
  getQueryTemplates(location: any, zoom: number): any[] | undefined;
  _calculateBounds(): void;
  _updateZIndex(): void;
  _initialize(): void;
  _attachSkipButtons(e: any): void;
}

export interface MapLayerConstructor {
  new (href: string | null, layerEl: MapLayerElement, options?: MapLayerOptions): MapLayer;
}

/**
 * Factory function signature for creating MapLayer instances
 * @param url - URL to MapML content (can be null for local content)
 * @param node - The map-layer HTML element or shadow root
 * @param options - Layer options
 * @returns MapLayer instance or null if no url and no node provided
 */
export declare function mapMLLayer(
  url: string | null, 
  node: MapLayerElement | ShadowRoot | null, 
  options?: MapLayerOptions
): MapLayer | null;

export declare const MapLayer: MapLayerConstructor;