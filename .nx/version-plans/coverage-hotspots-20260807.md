---
ng-advanced-table: patch
---

Cover the core entry point's four weakest files and ratchet its coverage thresholds up.

Test-only change; no library behavior is modified.

`NatTableHeaderMeasurementService` was the least-covered file in the library at 38.8% statements / 36% branches. The cause was environmental rather than neglect: jsdom ships no `ResizeObserver`, so the service's own `typeof ResizeObserver === 'undefined'` guard short-circuited every measurement path before it could run. The new spec installs a controllable fake observer, so header-width measurement, region viewport measurement, the unchanged-widths identity short-circuit, the zero-width guard, observer attachment, and teardown-on-destroy are now exercised — including the no-`ResizeObserver` path itself.

`NatTableService` gains coverage for `patchState` (both the pass-through options that treat `undefined` as a real value and the defined-only scalars that do not), the structural-equality short-circuits for accessibility text and keybindings, the three manual-mode computeds under both string and per-concern configuration, companion registration counting including the floor at zero, and surface/global keybinding merging.

`NatTableRowRenderEmitter` gains coverage for the per-token dedupe, the disabled and unstamped-cycle early exits, the 0.1 ms duration floor, and single-decimal rounding.

`hasNatTableStateValueChanged` was at 68.5% branch coverage despite being the helper responsible for comparing non-JSON-safe consumer filter values. It now covers Date, RegExp, and Map values, Set matching that only succeeds under backtracking, cyclic references in both the equal and unequal case, null-prototype objects, enumerable symbol keys, and primitive/object mismatches. Two behaviors are now locked down by test rather than left implicit: Map comparison is order-sensitive, and Set comparison backtracks rather than matching greedily.

Resulting core coverage, with thresholds ratcheted to match:

| Metric     | Before | After | Threshold |
| ---------- | ------ | ----- | --------- |
| statements | 91.5%  | 94.8% | 94        |
| branches   | 85.9%  | 89.9% | 89        |
| functions  | 92.6%  | 94.7% | 94        |
| lines      | 91.9%  | 95.6% | 95        |

The existing `table.service` and `table-state-value-equality` specs are restructured into the Gherkin shape required by AGENTS.md; each pre-existing test stays a single test rather than being split to fit the shape.
