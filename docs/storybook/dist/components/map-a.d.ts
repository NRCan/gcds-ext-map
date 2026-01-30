import type { Components, JSX } from "../types/components";

interface MapA extends Components.MapA, HTMLElement {}
export const MapA: {
    prototype: MapA;
    new (): MapA;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
