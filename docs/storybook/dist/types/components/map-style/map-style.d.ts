export declare class MapStyle {
    el: HTMLElement;
    media?: string;
    private _mql;
    private _changeHandler;
    private _observer;
    private styleElement;
    private _stylesheetHost;
    mediaChanged(newValue: string, oldValue: string): Promise<void>;
    getMapEl(): any;
    private _connect;
    private _disconnect;
    private _copyAttributes;
    private _registerMediaQuery;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
}
