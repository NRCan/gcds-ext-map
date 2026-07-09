#!/usr/bin/env bash
#
# deploy-to-docs.sh
#
# Builds gcds-ext-map and deploys the dist/ artifacts into the sibling gcds-docs
# project so that gcds-docs' Eleventy build picks up the latest local code.
#
# This is for LOCAL DEVELOPMENT — it replaces the npm-installed gcds-ext-map
# dist/ in gcds-docs/node_modules with a freshly-built copy from this repo.
#
# Usage:
#   bash scripts/deploy-to-docs.sh           # build + deploy
#   bash scripts/deploy-to-docs.sh --no-build  # deploy existing dist/ only
#   bash scripts/deploy-to-docs.sh --build-docs # also run gcds-docs build
#   bash scripts/deploy-to-docs.sh --check     # only check Stencil alignment
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GCDS_DOCS_DIR="$(cd "$REPO_ROOT/../gcds-docs" 2>/dev/null && pwd || echo "")"

DO_BUILD=true
DO_BUILD_DOCS=false
CHECK_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --no-build)    DO_BUILD=false ;;
    --build-docs)  DO_BUILD_DOCS=true ;;
    --check)       CHECK_ONLY=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

info()  { echo "==> $*"; }
warn()  { echo "WARNING: $*" >&2; }
error() { echo "ERROR: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Check Stencil version alignment between gcds-ext-map and gcds-core
# ---------------------------------------------------------------------------
check_stencil_alignment() {
  info "Checking Stencil version alignment..."

  local map_stencil docs_stencil map_manifest docs_manifest
  local map_pkg="$REPO_ROOT/node_modules/@stencil/core/package.json"
  local docs_core_pkg="$GCDS_DOCS_DIR/node_modules/@gcds-core/components/package.json"

  if [ ! -f "$map_pkg" ]; then
    warn "gcds-ext-map: @stencil/core not installed. Run npm install."
    return 1
  fi

  # Installed Stencil version in gcds-ext-map
  map_stencil=$(node -p "require('$map_pkg').version")

  # Stencil version declared as dependency by @gcds-core/components
  if [ -f "$docs_core_pkg" ]; then
    docs_stencil=$(node -p "require('$docs_core_pkg').dependencies?.['@stencil/core'] || 'not found'")
    local docs_core_ver
    docs_core_ver=$(node -p "require('$docs_core_pkg').version")
    echo "  gcds-ext-map build Stencil:      $map_stencil"
    echo "  @gcds-core/components:       $docs_core_ver (wants Stencil $docs_stencil)"
  else
    warn "  @gcds-core/components not installed in gcds-docs."
    echo "  gcds-ext-map build Stencil:      $map_stencil"
  fi

  # Compare the built runtime chunks (the definitive check)
  local map_bootstrap="$REPO_ROOT/dist/gcds-ext-map/gcds-ext-map.esm.js"
  local docs_gcds_bootstrap
  docs_gcds_bootstrap=$(ls "$GCDS_DOCS_DIR"/node_modules/@gcds-core/components/dist/gcds/gcds.esm.js 2>/dev/null || echo "")

  if [ -f "$map_bootstrap" ] && [ -n "$docs_gcds_bootstrap" ]; then
    # Extract the Stencil runtime chunk filename from each bootstrap
    local map_runtime docs_runtime
    map_runtime=$(grep -oP 'from"\./p-[A-Za-z0-9_]+\.js"' "$map_bootstrap" | head -1 | tr -d '"' | sed 's/from//')
    docs_runtime=$(grep -oP 'from"\./p-[A-Za-z0-9_]+\.js"' "$docs_gcds_bootstrap" | head -1 | tr -d '"' | sed 's/from//')

    local map_runtime_size docs_runtime_size
    map_runtime_size=$(wc -c < "$REPO_ROOT/dist/gcds-ext-map/${map_runtime#./}" 2>/dev/null || echo "?")
    docs_runtime_size=$(wc -c < "$GCDS_DOCS_DIR/node_modules/@gcds-core/components/dist/gcds/${docs_runtime#./}" 2>/dev/null || echo "?")

    echo "  gcds-ext-map runtime chunk:      ${map_runtime#./} ($map_runtime_size bytes)"
    echo "  gcds-core runtime chunk:     ${docs_runtime#./} ($docs_runtime_size bytes)"

    if [ "$map_runtime_size" != "?" ] && [ "$docs_runtime_size" != "?" ]; then
      # Rough heuristic: if size differs by >10x, they embed different things
      # (gcds-ext-map bundles Leaflet into its runtime chunk, gcds-core doesn't)
      # The key concern is Stencil VERSION matching, not chunk content.
      # Check for major.minor match in the installed Stencil version vs what
      # gcds-core declares.
      local map_major_minor
      map_major_minor=$(echo "$map_stencil" | grep -oP '^\d+\.\d+')
      if echo "$docs_stencil" | grep -qP "$map_major_minor"; then
        echo "  ✓ Stencil versions are aligned ($map_major_minor.x)"
      else
        warn "  ✗ Stencil version MISMATCH — gcds-ext-map uses $map_stencil"
        warn "    @gcds-core/components declares $docs_stencil"
        warn "    This can cause 'Constructor not found' errors at runtime!"
        return 1
      fi
    fi
  fi
  return 0
}

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------
if [ -z "$GCDS_DOCS_DIR" ] || [ ! -d "$GCDS_DOCS_DIR" ]; then
  error "Sibling repo ../gcds-docs not found. Expected at: $REPO_ROOT/../gcds-docs"
fi

if [ "$CHECK_ONLY" = true ]; then
  check_stencil_alignment
  exit $?
fi

# ---------------------------------------------------------------------------
# Phase 1: Build gcds-ext-map
# ---------------------------------------------------------------------------
if [ "$DO_BUILD" = true ]; then
  info "Building gcds-ext-map..."
  cd "$REPO_ROOT"
  npm run build
  info "Build complete."
else
  info "Skipping gcds-ext-map build (--no-build)."
  if [ ! -d "$REPO_ROOT/dist/gcds-ext-map" ]; then
    error "No build artifacts found at dist/gcds-ext-map/. Run without --no-build."
  fi
fi

# ---------------------------------------------------------------------------
# Phase 2: Check Stencil alignment
# ---------------------------------------------------------------------------
check_stencil_alignment || warn "Proceeding despite Stencil mismatch."

# ---------------------------------------------------------------------------
# Phase 3: Deploy to gcds-docs
# ---------------------------------------------------------------------------
info "Deploying gcds-ext-map dist/ to gcds-docs..."

DEST="$GCDS_DOCS_DIR/node_modules/@gcds-extensions/gcds-ext-map/dist"
PKG_DIR="$(dirname "$DEST")"

# Ensure the package folder exists in gcds-docs/node_modules (fresh installs
# or post-rename runs may not yet have this scoped path populated by npm).
if [ ! -d "$PKG_DIR" ]; then
  info "Creating $PKG_DIR (package not yet installed in gcds-docs)."
  mkdir -p "$PKG_DIR"
fi

# Clean the target (removes stale chunks from prior builds)
if [ -d "$DEST" ]; then
  info "Removing old dist/ in gcds-docs/node_modules/@gcds-extensions/gcds-ext-map/..."
  rm -rf "$DEST"
fi

# Copy fresh build
cp -a "$REPO_ROOT/dist" "$DEST"

# Count files
FILE_COUNT=$(find "$DEST/gcds-ext-map" -name '*.js' | wc -l)
info "Deployed $FILE_COUNT JS files to gcds-docs."

# Also clean stale chunks from _site if it exists (prevents old chunk confusion)
SITE_DEST="$GCDS_DOCS_DIR/_site/components/gcds-ext-map/dist/gcds-ext-map"
if [ -d "$SITE_DEST" ]; then
  info "Cleaning stale _site/components/gcds-ext-map/dist/gcds-ext-map/..."
  rm -rf "$SITE_DEST"
  info "Stale _site artifacts removed. Run 'npm run build' in gcds-docs to regenerate."
fi

# ---------------------------------------------------------------------------
# Phase 4: Optionally build gcds-docs
# ---------------------------------------------------------------------------
if [ "$DO_BUILD_DOCS" = true ]; then
  info "Building gcds-docs..."
  cd "$GCDS_DOCS_DIR"
  npm run build
  info "gcds-docs build complete."
fi

echo ""
echo "============================================================"
echo " gcds-ext-map artifacts deployed to gcds-docs"
echo "============================================================"
echo ""
echo " Deployed:  $DEST/gcds-ext-map/"
echo ""
if [ "$DO_BUILD_DOCS" = false ]; then
  echo " Next step: cd $GCDS_DOCS_DIR && npm run build"
  echo "            (or: npm run start  for dev server)"
fi
echo ""
echo "============================================================"
