import type { Components, JSX } from "../types/components";

interface MapSpan extends Components.MapSpan, HTMLElement {}
export const MapSpan: {
    prototype: MapSpan;
    new (): MapSpan;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
