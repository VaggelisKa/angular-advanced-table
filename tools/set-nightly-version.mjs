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
// Scheme: <next-stable>-next.<commits-since-that-base-was-first-previewed>
//   at v2.12.1 + 7 commits, with only patch plans pending -> 2.12.2-next.7
//   the next commit, a minor plan landing with it         -> 2.13.0-next.1
//   the commit after that                                 -> 2.13.0-next.2
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
//   then strictly increasing, so versions never collide or go backwards.
// - It counts from the FIRST commit in this cycle that asked for the current
//   base, not from the tag, so it restarts at 1 when a landing plan raises the
//   base — 2.12.2-next.7 then 2.13.0-next.1 — reading as "nightlies into this
//   base" instead of carrying the old base's count onto a fresh number. A
//   stable tag consumes every plan, so the next cycle restarts from the tag.
// - "First commit that asked for it", rather than "first of the current run",
//   is what keeps versions unique: deleting or lowering a pending plan drops
//   the base back to one already published under, and resuming that base's
//   original count (2.12.2-next.11, not a second 2.12.2-next.1) is what stops
//   the nightly from colliding with a published tarball. Within one base the
//   count only ever rises.
// - Git alone cannot guarantee that across a change to this scheme, though:
//   history did not move, but the number it maps to did. So the count is also
//   floored just above the highest `-next.N` already published on the same
//   base. It normally does nothing — nothing is published above where git is
//   pointing — and it is skipped, with a warning, when the registry is
//   unreachable, since a nightly should not fail over a lookup.
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

const PLANS_DIR = '.nx/version-plans';

/**
 * Highest bump the given version plans request for `packageName`, or `patch`
 * when nothing is pending — the release that has been described but not cut.
 *
 * Plans are keyed by package (or by release group, or `__default__`, which the
 * repo avoids but Nx still honours); anything keyed to something else belongs
 * to a project this manifest is not, so it is skipped rather than counted.
 */
function highestBump(plans, packageName) {
  let bump = 'patch';

  for (const { file, text } of plans) {
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1];
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

/** Plans in the working tree — the bump this build is previewing. */
function workingTreePlans() {
  if (!existsSync(PLANS_DIR)) return [];

  return readdirSync(PLANS_DIR)
    .filter((entry) => entry.endsWith('.md'))
    .map((file) => ({ file, text: readFileSync(join(PLANS_DIR, file), 'utf8') }));
}

/** The same, as of `ref`. Commits with no plans directory yield none. */
function plansAt(ref) {
  let listing;
  try {
    listing = git('ls-tree', '-r', '--name-only', ref, '--', PLANS_DIR);
  } catch {
    return [];
  }

  return listing
    .split('\n')
    .filter((path) => path.endsWith('.md'))
    .map((path) => ({ file: `${ref}:${path}`, text: git('show', `${ref}:${path}`) }));
}

/**
 * Earliest commit since `tag` whose plans already requested `bump` — where the
 * current base was first previewed, and so where its counter starts.
 *
 * Only commits that touched the plans can change the answer, so the log is
 * filtered to those; everything between two of them inherits the earlier one's
 * bump. Falls back to `HEAD`: no commit asked for this base, so the working
 * tree holds uncommitted plan edits and HEAD is its first nightly.
 */
function firstCommitRequesting(bump, tag, packageName) {
  const commits = git('log', '--format=%H', '--reverse', `${tag}..HEAD`, '--', PLANS_DIR).split('\n').filter(Boolean);

  return commits.find((sha) => highestBump(plansAt(sha), packageName) === bump) ?? 'HEAD';
}

/**
 * Highest `N` already published as `<base>-next.N`, or 0 when none is. Guards
 * the one case git cannot see: a version that history no longer maps to, but
 * the registry has kept — republishing it fails the publish outright.
 */
function highestPublishedCounter(packageName, base) {
  let versions;
  try {
    // stderr ignored: npm's config warnings would otherwise land in the log
    // between the two lines that explain what this script decided.
    const stdio = ['ignore', 'pipe', 'ignore'];
    versions = JSON.parse(execFileSync('npm', ['view', packageName, 'versions', '--json'], { encoding: 'utf8', stdio }));
  } catch {
    console.warn(`set-nightly-version: warning — could not read published versions of ${packageName}; not checking for reuse`);
    return 0;
  }

  const counter = new RegExp(`^${base.replace(/\./g, '\\.')}-next\\.(\\d+)$`);

  return [versions].flat().reduce((highest, version) => Math.max(highest, Number(counter.exec(version)?.[1] ?? 0)), 0);
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
const commitsSinceTag = Number(git('rev-list', '--count', `${tag}..HEAD`));

if (commitsSinceTag === 0) {
  console.error(`set-nightly-version: HEAD is ${tag} itself — there is nothing newer than the stable release to publish.`);
  process.exit(1);
}

// Not fatal: a hand-edited manifest or a missing tag push should not block the
// channel, but it does mean the counter is measuring from an unexpected base.
if (tag !== `v${pkg.version}`) {
  console.warn(`set-nightly-version: warning — manifest is ${pkg.version} but the latest tag is ${tag}`);
}

const [, major, minor, patch] = base.map(Number);
const bump = highestBump(workingTreePlans(), pkg.name);
const nextStable =
  bump === 'major' ? `${major + 1}.0.0` : bump === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;

// Where this base's counter starts. When the tag's own plans already asked for
// the same bump — the usual case, nothing pending on either side — the base has
// applied for the whole cycle and the start is the tag itself.
const baseSince = highestBump(plansAt(tag), pkg.name) === bump ? tag : firstCommitRequesting(bump, tag, pkg.name);
const commitCount = baseSince === tag ? commitsSinceTag : Number(git('rev-list', '--count', `${baseSince}..HEAD`)) + 1;

// Strictly below, not "at or below": re-running a CI run re-stamps the same
// commit, and landing back on the version that run already published is what
// lets the workflow recognise the rerun and skip the publish. Only a count the
// registry has moved PAST needs correcting.
const published = highestPublishedCounter(pkg.name, nextStable);
if (published > commitCount) {
  console.warn(
    `set-nightly-version: warning — ${nextStable}-next.${commitCount} is below the published ` +
      `${nextStable}-next.${published}; counting on from there instead`
  );
}

const count = published > commitCount ? published + 1 : commitCount;
const version = `${nextStable}-next.${count}`;

pkg.version = version;
writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');
console.log(
  `set-nightly-version: ${manifest} -> ${version} ` +
    `(${commitCount} commit(s) on base ${nextStable}, ${commitsSinceTag} since ${tag}, pending bump: ${bump})`
);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
}
