Composition is the main design point of the table entry points. `ng-advanced-table` renders the grid and exposes a controller. `ng-advanced-table/components` provides optional companion controls that read and patch that controller. Your app owns domain workflows such as search copy, filter menus, row actions, bulk actions, dialogs, and server requests.

## Entry Point Responsibilities

| Entry point                        | Responsibility                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `ng-advanced-table`                | Core table, keyboard grid behavior, TanStack integration, state rows, row activation, accessibility announcements    |
| `ng-advanced-table/components`     | Surface, pagination, column visibility, scroll controls, toolbar, header actions, selection column, export directive |
| `ng-advanced-table/render-metrics` | Optional render-metrics store, filter, panel, and synthetic metrics column                                           |
| `ng-advanced-table/locale`         | Built-in locale dictionaries and provider helpers for core accessibility, controls, and render-metrics copy          |
| Your app                           | Search inputs, domain filters, row menus, bulk actions, fetch/retry flows, dialogs, routing, permissions             |

Keeping this boundary clear makes the reusable packages stable while still letting product-specific workflows feel native to your application.

## Surface And Controller

Most companion controls should live inside `NatTableSurface`. The surface creates the scoped `NatTableService`, passes state inputs to the table, receives table state changes, and lets controls patch the same controller.

```html
<nat-table-surface [initialState]="initialState">
  <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />

  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />

  <nat-table-scroll-control />
  <nat-table-column-visibility />
</nat-table-surface>
```

The table registers itself as the controller for controls in that surface. In unusual layouts, controls that accept `for` can target an exported table instance directly.

```html
<nat-table #grid="natTable" [data]="rows()" [columns]="columns" accessibleName="Open positions" />

<nat-table-toolbar [for]="grid" accessibleName="Detached table actions">
  <button type="button" natToolbarItem natTableExport [for]="grid">Export</button>
</nat-table-toolbar>
```

Prefer the scoped surface for normal pages. Use direct controller binding only when the layout requires controls outside the surface.

## Stock Controls

| Control                             | Use it for                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `NatTableSurface`                   | Controller scope, companion-control wiring, and state binding (styling is opt-in — see Theming) |
| `NatTableColumnVisibility`          | Hide and show hideable columns                                                                  |
| `NatTablePageSize`                  | Page-size chips                                                                                 |
| `NatTablePager`                     | Previous and next page controls                                                                 |
| `NatTablePagination`                | Combined page-size and pager toolbar                                                            |
| `NatTableScrollControl`             | Horizontal scroll buttons and range control                                                     |
| `NatTableToolbar`                   | Roving-keyboard toolbar shell for table actions                                                 |
| `NatToolbarGroup`, `natToolbarItem` | Toolbar grouping and item registration                                                          |
| `withNatTableHeaderActions(...)`    | Header sort buttons plus pin and move menus                                                     |
| `withNatTableSelectionColumn(...)`  | Select-all and per-row checkbox column                                                          |
| `NatTableExport`                    | CSV export or app-provided export operation                                                     |

## Header Actions

Wrap column definitions with `withNatTableHeaderActions(...)` to compose shared header controls, then enable each capability on the surface: `[enableSorting]="true"` for sort buttons, `[enablePinning]="true"` for the pin menu, and `[enableReordering]="true"` for menu-based reordering across all columns. Sorting and pinning resolve as `column.<flag> ?? surface.<enabler>`; reordering resolves as `column.meta.reorderable ?? surface.enableReordering`. With the surface on, every column reorders by default; opt a column out with `meta: { reorderable: false }` and its menu and keyboard move controls disappear. With the surface off, set `meta: { reorderable: true }` on the columns that should expose drag/drop, menu moves, and keyboard reordering.

```html
<nat-table-surface [enableSorting]="true" [enablePinning]="true" [enableReordering]="true">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

```ts
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

readonly columns = withNatTableHeaderActions<PositionRow>(
  [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      meta: { label: 'Symbol', rowHeader: true },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      meta: { label: 'Price', align: 'end' },
    },
  ],
  {
    enableColumnReorderActions: true,
  },
);
```

The helper preserves original header content and can be applied repeatedly. It is the intended composition point for header controls: keep the real header in `column.header`, add `meta.label`, then wrap the final column array. Do not add a second styled header row or replace the table header DOM to customize sort icons.

Use `sortIndicator` when the design needs custom sort icon, badge, or text content while keeping the bundled sort behavior and labels.

```ts
import { Component, input } from '@angular/core';
import { flexRenderComponent, type NatTableSortIndicatorContext } from 'ng-advanced-table';
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

@Component({
  selector: 'app-sort-indicator',
  template: `
    <span aria-hidden="true" [attr.data-sort-state]="context().sortState || 'none'">
      {{ context().sortState === 'asc' ? 'Asc' : context().sortState === 'desc' ? 'Desc' : 'Sort' }}
    </span>
  `,
})
export class SortIndicator {
  readonly context = input.required<NatTableSortIndicatorContext>();
}

readonly columns = withNatTableHeaderActions(baseColumns, {
  sortIndicator: (context) =>
    flexRenderComponent(SortIndicator, {
      inputs: { context },
    }),
});
```

The custom indicator is visual only. The generated sort button still owns the click handler, keyboard behavior, accessible name, multi-sort state, and `aria-sort`.

For utility columns, use `hiddenHeaderLabel` to keep a screen-reader label while hiding redundant visible header text.

```ts
{
  id: 'actions',
  header: 'Actions',
  enableSorting: false,
  enableGlobalFilter: false,
  enableHiding: false,
  meta: {
    label: 'Actions',
    hiddenHeaderLabel: 'Row actions',
    headerActions: false,
  },
  cell: (context) => renderActions(context.row.original),
}
```

Set `column.meta.headerActions` to `false` when a column should not get the wrapper, or pass a per-column object to override helper-level options for that column.

## Toolbar Composition

Use `<nat-table-toolbar>` for generic command rows. Projected interactive controls that participate in toolbar keyboard navigation must use `natToolbarItem` or `NatToolbarGroup`.

```html
<nat-table-toolbar accessibleName="Positions toolbar">
  <button type="button" natToolbarItem natToolbarItemPosition="start">Refresh</button>

  <div natToolbarGroup="end" accessibleName="Density">
    <button type="button" natToolbarItem>Compact</button>
    <button type="button" natToolbarItem>Comfortable</button>
  </div>

  <button type="button" natToolbarItem natToolbarItemPosition="end" natTableExport>Export</button>
</nat-table-toolbar>
```

Keep DOM order aligned with screen-reader and roving-keyboard order. Use start, center, and end positions for visual placement, but do not reorder the DOM in a way that makes keyboard navigation surprising.

## Consumer-Owned Search

Global search is intentionally not a packaged UI primitive. Build a search component in your app, inject `NatTableService`, register search while the component is alive, and patch the table `globalFilter` state.

```ts
import { Component, DestroyRef, computed, inject, input } from '@angular/core';
import { NatTableService, type PaginationState, type RowData } from 'ng-advanced-table';
import { NatToolbarItem } from 'ng-advanced-table/components';

@Component({
  selector: 'app-table-search',
  imports: [NatToolbarItem],
  template: `
    <input
      type="search"
      natToolbarItem
      [attr.aria-label]="label()"
      [value]="value()"
      [placeholder]="placeholder()"
      (input)="onInput($event)" />
  `
})
export class TableSearch<TData extends RowData = RowData> {
  readonly label = input('Search table');
  readonly placeholder = input('Type to search...');

  private readonly tableService = inject<NatTableService<TData>>(NatTableService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly controller = computed(() => this.tableService.controller());
  protected readonly value = computed(() => this.controller()?.table.getState().globalFilter ?? '');

  constructor() {
    this.tableService.registerSearch();
    this.destroyRef.onDestroy(() => this.tableService.unregisterSearch());
  }

  protected onInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement) || target.value === this.value()) {
      return;
    }

    this.controller()?.patchState({
      globalFilter: target.value,
      pagination: (current: PaginationState) => ({ ...current, pageIndex: 0 })
    });
  }
}
```

Then place it in a toolbar or beside the table.

```html
<nat-table-surface>
  <nat-table-toolbar accessibleName="Table actions">
    <app-table-search label="Search by symbol, company, or desk" />
    <button type="button" natToolbarItem natTableExport exportFileName="positions">Export</button>
  </nat-table-toolbar>

  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

The app owns the input label, placeholder, debounce policy, URL synchronization, analytics, and server requests.

## Domain Filters

Domain filters should usually be app-owned because their labels, options, counts, and fetch behavior are product-specific. Patch `columnFilters` when the filter is table-local, or filter the rows before passing them to the table when the table should not own the filter state.

```ts
protected toggleStatus(status: PositionStatus): void {
  const selected = new Set(this.selectedStatuses());

  if (selected.has(status)) {
    selected.delete(status);
  } else {
    selected.add(status);
  }

  this.tableState.update((state) => ({
    ...state,
    columnFilters: upsertColumnFilter(state.columnFilters ?? [], 'status', [...selected]),
    pagination: { ...(state.pagination ?? { pageIndex: 0, pageSize: 25 }), pageIndex: 0 },
  }));
}
```

Keep the filter controls accessible as normal application controls. Use button groups, checkboxes, menus, or segmented controls according to the product interaction, then update table state from those controls.

## Helper Order

When composing column helpers, apply helpers that add synthetic columns first, then wrap the final array with header actions.

```ts
readonly metricsStore = new NatTableRenderMetricsStore();

readonly columns = withNatTableHeaderActions(
  withRenderMetricsColumn(
    withNatTableSelectionColumn(baseColumns, {
      label: 'Selection',
      selectRowAriaLabel: (row) => `Select ${row.original.name}`,
    }),
    this.metricsStore,
  ),
  {
    enableColumnReorderActions: true,
  },
);
```

This prevents utility columns from being wrapped more than intended and lets header actions see the final column list. As above, columns reorder by default once `[enableReordering]="true"` is set; opt a column out of the generated move controls with `meta: { reorderable: false }`, or leave the surface off and opt individual columns in with `meta: { reorderable: true }`.
