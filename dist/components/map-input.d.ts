import type { Components, JSX } from "../types/components";

interface MapInput extends Components.MapInput, HTMLElement {}
export const MapInput: {
    prototype: MapInput;
    new (): MapInput;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
