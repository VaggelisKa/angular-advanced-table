# angular-advanced-table

Signals-first Angular workspace for three composable table packages built on TanStack Table.

## Documentation Map

- Canonical documentation for the workspace and all packages lives in this file.
- Package supplements live here:
  - [`projects/ng-advanced-table/README.md`](projects/ng-advanced-table/README.md)
  - [`projects/ng-advanced-table-ui/README.md`](projects/ng-advanced-table-ui/README.md)
  - [`projects/ng-advanced-table-utils/README.md`](projects/ng-advanced-table-utils/README.md)
- If a package README and this file disagree, prefer this file.
- Agent routing:
  - Use [Core Table](#core-table) for `NatTable`.
  - Use [UI Package](#ui-package) for optional controls, surfaces, and header actions.
  - Use [Utils Package](#utils-package) for render-metrics tooling.

## Package Matrix

### `ng-advanced-table`

Purpose: the core table primitive.

Public exports:

- `NatTable`
- `NatTableRowRenderedEvent`
- `NatTableAccessibilityText`
- `NatTableAccessibilitySummaryContext`
- `NatTableAccessibilitySortingAnnouncementContext`
- `NatTableAccessibilityFilteringAnnouncementContext`
- `NatTableAccessibilityColumnVisibilityAnnouncementChange`
- `NatTableAccessibilityColumnVisibilityAnnouncementContext`
- `NatTableAccessibilityPaginationAnnouncementContext`
- `NatTableAccessibilityColumnReorderAnnouncementContext`
- `NatTableState`
- `NatTableColumnMeta`
- `NatTableCellTone`
- `NatTableSortDirection`
- `NatTableSortIndicatorContext`

### `ng-advanced-table-ui`

Purpose: optional UI controls and presentational helpers that compose around a compatible table controller.

Public exports:

- `NatTableSurface`
- `NatTableSearch`
- `NatTableColumnVisibility`
- `NatTablePageSize`
- `NatTablePager`
- `withNatTableHeaderActions(...)`
- `NatTableHeaderActionsOptions`
- `NatTableSortIndicatorContent`
- `NatTableAccessibilityPageSizeOptionContext`
- `NatTableAccessibilityPageSizeLabels`
- `NatTableAccessibilityPagerContext`
- `NatTableAccessibilityPagerLabels`
- `NatTableAccessibilityColumnVisibilitySummaryContext`
- `NatTableAccessibilityColumnVisibilityActionContext`
- `NatTableAccessibilityColumnVisibilityStateContext`
- `NatTableAccessibilityColumnVisibilityLabels`
- `NatTableAccessibilityHeaderActionSortContext`
- `NatTableAccessibilityHeaderActionPinContext`
- `NatTableAccessibilityHeaderActionLabels`
- `NatTableUiController`
- `NatTableUiState`
- `NatTableColumnMeta`
- `NatTableSortDirection`
- `NatTableSortIndicatorContext`

### `ng-advanced-table-utils`

Purpose: optional instrumentation and render-metrics helpers.

Public exports:

- `NatTableRenderMetricsStore`
- `NatRenderMetricsFilter`
- `NatRenderMetricsPanel`
- `withRenderMetricsColumn(...)`
- `WithRenderMetricsColumnOptions`
- `NatTableRenderMetricsController`
- `NatTableRenderMetricsEvent`
- `NatTableRenderMetricsState`
- `getRowRenderTone(...)`
- `getRenderToneLabel(...)`
- `isRenderFilterValue(...)`
- `RENDER_FILTER_OPTIONS`
- `RENDER_METRIC_COLUMN_ID`
- `RowRenderFilterOption`
- `RowRenderFilterValue`
- `RowRenderMeasurement`
- `RowRenderMetric`
- `RowRenderTone`

## Install

### Core only

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/aria @angular/cdk
```

### Core and UI

```bash
npm install ng-advanced-table ng-advanced-table-ui @tanstack/angular-table @angular/aria @angular/cdk
```

### Core, UI, and utils

```bash
npm install ng-advanced-table ng-advanced-table-ui ng-advanced-table-utils @tanstack/angular-table @angular/aria @angular/cdk
```

## Quick Start

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePageSize,
  NatTablePager,
  NatTableSearch,
  NatTableSurface,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface PositionRow {
  id: string;
  symbol: string;
  desk: string;
  price: number;
}

const columns = withNatTableHeaderActions<PositionRow>([
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    enablePinning: true,
    meta: { label: 'Symbol' },
    cell: (context) => context.getValue<string>(),
  },
  {
    accessorKey: 'desk',
    header: 'Desk',
    meta: { label: 'Desk' },
    cell: (context) => context.getValue<string>(),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: { label: 'Price', align: 'end' },
    cell: (context) => `$${context.getValue<number>().toFixed(2)}`,
  },
]);

@Component({
  selector: 'app-positions-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableSearch,
    NatTableSurface,
  ],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [initialState]="initialState"
      [enablePagination]="true"
      [getRowId]="getRowId"
      ariaLabel="Open positions"
      (stateChange)="tableState.set($event)"
    />

    <nat-table-surface>
      <nat-table-search [for]="grid" />
      <nat-table-column-visibility [for]="grid" />
      <nat-table-page-size [for]="grid" [pageSizeOptions]="[25, 50, 100]" />
      <nat-table-pager [for]="grid" />
    </nat-table-surface>
  `,
})
export class PositionsTableComponent {
  readonly rows = signal<PositionRow[]>([]);
  readonly columns = columns;
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 0, pageSize: 25 },
  };
  readonly getRowId = (row: PositionRow) => row.id;
}
```

## Core Table

`NatTable` is the canonical core primitive in this workspace.

Responsibilities:

- Render the table structure and semantic grid markup.
- Own TanStack state integration for sorting, filtering, visibility, pinning, ordering, and optional pagination.
- Support controlled and uncontrolled `NatTableState`.
- Support sticky headers and sticky pinned columns.
- Expose a stable imperative/read API to optional companion controls.
- Provide accessibility announcements and keyboard guidance.
- Optionally emit per-row render timings through `(rowRendered)`.

Explicit non-goals:

- Search UI.
- Column visibility UI.
- Page-size UI.
- Pager UI.
- Header action buttons.
- Card or surface styling.

Use [`ng-advanced-table-ui`](projects/ng-advanced-table-ui/README.md) for the first five items and [`ng-advanced-table-utils`](projects/ng-advanced-table-utils/README.md) for render-metrics presentation.

## Core API

### Inputs

- `data`: required row data.
- `columns`: required TanStack column definitions.
- `ariaLabel`: required accessible name for the table region.
- `ariaDescription`: optional longer description announced with the table.
- `keyboardInstructions`: optional screen-reader instructions. A default is provided.
- `accessibilityText`: optional overrides for built-in table summaries, live announcements, and reorder instructions.
- `enableGlobalFilter`: enables the global filter pipeline. Defaults to `true`.
- `allowColumnPinning`: enables sticky column pinning. Defaults to `true`.
- `allowColumnReorder`: enables drag-and-drop and keyboard reordering. Defaults to `false`.
- `enablePagination`: enables the pagination row model. Defaults to `false`.
- `emptyStateLabel`: empty-state message. Defaults to `No rows match the current view.`.
- `globalFilterFn`: optional override for the built-in generic global filter.
- `initialState`: uncontrolled initial state, read once on first render.
- `state`: controlled state slices. Omitted slices remain internal.
- `getRowId`: optional stable row id resolver.
- `emitRowRenderEvents`: enables `(rowRendered)`. Defaults to `false`.
- `enableAnnouncements`: enables polite live announcements for sort, filter, and pagination changes. Defaults to `true`.

### Outputs

- `stateChange`: emits the next full `NatTableState`.
- `rowRendered`: emits `NatTableRowRenderedEvent` when render instrumentation is enabled.

### Public instance API

- `table`: raw TanStack `Table<TData>` instance.
- `patchState(...)`: applies partial state updaters while respecting controlled slices.
- `tableElementId()`: returns the generated DOM id for the table region.

### `NatTableState`

State slices emitted by `stateChange` and accepted by `state` / `initialState`:

- `sorting`
- `globalFilter`
- `columnFilters`
- `columnVisibility`
- `columnOrder`
- `columnPinning`
- `pagination`

### `NatTableColumnMeta`

Attach optional metadata through `columnDef.meta`:

- `label`: friendly label used by accessibility text and optional controls.
- `align`: `'start' | 'end'`.
- `rowHeader`: marks body cells in the column as row headers.
- `cellTone`: maps a cell to `'positive' | 'negative' | 'neutral' | 'warning' | null`.

### Accessibility text overrides

Use `accessibilityText` when the built-in English summaries or live announcements do not match your product language or terminology.

Supported overrides:

- `reorderKeyboardInstructions`
- `tableSummary(...)`
- `sortingChange(...)`
- `filteringChange(...)`
- `columnVisibilityChange(...)`
- `pageSizeChange(...)`
- `pageChange(...)`
- `columnReorder(...)`

```ts
readonly accessibilityText = {
  reorderKeyboardInstructions: 'Brug Alt+Shift til at flytte kolonner.',
  tableSummary: ({
    visibleRowsText,
    totalRowsText,
    visibleColumnsText,
    pageText,
    pageCountText,
  }) => `Oversigt ${visibleRowsText}/${totalRowsText}/${visibleColumnsText}/${pageText}/${pageCountText}`,
  filteringChange: ({ query, visibleRowsText }) => `Filter ${query}:${visibleRowsText}`,
  sortingChange: ({ columnLabel, sortState }) => `Sortering ${columnLabel}:${sortState}`,
  pageChange: ({ pageText, pageCountText, visibleRowsText }) =>
    `Side ${pageText}/${pageCountText}:${visibleRowsText}`,
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

The formatter contexts expose browser-locale number strings such as `pageText` and semantic state values such as `sortState`, so most consumers can localize copy without re-deriving table state.

### Composition rules

- A state slice is controlled only when that property is present in `state`.
- Global filter and column-filter updates reset `pagination.pageIndex` to `0`.
- Reordering stays inside the current pinning zone. Dragging does not move a column between left, center, and right pin groups.
- When `enablePagination` is `false`, the table uses filtered and sorted row models without pagination.
- `emitRowRenderEvents` is intentionally opt-in because it installs per-row render instrumentation.
- `enableAnnouncements` is on by default so sorting, filtering, and pagination changes are announced to assistive technology users.

### Building custom UI around `NatTable`

Template integration points:

- `#grid="natTable"` gives you the component instance.
- `grid.table` is the raw TanStack table for read operations and existing TanStack behaviors.
- `grid.patchState(...)` is the stable write API for external controls.
- `(stateChange)` keeps external state in sync when you control one or more slices.

Common read patterns:

- `grid.table.getState().pagination`
- `grid.table.getCanNextPage()`
- `grid.table.getVisibleLeafColumns()`
- `grid.table.getAllLeafColumns()`

Common write patterns:

- `grid.patchState({ globalFilter: 'abc' })`
- `grid.patchState({ columnOrder: ['region', 'service', 'latencyMs'] })`
- `grid.patchState({ pagination: (current) => ({ ...current, pageIndex: 0 }) })`
- `grid.table.nextPage()`
- `grid.table.previousPage()`
- `column.toggleVisibility(...)`
- `column.toggleSorting()`
- `column.pin('left')`

## UI Package

`ng-advanced-table-ui` is optional. It provides thin Angular components and helpers around the core controller contract.

Exports:

- `NatTableSurface`
- `NatTableSearch`
- `NatTableColumnVisibility`
- `NatTablePageSize`
- `NatTablePager`
- `withNatTableHeaderActions(...)`
- `NatTableHeaderActionsOptions`
- `NatTableSortIndicatorContent`
- `NatTableAccessibilityPageSizeOptionContext`
- `NatTableAccessibilityPageSizeLabels`
- `NatTableAccessibilityPagerContext`
- `NatTableAccessibilityPagerLabels`
- `NatTableAccessibilityColumnVisibilitySummaryContext`
- `NatTableAccessibilityColumnVisibilityActionContext`
- `NatTableAccessibilityColumnVisibilityStateContext`
- `NatTableAccessibilityColumnVisibilityLabels`
- `NatTableAccessibilityHeaderActionSortContext`
- `NatTableAccessibilityHeaderActionPinContext`
- `NatTableAccessibilityHeaderActionLabels`
- `NatTableUiController`
- `NatTableUiState`
- `NatTableColumnMeta`
- `NatTableSortDirection`
- `NatTableSortIndicatorContext`

### `NatTableUiController`

The UI package works with any controller that implements:

- `table: Table<TData>`
- `enableGlobalFilter(): boolean`
- `enablePagination(): boolean`
- `patchState(...)`
- `tableElementId(): string`

`<nat-table #grid="natTable">` satisfies this contract without any adapter code.

### Package behavior

- `NatTableSurface` owns the default `--nat-table-*` CSS variables that used to live in core.
- `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, and `NatTablePager` are intentionally small wrappers over the controller contract.
- `withNatTableHeaderActions(...)` preserves the original header content and only adds controls when the underlying column supports sorting or pinning.

### Accessibility label overrides

The UI components expose `accessibilityLabels` overrides so consumers can localize or replace the default wording.

```ts
readonly pageSizeLabels = {
  groupAriaLabel: 'Rækker pr. side',
  pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rækker`,
  pageSizeOptionAriaLabel: ({ pageSizeText }) => `Vis ${pageSizeText} rækker`,
};

readonly pagerLabels = {
  groupAriaLabel: 'Sideskift',
  previousPageAriaLabel: 'Forrige side',
  nextPageAriaLabel: 'Næste side',
  pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`,
};

readonly columnVisibilityLabels = {
  heading: 'Kolonner',
  groupAriaLabel: 'Kolonnesynlighed',
  visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
    `${visibleColumnCountText} af ${totalColumnCountText} synlige`,
  toggleColumnAriaLabel: ({ columnLabel, toggleAction }) =>
    `${toggleAction === 'hide' ? 'Skjul' : 'Vis'} kolonne ${columnLabel}`,
  columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Synlig' : 'Skjult'),
};

readonly columns = withNatTableHeaderActions(baseColumns, {
  accessibilityLabels: {
    sortButton: ({ label }) => `Sorter ${label}`,
    pinButton: ({ label, toggleAction }) =>
      `${toggleAction === 'unpin' ? 'Frigør' : 'Fastgør'} kolonne ${label}`,
    pinButtonText: ({ toggleAction }) => (toggleAction === 'unpin' ? 'Frigør' : 'Fastgør'),
  },
});
```

```html
<nat-table-column-visibility [for]="grid" [accessibilityLabels]="columnVisibilityLabels" />
<nat-table-page-size
  [for]="grid"
  [pageSizeOptions]="[25, 50, 100]"
  [accessibilityLabels]="pageSizeLabels"
/>
<nat-table-pager [for]="grid" [accessibilityLabels]="pagerLabels" />
```

`NatTableSearch` already supports custom text through its `label` and `placeholder` inputs.

The formatter contexts also expose browser-locale number strings such as `pageText` and semantic states such as `toggleAction`, so most consumers only need to override copy, not rebuild table state.

### Sort-indicator override

Pass `sortIndicator` as the second argument to `withNatTableHeaderActions(...)` when you want custom sort content:

```ts
const columns = withNatTableHeaderActions<OrderRow>(baseColumns, {
  sortIndicator: ({ sortState }) =>
    sortState === 'asc' ? '▲' : sortState === 'desc' ? '▼' : '◇',
});
```

The callback receives:

- `sortState`
- `ariaSort`
- `column`
- `label`

### Replacement pattern

You can use any subset of the UI package.

Typical strategies:

- Keep `NatTableSurface` and replace pagination.
- Keep `withNatTableHeaderActions(...)` and replace search or visibility.
- Skip the UI package entirely and build your own controls against `NatTable`.

Write guidance for custom controls:

- Search should update `globalFilter` and usually reset `pagination.pageIndex` to `0`.
- Page size should update `pagination.pageSize` and usually reset `pagination.pageIndex` to `0`.
- Column visibility can use `column.toggleVisibility(...)` or patch `columnVisibility`.
- Sorting can use `column.toggleSorting()`.
- Pinning can use `column.pin(...)`.

## Utils Package

`ng-advanced-table-utils` is optional. Today it ships render-metrics instrumentation helpers.

Exports:

- `NatTableRenderMetricsStore`
- `NatRenderMetricsFilter`
- `NatRenderMetricsPanel`
- `withRenderMetricsColumn(...)`
- `WithRenderMetricsColumnOptions`
- `NatTableRenderMetricsController`
- `NatTableRenderMetricsEvent`
- `NatTableRenderMetricsState`
- `getRowRenderTone(...)`
- `getRenderToneLabel(...)`
- `isRenderFilterValue(...)`
- `RENDER_FILTER_OPTIONS`
- `RENDER_METRIC_COLUMN_ID`
- `RowRenderFilterOption`
- `RowRenderFilterValue`
- `RowRenderMeasurement`
- `RowRenderMetric`
- `RowRenderTone`

### Render-metrics wiring

1. Create one `NatTableRenderMetricsStore`.
2. Enable row render events on `<nat-table>`.
3. Record each `(rowRendered)` event into the store.
4. Optionally wrap your columns with `withRenderMetricsColumn(...)`.
5. Render `NatRenderMetricsPanel` and `NatRenderMetricsFilter` against the same store.

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatRenderMetricsFilter,
  NatRenderMetricsPanel,
  NatTableRenderMetricsStore,
  withRenderMetricsColumn,
} from 'ng-advanced-table-utils';

@Component({
  selector: 'app-render-metrics-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatRenderMetricsFilter, NatRenderMetricsPanel],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [enablePagination]="true"
      [emitRowRenderEvents]="true"
      ariaLabel="Render metrics demo"
      (stateChange)="tableState.set($event)"
      (rowRendered)="metrics.record($event)"
    />

    <nat-render-metrics-panel [store]="metrics" />
    <nat-render-metrics-filter [for]="grid" [store]="metrics" />
  `,
})
export class RenderMetricsTableComponent {
  readonly rows = signal<readonly unknown[]>([]);
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly metrics = new NatTableRenderMetricsStore();
  readonly columns: ColumnDef<unknown>[] = withRenderMetricsColumn<unknown>([], this.metrics);
}
```

### Render-metrics notes

- `withRenderMetricsColumn(...)` appends a synthetic metrics column. The default id is `__rowRenderMetric`.
- `NatRenderMetricsFilter` writes a column filter for the metrics column and resets pagination to the first page.
- `NatTableRenderMetricsStore.measurement()` summarizes the latest completed render cycle on the current page.
- `NatTableRenderMetricsStore.rowMetric(rowId)` returns the latest metric for an individual row.

## Migration

If you are upgrading from the previous all-in-one `NatTable`:

- `NatTable` is now intentionally barebones.
- Search, column visibility, page-size, pager, sort buttons, pin buttons, and surface styling moved out of core.
- `showPagination` was replaced by `enablePagination`.
- `enablePagination` now defaults to `false`.
- `pageSizeOptions`, `searchLabel`, `searchPlaceholder`, and `showColumnVisibility` were removed from `NatTable`.
- Wrap columns with `withNatTableHeaderActions(...)` if you still want built-in sort or pin buttons.

## Repo Scripts

```bash
npm run test:packages
npm run build:packages
npm run build:showcase
npm run pack:dry-run
npm run verify
```
