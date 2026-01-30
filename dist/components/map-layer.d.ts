import type { Components, JSX } from "../types/components";

interface MapLayer extends Components.MapLayer, HTMLElement {}
export const MapLayer: {
    prototype: MapLayer;
    new (): MapLayer;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
