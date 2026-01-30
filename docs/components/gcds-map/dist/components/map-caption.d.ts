import type { Components, JSX } from "../types/components";

interface MapCaption extends Components.MapCaption, HTMLElement {}
export const MapCaption: {
    prototype: MapCaption;
    new (): MapCaption;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
