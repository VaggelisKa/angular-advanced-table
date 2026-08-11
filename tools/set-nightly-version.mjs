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
// Scheme: <next-patch>-next.<commits-since-last-release-tag>
//   e.g. at v2.12.1 + 7 commits -> 2.12.2-next.7
//
// - The patch bump keeps the nightly sorting ABOVE the current stable.
// - `-next.…` makes it a semver prerelease, so it is excluded from consumer
//   `^`/`~` ranges by default — `npm i ng-advanced-table` can never resolve it.
// - The counter is derived from git history rather than stored anywhere, which
//   only works because main is linear (squash merges): `rev-list --count` is
//   then strictly increasing, so versions never collide or go backwards. It
//   resets to 1 on each stable tag, reading as "commits into the 2.12.2 cycle".
//
// The version deliberately carries no sha. To trace a nightly back to a commit,
// use its npm provenance attestation, which links the tarball to the exact
// workflow run and source commit.
//
// Usage: node tools/set-nightly-version.mjs [<distPackageRoot>]
//   e.g. node tools/set-nightly-version.mjs dist/libs/ng-advanced-table

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'dist/libs/ng-advanced-table';

function git(...args) {
  // stderr ignored: `describe` failing is an expected, handled path below, and
  // its own "fatal:" line would land above the message that explains the fix.
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

/**
 * Most recent release tag reachable from HEAD. Fails loudly rather than falling
 * back: without a tag `rev-list --count` silently counts from the root commit,
 * which would publish something like `-next.1400`.
 */
function lastReleaseTag() {
  try {
    return git('describe', '--tags', '--abbrev=0', '--match', 'v*');
  } catch {
    console.error(
      'set-nightly-version: no v* tag reachable from HEAD. ' +
        'Check out with full history and tags (actions/checkout fetch-depth: 0).'
    );
    process.exit(1);
  }
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

const tag = lastReleaseTag();
const count = Number(git('rev-list', '--count', `${tag}..HEAD`));

if (count === 0) {
  console.error(`set-nightly-version: HEAD is ${tag} itself — there is nothing newer than the stable release to publish.`);
  process.exit(1);
}

// Not fatal: a hand-edited manifest or a missing tag push should not block the
// channel, but it does mean the counter is measuring from an unexpected base.
if (tag !== `v${pkg.version}`) {
  console.warn(`set-nightly-version: warning — manifest is ${pkg.version} but the latest tag is ${tag}`);
}

const [, major, minor, patch] = base;
const version = `${major}.${minor}.${Number(patch) + 1}-next.${count}`;

pkg.version = version;
writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');
console.log(`set-nightly-version: ${manifest} -> ${version} (${count} commit(s) since ${tag})`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
}
