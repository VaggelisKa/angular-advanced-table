# angular-advanced-table

Signals-first Angular workspace for composable TanStack Table primitives.

## Documentation Map

This README is the canonical workspace reference. Package READMEs stay intentionally small and point back here for behavior, API shape, and composition rules.

| Package                   | Use it for                           | Main exports                                                                                                                           |
| ------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `ng-advanced-table`       | Core table primitive                 | `NatTable`, `NatTableState`, `NatTableColumnMeta`                                                                                      |
| `ng-advanced-table-ui`    | Optional controls and header actions | `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, `withNatTableHeaderActions(...)` |
| `ng-advanced-table-utils` | Optional render-metrics tooling      | `NatTableRenderMetricsStore`, `NatRenderMetricsPanel`, `NatRenderMetricsFilter`, `withRenderMetricsColumn(...)`                        |

Supplemental package READMEs:

- [`projects/ng-advanced-table/README.md`](projects/ng-advanced-table/README.md)
- [`projects/ng-advanced-table-ui/README.md`](projects/ng-advanced-table-ui/README.md)
- [`projects/ng-advanced-table-utils/README.md`](projects/ng-advanced-table-utils/README.md)

Angular 21+ apps can consume these packages with or without `zone.js`. The workspace validates them in zoneless tests and in the showcase app.

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
    meta: { label: 'Symbol', rowHeader: true },
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

`NatTable` is the core primitive. It renders the semantic grid, owns TanStack state integration, and exposes a stable controller surface for optional companion UI.

It does not ship search UI, column visibility UI, page-size UI, pager UI, header action buttons, or surface styling. Use `ng-advanced-table-ui` for those pieces and `ng-advanced-table-utils` for render instrumentation.

Example, core only:

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';

interface ServiceRow {
  id: string;
  service: string;
  latencyMs: number;
}

@Component({
  selector: 'app-service-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable],
  template: ` <nat-table [data]="rows()" [columns]="columns" ariaLabel="Service latency" /> `,
})
export class ServiceTableComponent {
  readonly rows = signal<readonly ServiceRow[]>([]);
  readonly columns: ColumnDef<ServiceRow>[] = [
    {
      accessorKey: 'service',
      header: 'Service',
      meta: { label: 'Service', rowHeader: true },
    },
    {
      accessorKey: 'latencyMs',
      header: 'Latency',
      meta: { label: 'Latency', align: 'end' },
      cell: (context) => `${context.getValue<number>()} ms`,
    },
  ];
}
```

Core exports:

- Component: `NatTable`
- Common types: `NatTableState`, `NatTableVirtualizationOptions`, `NatTableColumnMeta`, `NatTableRowRenderedEvent`, `NatTableCellTone`, `NatTableSortDirection`, `NatTableSortIndicatorContext`
- Accessibility types: `NatTableAccessibilityText`, `NatTableAccessibilitySummaryContext`, `NatTableAccessibilitySortingAnnouncementContext`, `NatTableAccessibilityFilteringAnnouncementContext`, `NatTableAccessibilityColumnVisibilityAnnouncementChange`, `NatTableAccessibilityColumnVisibilityAnnouncementContext`, `NatTableAccessibilityPaginationAnnouncementContext`, `NatTableAccessibilityColumnReorderAnnouncementContext`

## Core API

### Inputs

| Input                  | Default                             | Notes                                                                   |
| ---------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `data`                 | required                            | Row array rendered by the table                                         |
| `columns`              | required                            | TanStack `ColumnDef<TData>[]`                                           |
| `ariaLabel`            | required                            | Accessible name for the table region                                    |
| `ariaDescription`      | `''`                                | Extra description announced with the grid                               |
| `keyboardInstructions` | built-in text                       | Screen-reader instructions for cell navigation                          |
| `accessibilityText`    | `{}`                                | Overrides summaries and live announcements                              |
| `enableGlobalFilter`   | `true`                              | Enables the global filter pipeline                                      |
| `allowColumnPinning`   | `true`                              | Enables sticky pinning where columns allow it                           |
| `allowColumnReorder`   | `false`                             | Enables drag/drop and keyboard reordering                               |
| `enablePagination`     | `false`                             | Enables the pagination row model                                        |
| `virtualization`       | `null`                              | Enables CDK-backed fixed-size body-row virtualization with an auto-capped viewport |
| `emptyStateLabel`      | `'No rows match the current view.'` | Empty-state copy                                                        |
| `globalFilterFn`       | built-in filter                     | Replaces the generic global filter                                      |
| `initialState`         | `{}`                                | Uncontrolled initial state, read once                                   |
| `state`                | `{}`                                | Controlled slices only; omitted slices stay internal                    |
| `getRowId`             | row index                           | Stable row id resolver for actions and metrics                          |
| `emitRowRenderEvents`  | `false`                             | Enables `(rowRendered)` instrumentation                                 |
| `enableAnnouncements`  | `true`                              | Enables polite live announcements                                       |

### Outputs and instance API

| API                | Type                       | Notes                                                             |
| ------------------ | -------------------------- | ----------------------------------------------------------------- |
| `(stateChange)`    | `NatTableState`            | Emits the full next state                                         |
| `(rowRendered)`    | `NatTableRowRenderedEvent` | Emits per-row timings when instrumentation is enabled             |
| `table`            | `Table<TData>`             | Raw TanStack instance for reads and advanced commands             |
| `patchState(...)`  | method                     | Applies partial state updaters while respecting controlled slices |
| `tableElementId()` | method                     | Returns the generated table region id                             |

### `NatTableState`

| Slice              | Meaning                                    |
| ------------------ | ------------------------------------------ |
| `sorting`          | Active single-column sort                  |
| `globalFilter`     | Current global search query                |
| `columnFilters`    | TanStack column filters keyed by column id |
| `columnVisibility` | Visibility map for hideable columns        |
| `columnOrder`      | Leaf-column order                          |
| `columnPinning`    | Left and right pinned column ids           |
| `pagination`       | Page index and page size                   |

### `NatTableColumnMeta`

Attach metadata through `columnDef.meta`:

| Field       | Type                                                                      | Purpose                                                        |
| ----------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `label`     | `string`                                                                  | Stable human-readable label for accessibility and companion UI |
| `align`     | `'start' \| 'end'`                                                        | Cell and header alignment                                      |
| `rowHeader` | `boolean`                                                                 | Marks body cells in the column as row headers                  |
| `cellTone`  | `(context) => 'positive' \| 'negative' \| 'neutral' \| 'warning' \| null` | Maps a cell to a semantic tone                                 |

### Behavior rules

- A slice is controlled only when that property is present in `state`.
- Global filter and column-filter updates reset `pagination.pageIndex` to `0`.
- Reordering stays inside the current pinning zone. It does not move columns between left, center, and right groups.
- `virtualization` uses Angular CDK scrolling primitives with a fixed row height and mounts at most `maxRenderedRows` body rows at once. The default cap is `50`.
- `emitRowRenderEvents` is opt-in because it installs per-row render instrumentation.
- `enableAnnouncements` is on by default so sort, filter, visibility, and pagination changes are announced.

### Virtualization

Use `virtualization` when the current row model can grow large enough that you do not want every body row mounted at once.

```ts
readonly virtualization = {
  maxRenderedRows: 50,
};
```

```html
<nat-table
  [data]="rows()"
  [columns]="columns"
  [virtualization]="virtualization"
  ariaLabel="Orders"
/>
```

Notes:

- The body viewport is powered by Angular CDK virtual scrolling and auto-caps itself to the virtual row budget, so a `pageSize` of `100` still mounts only about `50` body rows by default.
- Rows should stay at a consistent height. If your table uses a taller custom row layout, pass `rowHeight`.

## Accessibility Text Overrides

Use `accessibilityText` when the built-in English summaries or live announcements do not match your product language or terminology. The available keys are:

- `reorderKeyboardInstructions`
- `tableSummary(...)`
- `sortingChange(...)`
- `filteringChange(...)`
- `columnVisibilityChange(...)`
- `pageSizeChange(...)`
- `pageChange(...)`
- `columnReorder(...)`

```ts
import type { NatTableAccessibilityText } from 'ng-advanced-table';

readonly accessibilityText: NatTableAccessibilityText = {
  reorderKeyboardInstructions: 'Use Alt+Shift+Arrow keys to move columns.',
  tableSummary: ({ visibleRowsText, totalRowsText, pageText, pageCountText }) =>
    `${visibleRowsText} of ${totalRowsText} rows visible. Page ${pageText} of ${pageCountText}.`,
  filteringChange: ({ query, visibleRowsText }) => `Filter ${query}. ${visibleRowsText} rows visible.`,
  sortingChange: ({ columnLabel, sortState }) => `${columnLabel} sorted ${sortState}.`,
};
```

The formatter contexts already expose locale-formatted numbers and semantic state labels, so most consumers only need to replace copy rather than recompute table state.

## Custom Cell Components

Use `flexRenderComponent(...)` from `@tanstack/angular-table` when a cell should render an Angular component instead of plain text.

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { flexRenderComponent, type ColumnDef } from '@tanstack/angular-table';

interface PositionRow {
  id: string;
  symbol: string;
}

@Component({
  selector: 'app-position-actions-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" (click)="trade.emit(row().id)">Trade</button>`,
})
export class PositionActionsCell {
  readonly row = input.required<PositionRow>();
  readonly trade = output<string>();
}

readonly columns: ColumnDef<PositionRow>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    meta: { label: 'Symbol', rowHeader: true },
    cell: (context) => context.getValue<string>(),
  },
  {
    id: 'actions',
    header: 'Actions',
    meta: { label: 'Actions', align: 'end' },
    enableSorting: false,
    enableGlobalFilter: false,
    cell: (context) =>
      flexRenderComponent(PositionActionsCell, {
        inputs: { row: context.row.original },
        outputs: { trade: (id) => this.placeTrade(id) },
      }),
  },
];
```

Guidelines:

- Keep data loading, mutations, dialogs, and table state in the container. Treat the cell component as a presentational leaf that emits intent.
- Set `meta.label` whenever the header is not a plain string so accessibility text and companion UI still have a stable label.
- Row menus are intentionally consumer-defined. Build them as normal cell renderers, typically with Angular CDK menu primitives and `ngGridCellWidget` on the trigger.

## UI Package

`ng-advanced-table-ui` provides small companion controls that compose around any `NatTableUiController<TData>`. `<nat-table #grid="natTable">` already satisfies that contract.

Example, add stock controls around an existing table:

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

<nat-table-surface>
  <nat-table-search [for]="grid" />
  <nat-table-column-visibility [for]="grid" />
  <nat-table-page-size [for]="grid" [pageSizeOptions]="[25, 50, 100]" />
  <nat-table-pager [for]="grid" />
</nat-table-surface>
```

UI exports:

- Components: `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`
- Helpers and contracts: `withNatTableHeaderActions(...)`, `NatTableHeaderActionsOptions`, `NatTableSortIndicatorContent`, `NatTableUiController`, `NatTableUiState`
- Shared types: `NatTableColumnMeta`, `NatTableSortDirection`, `NatTableSortIndicatorContext`, `NatTableAccessibilityPageSizeOptionContext`, `NatTableAccessibilityPageSizeLabels`, `NatTableAccessibilityPagerContext`, `NatTableAccessibilityPagerLabels`, `NatTableAccessibilityColumnVisibilitySummaryContext`, `NatTableAccessibilityColumnVisibilityActionContext`, `NatTableAccessibilityColumnVisibilityStateContext`, `NatTableAccessibilityColumnVisibilityLabels`, `NatTableAccessibilityHeaderActionMenuContext`, `NatTableAccessibilityHeaderActionSortContext`, `NatTableAccessibilityHeaderActionPinContext`, `NatTableAccessibilityHeaderActionLabels`

| API                              | Purpose                                                        | Key inputs or options                                        |
| -------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| `NatTableSurface`                | Layout wrapper and default `--nat-table-*` CSS variables       | none                                                         |
| `NatTableSearch`                 | Global filter input                                            | `for`, `label`, `placeholder`                                |
| `NatTableColumnVisibility`       | Toggle hideable columns                                        | `for`, `label`, `ariaLabel`, `accessibilityLabels`           |
| `NatTablePageSize`               | Chip-based page-size switcher                                  | `for`, `pageSizeOptions`, `ariaLabel`, `accessibilityLabels` |
| `NatTablePager`                  | Previous/next pagination control                               | `for`, `ariaLabel`, `accessibilityLabels`                    |
| `withNatTableHeaderActions(...)` | Wraps header content with a built-in sort control and pin menu | `sortIndicator`, `accessibilityLabels`                       |

Controller contract required by the UI package:

- `table: Table<TData>`
- `enableGlobalFilter(): boolean`
- `enablePagination(): boolean`
- `patchState(...)`
- `tableElementId(): string`

Notes:

- `NatTableSearch` is only useful when `enableGlobalFilter` is enabled. That is the core default.
- `NatTablePageSize` and `NatTablePager` assume `enablePagination` is enabled.
- `NatTableSurface` owns the default `--nat-table-*` CSS variables that used to live in core.
- `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, and `NatTablePager` are intentionally small wrappers over the controller contract.
- `withNatTableHeaderActions(...)` preserves the original header content and only adds controls when the underlying column supports sorting or pinning, including a compact three-dot menu for left and right pin actions.

## Accessibility Label Overrides

The UI package exposes copy overrides without forcing you to rebuild controller state:

- `NatTablePageSize`: `NatTableAccessibilityPageSizeLabels`
- `NatTablePager`: `NatTableAccessibilityPagerLabels`
- `NatTableColumnVisibility`: `NatTableAccessibilityColumnVisibilityLabels`
- `withNatTableHeaderActions(...)`: `NatTableAccessibilityHeaderActionLabels`
- `NatTableSearch`: use `label` and `placeholder`

```ts
readonly pagerLabels = {
  groupAriaLabel: 'Pagination',
  previousPageAriaLabel: 'Previous page',
  nextPageAriaLabel: 'Next page',
  pageIndicator: ({ pageText, pageCountText }) => `Page ${pageText} of ${pageCountText}`,
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
    menuButton: ({ label }) => `Kolonnehandlinger for ${label}`,
    pinButton: ({ label, toggleAction, pinSide }) =>
      `${toggleAction === 'unpin' ? 'Frigør' : 'Fastgør'} kolonne ${label} ${
        toggleAction === 'unpin' ? 'fra' : 'til'
      } ${pinSide === 'left' ? 'venstre' : 'højre'}`,
    pinButtonText: ({ pinSide }) => (pinSide === 'left' ? 'Venstre' : 'Højre'),
  },
});
```

The label callbacks receive locale-formatted numbers and semantic states such as `toggleAction`, `visibilityState`, `sortState`, `pinState`, and `pinSide`.

## Utils Package

`ng-advanced-table-utils` currently ships render-metrics helpers for measuring row paint time and surfacing that data in the table.

Example, wire metrics into an existing table:

```ts
readonly metrics = new NatTableRenderMetricsStore();
readonly columns = withRenderMetricsColumn(baseColumns, this.metrics);
```

```html
<nat-table
  #grid="natTable"
  [data]="rows()"
  [columns]="columns"
  [emitRowRenderEvents]="true"
  ariaLabel="Render metrics demo"
  (rowRendered)="metrics.record($event)"
/>

<nat-render-metrics-panel [store]="metrics" />
<nat-render-metrics-filter [for]="grid" [store]="metrics" />
```

Utils exports:

- Core helpers: `NatTableRenderMetricsStore`, `NatRenderMetricsPanel`, `NatRenderMetricsFilter`, `withRenderMetricsColumn(...)`
- Contracts and options: `WithRenderMetricsColumnOptions`, `NatTableRenderMetricsController`, `NatTableRenderMetricsEvent`, `NatTableRenderMetricsState`
- Tone and filter helpers: `getRowRenderTone(...)`, `getRenderToneLabel(...)`, `isRenderFilterValue(...)`, `RENDER_FILTER_OPTIONS`, `RENDER_METRIC_COLUMN_ID`, `RowRenderFilterOption`, `RowRenderFilterValue`, `RowRenderMeasurement`, `RowRenderMetric`, `RowRenderTone`

| API                            | Purpose                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `NatTableRenderMetricsStore`   | Stores per-row timings, exposes `measurement()`, `rowMetrics()`, `rowMetric(rowId)`, `record(...)`, and `reset()` |
| `NatRenderMetricsPanel`        | Compact summary of the latest render cycle                                                                        |
| `NatRenderMetricsFilter`       | Chip group that filters the synthetic metrics column by tone                                                      |
| `withRenderMetricsColumn(...)` | Appends a synthetic metrics column to an existing `ColumnDef[]`                                                   |

### Render-metrics wiring

1. Create one `NatTableRenderMetricsStore`.
2. Enable `[emitRowRenderEvents]="true"` on `<nat-table>`.
3. Record each `(rowRendered)` event with `store.record($event)`.
4. Optionally wrap your columns with `withRenderMetricsColumn(...)`.
5. Render `NatRenderMetricsPanel` and `NatRenderMetricsFilter` against the same store.

## Migration

If you are upgrading from the earlier all-in-one `NatTable`:

- `NatTable` is now intentionally barebones.
- Search, column visibility, page-size, pager, sort controls, pin menu actions, and surface styling moved to `ng-advanced-table-ui`.
- `showPagination` was replaced by `enablePagination`.
- `enablePagination` now defaults to `false`.
- `pageSizeOptions`, `searchLabel`, `searchPlaceholder`, and `showColumnVisibility` were removed from `NatTable`.
- Wrap columns with `withNatTableHeaderActions(...)` if you want the stock sort control and pin menu.
