import type { Components, JSX } from "../types/components";

interface MapLink extends Components.MapLink, HTMLElement {}
export const MapLink: {
    prototype: MapLink;
    new (): MapLink;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
