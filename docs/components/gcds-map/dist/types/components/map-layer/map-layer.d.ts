export declare class GcdsMapLayer {
    el: HTMLElement;
    src?: string;
    checked?: boolean;
    hidden: boolean;
    opacity?: number;
    _opacity?: number;
    media?: string;
    get opacityValue(): number;
    _layer: any;
    _layerControl: any;
    _layerControlHTML: any;
    _layerItemSettingsHTML: any;
    _propertiesGroupAnatomy: any;
    disabled: boolean;
    _fetchError: boolean;
    _layerRegistry: Map<number, {
        layer: any;
        count: number;
    }>;
    srcChanged(newValue: string, oldValue: string): void;
    checkedChanged(newValue: boolean): void;
    opacityChanged(newValue: number, oldValue: number): void;
    mediaChanged(newValue: string, oldValue: string): void;
    hiddenChanged(newValue: boolean, oldValue: boolean): void;
    private _applyHiddenState;
    private loggedMessages;
    private _observer?;
    private _mql?;
    private _changeHandler?;
    private _boundCreateLayerControlHTML?;
    private _layerControlCheckbox?;
    private _layerControlLabel?;
    private _opacityControl?;
    private _opacitySlider?;
    private _styles?;
    get label(): string;
    set label(val: string);
    get extent(): any;
    private _registerMediaQuery;
    getMapEl(): any;
    componentWillLoad(): void;
    disconnectedCallback(): void;
    private _onRemove;
    connectedCallback(): void;
    private _onAdd;
    private _setLocalizedDefaultLabel;
    private _selectAlternateOrChangeProjection;
    private _copyRemoteContentToShadowRoot;
    /**
     * For "local" content, getProjection will use content of "this"
     * For "remote" content, you need to pass the shadowRoot to search through
     */
    getProjection(): any;
    private _attachedToMap;
    private _runMutationObserver;
    /**
     * Set up a function to watch additions of child elements of map-layer or
     * map-layer.shadowRoot and invoke desired side effects via _runMutationObserver
     */
    private _bindMutationObserver;
    private _validateDisabled;
    private toggleLayerControlDisabled;
    queryable(): boolean;
    getAlternateStyles(styleLinks: any[]): HTMLElement | null;
    getOuterHTML(): string;
    zoomTo(): void;
    pasteFeature(feature: any): void;
    private _createLayerControlHTML;
    whenReady(): Promise<void>;
    /**
     * Wait for all map-extent and map-feature elements to be ready.
     * Returns a promise that resolves when all are settled.
     */
    whenElemsReady(): Promise<PromiseSettledResult<unknown>[]>;
    /**
     * Convert this MapML layer to GeoJSON FeatureCollection
     * @param options - Conversion options:
     *   - propertyFunction: Function to map <map-properties> to GeoJSON properties
     *   - transform: Whether to transform coordinates to GCRS (EPSG:4326), defaults to true
     * @returns GeoJSON FeatureCollection object
     */
    mapml2geojson(options?: any): any;
    render(): any;
}
