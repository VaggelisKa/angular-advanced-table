#!/usr/bin/env node
// Removes the `nx` key from built library manifests before they are packed/published.
//
// Why: the 4 libs carry their Nx project config in `package.json` under an `nx` key
// (Nx idiom). ng-packagr copies unknown top-level keys verbatim into the dist manifest
// (its strip-list does NOT include `nx` — see ng-packagr write-package.transform.js),
// so without this step the `nx` build config would ship inside the published npm tarball.
//
// Usage: node tools/strip-nx-manifest.mjs <distPackageRoot> [<distPackageRoot> ...]
//   e.g. node tools/strip-nx-manifest.mjs dist/libs/ng-advanced-table

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const roots = process.argv.slice(2);
if (roots.length === 0) {
  console.error('usage: strip-nx-manifest.mjs <distPackageRoot> [<distPackageRoot> ...]');
  process.exit(1);
}

for (const root of roots) {
  const manifest = join(root, 'package.json');
  if (!existsSync(manifest)) {
    console.error(`strip-nx: ${manifest} not found — run the build first`);
    process.exit(1);
  }
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  if ('nx' in pkg) {
    delete pkg.nx;
    writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`strip-nx: removed nx key from ${manifest}`);
  } else {
    console.log(`strip-nx: ${manifest} already clean`);
  }
}
