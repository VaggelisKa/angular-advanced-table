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
// Scheme: <next-stable>-next.<commits-since-last-release-tag>
//   at v2.12.1 + 7 commits, with only patch plans pending -> 2.12.2-next.7
//   the same commit, with a pending minor plan            -> 2.13.0-next.7
//
// - The base is the version the pending `.nx/version-plans/` entries are
//   already asking for: the highest bump any of them requests. A nightly is a
//   preview of the next stable release, so it should preview that release's
//   number too — `2.12.2-next.7` for a tree that will ship as 2.13.0 both
//   understates the change and sorts below every 2.13.0 prerelease.
// - Any bump keeps the nightly sorting ABOVE the current stable.
// - `-next.…` makes it a semver prerelease, so it is excluded from consumer
//   `^`/`~` ranges by default — `npm i ng-advanced-table` can never resolve it.
// - The counter is derived from git history rather than stored anywhere, which
//   only works because main is linear (squash merges): `rev-list --count` is
//   then strictly increasing, so versions never collide or go backwards. It
//   resets to 1 on each stable tag, reading as "commits into the next cycle".
//   Raising the bump mid-cycle (a minor plan lands on top of patch ones) also
//   moves the base up, so the sequence keeps climbing. Only deleting or
//   lowering a pending plan can move the base back down; the counter still
//   rises, so versions stay unique, but `@next` would point at a lower number
//   than the previous nightly until the next plan lands.
//
// The version deliberately carries no sha. To trace a nightly back to a commit,
// use its npm provenance attestation, which links the tarball to the exact
// workflow run and source commit.
//
// Usage: node tools/set-nightly-version.mjs [<distPackageRoot>]
//   e.g. node tools/set-nightly-version.mjs dist/libs/ng-advanced-table

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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

const BUMPS = ['patch', 'minor', 'major'];

// Nx accepts the full semver release-type set in a plan. The prerelease
// variants describe how the stable release is CUT, not how big the change is,
// so they collapse onto the bump they are a prerelease of.
const BUMP_ALIASES = { premajor: 'major', preminor: 'minor', prepatch: 'patch', prerelease: 'patch' };

/**
 * Highest bump the pending version plans request for `packageName`, or `patch`
 * when nothing is pending — the release that has been described but not cut.
 *
 * Plans are keyed by package (or by release group, or `__default__`, which the
 * repo avoids but Nx still honours); anything keyed to something else belongs
 * to a project this manifest is not, so it is skipped rather than counted.
 */
function pendingBump(packageName) {
  const dir = '.nx/version-plans';
  if (!existsSync(dir)) return 'patch';

  let bump = 'patch';

  for (const file of readdirSync(dir).filter((entry) => entry.endsWith('.md'))) {
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(join(dir, file), 'utf8'))?.[1];
    if (!frontmatter) continue;

    for (const line of frontmatter.split('\n')) {
      const entry = /^\s*['"]?([^'":\s]+)['"]?\s*:\s*['"]?([A-Za-z]+)['"]?\s*$/.exec(line);
      if (!entry) continue;

      const [, key, rawLevel] = entry;
      if (key !== packageName && key !== '__default__') continue;

      const level = BUMP_ALIASES[rawLevel.toLowerCase()] ?? rawLevel.toLowerCase();
      if (!BUMPS.includes(level)) {
        // Not fatal: `nx release plan:check` owns plan validity, and a nightly
        // is not the place to block a publish over one unreadable entry.
        console.warn(`set-nightly-version: warning — ${file} requests unknown bump "${rawLevel}"; ignoring it`);
        continue;
      }

      if (BUMPS.indexOf(level) > BUMPS.indexOf(bump)) bump = level;
    }
  }

  return bump;
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

const [, major, minor, patch] = base.map(Number);
const bump = pendingBump(pkg.name);
const nextStable =
  bump === 'major' ? `${major + 1}.0.0` : bump === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
const version = `${nextStable}-next.${count}`;

pkg.version = version;
writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');
console.log(`set-nightly-version: ${manifest} -> ${version} (${count} commit(s) since ${tag}, pending bump: ${bump})`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
}
