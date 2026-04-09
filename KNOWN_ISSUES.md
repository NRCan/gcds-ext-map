# Known Issues

## Next Feature Button Race Condition

**Status**: Bug exists in both gcds-map and MapML.js  
**Discovered**: December 5, 2025 during test migration  
**Test**: `multipleQueryExtents.e2e.ts` - Tests with rapid "Next feature" button clicks

### Description
Clicking the "Next feature" button too rapidly in query result pagination causes a console error and potential test/UI failures. The error occurs in `MapFeatureLayer.js:352`:

```
Uncaught (in promise) TypeError: Cannot read properties of null (reading 'fire')
    at NewClass.showPaginationFeature (MapFeatureLayer.js:352:17)
```

### Technical Details
The `showPaginationFeature` method attempts to fire events on an object that becomes null when the button is clicked faster than the previous pagination operation completes. This suggests the pagination state isn't properly synchronized or protected against rapid successive calls.

### Reproduction
```javascript
// Click "Next feature" button rapidly without delays
await page.getByTitle('Next feature').click();
await page.getByTitle('Next feature').click(); // May cause error
await page.getByTitle('Next feature').click(); // More likely to cause error
```

### Workaround
Add 100ms delays between clicks:
```javascript
await page.getByTitle('Next feature').click();
await page.waitForTimeout(100);
await page.getByTitle('Next feature').click();
```

### Notes
- Manual slow clicking doesn't reproduce the issue
- The race condition suggests missing state synchronization in pagination logic
- Should investigate adding debouncing or disabling the button during pagination transitions
- This is not a regression - MapML.js has the same behavior

---

## Layer Control - Extent Disappears After DOM Reordering

**Status**: Bug exists in both gcds-map and MapML.js  
**Discovered**: December 5, 2025 during test migration  
**Test**: `mixedLayer-zindex-rendering.e2e.ts` - Test #4 "DOM order change affects z-index rendering"

### Description
When a `map-extent` element is moved in the DOM via JavaScript manipulation (e.g., `insertBefore()`), the extent's entry disappears from the layer control panel, even though:
- The extent continues to render correctly on the map
- The z-index ordering updates properly based on new DOM position
- The extent's checked state is preserved

### Technical Details
When an extent is moved in the DOM:
1. `disconnectedCallback()` fires and removes `_layerControlHTML` from the layer control
2. `connectedCallback()` fires and creates new `_layerControlHTML` 
3. The new control HTML is **not** re-inserted into the parent layer's `_propertiesGroupAnatomy` fieldset
4. Result: Extent renders correctly but is missing from layer control

### Reproduction
```javascript
// Move extent after a feature in DOM
const firstFeature = document.querySelector('map-feature');
const firstExtent = document.querySelector('map-extent');
firstFeature.parentNode.insertBefore(firstExtent, firstFeature.nextSibling);
// Extent rendering updates correctly (z-index changes)
// But extent disappears from layer control panel
```

### Test Impact
The test `mixedLayer-zindex-rendering.e2e.ts` verifies rendering (screenshot) not layer control state, so the test passes. The bug was noticed during investigation when timeout needed adjustment for proper rendering update.

### Notes
- This is not a regression - MapML.js has the same behavior
- The `data-moving` attribute (used during layer control drag operations) properly prevents this issue during drag
- A fix would need to add insertion logic to `connectedCallback()` similar to the hidden attribute handler (lines 105-140 in map-extent.tsx)
- Investigate whether this is intended behavior or should be fixed in MapML.js upstream

---

## Custom Projection API Documentation

**Status**: Documentation needed  
**Discovered**: December 12, 2025 during custom projection refactoring  
**Related**: `M.defineCustomProjection()` global API implementation

### Description
The preferred API for defining custom projections is `window.M.defineCustomProjection()`, not `<mapml-viewer>.defineCustomProjection()` as currently documented at https://maps4html.org/web-map-doc/docs/api/mapml-viewer-api#definecustomprojectionoptions

### Technical Details
Custom projections must be defined **before** map markup is parsed to avoid timing issues:

```html
<script type="module">
  // Wait for M API to be available
  if (!window.M) {
    await new Promise(resolve => {
      const checkM = setInterval(() => {
        if (window.M) {
          clearInterval(checkM);
          resolve();
        }
      }, 10);
    });
  }
  
  // Define projection before map markup
  window.M.defineCustomProjection(JSON.stringify({
    "projection": "BNG",
    "proj4string": "+proj=tmerc ...",
    "origin": [-238375, 1376256],
    "resolutions": [896, 448, 224, ...],
    "bounds": [[-238375, 0], [900000, 1376256]],
    "tilesize": 256
  }));
</script>

<!-- Now map can use the custom projection -->
<mapml-viewer projection="BNG">
  ...
</mapml-viewer>
```

### Why Element Method Has Timing Issues
- `<mapml-viewer>.defineCustomProjection()` is only available after the element initializes
- But `connectedCallback()` runs `whenProjectionDefined(projection)` immediately
- If projection doesn't exist yet, initialization fails with "Projection X is not defined"
- This creates a chicken-and-egg problem for the documented workflow

### Solution
Both APIs exist and delegate to the same implementation:
- `window.M.defineCustomProjection()` - **Recommended** for page setup before map markup
- `<mapml-viewer>.defineCustomProjection()` - Available for runtime/programmatic use

### Action Required
Update documentation to recommend `window.M.defineCustomProjection()` as the primary API for defining custom projections, with the element method as a secondary option for dynamic scenarios.

### Notes
- `window.M` namespace is the polyfill API
- Future standardization may use a different namespace (e.g., `window.maps`)
- Both APIs store projections globally in `window.M[projectionName]`

---

## Crosshair Layer - Missing Accessibility Tests

**Status**: Critical accessibility feature, tests needed  
**Discovered**: December 12, 2025 during keyboard navigation implementation  
**Component**: Crosshair layer (`src/components/utils/mapml/layers/Crosshair.js`)

### Description
The crosshair layer is a **critical accessibility feature** that enables keyboard navigation to map features, but currently lacks automated tests to verify its functionality.

### Why Crosshair Is Critical
The crosshair serves two essential accessibility functions:

1. **Visual feedback**: Displays a crosshair at the map center when the map has keyboard focus, helping keyboard users orient themselves
2. **Feature navigation enabler**: Fires the `mapkeyboardfocused` event when the map receives keyboard focus, which triggers the FeatureIndex handler to set `tabindex=0` on the nearest feature

**Without the crosshair**, keyboard users cannot tab to features because:
- The `mapkeyboardfocused` event never fires
- FeatureIndex never calls `_sortIndex()` 
- Features remain with `tabindex=-1` (unfocusable)
- Keyboard navigation to features is completely broken

### Event Chain That Depends on Crosshair
```
User presses Tab → Map container gains focus
  ↓
Crosshair detects keyboard event via _onKeyUpDown()
  ↓
Crosshair sets map.isFocused = true
  ↓
Crosshair fires map.fire('mapkeyboardfocused')
  ↓
FeatureIndex handler receives event
  ↓
FeatureIndex calls _sortIndex()
  ↓
FeatureIndex sets nearest feature's tabindex=0
  ↓
User can now tab to features
```

### Current Implementation
- **gcds-map.tsx line 610**: `this._crosshair = crosshair().addTo(this._map);`
- Matches MapML.js implementation exactly
- Added to map after controls, before event setup
- Auto-cleaned up when map is deleted

### Missing Test Coverage
Need automated tests for:
1. Crosshair appears in DOM when map gains keyboard focus
2. `mapkeyboardfocused` event fires when user tabs into map
3. Features gain `tabindex=0` after map is keyboard-focused
4. Crosshair visual elements are present and visible
5. Regression test: ensure crosshair isn't accidentally disabled

### Workaround for Manual Testing
Test in browser by:
1. Build and run: `npm run build && npm start`
2. Open any test page with features (e.g., `/test/map-feature/popupTabNavigation.html`)
3. Press Tab to focus the map
4. Verify crosshair appears at map center
5. Press Tab again - should focus first feature (not skip over it)

### Action Required
Create accessibility test suite for keyboard navigation features including crosshair visibility and feature focus behavior.

### Notes
- Crosshair cannot be disabled without breaking feature keyboard navigation
- This is a fundamental accessibility requirement, not optional
- Future refactoring must preserve crosshair or provide alternative event source
---

## customTCRS Test Needs Rewrite

**Status**: Confusing test exists in both gcds-map and MapML.js  
**Discovered**: December 24, 2025 during test refactoring  
**Test**: `customTCRS.e2e.ts` - Test #3 "Complex Custom TCRS, static features loaded, templated features loaded"

### Description
The customTCRS-features.html test has multiple issues that make it confusing and difficult to maintain:

1. **Invalid zoom metadata**: Arizona layer has `<map-meta name="zoom" content="min=1,max=5,value=0">` where `value=0` is outside the declared `min=1,max=5` range
2. **Mismatched zoom levels**: Features declare `zoom="2"` but map initializes at `zoom="3"`
3. **Unclear test intent**: Test expects Arizona layer to be disabled but doesn't document why (bounds intersection? zoom constraints? projection validation?)
4. **Mixed coordinate systems**: Tests features with different `cs` attributes (tilematrix, pcrs, gcrs) but unclear what behavior is being validated
5. **Missing extent element**: Arizona layer has `<map-meta name="extent">` metadata but no `<map-extent>` element - what is this testing?

### Impact
- Unclear whether layer disabling is due to bounds, zoom constraints, or validation
- Different behavior between mapml-viewer (may not enforce zoom constraints) and gcds-map (may enforce them)
- Test may pass/fail for unexpected reasons making it brittle

### Action Required
Rewrite test in both repositories to:
1. Use valid, consistent zoom metadata values
2. Clearly document what behavior each test case validates
3. Separate tests for bounds checking, zoom constraints, and coordinate system validation
4. Remove ambiguous/conflicting metadata
5. Match map zoom and feature zoom levels when testing static features

### Notes
- Test currently passes but for potentially wrong reasons
- May fail differently as zoom constraint enforcement evolves
- Should be split into multiple focused test cases