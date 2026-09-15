#!/usr/bin/env node
// copy-skills.js - Install or remove the bundled gcds-ext-map markup skills in the
// consumer's .github/skills/ folder so AI coding agents (e.g. GitHub Copilot in VS Code)
// can discover them. Run from a consumer project root:
//   npx gcds-ext-map-skills             # install
//   npx gcds-ext-map-skills --remove    # remove only the skills this package installed
const fs = require('fs');
const path = require('path');

// Agent Skills has no namespacing, so ownership is tracked via `metadata.package` in each SKILL.md.
const PACKAGE_TAG = '@gcds-extensions/map';

const pkgRoot = path.resolve(__dirname, '..');
// Prefer the published mirror; fall back to the source folder when run from a checkout.
const src = [path.join(pkgRoot, 'skills'), path.join(pkgRoot, '.github', 'skills')].find(
  (p) => fs.existsSync(p)
);

const dest = path.join(process.cwd(), '.github', 'skills');
const relDest = path.relative(process.cwd(), dest) || '.github/skills';
const remove = process.argv.slice(2).some((arg) => arg === '--remove' || arg === '--uninstall');

if (remove) {
  removeSkills();
} else {
  installSkills();
}

function installSkills() {
  if (!src) {
    console.error('[gcds-ext-map-skills] Could not find a bundled skills folder in the package.');
    process.exit(1);
  }

  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });

  console.log(`[gcds-ext-map-skills] Copied markup skills into ${relDest}/`);
  console.log('[gcds-ext-map-skills] Restart your editor so the agent can discover the new skills.');
  console.log('[gcds-ext-map-skills] To remove them later, run: npx gcds-ext-map-skills --remove');
}

function removeSkills() {
  if (!fs.existsSync(dest)) {
    console.log(`[gcds-ext-map-skills] Nothing to remove: ${relDest}/ does not exist.`);
    return;
  }

  const owned = fs
    .readdirSync(dest, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => isOwnedByThisPackage(path.join(dest, name)));

  if (owned.length === 0) {
    console.log(`[gcds-ext-map-skills] No ${PACKAGE_TAG} skills found in ${relDest}/`);
    return;
  }

  for (const name of owned) {
    fs.rmSync(path.join(dest, name), { recursive: true, force: true });
  }

  console.log(
    `[gcds-ext-map-skills] Removed ${owned.length} skill folder(s) from ${relDest}/: ${owned.join(', ')}`
  );
  console.log('[gcds-ext-map-skills] Restart your editor so the agent stops offering them.');
}

function isOwnedByThisPackage(dir) {
  const skillFile = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return false;

  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(skillFile, 'utf8'));
  if (!frontmatter) return false;

  const tag = PACKAGE_TAG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s+package:\\s*["']?${tag}["']?\\s*$`, 'm').test(frontmatter[1]);
}
