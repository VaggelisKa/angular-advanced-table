---
ng-advanced-table: patch
---

Add code coverage instrumentation and enforced thresholds to every `test` target.

The workspace had no coverage provider installed at all, so `--coverage` hard-failed and coverage could regress silently. `@vitest/coverage-v8` now sits in the `shared-dev` catalog, version-aligned with `vitest`.

Coverage is always on for `test` (no CLI flag, no CI workflow change) and thresholds fail the target when breached. Each entry point scopes `coverageInclude` to its own root, which matters because all four entry points share one `tsconfig.spec.json` and companion specs load core at runtime — unscoped, the `components` report was polluted by core files and understated itself by roughly 12 points (79.2% → 91.0% statements once scoped). `coverageExclude` drops specs, `test-helpers/`, type-only `*.type.ts`, and barrels.

Thresholds are set at the measured baseline, floored to whole numbers:

| Project        | statements | branches | functions | lines |
| -------------- | ---------- | -------- | --------- | ----- |
| core           | 91         | 85       | 92        | 91    |
| components     | 90         | 75       | 93        | 91    |
| locale         | 80         | 73       | 85        | 79    |
| render-metrics | 85         | 65       | 86        | 84    |
| showcase       | 68         | 66       | 65        | 68    |

Showcase thresholds carry extra slack because it is an unpublished demo app that gains example components continuously; the floor is there to catch real rot, not to gate each new demo.

The `test` target now declares `{workspaceRoot}/coverage/{projectName}` as an output so reports survive a cache hit.
