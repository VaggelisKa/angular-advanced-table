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
import { ColumnDef, NatTableUserState } from 'ng-advanced-table';
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
- Use `withNatTableHeaderActions(...)` for bundled sorting, pinning, move, and visibility actions.
- Use `withNatTableSelectionColumn(...)` for the bundled selection column.

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
