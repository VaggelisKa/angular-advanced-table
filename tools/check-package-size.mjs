#!/usr/bin/env node
// Guards the published package against two silent regressions that only show up
// in the built artifact:
//
//   1. Size. Each entry point's FESM bundle has a gzipped ceiling in
//      tools/package-size-budget.json.
//   2. Entry-point layering. AGENTS.md requires cross-entry imports to use the
//      package specifier so each layer stays separately tree-shakeable. A deep
//      relative import across an entry-point boundary silently inlines the code
//      instead — which lint catches in source, but this catches in the artifact
//      that actually ships.
//
// Usage: node tools/check-package-size.mjs [distDir]

import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(process.cwd(), process.argv[2] ?? 'dist/libs/ng-advanced-table');
const budget = JSON.parse(readFileSync(join(toolsDir, 'package-size-budget.json'), 'utf8'));

/** Static `from '<specifier>'` / `import '<specifier>'` targets in a FESM bundle. */
function importedSpecifiers(source) {
  const specifiers = new Set();

  for (const match of source.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
    specifiers.add(match[1]);
  }

  return specifiers;
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
const failures = [];
const rows = [];

for (const entry of budget.entryPoints) {
  const bundlePath = join(distDir, entry.fesm);
  let source;

  try {
    source = readFileSync(bundlePath);
  } catch {
    failures.push(`${entry.name}: missing bundle at ${entry.fesm} — was the package built?`);
    continue;
  }

  const gzipBytes = gzipSync(source).byteLength;
  const headroom = entry.maxGzipBytes - gzipBytes;
  const overBudget = gzipBytes > entry.maxGzipBytes;

  rows.push({
    name: entry.name,
    raw: kb(source.byteLength),
    gzip: kb(gzipBytes),
    budget: kb(entry.maxGzipBytes),
    headroom: `${headroom < 0 ? '' : '+'}${kb(headroom)}`,
    status: overBudget ? 'OVER' : 'ok'
  });

  if (overBudget) {
    failures.push(`${entry.name}: gzipped ${kb(gzipBytes)} exceeds budget ${kb(entry.maxGzipBytes)} by ${kb(-headroom)}.`);
  }

  const specifiers = importedSpecifiers(source.toString('utf8'));

  for (const forbidden of entry.forbiddenImports) {
    if (specifiers.has(forbidden)) {
      failures.push(`${entry.name}: imports '${forbidden}', which the entry-point graph forbids.`);
    }
  }
}

console.table(rows);

if (failures.length > 0) {
  console.error('\nPackage size / layering check failed:\n');

  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }

  console.error(
    '\nA large jump in a companion bundle usually means a deep relative import across an\n' +
      'entry-point boundary inlined code that should have stayed a package import.\n' +
      'If the growth is legitimate, raise the ceiling in tools/package-size-budget.json\n' +
      'and say why in the PR body.\n'
  );
  process.exit(1);
}

console.log('\nAll entry points within size budget, and entry-point layering holds.\n');
