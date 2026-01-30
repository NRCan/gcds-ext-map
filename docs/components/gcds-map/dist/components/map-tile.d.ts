import type { Components, JSX } from "../types/components";

interface MapTile extends Components.MapTile, HTMLElement {}
export const MapTile: {
    prototype: MapTile;
    new (): MapTile;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
