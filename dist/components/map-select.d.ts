import type { Components, JSX } from "../types/components";

interface MapSelect extends Components.MapSelect, HTMLElement {}
export const MapSelect: {
    prototype: MapSelect;
    new (): MapSelect;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
