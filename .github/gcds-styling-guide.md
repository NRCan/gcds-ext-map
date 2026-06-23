# GCDS Styling Guide for gcds-map Ports

Short guidance for porting MapML.js controls / components into `gcds-map`
so the result is consistent with the GC Design System (GCDS). This is a
distillation of [gcds-request.md](../gcds-request.md) (the original GCDS
team request) and [gcds-integration-feedback.md](./gcds-integration-feedback.md)
(the decisions we made while applying it). Read those for the full
rationale; this file is the checklist.

## TL;DR

`gcds-map.css` is a composite stylesheet that fork-bundles:

1. `~leaflet/dist/leaflet.css` (via `@import`, third-party, untouched)
2. `~leaflet.locatecontrol/dist/L.Control.Locate.css` (via `@import`,
   third-party, untouched)
3. Forked-and-inlined content from upstream MapML.js `mapml.css`
4. GCDS-specific overrides and project-owned additions

When you add CSS for a newly-ported control to
[`src/components/gcds-map/gcds-map.css`](../src/components/gcds-map/gcds-map.css):

1. Wrap every hard-coded color, spacing, border-width, and border-radius
   in a GCDS token with the original value as the fallback.
2. Use CSS logical properties (`inset-*`, `border-block-*`,
   `padding-inline`, `text-align: start`, ...) for selectors **you own**
   (i.e. `.mapml-*` and project-specific classes).
3. Do **not** convert `.leaflet-*` override selectors — keep those
   physical to avoid specificity-equal mismatches with Leaflet's base
   CSS. Token-wrap their colors/spacing only where it doesn't change
   resolved values.
4. Do **not** modify the imported third-party CSS in any way — it's
   vendored as-is.
5. Do **not** add `@font-face` or `@import` of `tokens.css` inside the
   stylesheet — shadow DOM swallows both. Tokens reach us via `:root`
   inheritance from the host page; fonts are the host page's job.
6. Keep generic box-shadows as raw `rgba()` values — GCDS box-shadow
   tokens are component-scoped only (focus rings, cards, nav menus), no
   generic elevation token.
7. Preserve source order / line correspondence with upstream MapML.js
   `mapml.css` to keep diff-and-patch workflow viable for sections (3).

## Token Mapping Reference

Use these mappings. The fallback is **always the original hard-coded
value**, not the resolved token value — this preserves appearance when
GCDS isn't loaded and matches the pattern already in
[`gcds-map.css`](../src/components/gcds-map/gcds-map.css).

### Colors

| Hard-coded | GCDS token | Notes |
|---|---|---|
| `#fff` / `white` (backgrounds) | `--gcds-bg-white` | matches contextmenu, panel, button bg |
| `#fff` (pure color usage) | `--gcds-color-white` | when semantically "the color white" |
| `#000` / `black` | `--gcds-color-black` | |
| `#222` (body text) | `--gcds-text-primary` | shifts to `#333` |
| `rgb(60,64,67)` | `--gcds-text-secondary` | |
| `#f4f4f4`, `#f0f0f0` (hover/light bg) | `--gcds-bg-light` | both map here |
| `#e3e3e3` (subtle borders) | `--gcds-color-grayscale-100` | |
| `#eee` (dividers) | `--gcds-color-grayscale-100` | |
| `#ccc` (input borders) | `--gcds-color-grayscale-200` | exact match `#cccccc` |
| `lightgrey` | `--gcds-color-grayscale-150` | |
| `#bbb` (disabled text) | `--gcds-disabled-text` | large shift to `#808080` — flagged with GCDS team |
| `rgb(222,225,230)` | *(no token)* | keep |
| Focus ring on inputs | `--gcds-input-focus-border` | |
| Focus ring on other interactive | `--gcds-focus-border` | |
| Link colors | `--gcds-link-default` / `--gcds-link-hover` / `--gcds-link-visited` / `--gcds-link-focus-*` | see [example 1 in gcds-request.md](../gcds-request.md) |

### Spacing

Use `--gcds-spacing-*` tokens. The token name is roughly `8 × (value /
0.5rem)`. Common ones:

| Value | Token |
|---|---|
| `4px` / `5px` | `--gcds-spacing-50` |
| `8px` | `--gcds-spacing-100` |
| `12px` | `--gcds-spacing-150` |
| `15px` | `--gcds-spacing-175` |
| `24px` | `--gcds-spacing-300` |
| `30px` | `--gcds-spacing-350` |
| `36px` | `--gcds-spacing-450` |

### Borders & Radius

| Hard-coded | GCDS token |
|---|---|
| `1px` border-width | `--gcds-border-width-sm` |
| `4px` border-radius | `--gcds-border-radius-md` (shifts to ~6px — flagged) |

### Typography (weights & families)

Font **family** is set on `.leaflet-container` to
`var(--gcds-font-families-body, 'Noto Sans', sans-serif)` and inherits.
Form controls need `font-family: inherit;` (see the section below).

Font **weights** should use tokens:

| Hard-coded | GCDS token |
|---|---|
| `font-weight: 300` | `--gcds-font-weights-light` |
| `font-weight: normal` / `400` | `--gcds-font-weights-regular` |
| `font-weight: 500` | `--gcds-font-weights-medium` |
| `font-weight: 600` | `--gcds-font-weights-semibold` |
| `font-weight: bold` / `700` / `900` | `--gcds-font-weights-bold` |

GCDS does not ship a `900` weight token; collapse to `bold` (`700`).

### Shadows

GCDS provides `box-shadow` tokens, but they are all **component-scoped**
(focus rings such as `--gcds-input-focus-box-shadow`, card shadows such
as `--gcds-card-hover-box-shadow`, and surface-specific menu shadows
such as `--gcds-nav-group-top-nav-dropdown-box-shadow`). There is **no
generic drop-shadow / elevation token** in the palette.

Guidance:

- If your control has a true match (e.g. a focus ring on an input, where
  `--gcds-input-focus-box-shadow` applies) — use the token.
- For decorative drop shadows on map controls / panels / popovers, keep
  the raw `box-shadow: ... rgba(...)` value. Do **not** repurpose a
  card / nav / menu token for unrelated UI — the offsets, radii, and
  intent differ.
- Don't bother token-wrapping just the color portion of an alpha-blended
  pure-black shadow (e.g. `rgba(0,0,0,0.1)`) — `--gcds-color-black`
  resolves to the same value, and `rgba()` can't accept a hex variable
  anyway. Leaving the raw `rgba(...)` is correct.

### Font sizes

Generally **not** tokenized in this file. Leave existing upstream values
as-is unless they clearly map to a GCDS typography token.

Note that GCDS's smallest body token (`--gcds-font-sizes-text-small`)
resolves to `1.125rem` (18px), which is larger than typical in-map UI
chrome (12–14px). For most map controls, raw px values are the
pragmatic choice. Use the GCDS heading / body tokens only if the
content is genuinely heading- or body-level (e.g. a dialog with prose).

**For new font-size values you introduce**, prefer accessible minimums:

- Interactive text (buttons, links, form-control labels, search results,
  list items the user clicks): **≥ 14px**. Avoid `12px` / `13px` — these
  exist in upstream MapML / Leaflet code but should not be added new.
- Primary body text: **≥ 1rem** (16px).
- Form-control text (`<input>`, `<textarea>`): **≥ 14px**, ideally
  `1rem`. The GCDS reference token `--gcds-input-font-desktop`
  resolves to `1.25rem`, which is correct for top-level forms but
  often too large for in-map controls — `1rem` is a reasonable middle
  ground.

Rationale: GCDS uses `1rem` as its body baseline, and WCAG / common
accessibility heuristics treat ~14px as the floor for interactive text.
Keeping new additions at or above this floor avoids degrading
accessibility even while we leave legacy upstream values untouched.

## Logical Property Conversions

Apply these on selectors you own (anything `.mapml-*`, your control's
own classes). For Leaflet override selectors (`.leaflet-*`) keep
physical properties.

| Physical | Logical |
|---|---|
| `top` / `bottom` | `inset-block-start` / `inset-block-end` |
| `left` / `right` | `inset-inline-start` / `inset-inline-end` |
| `margin-top/bottom` | `margin-block-start/end` |
| `margin-left/right` | `margin-inline-start/end` |
| `padding-top/bottom` | `padding-block-start/end` (or `padding-block`) |
| `padding-left/right` | `padding-inline-start/end` (or `padding-inline`) |
| `border-top/bottom` | `border-block-start/end` |
| `border-left/right` | `border-inline-start/end` |
| `border-radius: a b c d` (4-value) | split into `border-{start,end}-{start,end}-radius` |
| `text-align: left/right` | `text-align: start/end` |

### Direction-sensitive behavior

Logical CSS only flips when `dir="rtl"` is set. A few patterns also
require JS awareness:

- `transform: translateX(-100%)` for slide-in panels does **not** auto-flip.
  If RTL support matters for the control, the JS will need to choose the
  axis. Flag and defer unless explicitly in scope.

## Pattern: Token with Fallback

```css
/* GOOD */
background-color: var(--gcds-bg-white, #fff);
border-radius: var(--gcds-border-radius-md, 4px);
padding-inline: var(--gcds-spacing-100, 8px);
border-block-end: var(--gcds-border-width-sm, 1px) solid
  var(--gcds-color-grayscale-100, #eee);

/* BAD — no fallback (breaks if GCDS isn't loaded) */
background-color: var(--gcds-bg-white);

/* BAD — fallback uses the resolved token value instead of the original */
border-radius: var(--gcds-border-radius-md, 6px);
```

## Don'ts (Shadow DOM gotchas)

- **Do not** add `@font-face` rules to `gcds-map.css`. They are silently
  ignored inside shadow DOM. Host pages load GCDS fonts.
- **Do not** `@import '@gcds-core/tokens/.../tokens.css'`. The `:root`
  selector in that file targets `<html>`, but the rules are inert when
  loaded from inside a shadow root. Tokens reach us via inheritance
  when the host page loads `@gcds-core/components`.
- **Do not** add inline `style="..."` in the control's JS. All styling
  belongs in `gcds-map.css` so tokens can override.

## Form Controls and Font Inheritance

Browsers do **not** inherit `font-family` (or other font props) into
`<input>`, `<button>`, `<select>`, `<textarea>` by default — they fall
back to UA-default fonts. `.leaflet-container` sets the GCDS body font,
but that inheritance stops at form controls.

Two ways to opt back in:

1. Apply the existing `.mapml-button` class to your `<button>` — it
   sets `font: inherit` (along with other resets).
2. Add `font-family: inherit;` directly in your control's CSS. Use this
   for `<input>` elements and for `<button>`s where you can't use
   `mapml-button` (e.g. you need a specific `font-size`).

Symptom if you forget: the control's text renders in a system sans
(Helvetica / Arial / Roboto) instead of Noto Sans, even though
everything else on the map looks correct.

## Self-Check Before Committing a Port

- [ ] Every new color value uses `var(--gcds-..., <original>)`.
- [ ] Every new spacing, border-width, border-radius uses a GCDS token
      with the original value as fallback (or is justifiably left raw
      e.g. shadow rgba, in-map font-size).
- [ ] Every new `font-weight` uses a `--gcds-font-weights-*` token.
- [ ] Any new `font-size` I introduce for interactive text is **≥ 14px**
      (≥ 1rem for primary body content). Legacy upstream `12px` / `13px`
      values may stay; do not add new ones.
- [ ] My own selectors use logical properties; Leaflet overrides stay
      physical.
- [ ] Any `<input>` / `<button>` / `<select>` / `<textarea>` the
      control adds either uses the `.mapml-button` class or sets
      `font-family: inherit;` so it picks up the GCDS body font.
- [ ] No `@font-face`, no `@import` of `tokens.css`, no inline styles
      added.
- [ ] CSS block sits at the source-order position that matches the
      upstream MapML.js `mapml.css` if applicable.
- [ ] Visual smoke test in a page that loads GCDS, and one that doesn't
      — both should render reasonably.

## Open Questions (still pending GCDS team input)

See [gcds-integration-feedback.md](./gcds-integration-feedback.md). The
mappings above reflect our current best guesses. If those answers
change, update this guide.

## Audit Status of the Existing CSS

`.mapml-*` selectors have had a tokenization / logical-property pass:
font-weights are tokenized (`bold` / `900` → `--gcds-font-weights-bold`)
and straightforward physical positions on project-owned controls have
been converted to logical (`.mapml-control-scale`, `.mapml-crosshair`
block-axis, `.mapml-feature-index` block-axis).

Known remaining items, intentional or deferred:

- A few `.mapml-*` selectors keep physical `left: 50%` paired with
  `transform: translateX(-50%)` or negative margins (`.mapml-crosshair`,
  `.mapml-feature-index`). Both the original and a mechanical
  `inset-inline-start: 50%` conversion are RTL-incorrect for different
  reasons; left as-is until an RTL-safe centering refactor is in scope.
- Raw `font-size` values inside `.mapml-*` controls (`12px`, `16px`,
  `20px`, `34px`, `large`, `1.125rem`) are intentionally not tokenized:
  GCDS's smallest body font token is `1.125rem` (18px), too large for
  in-map UI chrome. Don't introduce *new* font sizes below 14px for
  interactive text; leave the upstream values alone.
- `.leaflet-*` override selectors keep physical properties on purpose
  (Leaflet specificity-equal rule). Tokenizing their colors is fine
  where the resolved value matches.
- Imported `leaflet.css` and `L.Control.Locate.css` are third-party and
  must not be modified.

Policy going forward:

- **Do not** introduce new code that violates the TL;DR. Apply the full
  guide to anything you author.
- **Opportunistic retrofit:** when you touch a legacy section for any
  other reason, bring it up to the guide at the same time. Avoid huge
  sweep PRs that touch unrelated areas and break the upstream-diff
  workflow.
