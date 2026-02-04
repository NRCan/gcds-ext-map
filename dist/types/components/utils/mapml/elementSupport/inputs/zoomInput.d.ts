export declare class ZoomInput {
    name: string;
    min: string;
    max: string;
    value: number;
    step: string;
    layer: any;
    constructor(name: string, min: string, max: string, value: number, step: string, layer: any);
    validateInput(): boolean;
    getValue(): number;
}
