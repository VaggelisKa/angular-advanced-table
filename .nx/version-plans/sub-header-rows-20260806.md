---
ng-advanced-table: minor
---

Add sub-header (group) rows to `nat-table` and `nat-list`.

New inputs on both renderers: `subHeaderColumn` (a leaf column id whose value groups rows under rendered sub-header rows), `subHeaderOrder` (an optional explicit group value order; unlisted values sort after listed ones in natural ascending order), and `enableSubHeaders` (default `true`; `false` ignores the sub-header config on that renderer only, with no forced sort, group rows, or dev warnings). The grouping engine lives in the shared `NatTableState`, so both renderers get identical behavior.

Sorting semantics:

- The renderer always sorts by the sub-header column first via a forced ascending entry that only exists in the state handed to TanStack. `sortingChange`, `[(state)]`, `aria-sort`, sort indicators, and multi-sort priority badges never contain it — user sorting stays the visible primary sort and applies within groups.
- `withNatTableHeaderActions(...)` derives sort state, priorities, and labels from the stripped user-visible sorting (`getVisibleSorting`/`getVisibleSortState`/`getVisibleSortPriority` in the components entry), and suppresses the sort button on the active sub-header column, whose toggles would be hidden no-ops. The new public `stripNatTableSubHeaderSorting` helper backs this.
- An unset or unknown `subHeaderColumn` disables the feature entirely (dev-mode warning); `subHeaderOrder` without `subHeaderColumn` is ignored with a warning.

Rendering:

- The table renders a full-width `<tr class="sub-header-row"><td colspan>` before each group's first row; the label content is sticky-left so it stays visible under horizontal scroll with pinned columns. The list renders a plain `<li class="list-sub-header">` with no horizontal padding by default, aligning with list items. A group split by pagination repeats its sub-header at the page start.
- Default content is the group value; `ng-template[natTableSubHeader]` (new `NatTableSubHeaderTemplate` directive) overrides it with a context of `value`/`$implicit`, `rowCountValue` (whole group across the filtered dataset, pre-pagination), the group's first `row`, and the `table`. New public types: `NatTableSubHeaderGroup`, `NatTableSubHeaderTemplateContext`.
- Sub-header rows carry no selection state, row-activation handlers, or render-metrics events.
- New public styling tokens: `--nat-table-sub-header-background`, `--nat-table-sub-header-color`, `--nat-table-space-sub-header`, `--nat-table-font-weight-sub-header`.

Accessibility:

- Each sub-header row renders a screen-reader announcement ("Active group, 3 rows."), backed by new locale keys `subHeaderRow` and `listSubHeaderRow` (list copy says items) with the usual grid-fallback merge behavior and a `NatTableAccessibilitySubHeaderContext` formatter context.
