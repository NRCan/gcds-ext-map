#!/usr/bin/env node
/**
 * Prepends provenance headers to source files derived from MapML.js, as
 * required by the W3C Software and Document License (see NOTICE), and
 * maintains the notice that travels with the web-map-doc derived skills.
 *
 * Idempotent: files that already carry the header are left untouched.
 * Run after importing new material from MapML.js or web-map-doc.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const MARKER = 'derived from MapML.js';

const MAPML_HEADER = `/*
 * This file includes material copied from or derived from MapML.js
 * <https://github.com/Maps4HTML/MapML.js>.
 * Copyright 2015-2024 Canada Centre for Mapping and Earth Observation,
 * Natural Resources Canada, and the MapML.js contributors.
 * Licensed under the W3C Software and Document License
 * <http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document>.
 * SPDX-License-Identifier: W3C-20150513
 *
 * Modified by Natural Resources Canada for @gcds-extensions/map.
 * See the NOTICE file in the root of this distribution for the full notice,
 * which must be retained in all copies and derivative works.
 */
`;

const GCDS_MARKER = 'derived from @gcds-core/components';

const GCDS_HEADER = `/*
 * This file is derived from @gcds-core/components
 * <https://github.com/cds-snc/gcds-components>.
 * Copyright (c) Government of Canada / Gouvernement du Canada.
 * SPDX-License-Identifier: MIT
 * See the NOTICE file in the root of this distribution.
 */
`;

// The markup skills are derived from web-map-doc and are copied out of this
// package into a consumer's .github/skills/ by `npx gcds-ext-map-skills`, where
// the root NOTICE file does not follow them. This sidecar travels with them
// instead: it lives in the skills folder, is mirrored into the published
// skills/ folder by sync-skills.js, and is installed and removed alongside the
// skills by bin/copy-skills.js.
const SKILLS_NOTICE_FILE = 'GCDS-EXT-MAP-SKILLS-NOTICE.md';

const SKILLS_NOTICE = `NOTICE -- MapML authoring skills from @gcds-extensions/map
==========================================================

The skill folders installed alongside this file are derived, in whole or in
part, from the MapML.js documentation, web-map-doc
<https://github.com/Maps4HTML/web-map-doc>, published at
<https://maps4html.org/web-map-doc/>. Most of the prose in each \`SKILL.md\` is
copied from the corresponding element reference page in that repository.

    Copyright 2021-2026 Canada Centre for Mapping and Earth Observation,
    Strategic Policy and Innovation Sector, Natural Resources Canada,
    and Malvoz <https://github.com/Malvoz>, together with the other
    contributors to the web-map-doc repository
    <https://github.com/Maps4HTML/web-map-doc/graphs/contributors>.

That material is licensed under the W3C Software and Document License
<http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document>.

SPDX-License-Identifier: W3C-20150513

Changes and modifications made by Natural Resources Canada in these skills
include, but are not limited to: restructuring the documentation into the
Agent Skills format, with YAML frontmatter and agent-directed usage
instructions; condensing, reordering and omitting parts of the original prose;
removing the documentation site's navigation, demonstration iframes and
cross-references; substituting \`<gcds-ext-map>\` for \`<mapml-viewer>\`
throughout; and adding guidance specific to \`@gcds-extensions/map\`.

The skill \`gcds-map-page-markup\` is original to \`@gcds-extensions/map\` and is
not derived from web-map-doc.

The W3C Software and Document License requires that this notice be retained,
in a location viewable to users, in all copies and derivative works of this
material, including modified copies. Keep this file alongside the skills.

The full notice for \`@gcds-extensions/map\`, covering the other works it
derives from and redistributes, is in the NOTICE file of that package
<https://www.npmjs.com/package/@gcds-extensions/map>.
`;

function writeSkillsNotice() {
  const skillsDir = path.join(root, '.github/skills');
  if (!fs.existsSync(skillsDir)) return false;

  const target = path.join(skillsDir, SKILLS_NOTICE_FILE);
  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === SKILLS_NOTICE) return false;

  fs.writeFileSync(target, SKILLS_NOTICE);
  return true;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'test' || entry.name === 'stories') continue;
      walk(full, out);
    } else if (/\.(ts|tsx|js)$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const mapmlDerived = [
  ...walk(path.join(root, 'src/components/utils/mapml')),
  path.join(root, 'src/global/mapml-globals.js'),
  ...fs
    .readdirSync(path.join(root, 'src/components'), { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'utils' && d.name !== 'test')
    .map(d => path.join(root, 'src/components', d.name, `${d.name}.tsx`))
    .filter(p => fs.existsSync(p)),
];

const gcdsDerived = [path.join(root, 'src/components/utils/utils.ts')];

function prepend(file, header, marker) {
  const original = fs.readFileSync(file, 'utf8');
  if (original.includes(marker)) return false;
  fs.writeFileSync(file, header + original);
  return true;
}

let changed = 0;
for (const file of mapmlDerived) {
  if (prepend(file, MAPML_HEADER, MARKER)) changed++;
}
for (const file of gcdsDerived) {
  if (fs.existsSync(file) && prepend(file, GCDS_HEADER, GCDS_MARKER)) changed++;
}

console.log(`license headers: ${changed} file(s) updated, ` + `${mapmlDerived.length + gcdsDerived.length - changed} already current`);

console.log(
  writeSkillsNotice()
    ? `skills notice: wrote .github/skills/${SKILLS_NOTICE_FILE}`
    : `skills notice: .github/skills/${SKILLS_NOTICE_FILE} already current`
);
