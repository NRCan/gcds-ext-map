import type { Components, JSX } from "../types/components";

interface GcdsMap extends Components.GcdsMap, HTMLElement {}
export const GcdsMap: {
    prototype: GcdsMap;
    new (): GcdsMap;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
