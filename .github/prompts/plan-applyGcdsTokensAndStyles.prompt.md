## Plan: Apply GCDS Tokens, Fonts & Logical Properties to gcds-ext-map

The GCDS team's request targets `@maps4html/mapml` and `mapml.css`, but the actual work applies to the gcds-ext-map Stencil project and its [gcds-ext-map.css](gcds-ext-map/src/components/gcds-ext-map/gcds-ext-map.css). The core task: install `@gcds-core/tokens`, replace ~15 hard-coded color values with `var(--gcds-*)` token references, convert remaining directional CSS to logical properties, and handle fonts. The main pitfall is **Shadow DOM**.

---

### Phase 1: Package Setup
1. Install `@gcds-core/tokens` as devDependency (the non-deprecated successor to `@cdssnc/gcds-tokens`)
2. Verify available token names against the hard-coded values in the CSS
3. **Do NOT install fonts as a package** — see Pitfall P2 below

### Phase 2: Token Replacement in gcds-ext-map.css
Replace hard-coded values with `var(--gcds-*, <fallback>)` — always including the current value as fallback so the component works standalone:

| Hard-coded | Verified GCDS token | Fallback | Usage |
|---|---|---|---|
| `#fff` / `white` | `--gcds-color-white` | `#ffffff` | Controls, context menu, attribution, layers |
| `#000` | `--gcds-color-black` | `#000000` | Control links, reload button |
| `#222` | `--gcds-text-primary` | `#333333` ⚠️ shifts from `#222` | Context menu text |
| `#f4f4f4` | `--gcds-bg-light` | `#f2f2f2` ⚠️ shifts from `#f4f4f4` | Hover/disabled states |
| `#f0f0f0` | `--gcds-bg-light` | `#f2f2f2` ⚠️ shifts from `#f0f0f0` | Hover border color |
| `#e3e3e3` | `--gcds-color-grayscale-100` | `#e6e6e6` ⚠️ shifts from `#e3e3e3` | Borders, separators |
| `#bbb` | `--gcds-disabled-text` | `#808080` ⚠️ shifts from `#bbb` | Disabled button text |
| `rgb(0 0 0 / 30%)` | *(no token)* | keep as-is | Box shadows |
| `rgb(222,225,230)` | *(no token)* | keep as-is | Link preview background |
| `rgb(60,64,67)` | `--gcds-text-secondary` | `#595959` ⚠️ shifts from `rgb(60,64,67)` | Link preview text |
| `lightgrey` | `--gcds-color-grayscale-150` | `#d9d9d9` | Kbd background |
| `4px` border-radius | `--gcds-border-radius-md` | `0.375rem` ≈ `6px` ⚠️ shifts from `4px` | Control corners |

**⚠️ = value shifts:** GCDS tokens don't exactly match current hard-coded values. Using `var(--token, <current-value>)` with current value as fallback preserves current look without GCDS; with GCDS loaded, colors shift slightly to the design system palette.

Typography: `font-size: 12px` and `44px` WCAG target sizes stay as-is (no matching tokens).

**Only file modified:** [gcds-ext-map.css](gcds-ext-map/src/components/gcds-ext-map/gcds-ext-map.css)

### Phase 3: Logical Properties Conversion
~28 directional CSS properties need assessment. Many already use logical properties. Convert the rest where appropriate:
- `margin-top/left/right/bottom` → `margin-block-start/inline-start/inline-end/block-end`
- `padding-left/right/top` → `padding-inline-start/inline-end/block-start`
- `border-top/bottom` → `border-block-start/block-end`
- `border-top-left-radius` → `border-start-start-radius` (8 instances)

**CAUTION:** Physical positioning (`left: 50%; top: 50%`) for crosshairs, tiles, and absolute positioning must NOT be converted — these are viewport-physical.

### Phase 4: Font Strategy
Fonts cannot be loaded inside shadow DOM. Document that host pages must load GCDS fonts (already the pattern — `src/index.html` loads GCDS from CDN).

### Phase 5: Test Updates
- If using fallback values, existing tests pass without changes
- Screenshot-based tests would need baseline updates if colors actually shift
- Full test suite: `npm test`

---

### Key Pitfalls

| # | Risk | Issue | Mitigation |
|---|---|---|---|
| **P1** | HIGH | **Shadow DOM `:root` mismatch** — `tokens.css` defines properties on `:root`. If `@import`-ed inside shadow DOM CSS, the `:root` selector won't define tokens on the shadow root. | Don't import tokens.css into shadow DOM CSS. Rely on host page's `@gcds-core/components` CSS which defines tokens on `:root`. CSS custom properties inherit through shadow DOM. |
| **P2** | HIGH | **`@font-face` in shadow DOM** — Font declarations inside shadow DOM don't register properly. The GCDS request says to add font imports to CSS, but this breaks in shadow DOM. | Require host page to load fonts. Document this requirement clearly. |
| **P3** | MEDIUM | **MapML.js diff divergence** — Adding `var()` wrappers will make future diffing against mapml.css harder. | Keep same source order, document the mapping. |
| **P4** | MEDIUM | **Visual regression** — GCDS tokens may not exactly match current hard-coded values. | Use current values as fallbacks in `var()`, so appearance is identical without GCDS loaded. |
| **P5** | LOW | **Package naming** — Request uses deprecated `@cdssnc/gcds-tokens`. The project already uses `@gcds-core/components`. | Use `@gcds-core/tokens` consistently. |
| **P6** | LOW | **Leaflet CSS conflicts** — Leaflet uses physical directional properties. Converting gcds-ext-map overrides to logical properties could create specificity mismatches. | Test each conversion; some Leaflet overrides must stay physical. |

### Decisions
- Use `@gcds-core/tokens` (not deprecated `@cdssnc/gcds-tokens`)
- Do NOT `@import` tokens or fonts inside shadow DOM CSS — rely on host page
- Always use `var(--gcds-token, <current-value>)` pattern so component works without GCDS loaded
- Physical positioning properties remain unconverted
- 44px WCAG touch target sizes remain as explicit values

### Scope
**Included:** Token replacement in gcds-ext-map.css, logical property conversion, package install, docs update
**Excluded:** Font loading inside shadow DOM, other component CSS (they have none), changes to MapML.js
