import type { Components, JSX } from "../types/components";

interface MapStyle extends Components.MapStyle, HTMLElement {}
export const MapStyle: {
    prototype: MapStyle;
    new (): MapStyle;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
