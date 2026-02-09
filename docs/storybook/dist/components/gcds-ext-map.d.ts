import type { Components, JSX } from "../types/components";

interface GcdsExtMap extends Components.GcdsExtMap, HTMLElement {}
export const GcdsExtMap: {
    prototype: GcdsExtMap;
    new (): GcdsExtMap;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
