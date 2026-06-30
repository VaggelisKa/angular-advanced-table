---
ng-advanced-table: patch
---

Adopt module-boundary enforcement and an internal element-layer structure (#185). Each subpath entry point is now a tagged Nx project (`type:core`/`ui`/`utils`/`locale`) guarded by `@nx/enforce-module-boundaries`, and source within each entry point is organized into `common`/`utils`/`domain-logic`/`ui`/`feature` element folders enforced by `eslint-plugin-boundaries`. Internal refactor and tooling only — no public API, `exports`, or runtime behavior change; the published bundles are unchanged.
