import type { Components, JSX } from "../types/components";

interface MapMeta extends Components.MapMeta, HTMLElement {}
export const MapMeta: {
    prototype: MapMeta;
    new (): MapMeta;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
