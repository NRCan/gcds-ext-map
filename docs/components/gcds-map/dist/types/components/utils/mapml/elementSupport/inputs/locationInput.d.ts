export declare class LocationInput {
    name: string;
    position?: string;
    axis: string;
    units?: string;
    min?: string;
    max?: string;
    rel?: string;
    layer: any;
    constructor(name: string, position: string, axis: string, units: string, min: string, max: string, rel: string, layer: any);
    validateInput(): boolean;
    _TCRSToPCRS(coords: any, zoom: number): any;
    getValue(zoom?: number, bounds?: any): any;
}
