# Mobile-Specific Capability Opt-Out — Design

- **Issue:** [#266](https://github.com/VaggelisKa/angular-advanced-table/issues/266)
- **Date:** 2026-07-08
- **Status:** Approved (brainstorming session)
- **Branch:** `art/feat/mobile-capability`

## Problem

Responsive tables need to disable specific Table Capabilities on mobile while keeping them active on desktop. Today consumers resort to `::ng-deep` CSS toggles, manual click-handler suppression, or duplicated component logic. Issue #266 asks for a mechanism that is declarative, reactive (signals and media queries), and extensible.

## Decisions

### 1. The consumer owns viewport detection

The library stays viewport-agnostic. Consumers feed any reactive condition (CDK `BreakpointObserver`, a `matchMedia` signal, a device service, a user preference) into the existing column-composition APIs. No breakpoint config, no media-query handling, and no new dependencies enter the library.

### 2. Capability opt-out gates the built-in interaction UI only — never the logic

Programmatic APIs stay live when a capability's UI is disabled. This is a hard requirement: the issue's own example replaces header-click sorting with an app-owned sort sheet, which sorts programmatically.

**Verified constraint:** mapping the opt-out to TanStack's table-level `enableSorting` is not an option. A runtime repro against the installed `@tanstack/table-core` 8.21.3 shows that with `enableSorting: false`, `table.setSorting(...)` writes the state but `getSortedRowModel` silently drops it — rows never sort (`getSortedRowModel.ts:21-23` filters sorting state by `getCanSort()`, which returns `false` when the table-level flag is off, `RowSorting.ts:478-484`). The design therefore never touches TanStack's table-level `enableSorting`.

### 3. Capabilities are column composition — rebuild columns reactively

The interaction surfaces already live in consumer-composed column APIs, and all but one already have opt-out flags. The single unified pattern:

```ts
columns = computed(() =>
  withNatTableHeaderActions(
    this.defs.map((d) => ({ ...d, enableResizing: !this.isMobile() })),
    {
      enableSortActions: !this.isMobile(), // NEW
      enableColumnPinActions: !this.isMobile(), // exists
      enableColumnReorderActions: !this.isMobile() // exists
    }
  )
);

isMobile = toSignal(
  inject(BreakpointObserver)
    .observe('(max-width: 767px)')
    .pipe(map((r) => r.matches)),
  { initialValue: false }
);
```

When the breakpoint signal flips, the `computed` re-wraps the columns and the headers re-render. `withNatTableHeaderActions` already documents that "reactive column builders can compose this helper" and unwraps previously wrapped headers, so repeated application is safe.

| Capability                                      | Mobile opt-out                                      | Library change                                                 |
| ----------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| Sorting UI (button, indicator, click, keyboard) | `enableSortActions: false` (helper option)          | **NEW — the only code change**                                 |
| Column resizing (handle, drag, Alt+arrow keys)  | `enableResizing: false` (columnDef)                 | none — gated at `interaction.util.ts:15-20`, opt-in per column |
| Pin menu                                        | `enableColumnPinActions: false` (helper option)     | none — exists                                                  |
| Reorder menu                                    | `enableColumnReorderActions: false` (helper option) | none — exists                                                  |
| Programmatic sorting (`setSorting`, sort sheet) | always live                                         | none — verified by repro                                       |

## The one library change: `enableSortActions`

Add `enableSortActions?: boolean` (default `true`) to `NatTableHeaderActionsOptions` (`libs/ng-advanced-table/components/common/header-actions.type.ts`), symmetric with the existing `enableColumnPinActions` / `enableColumnReorderActions`.

Behavior when `false` for a column:

- No sort button and no sort indicator are rendered; the header shows the plain header content.
- No click or keyboard sort interaction exists (the button is gone, so this falls out naturally — no `pointer-events` hacks).
- If pin/reorder actions are also disabled (or were never enabled) the header renders only the plain header label, identical to today's non-sortable columns.
- TanStack sorting stays fully enabled: `table.setSorting(...)` and column-def-level `enableSorting` behave exactly as before.
- `aria-sort` on the `<th>` (owned by the core table, `table.html:88/116` via `resolveAriaSort`) is **kept**. It announces sort _state_, not affordance — when an app-owned sort sheet sorts a column, screen readers still hear the column is sorted. This is correct WAI-ARIA usage.

Resolution order follows the existing `resolveBooleanOption` pattern (`with-table-header-actions.ts:59-60`): per-column `meta.headerActions.enableSortActions` overrides the helper-level option, which defaults to `true`.

### Non-changes (explicitly out)

- No new inputs on `NatTable` / `NatTableSurface`.
- No new directives, prefixes (`interactive*`), or config objects.
- No TanStack option changes; `enableColumnResizing`/`enableColumnPinning` hardcoded in `table.state.ts:241-243` stay as-is (resizing is already per-column opt-in via columnDef).
- No viewport/breakpoint code in the library.

## Alternatives rejected

1. **`interactive*` input family on `NatTable`** — new API vocabulary next to `enable*`; rejected as unnecessary once the existing helper-options pattern was identified.
2. **Table-level `enableSorting` input mapped to TanStack** — proven to break programmatic sorting (repro above).
3. **Single `capabilities` config object input** — second config style alongside flat inputs; merge semantics to define; superseded by the zero-new-concepts option.
4. **CSS-only (`pointer-events`, hiding indicators)** — does not stop keyboard interaction, leaves misleading semantics for assistive tech.
5. **Library-owned breakpoint service** — bakes viewport opinions into a headless library; only covers media-query-shaped conditions.

## Testing

- **Unit (header-actions):**
  - `enableSortActions: false` → no sort button rendered, plain header content shown.
  - Per-column `meta.headerActions.enableSortActions` overrides the helper-level value in both directions.
  - Default (`undefined`) keeps current behavior — existing specs stay green.
- **Unit (integration-level):** with sort actions disabled, `table.setSorting(...)` still sorts rows and `aria-sort` reflects the applied sort.
- **Showcase demo:** viewport-toggle Topic Example using the computed-columns pattern (simulated toggle, not real breakpoint, so it is testable and demonstrable on desktop).

## Documentation

- New Documentation Topic: **Responsive capabilities** — the computed-columns pattern, the full opt-out table above, and the Usage Boundary: viewport detection belongs to the consuming application.
- Update the sorting topic: note that disabling sort UI does not disable programmatic sorting.
- Update `skills/nat-best-practises` with the new option and the pattern.

## Versioning

Purely additive (one optional field, default preserves behavior) → minor release.
