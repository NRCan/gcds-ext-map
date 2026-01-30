export declare class MapSelect {
    el: HTMLElement;
    name?: string;
    selectDetails?: HTMLElement;
    htmlSelect?: HTMLSelectElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    nameChanged(newValue: string, oldValue: string): void;
    private _createLayerControlForSelect;
    private transcribe;
    whenReady(): Promise<void>;
    render(): any;
}
