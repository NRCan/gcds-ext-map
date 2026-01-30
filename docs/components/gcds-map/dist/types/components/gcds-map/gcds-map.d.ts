import { DOMTokenList } from '../utils/mapml/DOMTokenList.js';
export declare class GcdsMap {
    el: HTMLElement;
    lat?: number;
    lon?: number;
    zoom?: number;
    projection?: string;
    controls: boolean;
    static?: boolean;
    _controlslist?: string;
    locale?: any;
    _controlsList: DOMTokenList;
    _source: string;
    _history: any[];
    _historyIndex: number;
    _traversalCall: number | false;
    private _map;
    private _container;
    private mapCaptionObserver;
    private _featureIndexOverlay;
    private _zoomControl;
    private _layerControl;
    private _reloadButton;
    private _fullScreenControl;
    private _geolocationButton;
    private _scaleBar;
    private _isInitialized;
    private _debug;
    private _crosshair;
    private _boundDropHandler;
    private _boundDragoverHandler;
    controlsChanged(newValue: boolean): void;
    controlsListChanged(newValue: string): void;
    get controlsList(): DOMTokenList;
    set controlsList(value: string | null);
    projectionChanged(newValue: string, oldValue: string): Promise<void>;
    get extent(): any;
    getWidth(): number;
    getHeight(): number;
    staticChanged(): void;
    componentWillLoad(): void;
    connectedCallback(): Promise<void>;
    _setLocale(): void;
    _initShadowRoot(): void;
    _createMap(): void;
    disconnectedCallback(): void;
    _ensureControlsLoaded(): Promise<void>;
    _createControls(): void;
    _toggleControls(): void;
    _hideControls(): void;
    _showControls(): void;
    _deleteControls(): void;
    _setControlsVisibility(control: any, hide: any): void;
    _toggleStatic(): void;
    _removeEvents(): void;
    _setUpEvents(): void;
    _dropHandler(event: DragEvent): void;
    _dragoverHandler(event: DragEvent): void;
    /**
     * Toggle debug overlay on the map
     */
    toggleDebug(): void;
    locate(options?: any): void;
    _changeWidth(width: number | string): void;
    _changeHeight(height: number | string): void;
    _updateMapCenter(): void;
    _resetHistory(): void;
    _addToHistory(): void;
    private _updateNavigationControls;
    /**
     * Navigate back in map history
     */
    back(): void;
    /**
     * Allows user to move forward in history
     */
    forward(): void;
    /**
     * Allows the user to reload/reset the map's location to its initial location
     * and reset the history to the initial state
     */
    reload(): void;
    /**
     * Internal method to toggle fullscreen (used by MapML context menu)
     */
    private _toggleFullScreen;
    /**
     * Open the map source in a new window
     */
    viewSource(): void;
    /**
     * Zoom the map to a specific location and zoom level
     * @param lat - Latitude coordinate
     * @param lon - Longitude coordinate
     * @param zoom - Zoom level (optional, defaults to current zoom)
     */
    zoomTo(lat: number, lon: number, zoom?: number): void;
    whenProjectionDefined(projection: string): Promise<unknown>;
    defineCustomProjection(jsonTemplate: any): any;
    /**
     * Promise-based method to wait until map is ready
     * Returns a promise that resolves when the map is fully initialized
     */
    whenReady(): Promise<void>;
    /**
     * Promise-based method to wait until all layers are ready
     * Returns a promise that resolves when all child layers are fully initialized
     */
    whenLayersReady(): Promise<PromiseSettledResult<void>[]>;
    /**
     * Convert GeoJSON to MapML and append as a layer
     * @param json - GeoJSON object (FeatureCollection, Feature, or Geometry)
     * @param options - Conversion options:
     *   - label: Layer label (defaults to json.name, json.title, or locale default)
     *   - projection: Target projection (defaults to map's projection)
     *   - caption: Feature caption property name or function
     *   - properties: Custom properties handling (function, string, or HTMLElement)
     *   - geometryFunction: Custom geometry processing function
     * @returns The created map-layer element
     */
    geojson2mapml(json: any, options?: any): HTMLElement;
    render(): any;
}
