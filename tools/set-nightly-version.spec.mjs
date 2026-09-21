// Drives tools/set-nightly-version.mjs against throwaway git repositories, so
// the counter's transitions — a plan raising the base, a plan being deleted or
// restored, a registry that has moved past history — are exercised without
// waiting for a real release cycle to reach that state.
//
// Each case builds its own history and stubs `npm` on PATH, so nothing here
// touches the real repository, the registry, or the network.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const stamper = fileURLToPath(new URL('./set-nightly-version.mjs', import.meta.url));
const PACKAGE_NAME = 'ng-advanced-table';
const DIST = 'dist/package';

const created = [];

afterEach(() => {
  while (created.length) rmSync(created.pop(), { recursive: true, force: true });
});

/**
 * A repository with one tagged stable release, ready to take commits. `plans`
 * is always the COMPLETE set for that commit, so omitting one deletes it —
 * which is how the "pending plan withdrawn" cases are written.
 */
function createRepository(stable = '1.0.0') {
  const dir = mkdtempSync(join(tmpdir(), 'set-nightly-version-'));
  created.push(dir);

  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`);
    return result.stdout.trim();
  };

  mkdirSync(join(dir, 'bin'));
  mkdirSync(join(dir, DIST), { recursive: true });
  git('init', '--quiet', '--initial-branch=main');
  git('config', 'user.email', 'spec@example.com');
  git('config', 'user.name', 'Spec');

  const repository = {
    dir,
    commit(message, plans) {
      rmSync(join(dir, '.nx/version-plans'), { recursive: true, force: true });
      mkdirSync(join(dir, '.nx/version-plans'), { recursive: true });

      for (const [slug, bump] of Object.entries(plans ?? {})) {
        const [key, level] = Array.isArray(bump) ? bump : [PACKAGE_NAME, bump];
        writeFileSync(join(dir, `.nx/version-plans/${slug}.md`), `---\n${key}: ${level}\n---\n\n${message}\n`);
      }

      writeFileSync(join(dir, `${message.replace(/\W/g, '-')}.txt`), message);
      git('add', '--all');
      git('commit', '--quiet', '--message', message);

      return repository;
    },
    tag(name) {
      git('tag', name);
      return repository;
    },
    /** Runs the stamper with `published` as the registry's view of the package. */
    stamp({ published = [], registryReadable = true } = {}) {
      writeFileSync(join(dir, DIST, 'package.json'), `${JSON.stringify({ name: PACKAGE_NAME, version: stable }, null, 2)}\n`);

      const npm = join(dir, 'bin/npm');
      writeFileSync(npm, registryReadable ? `#!/bin/sh\necho '${JSON.stringify(published)}'\n` : '#!/bin/sh\nexit 1\n');
      chmodSync(npm, 0o755);

      const result = spawnSync('node', [stamper, DIST], {
        cwd: dir,
        encoding: 'utf8',
        env: { ...process.env, PATH: `${join(dir, 'bin')}:${process.env['PATH']}` }
      });

      return {
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        version: result.status === 0 ? JSON.parse(readFileSync(join(dir, DIST, 'package.json'), 'utf8')).version : null
      };
    }
  };

  return repository.commit('initial').tag(`v${stable}`);
}

describe('FEATURE: Nightly version stamping', () => {
  describe('GIVEN: a cycle with nothing pending', () => {
    describe('WHEN: stamping successive commits', () => {
      it('THEN: it previews the next patch and counts from the release tag', () => {
        const repository = createRepository();

        repository.commit('first');
        assert.equal(repository.stamp().version, '1.0.1-next.1');

        repository.commit('second');
        assert.equal(repository.stamp().version, '1.0.1-next.2');
      });
    });
  });

  describe('GIVEN: a minor plan lands part-way through a patch cycle', () => {
    describe('WHEN: stamping that commit and the one after it', () => {
      it('THEN: it moves the base up and restarts the counter at 1', () => {
        const repository = createRepository();

        repository.commit('first', { fix: 'patch' });
        repository.commit('second', { fix: 'patch' });
        assert.equal(repository.stamp().version, '1.0.1-next.2');

        repository.commit('third', { fix: 'patch', feature: 'minor' });
        assert.equal(repository.stamp().version, '1.1.0-next.1');

        repository.commit('fourth', { fix: 'patch', feature: 'minor' });
        assert.equal(repository.stamp().version, '1.1.0-next.2');
      });
    });
  });

  describe('GIVEN: the pending minor plan is withdrawn later in the cycle', () => {
    describe('WHEN: stamping the commit that dropped it', () => {
      it('THEN: it returns to the patch base above every nightly already cut on it', () => {
        const repository = createRepository();

        repository.commit('first', { fix: 'patch' });
        assert.equal(repository.stamp().version, '1.0.1-next.1');

        repository.commit('second', { fix: 'patch', feature: 'minor' });
        assert.equal(repository.stamp().version, '1.1.0-next.1');

        repository.commit('third', { fix: 'patch' });
        assert.equal(repository.stamp().version, '1.0.1-next.3');
      });
    });
  });

  describe('GIVEN: a withdrawn minor plan is restored', () => {
    describe('WHEN: stamping the commit that restored it', () => {
      it('THEN: it resumes that base from where the base was first requested', () => {
        const repository = createRepository();

        repository.commit('first', { feature: 'minor' });
        repository.commit('second');
        repository.commit('third', { feature: 'minor' });

        assert.equal(repository.stamp().version, '1.1.0-next.3');
      });
    });
  });

  describe('GIVEN: the registry holds a higher counter than history derives', () => {
    describe('WHEN: stamping', () => {
      it('THEN: it counts on from the published one instead of reusing a version', () => {
        const repository = createRepository();

        repository.commit('first', { feature: 'minor' });

        const stamped = repository.stamp({ published: ['1.0.0', '1.1.0-next.4'] });

        assert.equal(stamped.version, '1.1.0-next.5');
        assert.match(stamped.stderr, /below the published 1\.1\.0-next\.4/);
      });
    });
  });

  describe('GIVEN: the version history derives is exactly the published one — a CI rerun', () => {
    describe('WHEN: stamping the same commit again', () => {
      it('THEN: it reproduces that version, so the publish can be skipped as a duplicate', () => {
        const repository = createRepository();

        repository.commit('first');

        assert.equal(repository.stamp({ published: ['1.0.0', '1.0.1-next.1'] }).version, '1.0.1-next.1');
      });
    });
  });

  describe('GIVEN: the registry cannot be read', () => {
    describe('WHEN: stamping', () => {
      it('THEN: it warns and keeps the counter history derived rather than failing the nightly', () => {
        const repository = createRepository();

        repository.commit('first');

        const stamped = repository.stamp({ registryReadable: false });

        assert.equal(stamped.version, '1.0.1-next.1');
        assert.match(stamped.stderr, /could not read published versions/);
      });
    });
  });

  describe('GIVEN: plans Nx accepts but this package does not own', () => {
    describe('WHEN: stamping a commit carrying them', () => {
      it('THEN: it collapses prerelease bumps and ignores other packages', () => {
        const repository = createRepository();

        repository.commit('first', { preview: 'preminor', other: ['some-other-package', 'major'] });

        assert.equal(repository.stamp().version, '1.1.0-next.1');
      });
    });
  });

  describe('GIVEN: a plan requesting a bump level that is not a release type', () => {
    describe('WHEN: stamping', () => {
      it('THEN: it warns and treats the cycle as the patch it can still describe', () => {
        const repository = createRepository();

        repository.commit('first', { typo: 'moderate' });

        const stamped = repository.stamp();

        assert.equal(stamped.version, '1.0.1-next.1');
        assert.match(stamped.stderr, /unknown bump "moderate"/);
      });
    });
  });

  describe('GIVEN: HEAD is the stable release commit itself', () => {
    describe('WHEN: stamping', () => {
      it('THEN: it fails rather than publishing a nightly identical to the release', () => {
        const stamped = createRepository().stamp();

        assert.equal(stamped.status, 1);
        assert.match(stamped.stderr, /nothing newer than the stable release/);
      });
    });
  });

  describe('GIVEN: a manifest that was already stamped', () => {
    describe('WHEN: stamping it a second time', () => {
      it('THEN: it fails instead of compounding prerelease suffixes', () => {
        const repository = createRepository();

        repository.commit('first');
        repository.stamp();

        const result = spawnSync('node', [stamper, DIST], { cwd: repository.dir, encoding: 'utf8' });

        assert.equal(result.status, 1);
        assert.match(result.stderr, /expected a plain x\.y\.z/);
      });
    });
  });
});
