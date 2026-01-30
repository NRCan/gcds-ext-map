export declare class MapInput {
    el: HTMLElement;
    name: string;
    type: string;
    value?: string;
    axis?: string;
    units?: string;
    position?: string;
    rel?: string;
    min?: string;
    max?: string;
    step?: string;
    input: any;
    _layer: any;
    initialValue?: number;
    getMapEl(): any;
    getLayerEl(): any;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    checkValidity(): boolean;
    reportValidity(): boolean;
    whenReady(): Promise<void>;
    render(): any;
}
