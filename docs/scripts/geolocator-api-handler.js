/* See https://maps4html.org/web-map-doc/docs/user-guide/custom-handlers for
 * info about custom search handlers.
 *
 * Custom handler for the CGDI Geolocator API, which returns a bare JSON array
 * (not GeoJSON).  Uses e.detail.setResults() so the search control handles
 * button rendering, keyboard navigation, and click-to-navigate automatically.
 *
 * Item shape accepted by setResults():
 *   { text, value?, lat?, lng?, bbox? }
 *   - value present  → clicking re-searches (suggestion mode)
 *   - value absent   → clicking navigates to lat/lng/bbox (result mode)
 */
document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.querySelector('gcds-ext-map');
  if (!viewer) return;

  // --- helpers ---

  function label(r) {
    const parts = [r.name || 'Unnamed'];
    if (r.province) parts.push(r.province);
    if (r.category) parts.push('(' + r.category + ')');
    return parts.join(', ');
  }

  function parseGeolocatorItems(responses) {
    const out = [];
    for (const { data } of responses) {
      // The Geolocator API returns a bare array at the top level.
      const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : null;
      if (!arr) continue;
      for (const r of arr) out.push(r);
    }
    return out;
  }

  function isGeolocatorResponse(responses) {
    // At least one response has a bare array (or array items) instead of GeoJSON features.
    return parseGeolocatorItems(responses).length > 0;
  }

  // Track suggestions so we can zoom to the one the user clicked.
  // When a suggestion is clicked, the control re-searches using its name,
  // so we match the search term back to the original suggestion item.
  let lastSuggestions = [];

  // --- mapsuggestions: include value so clicking a suggestion re-searches ---

  viewer.addEventListener('mapsuggestions', (e) => {
    if (!e.detail) return;
    const items = parseGeolocatorItems(e.detail.responses);
    if (items.length === 0) return;

    lastSuggestions = items;
    e.preventDefault();
    e.detail.setResults(items.map((r) => ({
      text:  label(r),
      value: r.name,          // triggers a search when clicked
      lat:   r.lat,
      lng:   r.lng,
      bbox:  r.bbox || undefined
    })));
  });

  function zoomTo(r) {
    if (r.bbox && r.bbox.length === 4) {
      const [w, s, ea, n] = r.bbox;
      viewer._map.fitBounds([[s, w], [n, ea]]);
    } else if (r.lat != null && r.lng != null) {
      viewer._map.setView([r.lat, r.lng], 14);
    }
  }

  // --- mapsearch: omit value so clicking a result navigates the map ---

  viewer.addEventListener('mapsearch', (e) => {
    if (!e.detail) return;
    const items = parseGeolocatorItems(e.detail.responses);
    if (items.length === 0) return;

    // If the search was triggered by clicking a suggestion, zoom to that
    // suggestion (not the first search result).
    const term = e.detail.query || '';
    const clicked = lastSuggestions.find((s) => s.name === term);
    lastSuggestions = [];
    if (clicked) zoomTo(clicked);

    e.preventDefault();
    e.detail.setResults(items.map((r) => ({
      text: label(r),
      // no value → the control zooms to this item on click
      lat:  r.lat,
      lng:  r.lng,
      bbox: r.bbox || undefined
    })));
  });
});
