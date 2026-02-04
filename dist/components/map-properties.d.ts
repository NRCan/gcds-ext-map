import type { Components, JSX } from "../types/components";

interface MapProperties extends Components.MapProperties, HTMLElement {}
export const MapProperties: {
    prototype: MapProperties;
    new (): MapProperties;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
