#!/usr/bin/env bash
#
# deploy-gh-pages.sh
#
# Builds gcds-ext-map (Stencil + Storybook) and gcds-docs (Eleventy), then
# assembles the artifacts into the gh-pages branch's docs/ folder.
#
# Prerequisites:
#   - Run from the gcds-ext-map repo root, on the main branch
#   - ../gcds-docs sibling repo must exist
#   - npm dependencies installed in both repos
#
# Usage:
#   npm run deploy          # or: bash scripts/deploy-gh-pages.sh
#   npm run deploy -- --skip-build   # skip builds, assemble only (uses existing artifacts)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GCDS_DOCS_DIR="$(cd "$REPO_ROOT/../gcds-docs" 2>/dev/null && pwd || echo "")"
WORKTREE_DIR="/tmp/gcds-ext-map-gh-pages"
STORYBOOK_TMP="/tmp/gcds-ext-map-storybook-build"
SKIP_BUILD=false

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()  { echo "==> $*"; }
error() { echo "ERROR: $*" >&2; exit 1; }

cleanup() {
  info "Cleaning up..."
  if [ -d "$WORKTREE_DIR" ]; then
    git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_DIR" 2>/dev/null || true
  fi
  rm -rf "$STORYBOOK_TMP"
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
info "Running preflight checks..."

cd "$REPO_ROOT"

CURRENT_BRANCH="$(git branch --show-current)"
if [ "$CURRENT_BRANCH" != "main" ]; then
  error "Must be on the 'main' branch (currently on '$CURRENT_BRANCH')"
fi

if [ -z "$GCDS_DOCS_DIR" ] || [ ! -d "$GCDS_DOCS_DIR" ]; then
  error "Sibling repo ../gcds-docs not found. Expected at: $REPO_ROOT/../gcds-docs"
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  error "Working tree is not clean. Commit or stash changes first."
fi

# Verify gh-pages branch exists locally
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
  info "Local gh-pages branch not found. Creating from upstream/gh-pages..."
  git fetch upstream gh-pages
  git branch gh-pages upstream/gh-pages
fi

info "Preflight checks passed."
info "  gcds-ext-map:  $REPO_ROOT (branch: main)"
info "  gcds-docs: $GCDS_DOCS_DIR"

# ---------------------------------------------------------------------------
# Phase 1: Build gcds-ext-map (Stencil + Storybook)
# ---------------------------------------------------------------------------
if [ "$SKIP_BUILD" = false ]; then
  info "Building gcds-ext-map (npm run build)..."
  cd "$REPO_ROOT"
  npm run build

  info "Building Storybook (npm run build-storybook)..."
  npm run build-storybook
else
  info "Skipping builds (--skip-build)"
fi

# Save storybook output to temp dir (./docs will be replaced by gcds-docs content)
info "Saving Storybook build to temp dir..."
rm -rf "$STORYBOOK_TMP"
cp -a "$REPO_ROOT/docs" "$STORYBOOK_TMP"

# ---------------------------------------------------------------------------
# Phase 2: Build gcds-docs with PATH_PREFIX
# ---------------------------------------------------------------------------
if [ "$SKIP_BUILD" = false ]; then
  info "Building gcds-docs (PATH_PREFIX=/gcds-ext-map)..."
  cd "$GCDS_DOCS_DIR"

  # Force gcds-docs to use the just-built gcds-ext-map dist from the local repo,
  # not a stale cached version from GitHub. Remove old copy and reinstall.
  info "Updating gcds-ext-map in gcds-docs to match local build..."
  rm -rf node_modules/@gcds-extensions/gcds-ext-map
  npm install
  # Overwrite the npm-installed gcds-ext-map dist with our local build
  rm -rf node_modules/@gcds-extensions/gcds-ext-map/dist
  cp -a "$REPO_ROOT/dist" node_modules/@gcds-extensions/gcds-ext-map/dist

  PATH_PREFIX=/gcds-ext-map npm run build
fi

cd "$REPO_ROOT"

# Verify gcds-docs build output exists
if [ ! -d "$GCDS_DOCS_DIR/_site" ]; then
  error "gcds-docs build output not found at $GCDS_DOCS_DIR/_site"
fi

# ---------------------------------------------------------------------------
# Phase 3: Set up gh-pages worktree
# ---------------------------------------------------------------------------
info "Setting up gh-pages worktree at $WORKTREE_DIR..."

# Clean up any stale worktree
if [ -d "$WORKTREE_DIR" ]; then
  git worktree remove --force "$WORKTREE_DIR" 2>/dev/null || true
fi

git worktree add "$WORKTREE_DIR" gh-pages

# ---------------------------------------------------------------------------
# Phase 4: Assemble docs/ in the worktree
# ---------------------------------------------------------------------------
info "Assembling docs/ folder..."

# Remove old docs content (but not the folder itself)
rm -rf "$WORKTREE_DIR/docs"
mkdir -p "$WORKTREE_DIR/docs"

# Copy gcds-docs _site/ output → docs/
cp -a "$GCDS_DOCS_DIR/_site/." "$WORKTREE_DIR/docs/"

# Copy storybook build → docs/storybook/ (overwrites whatever gcds-docs put there)
rm -rf "$WORKTREE_DIR/docs/storybook"
cp -a "$STORYBOOK_TMP" "$WORKTREE_DIR/docs/storybook"

info "docs/ folder assembled."

# ---------------------------------------------------------------------------
# Phase 5: Commit (amend to keep gh-pages as single commit)
# ---------------------------------------------------------------------------
info "Committing to gh-pages (amend)..."

cd "$WORKTREE_DIR"
git add docs/

# Check if there are changes to commit
if git diff --cached --quiet; then
  info "No changes detected — docs/ is already up to date."
else
  MAIN_SHA="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
  git commit --amend -m "Deploy docs from main ($MAIN_SHA)"
  info "Committed. Main branch SHA: $MAIN_SHA"
fi

cd "$REPO_ROOT"

# ---------------------------------------------------------------------------
# Phase 6: Show summary and prompt for push
# ---------------------------------------------------------------------------
echo ""
echo "============================================================"
echo " gh-pages branch updated in worktree: $WORKTREE_DIR"
echo "============================================================"
echo ""
echo " To review:  ls $WORKTREE_DIR/docs/"
echo " To serve:   npx http-server $WORKTREE_DIR -p 8080"
echo "             then open http://localhost:8080/docs/en/"
echo ""
echo " To deploy:  git push --force upstream gh-pages"
echo ""
echo "============================================================"
echo ""

read -r -p "Push to upstream gh-pages now? [y/N] " REPLY
if [[ "$REPLY" =~ ^[Yy]$ ]]; then
  git push --force upstream gh-pages
  info "Pushed to upstream gh-pages."
else
  info "Skipped push. You can push later with: git push --force upstream gh-pages"
fi
