## The Computed-Columns Pattern

Responsive tables often need to disable specific capability UI on mobile while keeping it active on desktop: a header sort button and click-to-sort behavior might make room for an app-owned sort sheet, a resize handle might not fit a touch layout, and a pin menu might not be worth a tap target on small screens.

The library stays viewport-agnostic. Feed any reactive condition — CDK `BreakpointObserver`, a `matchMedia` signal, a device service, a user preference — into the same column-composition APIs used everywhere else, and rebuild columns inside a `computed()` keyed on that signal.

```ts
readonly isMobile = toSignal(
  inject(BreakpointObserver)
    .observe('(max-width: 767px)')
    .pipe(map((result) => result.matches)),
  { initialValue: false }
);

readonly columns = computed(() =>
  withNatTableHeaderActions(
    baseColumns.map((column) => ({ ...column, enableResizing: !this.isMobile() })),
    {
      enableSortActions: !this.isMobile(),
      enableColumnPinActions: !this.isMobile()
    }
  )
);
```

When the breakpoint signal flips, the `computed` re-wraps the columns and the headers re-render. Applying `withNatTableHeaderActions(...)` repeatedly is safe: it unwraps previously wrapped headers before installing the next wrapper, so reactive column builders can compose it without nesting the generated controls.

## Capability Opt-Out Table

| Capability                                      | Mobile opt-out                                      |
| ----------------------------------------------- | --------------------------------------------------- |
| Sort button and indicator                       | `enableSortActions: false` (helper option)          |
| Column resizing (handle, drag, keyboard)        | `enableResizing: false` (columnDef)                 |
| Pin menu                                        | `enableColumnPinActions: false` (helper option)     |
| Reorder menu                                    | `enableColumnReorderActions: false` (helper option) |
| Programmatic sorting (`setSorting`, sort sheet) | Never disabled                                      |

`enableSortActions: false` removes the sort button and indicator from the header; there is no click or keyboard sort interaction because the control that would host it is gone. `aria-sort` on the header cell is unaffected — it announces the column's sort _state_, not its affordance, so screen readers still hear that a column is sorted when an app-owned control drove the sort. Per-column `meta.headerActions.enableSortActions` overrides the helper-level option for a single column, following the same resolution order as `enableColumnPinActions` and `enableColumnReorderActions`.

TanStack sorting stays fully enabled behind `enableSortActions: false`: `table.setSorting(...)` and columnDef-level `enableSorting` behave exactly as before. This library never maps the mobile opt-out to TanStack's table-level `enableSorting` flag — see the Usage Boundary below for why.

## Usage Boundary

Viewport detection belongs to the consuming application, not the table. Wire `BreakpointObserver`, a `matchMedia` signal, or a device/user-preference service into the computed-columns pattern above; the library adds no breakpoint config, media-query handling, or new dependency.

Table-level `enableSorting` is intentionally never used to implement this opt-out. A runtime check against the installed `@tanstack/table-core` shows that with `enableSorting: false`, `table.setSorting(...)` writes the sorting state but `getSortedRowModel` silently drops it — rows never sort, because the row model filters sorting state by `getCanSort()`, which returns `false` when the table-level flag is off. Mapping the mobile opt-out to that flag would silently break any app-owned sort sheet that sorts programmatically. `enableSortActions` only ever touches the header action UI.
