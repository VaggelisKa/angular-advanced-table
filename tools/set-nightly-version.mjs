#!/usr/bin/env node
// Stamps a prerelease version onto a BUILT package manifest, for the nightly
// `@next` publish. Never touches source manifests, git, or the changelog.
//
// Why this exists instead of `nx release version`: this repo releases through
// Nx version plans (nx.json `release.versionPlans`). Running `nx release
// version` on every push to main would consume the pending plan files, write a
// release commit, and move the tag — leaving the deliberate stable release with
// nothing left to describe. A nightly is a publish, not a release, so it only
// rewrites `version` in dist/ right before `npm publish --tag next`.
//
// Scheme: <next-patch>-next.<utc-timestamp>.<short-sha>
//   e.g. 2.12.1 -> 2.12.2-next.20260811143210.45c37bc
//
// - The patch bump keeps the nightly sorting ABOVE the current stable.
// - `-next.…` makes it a semver prerelease, so it is excluded from consumer
//   `^`/`~` ranges by default — `npm i ng-advanced-table` can never resolve it.
// - The timestamp is a numeric semver identifier, so it compares numerically
//   and stays monotonic across same-day builds; the sha keeps it traceable.
//
// Usage: node tools/set-nightly-version.mjs [<distPackageRoot>] [--sha=<sha>]
//   e.g. node tools/set-nightly-version.mjs dist/libs/ng-advanced-table

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const shaArg = args.find((arg) => arg.startsWith('--sha='))?.slice('--sha='.length);
const root = args.find((arg) => !arg.startsWith('--')) ?? 'dist/libs/ng-advanced-table';

function resolveSha() {
  const sha = shaArg || process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
  const short = sha.trim().slice(0, 7);
  if (!/^[0-9a-f]{7}$/.test(short)) {
    console.error(`set-nightly-version: "${sha.trim()}" is not a commit sha`);
    process.exit(1);
  }
  return short;
}

/** UTC yyyymmddhhmmss — a numeric semver identifier, so it orders numerically. */
function timestamp() {
  return new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

const manifest = join(root, 'package.json');
if (!existsSync(manifest)) {
  console.error(`set-nightly-version: ${manifest} not found — run the build first`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
const base = /^(\d+)\.(\d+)\.(\d+)$/.exec(pkg.version);
if (!base) {
  console.error(
    `set-nightly-version: ${manifest} has version "${pkg.version}"; expected a plain x.y.z. ` +
      'A prerelease here means the manifest was already stamped.'
  );
  process.exit(1);
}

const [, major, minor, patch] = base;
const version = `${major}.${minor}.${Number(patch) + 1}-next.${timestamp()}.${resolveSha()}`;

pkg.version = version;
writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');
console.log(`set-nightly-version: ${manifest} -> ${version}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
}
