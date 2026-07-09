# GCDS Integration Feedback — Constraints & Decisions for Discussion

This document summarizes constraints encountered while applying the GCDS tokens, fonts, and styling request to the `gcds-ext-map` Stencil component project. We'd appreciate your input on the decisions below.

## Context

The `gcds-ext-map` component uses **Shadow DOM** (`shadow: true` in Stencil). All map UI — controls, popups, layer panel, context menu — renders inside the shadow root. This has significant implications for how GCDS styles can be integrated.

We also note the request referenced `@cdssnc/gcds-tokens` and `@cdssnc/gcds-fonts-icons`, which are deprecated. We've used `@gcds-core/tokens` (v1.2.0) instead, consistent with our existing `@gcds-core/components` peer dependency.

---

## Constraint 1: Fonts Cannot Be Loaded Inside Shadow DOM

**Problem:** `@font-face` declarations inside a shadow root do not register fonts with the browser. The request asks us to `@import` font CSS into our component stylesheet (`gcds-ext-map.css`), but since that stylesheet is scoped to the shadow DOM, any `@font-face` rules would be silently ignored.

**Our decision:** Require the host page to load GCDS fonts (via `<link>` tags or their own CSS). This is already the pattern — our demo pages load GCDS from CDN. We will document this as a requirement for consumers of `gcds-ext-map`.

**Question for GCDS team:** Is this acceptable, or do you have a preferred pattern for web components that use Shadow DOM? Some approaches include:
- Constructable/adoptable stylesheets injected into `document` from `connectedCallback()`
- A shared font-loading utility or helper from `@gcds-core`
- Accepting that host pages must include the fonts

---

## Constraint 2: Token Values Don't Exactly Match Current Colors

**Problem:** Several hard-coded colors in our CSS don't have exact equivalents in the GCDS token palette. Adopting tokens means accepting small visual shifts:

| Current value | Initially considered | Verified GCDS token | Token value | Shift |
|---|---|---|---|---|
| `#fff` / `white` | `--gcds-bg-white` | `--gcds-color-white` | `#ffffff` | None |
| `#000` | `--gcds-text-primary` | `--gcds-color-black` | `#000000` | None |
| `#222` | `--gcds-text-primary` | `--gcds-text-primary` | `#333333` | Lighter |
| `#f4f4f4` | `--gcds-bg-light` | `--gcds-bg-light` | `#f2f2f2` | Slightly darker |
| `#f0f0f0` | `--gcds-bg-light` | `--gcds-bg-light` | `#f2f2f2` | Slightly lighter |
| `#e3e3e3` | `--gcds-border-default` | `--gcds-color-grayscale-100` | `#e6e6e6` | Slightly lighter |
| `#bbb` | disabled text token | `--gcds-disabled-text` | `#808080` | Significantly darker |
| `rgb(0 0 0 / 30%)` | shadow token | *(component-scoped only; no generic shadow token)* | — | Kept as-is |
| `rgb(222,225,230)` | — | *(no token)* | — | Kept as-is |
| `rgb(60,64,67)` | — | `--gcds-text-secondary` | `#595959` | Different hue/lightness |
| `lightgrey` | — | `--gcds-color-grayscale-150` | `#d9d9d9` | — |
| `4px` border-radius | `--gcds-border-radius` | `--gcds-border-radius-md` | `0.375rem` (~6px) | Larger |

**Our decision:** Use `var(--gcds-token, <current-value>)` with the current value as fallback. Without GCDS loaded, appearance is unchanged. With GCDS loaded, colors shift to the design system palette.

**Question for GCDS team:** 
- Are these the correct token mappings, or would you recommend different ones?
- For `#bbb` (disabled control text) → `--gcds-disabled-text` (`#808080`) is a large shift. Is there a lighter disabled token, or should we keep the current value?
- For `border-radius: 4px` → `--gcds-border-radius-md` (`~6px`) changes the look of all controls. Should we adopt this, or keep `4px`?

---

## Constraint 3: CSS Custom Properties Inheritance Through Shadow DOM

**Problem:** The GCDS `tokens.css` file defines all properties on `:root`. We cannot `@import` this file inside our shadow DOM stylesheet — the `:root` selector would target `<html>`, but the properties wouldn't be available inside the shadow root unless they're defined on an ancestor in the light DOM.

**Our decision:** CSS custom properties *do* inherit through shadow DOM boundaries. So if the host page loads `@gcds-core/components` CSS (which defines tokens on `:root`), our shadow DOM `var()` references will resolve correctly. We rely on this inheritance rather than importing tokens ourselves.

**Question for GCDS team:** Does this approach align with how other GCDS-integrated web components handle token consumption?

---

## Constraint 4: MapML.js Source Correspondence

**Problem:** `gcds-ext-map.css` is a port of `mapml.css` from the upstream MapML.js project. We maintain source-order correspondence to enable diffing and selective patch application. Adding `var()` wrappers and converting to logical properties creates divergence that complicates future maintenance.

**Our decision:** Proceed with the changes but preserve source order and add a comment block at the top of the file documenting the GCDS token mapping for maintainability.

**Question for GCDS team:** Is there a recommended pattern for projects that maintain a fork relationship while integrating GCDS tokens? Any tooling or conventions that would help?

---

## Constraint 5: Logical Properties and Leaflet CSS

**Problem:** Leaflet's CSS uses physical directional properties (`margin-left`, `border-top`, etc.). Our CSS includes overrides of Leaflet selectors. Converting our overrides to logical properties while Leaflet retains physical properties could create subtle layout mismatches, since logical and physical properties have the same specificity but don't override each other (they're different properties).

**Our decision:** Convert to logical properties where safe (our own selectors), but keep physical properties for selectors that directly override Leaflet styles to avoid breakage.

**Question for GCDS team:** Is partial adoption of logical properties acceptable, or is full conversion expected?

---

## Summary of Questions

1. **Fonts in Shadow DOM** — host page loading acceptable, or is there a GCDS pattern for this?
2. **Color shifts** — are the token mappings correct? Especially `#bbb` → `--gcds-disabled-text`.
3. **Border radius** — adopt `--gcds-border-radius-md` (~6px) or keep `4px`?
4. **Token inheritance** — is relying on `:root` inheritance through shadow DOM the right approach?
5. **Logical properties** — is partial conversion (only non-Leaflet-override selectors) acceptable?
