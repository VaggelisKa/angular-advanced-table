# Table Patterns

## Entry Points

- `ng-advanced-table`: `NatTable`, `NatTableService`, `ColumnDef`, TanStack state types, `NatTableUserState`, `NatTableDataStatus`, `NAT_TABLE_DATA_STATUS`, template directives, keybinding helpers.
- `ng-advanced-table/components`: `NatTableSurface`, pagination controls, column visibility, scroll controls, toolbar primitives, header actions, row selection column, export directive, `provideNatTableExport`.
- `ng-advanced-table/render-metrics`: `NatTableRenderMetricsStore`, `NatRenderMetricsFilter`, `NatRenderMetricsPanel`, `withRenderMetricsColumn`.
- `ng-advanced-table/locale`: `provideNatTableLocales`, `provideNatTableControlsLocales`, `provideNatTableRenderMetricsLocales`, and locale contract types.

Import forwarded table types and helpers from `ng-advanced-table`. Do not import from deep source paths.

## Table Contract

Before coding, identify:

- The row type and stable row id.
- Columns, labels, row header column, custom cells, and export needs.
- Which state slices are controlled: sorting, global filter, column filters, visibility, order, pinning, sizing, row selection, or pagination.
- Whether data is client-side or manual/server-owned.
- Loading, empty, error, and retry UI.

## Basic Controlled Table

```ts
import { signal } from '@angular/core';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

type PositionRow = {
  readonly id: string;
  readonly title: string;
  readonly status: string;
};

readonly tableState = signal<Partial<NatTableUserState>>({
  sorting: [{ id: 'title', desc: false }]
});

readonly columns: ColumnDef<PositionRow, unknown>[] = withNatTableHeaderActions([
  {
    accessorKey: 'title',
    header: 'Title',
    meta: { label: 'Title', rowHeader: true }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status' }
  }
]);
```

```html
<nat-table-surface [(state)]="tableState">
  <nat-table [columns]="columns" [data]="rows()" accessibleName="Open positions" />
</nat-table-surface>
```

## Column Rules

- Add `meta.label` to every visible column.
- Set `meta.rowHeader` on the identifying column.
- Add `hiddenHeaderLabel` for icon-only or component headers.
- Use `withNatTableHeaderActions(...)` for bundled sorting, pinning, and move actions.
- Use `withNatTableSelectionColumn(...)` for the bundled selection column.

## Header Actions Composable

Use `withNatTableHeaderActions(...)` to compose header controls with column definitions. Do not add extra header rows, restyle body rows as headers, or rebuild the table header DOM to customize sort icons.

The pattern is:

1. Keep each column's real header in `column.header`.
2. Add `meta.label` for the accessible column name.
3. Apply helpers that add synthetic columns first.
4. Wrap the final columns with `withNatTableHeaderActions(...)`.
5. Pass custom sort icon or badge content through `sortIndicator`.

```ts
import { Component, input } from '@angular/core';
import { flexRenderComponent, type ColumnDef, type NatTableSortIndicatorContext } from 'ng-advanced-table';
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

@Component({
  selector: 'app-sort-indicator',
  template: `
    <span aria-hidden="true" [attr.data-sort-state]="context().sortState || 'none'">
      {{ context().sortState === 'asc' ? 'Asc' : context().sortState === 'desc' ? 'Desc' : 'Sort' }}
    </span>
  `
})
export class SortIndicator {
  readonly context = input.required<NatTableSortIndicatorContext>();
}

const baseColumns: ColumnDef<PositionRow, unknown>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    meta: { label: 'Title', rowHeader: true }
  }
];

readonly columns = withNatTableHeaderActions(baseColumns, {
  sortIndicator: (context) =>
    flexRenderComponent(SortIndicator, {
      inputs: { context }
    }),
  enableColumnReorderActions: true
});
```

`sortIndicator` content is visual. The generated sort button still owns the click handler, keyboard behavior, accessible name, multi-sort handling, and `aria-sort` state. Use `column.meta.headerActions` for per-column overrides, or set it to `false` for utility/action columns that should keep their original header.

Set `enableSortActions: false` to remove the built-in sort button/indicator for wrapped columns. Programmatic sorting via `NatTable.patchState({ sorting })` (or `natTable.table.setSorting(...)` on the underlying TanStack instance) and columnDef-level `enableSorting` are unaffected. Defaults to `true`. Override per column with `column.meta.headerActions.enableSortActions`.

## Responsive Capabilities

The table is viewport-agnostic; it has no built-in breakpoint concept. Detect the viewport in the consuming app (`BreakpointObserver`, `matchMedia`, or an app layout service) and rebuild columns inside a `computed()` keyed on that signal.

```ts
import { computed, signal } from '@angular/core';
import type { ColumnDef } from 'ng-advanced-table';
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

readonly isCompact = signal(false); // driven by BreakpointObserver or matchMedia

readonly columns = computed<ColumnDef<PositionRow, unknown>[]>(() =>
  withNatTableHeaderActions(
    [
      {
        accessorKey: 'title',
        header: 'Title',
        meta: { label: 'Title', rowHeader: true },
        enableResizing: !this.isCompact()
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { label: 'Status' }
      }
    ],
    {
      enableSortActions: !this.isCompact(),
      enableColumnPinActions: !this.isCompact()
    }
  )
);
```

Never map a mobile/compact opt-out to TanStack table-level `enableSorting`. Setting `enableSorting: false` on the table or a column makes `getCanSort()` return `false`, and `getSortedRowModel` then silently drops programmatic sort state: state writes succeed but rows never sort. Use `enableSortActions: false` instead — it only removes the UI affordance and leaves `enableSorting` and programmatic sorting intact.

## State Rules

- Store controlled table state as `Partial<NatTableUserState>`.
- Preserve unrelated slices on every update.
- Reset pagination when search or filters change the visible data set.
- Keep server fetching, errors, retries, and query construction in the app.

## Data Lifecycle Rows

Use `dataStatus` for loading, empty, and error rows. Project custom state UI into the table.

```html
<nat-table [columns]="columns" [data]="rows()" [dataStatus]="status()" [error]="error()" accessibleName="Open positions">
  <ng-template natTableLoading>Loading positions</ng-template>
  <ng-template natTableEmpty let-filtered>
    {{ filtered ? 'No rows match the active filters.' : 'There are no positions.' }}
  </ng-template>
  <ng-template natTableError>Positions could not be loaded</ng-template>
</nat-table>
```
