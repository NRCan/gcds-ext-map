#!/usr/bin/env node
// sync-skills.js - Mirror .github/skills into a publishable top-level skills/ folder.
// Run automatically on `prepack` so the published tarball ships the skills, while
// .github/skills remains the single editable source of truth.
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../.github/skills');
const dest = path.resolve(__dirname, '../skills');

if (!fs.existsSync(src)) {
  // .github/ is not part of the published tarball, so packing a copy of the package
  // is fine as long as the already-mirrored skills/ folder is there.
  if (fs.existsSync(dest)) {
    console.log('[sync-skills] no .github/skills to mirror; keeping the existing skills/ folder.');
    process.exit(0);
  }
  console.error(`[sync-skills] source not found: ${src}`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`[sync-skills] mirrored .github/skills -> ${path.relative(process.cwd(), dest)}`);
