import type { Components, JSX } from "../types/components";

interface MapGeometry extends Components.MapGeometry, HTMLElement {}
export const MapGeometry: {
    prototype: MapGeometry;
    new (): MapGeometry;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
