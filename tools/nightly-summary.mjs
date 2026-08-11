#!/usr/bin/env node
// Writes the GitHub Actions job summary for a nightly publish.
//
// Nightlies deliberately have no changelog of their own — one snapshot is one
// commit, and its prose already exists as a pending Nx version plan that will
// be rendered into CHANGELOG.md when a stable release is cut. So instead of
// generating one, this surfaces what is already there: the commit, a compare
// link against the last stable tag, and the pending plan entries, which are
// exactly "what is in @next that is not in latest".
//
// Usage: node tools/nightly-summary.mjs --version=<version> [--sha=<sha>]
//   Writes to $GITHUB_STEP_SUMMARY, or stdout when that is unset (local runs).

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const arg = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

const version = arg('version');
if (!version) {
  console.error('usage: nightly-summary.mjs --version=<version> [--sha=<sha>]');
  process.exit(1);
}

function git(...gitArgs) {
  return execFileSync('git', gitArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

const sha = arg('sha') || process.env.GITHUB_SHA || git('rev-parse', 'HEAD');
const server = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
const repo = process.env.GITHUB_REPOSITORY ?? 'VaggelisKa/angular-advanced-table';

let tag = '';
try {
  tag = git('describe', '--tags', '--abbrev=0', '--match', 'v*');
} catch {
  // No tag is not worth failing the summary over — the publish already succeeded.
}

/**
 * First prose line of each pending version plan: the sentence a PR author wrote
 * to describe the change, and the same text Nx renders into the changelog.
 */
function pendingPlans() {
  const dir = '.nx/version-plans';
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const body = readFileSync(join(dir, file), 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
      const headline = body.split('\n').find((line) => line.trim().length > 0);
      return { file, headline: headline?.trim() ?? '(no description)' };
    });
}

const lines = [
  '### Nightly published',
  '',
  '```bash',
  `npm i ng-advanced-table@${version}`,
  '# or track the tag: npm i ng-advanced-table@next',
  '```',
  ''
];

const commitLink = `[\`${sha.slice(0, 7)}\`](${server}/${repo}/commit/${sha})`;
lines.push(
  tag ? `Built from ${commitLink} — [compare with ${tag}](${server}/${repo}/compare/${tag}...${sha})` : `Built from ${commitLink}`
);
lines.push('');

const plans = pendingPlans();
lines.push('#### Queued for the next stable release', '');

if (plans.length === 0) {
  lines.push('_No pending version plans._');
} else {
  lines.push(...plans.map((plan) => `- ${plan.headline}`));
  lines.push('', `<sub>From ${plans.length} pending \`.nx/version-plans/\` entr${plans.length === 1 ? 'y' : 'ies'}.</sub>`);
}

const summary = lines.join('\n') + '\n';

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
} else {
  process.stdout.write(summary);
}
