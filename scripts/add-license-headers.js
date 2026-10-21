#!/usr/bin/env node
/**
 * Prepends provenance headers to source files derived from MapML.js, as
 * required by the W3C Software and Document License (see NOTICE).
 *
 * Idempotent: files that already carry the header are left untouched.
 * Run after importing new material from MapML.js.
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
