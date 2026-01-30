import type { Components, JSX } from "../types/components";

interface MapExtent extends Components.MapExtent, HTMLElement {}
export const MapExtent: {
    prototype: MapExtent;
    new (): MapExtent;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
