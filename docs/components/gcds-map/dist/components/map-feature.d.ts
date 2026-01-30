import type { Components, JSX } from "../types/components";

interface MapFeature extends Components.MapFeature, HTMLElement {}
export const MapFeature: {
    prototype: MapFeature;
    new (): MapFeature;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
