export declare class MapMeta {
    el: HTMLElement;
    name?: string;
    content?: string;
    nameChanged(newValue: string, oldValue: string): void;
    contentChanged(newValue: string, oldValue: string): void;
    set contentValue(val: string | undefined);
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): any;
}
