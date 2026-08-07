---
ng-advanced-table: patch
---

Add a published-package size budget and an artifact-level entry-point layering check.

The showcase carried build budgets but the published package carried none, so nothing automatically checked that the four entry points stay separately tree-shakeable. That invariant was enforced only by lint on source and by review.

`tools/check-package-size.mjs` (`pnpm run size:check`, wired into the CI release gate after the package build and into `pnpm run verify`) measures each entry point's FESM bundle and fails on either a gzipped size ceiling breach or a forbidden cross-entry import in the shipped bundle. The forbidden-import graph mirrors the AGENTS.md layering rules: core must not reach `components` or `render-metrics`, and `locale` must stay the leaf.

The layering half matters because a deep relative import across an entry-point boundary inlines code rather than referencing it. Lint catches that in source; this catches it in the artifact that actually ships, where the symptom is a companion bundle that suddenly grows by the size of core.

Ceilings are set roughly 10% above the current gzipped sizes (core 62.1 kB, components 31.6 kB, locale 7.3 kB, render-metrics 5.9 kB), so ordinary feature work passes while an inlining regression fails immediately.
