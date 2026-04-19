# ng-advanced-table

`ng-advanced-table` is the bare core table package in this workspace. It renders the table itself and owns the TanStack state integration, but it does not ship opinionated controls or card styling.

## What Stays In Core

- standalone `NatTable`
- TanStack sorting, filtering, visibility, column ordering, pinning, and optional pagination state
- sticky header and sticky pinned-column layout
- controlled or uncontrolled `NatTableState`
- typed column metadata through `NatTableColumnMeta`
- optional `(rowRendered)` instrumentation for performance tooling

## What Moved Out

Use [`ng-advanced-table-ui`](../ng-advanced-table-ui/README.md) for:

- search input
- column visibility chips
- page-size chips
- pager buttons
- sort/pin header actions
- themed card/surface styling

## Installation

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/aria @angular/cdk
```

Add `ng-advanced-table-ui` only if you want the companion controls:

```bash
npm install ng-advanced-table-ui
```

## Quick Start

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

interface ServiceRow {
  id: string;
  service: string;
  region: string;
  latencyMs: number;
}

@Component({
  selector: 'app-service-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [initialState]="initialState"
      [allowColumnReorder]="true"
      [enablePagination]="true"
      [getRowId]="getRowId"
      ariaLabel="Service latency"
      (stateChange)="tableState.set($event)"
    />
  `,
})
export class ServiceTableComponent {
  readonly rows = signal<ServiceRow[]>([]);
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly columns: ColumnDef<ServiceRow>[] = [
    {
      accessorKey: 'service',
      header: 'Service',
      enablePinning: true,
      meta: { label: 'Service' },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'region',
      header: 'Region',
      meta: { label: 'Region' },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'latencyMs',
      header: 'Latency',
      meta: { label: 'Latency', align: 'end' },
      cell: (context) => `${context.getValue<number>()} ms`,
    },
  ];
  readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 0, pageSize: 25 },
  };
  readonly getRowId = (row: ServiceRow) => row.id;
}
```

## Core API

### Inputs

- `data`: required table rows
- `columns`: required TanStack column definitions
- `ariaLabel`: required accessible name for the grid
- `accessibilityText`: overrides generated screen-reader summaries, live announcements, and reorder instructions
- `enableGlobalFilter`: enables global filtering for external search controls
- `allowColumnPinning`: enables sticky pinning where columns allow it
- `allowColumnReorder`: enables drag-and-drop and keyboard reordering for leaf headers
- `enablePagination`: enables TanStack pagination row models; defaults to `false`
- `emptyStateLabel`: message shown when the current row model is empty
- `globalFilterFn`: override for the built-in generic global search
- `initialState`: uncontrolled initial state
- `state`: controlled state slices
- `getRowId`: optional stable row id resolver
- `emitRowRenderEvents`: enables `(rowRendered)`

### Outputs

- `stateChange`: emits the next full `NatTableState`
- `rowRendered`: emits per-row paint measurements when instrumentation is enabled

### Public Instance API

- `table`: raw TanStack table instance
- `patchState(...)`: applies state updaters while respecting controlled slices

## Custom Accessibility Text

Use `accessibilityText` when the built-in English summaries or live announcements do not fit your product language or terminology.

```ts
readonly accessibilityText = {
  reorderKeyboardInstructions: 'Usa Alt+Shift para mover columnas.',
  tableSummary: ({
    visibleRowsText,
    totalRowsText,
    visibleColumnsText,
    pageText,
    pageCountText,
  }) => `Resumen ${visibleRowsText}/${totalRowsText}/${visibleColumnsText}/${pageText}/${pageCountText}`,
  filteringChange: ({ query, visibleRowsText }) => `Filtro ${query}:${visibleRowsText}`,
  sortingChange: ({ columnLabel, sortState }) => `Orden ${columnLabel}:${sortState}`,
  pageChange: ({ pageText, pageCountText, visibleRowsText }) =>
    `Pagina ${pageText}/${pageCountText}:${visibleRowsText}`,
};
```

```html
<nat-table
  [data]="rows()"
  [columns]="columns"
  [state]="tableState()"
  [enablePagination]="true"
  [allowColumnReorder]="true"
  [accessibilityText]="accessibilityText"
  ariaLabel="Orders"
  (stateChange)="tableState.set($event)"
/>
```

Every formatter receives structured context with browser-locale number strings such as `pageText` and semantic states such as `sortState`, so consumers can localize copy without re-deriving state or formatting counts themselves.

## `NatTableColumnMeta`

Attach optional metadata through `columnDef.meta`:

- `label`: accessible/friendly label for optional companion controls
- `align`: `'start' | 'end'`
- `cellTone`: returns `'positive' | 'negative' | 'neutral' | 'warning' | null`

## Building Custom UI Around `NatTable`

`NatTable` is designed so consumers can replace any optional UI with their own components.

The key integration points are:

- `#grid="natTable"`: get the component instance in the template
- `grid.table`: read the raw TanStack table state and derived helpers
- `grid.patchState(...)`: update table state from your own UI while respecting controlled slices
- `(stateChange)`: keep external state in sync if you use controlled state

When column reordering is enabled:

- unpinned columns follow `state.columnOrder`
- left and right pinned columns follow `state.columnPinning.left` and `state.columnPinning.right`
- dragging does not move a column across pinning zones; use `column.pin(...)` to change zones

For read-only UI, prefer `grid.table`:

- `grid.table.getState().pagination`
- `grid.table.getCanNextPage()`
- `grid.table.getVisibleLeafColumns()`
- `grid.table.getAllLeafColumns()`

For write UI, prefer `grid.patchState(...)` when you want to update state slices directly, or call TanStack instance methods when the behavior already exists there:

- `grid.patchState({ globalFilter: 'abc' })`
- `grid.patchState({ columnOrder: ['region', 'service', 'latencyMs'] })`
- `grid.patchState({ pagination: (current) => ({ ...current, pageIndex: 0 }) })`
- `grid.table.nextPage()`
- `grid.table.previousPage()`
- `column.toggleVisibility(...)`
- `column.toggleSorting()`
- `column.pin('left')`

### Custom Pagination Example

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NatTable } from 'ng-advanced-table';

@Component({
  selector: 'app-custom-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="pagination" aria-label="Table pagination">
      <button type="button" [disabled]="!for().table.getCanPreviousPage()" (click)="previous()">
        Back
      </button>

      <span> {{ pageIndex() + 1 }} / {{ pageCount() }} </span>

      <button type="button" [disabled]="!for().table.getCanNextPage()" (click)="next()">
        Forward
      </button>
    </nav>
  `,
})
export class CustomPaginationComponent<TData = unknown> {
  readonly for = input.required<NatTable<TData>>();

  protected pageIndex(): number {
    return this.for().table.getState().pagination.pageIndex;
  }

  protected pageCount(): number {
    return this.for().table.getPageCount() || 1;
  }

  protected previous(): void {
    this.for().table.previousPage();
  }

  protected next(): void {
    this.for().table.nextPage();
  }
}
```

```html
<nat-table
  #grid="natTable"
  [data]="rows()"
  [columns]="columns"
  [state]="tableState()"
  [enablePagination]="true"
  ariaLabel="Orders"
  (stateChange)="tableState.set($event)"
/>

<app-custom-pagination [for]="grid" />
```

The same pattern works for custom search, custom page-size pickers, custom “show/hide columns” menus, and custom table toolbars.

## Migration Notes

If you are upgrading from the previous all-in-one `NatTable`:

- replace `showPagination` with `enablePagination`
- remove `pageSizeOptions`, `searchLabel`, `searchPlaceholder`, and `showColumnVisibility` from `NatTable`
- wrap headers with `withNatTableHeaderActions(...)` if you still want built-in sort/pin buttons or custom sort indicators
- compose search, pager, and visibility with `ng-advanced-table-ui`
