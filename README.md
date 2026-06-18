# angular-advanced-table

Signals-first Nx monorepo for composable Angular TanStack Table primitives.

## Documentation Map

This README is the canonical workspace reference. Package READMEs stay intentionally small and point back here for behavior, API shape, and composition rules. The `apps/showcase` project is the demo app, and publishable packages live under `libs/*`.

| Package                     | Use it for                                           | Main exports                                                                                                                                                                                        |
| --------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ng-advanced-table`         | Core table primitive                                 | `NatTable`, `NatTableState`, `NatTableColumnMeta`, `NAT_TABLE_DATA_STATUS`                                                                                                                          |
| `ng-advanced-table-ui`      | Optional controls, header actions, and row selection | `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, `NatTableScrollControl`, `withNatTableHeaderActions(...)`, `withNatTableSelectionColumn(...)` |
| `ng-advanced-table-utils`   | Optional render-metrics tooling                      | `NatTableRenderMetricsStore`, `NatRenderMetricsPanel`, `NatRenderMetricsFilter`, `withRenderMetricsColumn(...)`                                                                                     |
| `ng-advanced-table-locales` | Built-in locale registry                             | `provideNatTableLocales(...)`, `provideNatTableUiLocales(...)`, `provideNatTableUtilsLocales(...)`                                                                                                  |

The workspace keeps shared table contracts aligned through the private `ng-advanced-table-types` library. Consumers should import public contracts from published packages only; prefer `ng-advanced-table` for `NatTableColumnMeta`, `NatTableState`, `NatTableSortDirection`, and `NatTableSortIndicatorContext` when column definitions or state move across package boundaries. The UI and utils packages keep compatibility exports for consumers already importing from those entry points.

- **[Accessibility](ACCESSIBILITY.md)** — customize screen reader summaries and UI companion labels (`accessibilityText`, `accessibilityLabels`).

Supplemental package READMEs:

- [`libs/ng-advanced-table/README.md`](libs/ng-advanced-table/README.md)
- [`libs/ng-advanced-table-ui/README.md`](libs/ng-advanced-table-ui/README.md)
- [`libs/ng-advanced-table-utils/README.md`](libs/ng-advanced-table-utils/README.md)
- [`libs/ng-advanced-table-locales/README.md`](libs/ng-advanced-table-locales/README.md)

Consumer theming guide:

- [`THEMING.md`](THEMING.md)

Documentation maintenance checklist:

- When a public export changes, update this package map, the matching package README public export list, and the API table for that package.
- When accessibility or localization inputs change, update the machine-readable API map in [`ACCESSIBILITY.md`](ACCESSIBILITY.md).
- When recommended composition changes, keep the examples in this README, package READMEs, and [`THEMING.md`](THEMING.md) in sync.

Angular 21+ apps can consume these packages with or without `zone.js`. The workspace validates them in zoneless tests and in the showcase app.

## Install

### Core only

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

### Core and UI

```bash
npm install ng-advanced-table ng-advanced-table-ui @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

### Core, UI, and utils

```bash
npm install ng-advanced-table ng-advanced-table-ui ng-advanced-table-utils @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

### With built-in locale registry

```bash
npm install ng-advanced-table ng-advanced-table-ui ng-advanced-table-utils ng-advanced-table-locales @tanstack/angular-table @angular/common @angular/aria @angular/cdk
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
  NatTableScrollControl,
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
    size: 96,
    minSize: 80,
    meta: { label: 'Symbol', rowHeader: true },
    cell: (context) => context.getValue<string>(),
  },
  {
    accessorKey: 'desk',
    header: 'Desk',
    maxSize: 160,
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
    NatTableScrollControl,
    NatTableSearch,
    NatTableSurface,
  ],
  template: `
    <nat-table-surface>
      <nat-table
        #grid="natTable"
        [data]="rows()"
        [columns]="columns"
        [initialState]="initialState"
        [enablePagination]="true"
        [getRowId]="getRowId"
        accessibleName="Open positions"
      />

      <nat-table-scroll-control />
      <nat-table-search />
      <nat-table-column-visibility />
      <nat-table-page-size [pageSizeOptions]="[25, 50, 100]" />
      <nat-table-pager />
    </nat-table-surface>
  `,
})
export class PositionsTableComponent {
  readonly rows = signal<PositionRow[]>([]);
  readonly columns = columns;
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
  template: ` <nat-table [data]="rows()" [columns]="columns" accessibleName="Service latency" /> `,
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
- Common constants and types: `NAT_TABLE_DATA_STATUS`, `NAT_TABLE_BODY_STATE`, `NatTableState`, `NatTableDataStatus`, `NatTableRowIdGetter`, `NatTableRowActivateEvent`, `NatTableColumnMeta`, `NatTableRowRenderedEvent`, `NatTableCellTone`, `NatTableSortDirection`, `NatTableSortIndicatorContext`
- Accessibility: `NatTableAccessibilityText` at the package root; deep formatter context types live under the `NatTableA11y` namespace (for example `NatTableA11y.NatTableAccessibilitySummaryContext`).

## Core API

### Inputs

| Input                 | Default      | Notes                                                                                                                  |
| --------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `data`                | required     | Row array rendered by the table                                                                                        |
| `columns`             | required     | TanStack `ColumnDef<TData>[]`                                                                                          |
| `accessibleName`      | required     | Accessible name for the grid when no visible `caption` is rendered                                                     |
| `caption`             | `undefined`  | Visible table caption; when present, it provides the grid's accessible name                                            |
| `accessibilityText`   | `{}`         | Overrides for description, keyboard instructions, state-row copy, and announcements                                    |
| `dataStatus`          | `'success'`  | Data lifecycle status: `'loading'`, `'error'`, or `'success'`                                                          |
| `error`               | `null`       | Optional error payload passed to `natTableError` templates                                                             |
| `enableGlobalFilter`  | `true`       | Enables the global filter pipeline                                                                                     |
| `enableColumnPinning` | `true`       | Enables sticky pinning where columns allow it                                                                          |
| `enableColumnReorder` | `false`      | Enables drag/drop and keyboard reordering with Ctrl+Shift+Left/Right Arrow, or Command+Shift+Left/Right Arrow on macOS |
| `enablePagination`    | `false`      | Enables the pagination row model                                                                                       |
| `enableRowSelection`  | `false`      | Enables row selection: `aria-selected`, the `rowSelection` state slice, and the companion checkbox column              |
| `selectionMode`       | `'multiple'` | Selection cardinality when enabled: `'multiple'` or `'single'` (single keeps the first selected row by key order)      |
| `globalFilterFn`      | built-in     | Replaces the generic global filter                                                                                     |
| `initialState`        | `{}`         | Uncontrolled initial state, read once                                                                                  |
| `state`               | `{}`         | Controlled slices only; omitted slices stay internal                                                                   |
| `getRowId`            | row index    | Stable row id resolver (`NatTableRowIdGetter`); optional third argument matches TanStack's parent row when present     |
| `emitRowRenderEvents` | `false`      | Enables `(rowRendered)` instrumentation                                                                                |
| `enableAnnouncements` | `true`       | Enables polite live announcements                                                                                      |
| `stickyHeader`        | `true`       | Enables vertical sticky positioning for the table header row                                                           |

A visible `caption` takes over the rendered grid label, while `accessibleName` remains the required captionless fallback.

### Outputs and instance API

| API                        | Type                              | Notes                                                                                                                                                |
| -------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `(stateChange)`            | `NatTableState`                   | Emits the full next state on every update; prefer granular outputs when only one slice is controlled                                                 |
| `(sortingChange)`          | `SortingState`                    | Emits when only the sorting slice actually changed                                                                                                   |
| `(globalFilterChange)`     | `string`                          | Emits when only the global filter slice actually changed                                                                                             |
| `(columnFiltersChange)`    | `ColumnFiltersState`              | Emits when only the column filters slice actually changed                                                                                            |
| `(columnVisibilityChange)` | `VisibilityState`                 | Emits when only the column visibility slice actually changed                                                                                         |
| `(columnOrderChange)`      | `ColumnOrderState`                | Emits when only the column order slice actually changed                                                                                              |
| `(columnPinningChange)`    | `ColumnPinningState`              | Emits when only the column pinning slice actually changed                                                                                            |
| `(paginationChange)`       | `PaginationState`                 | Emits when only the pagination slice actually changed                                                                                                |
| `(rowSelectionChange)`     | `RowSelectionState`               | Emits when only the row selection slice actually changed                                                                                             |
| `(rowActivate)`            | `NatTableRowActivateEvent<TData>` | Emits when a body row is activated through a primary click or `Enter` / `Space` key press; activations from interactive cell descendants are ignored |
| `(rowRendered)`            | `NatTableRowRenderedEvent`        | Emits per-row timings when instrumentation is enabled                                                                                                |
| `table`                    | `Table<TData>`                    | Raw TanStack instance for reads and advanced commands                                                                                                |
| `patchState(...)`          | method                            | Applies partial state updaters while respecting controlled slices                                                                                    |
| `tableElementId`           | `Signal<string>`                  | Read-only signal holding the generated `<table>` element id (use `tableElementId()` in templates and `aria-controls` bindings)                       |

The granular `*Change` outputs only fire when the corresponding slice differs from the previous emission, so binding to a single output (for example `(paginationChange)`) avoids the equality work that `(stateChange)` typically requires.

### State ownership patterns

Most tables should start uncontrolled: omit `[state]`, pass `[initialState]` only for defaults such as the first page size, and let `NatTable` plus companion controls manage sorting, filters, visibility, pagination, pinning, and order internally.

Use granular outputs when your application owns one slice. Pass only the slice you control back through `[state]`; omitted properties remain internal:

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { type ColumnDef, type ColumnFiltersState } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

interface OrderRow {
  id: string;
  status: string;
  total: number;
}

@Component({
  selector: 'app-filtered-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [state]="controlledState()"
      accessibleName="Filtered orders"
      (columnFiltersChange)="columnFilters.set($event)"
    />
  `,
})
export class FilteredOrdersTableComponent {
  readonly rows = signal<OrderRow[]>([]);
  readonly columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status', rowHeader: true },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      meta: { label: 'Total', align: 'end' },
      cell: (context) => `$${context.getValue<number>().toFixed(2)}`,
    },
  ];
  readonly columnFilters = signal<ColumnFiltersState>([{ id: 'status', value: 'open' }]);
  readonly controlledState = computed<Partial<NatTableState>>(() => ({
    columnFilters: this.columnFilters(),
  }));
}
```

Use `(stateChange)` when you need a complete-state snapshot for logging, persistence, or deliberately controlling the entire normalized table state. `(stateChange)` emits a full `NatTableState` on every update; if you assign that event to the same signal used by `[state]`, every emitted property becomes controlled after the first update.

### `NatTableState`

| Slice              | Meaning                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sorting`          | Active single-column sort                                                                                                                                                                                       |
| `globalFilter`     | Current global search query                                                                                                                                                                                     |
| `columnFilters`    | TanStack column filters keyed by column id                                                                                                                                                                      |
| `columnVisibility` | Visibility map for hideable columns                                                                                                                                                                             |
| `columnOrder`      | Leaf-column order                                                                                                                                                                                               |
| `columnPinning`    | Left and right pinned column ids                                                                                                                                                                                |
| `rowSelection`     | Selected row ids keyed by `getRowId` as `Record<string, boolean>`; only populated when `enableRowSelection` is `true`                                                                                           |
| `pagination`       | Page index and page size (still present in `NatTableState` when `enablePagination` is `false`; the client-side pagination row model is off, so only `stateChange` / UI that reads `pagination` will reflect it) |

The `pagination` slice always exists so controlled and uncontrolled code paths stay stable. When `enablePagination` is `false`, `pageIndex` / `pageSize` still update with defaults and filter-driven resets, but the table body is not paginated until you opt in.

### `NatTableColumnMeta`

Prefer the canonical import when metadata is shared across packages:

```ts
import type { NatTableColumnMeta } from 'ng-advanced-table';
```

`ng-advanced-table-ui` and `ng-advanced-table-utils` expose matching compatibility types for consumers already importing from those packages.

Attach metadata through `columnDef.meta`:

| Field               | Type                                                                      | Purpose                                                                        |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `label`             | `string?`                                                                 | Stable human-readable label for accessibility and companion UI                 |
| `hiddenHeaderLabel` | `string?`                                                                 | Visually hidden header label for utility columns with redundant visible titles |
| `align`             | `'start' \| 'end'`                                                        | Cell and header alignment                                                      |
| `rowHeader`         | `boolean`                                                                 | Marks body cells in the column as row headers                                  |
| `cellTone`          | `(context) => 'positive' \| 'negative' \| 'neutral' \| 'warning' \| null` | Maps a cell to a semantic tone                                                 |
| `cellHeight`        | `number \| string`                                                        | Optional body-cell height in pixels or any CSS length                          |
| `cellMaxLines`      | `number`                                                                  | Maximum body-cell content lines before truncation; defaults to `2`             |
| `headerSize`        | `number \| string`                                                        | Optional header-only width in pixels                                           |
| `headerMinSize`     | `number \| string`                                                        | Optional header-only minimum width in pixels                                   |
| `headerMaxSize`     | `number \| string`                                                        | Optional header-only maximum width in pixels                                   |

Set `hiddenHeaderLabel: 'Row actions'` for compact utility columns whose title would be redundant visually, such as row actions or menu columns. The table renders that value as screen-reader-only header text even when the header is supplied by a function or component. When the column is wrapped with `withNatTableHeaderActions(...)`, only the header label is visually hidden; sort buttons and the three-dot column actions menu stay visible and use `hiddenHeaderLabel` for their generated accessible labels.

Body cell content is clamped to two lines by default. Use `cellHeight` to make a column's body cells fixed-height, set `cellMaxLines` to a different line count, or set `cellMaxLines: Infinity` for columns with custom interactive renderers that should not be line-clamped. Invalid explicit `cellMaxLines` values fall back to two lines.

### Column sizing and pinned offsets

`NatTable` uses TanStack column sizing fields for **body cells** only:

- `size` — preferred body cell width in pixels (rendered as CSS `width`).
- `minSize` — applies a CSS `min-width` to body cells in pixels.
- `maxSize` — caps body cells with CSS `max-width` in pixels.

Column headers size from their content by default. To constrain a header independently, set optional `meta.headerSize`, `meta.headerMinSize`, or `meta.headerMaxSize` on the column definition.

Use one body sizing model per column:

- Fixed width: set `size`. Body content ellipsizes at that width unless `maxSize` permits a wider cell.
- Minimum width: set `minSize`, with or without `size`.
- Maximum width: set `maxSize` and leave `size` unset when the browser should size body cells from content up to that cap.
- Intrinsic width: leave `size`, `minSize`, and `maxSize` unset. Body cells size from content.

Pinned column offsets are based on measured header widths after layout. Before a measurement exists, the fallback is:

- `size` for fixed-width columns.
- `column.getSize()` for `maxSize` columns, intrinsic columns, SSR, jsdom, and the first paint before `ResizeObserver` reports real widths.

### Column resizing

Resizing is **opt-in per column**, not table-wide. Set `enableResizing: true` on the columns that should expose a drag handle and leave it off (the default) for columns that should stay fixed — the same per-column model as sorting, filtering, and pinning.

```ts
const columns: ColumnDef<Row>[] = [
  // resizable: handle + keyboard resize, bounded by minSize/maxSize
  { accessorKey: 'name', header: 'Name', enableResizing: true, minSize: 120, maxSize: 320, meta: { label: 'Name' } },
  // not resizable (no handle)
  { accessorKey: 'id', header: 'ID', meta: { label: 'ID' } },
];
```

Configure the width model with `columnSizingMode` on `<nat-table-surface>`:

- `columnSizingMode="fill"` (the default) stretches columns to fill the container. Resizing a column is pixel-exact: the other columns reflow to absorb the change (down to their `minSize`), so the table stays exactly as wide as its region — it never overflows or leaves a gap, and a column can only grow into the space the others can yield.
- `columnSizingMode="fixed"` makes column widths authoritative (`table-layout: fixed`) and scrolls the region horizontally once the columns overflow. Use it when columns should keep exact pixel widths independent of the container.
- `columnResizeMode="onEnd"` (the default) commits the new width on pointer release; `"onChange"` updates live during the drag.

`minSize`/`maxSize` bound how far a column can be resized in either mode, and a drag is additionally capped to the visible region so the table never overflows. A column that does not declare `minSize` cannot be resized below a 48px default floor (twice the resize-handle hit target), so the handle stays grabbable and neighbours never collapse to a sliver; set an explicit `minSize` to choose a different lower bound. Width changes flow through the `columnSizing` state slice and the granular `columnSizingChange` output, and are mirrored to body cells so headers and cells stay aligned. Keyboard resizing (RTL-aware) lives on the column header — there is no separate tab stop: focus a header, then `Alt`+Left/Right Arrow to step the width and `Alt`+Home/End to jump to its min/max bound.

### Behavior rules

- A slice is controlled **only** when its property is _present_ in `state`, even if the value is an empty array or empty record. Omitted properties stay uncontrolled and are managed internally.
- `initialState` is a one-time seed read on the first render; once a slice is also controlled through `state`, the seed for that slice is ignored.
- Global filter and column-filter updates reset `pagination.pageIndex` to `0`.
- Reordering stays inside the current pinning zone. It does not move columns between left, center, and right groups.
- Keyboard reordering uses Ctrl+Shift+Left Arrow and Ctrl+Shift+Right Arrow on the focused column header. On macOS, use Command+Shift+Left Arrow and Command+Shift+Right Arrow.
- Drag/drop column reordering needs a non-drag pointer alternative for WCAG 2.2 AA. `withNatTableHeaderActions(..., { enableColumnPinActions: false, enableColumnReorderActions: true })` provides this through Move left and Move right menu items without pin actions. Custom header menus should expose equivalent click/tap controls and call `headerContext.table.options.meta?.natTableMoveColumn?.(column.id, direction)`, where `direction` is `'left'` or `'right'`, disabling unavailable actions with `natTableCanMoveColumn`.
- `(rowActivate)` ignores activations whose target sits inside an interactive cell descendant — `<a href>`, `<button>`, form controls, `<summary>`, `contenteditable`, or elements with `role="button" | "link" | "checkbox" | "menuitem" | "tab" | "switch" | "combobox" | "textbox" | "searchbox"`. Use it for row-level navigation; keep cell-level controls inside cells.
- `emitRowRenderEvents` is opt-in because it installs per-row render instrumentation.
- `enableAnnouncements` is on by default so sort, filter, visibility, and pagination changes are announced.

### Loading, empty, and error states

`NatTable` owns the body-row structure for data lifecycle states, while consumers own fetching, retrying, and error classification. Pass `dataStatus="loading"` while initial data is unavailable or while retrying, `dataStatus="error"` when the table should show an error row, and keep the default `'success'` state after a successful request. Successful requests with no rows derive the empty body row. Loading with existing rows keeps those rows visible and sets `aria-busy="true"` for background refreshes.

The built-in state rows render as one body row with a single grid cell spanning all visible columns. Customize the content with template directives:

```ts
import {
  NAT_TABLE_DATA_STATUS,
  NatTable,
  NatTableEmptyTemplate,
  NatTableErrorTemplate,
  NatTableLoadingTemplate,
  type NatTableDataStatus,
} from 'ng-advanced-table';

@Component({
  imports: [NatTable, NatTableLoadingTemplate, NatTableEmptyTemplate, NatTableErrorTemplate],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [dataStatus]="dataStatus()"
      [error]="loadError()"
      accessibleName="Orders"
    >
      <ng-template natTableLoading>
        <app-table-skeleton />
      </ng-template>

      <ng-template natTableEmpty let-filtered="filtered">
        <app-empty-orders [filtered]="filtered" />
      </ng-template>

      <ng-template natTableError let-error>
        <app-table-error [error]="error" (retry)="reload()" />
      </ng-template>
    </nat-table>
  `,
})
export class OrdersTable {
  readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.loading);
}
```

Focusable controls inside `natTableLoading`, `natTableEmpty`, and `natTableError` templates are managed by `NatTable`; use normal buttons, links, and inputs. `ngGridCellWidget` is still needed for custom interactive controls rendered in ordinary data or header cells.

State rows use a short keyframe enter animation by default and respect `prefers-reduced-motion`. Override the motion with `--nat-table-state-transition-duration`, `--nat-table-state-transition-timing`, `--nat-table-state-transition-distance`, and `--nat-table-state-transition-opacity-from`, or set `--nat-table-state-transition-duration: 0ms` to disable visible motion.

## Accessibility and Internationalization

Accessible copy is split by ownership. Set table-specific copy such as `accessibleName`, `caption`, descriptions, and stable `columnDef.meta.label` values on the table or columns. Generated table copy has built-in English defaults and can be configured once with `provideNatTableLocales()` from `ng-advanced-table-locales`; UI and utils labels opt in through their companion locale entry points.

See [Accessibility and internationalization](ACCESSIBILITY.md) for the agent checklist, localization guidance, and examples.

`NatTableAccessibilityText` combines plain strings and formatter callbacks:

- `description` — supplemental description announced through `aria-describedby`
- `keyboardInstructions` — screen-reader instructions for grid navigation
- `emptyState` — visible message rendered when the current view contains no rows
- `loadingState` — visible message rendered while initial rows are loading
- `errorState` — visible message rendered when `dataStatus` is `'error'`
- `reorderKeyboardInstructions` — extra reorder instructions when reordering is enabled
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
  description: 'Sortable table of open positions, with sticky symbol column.',
  emptyState: 'No positions match the current filters.',
  loadingState: 'Loading positions.',
  errorState: 'Positions could not be loaded.',
  reorderKeyboardInstructions:
    'Use Control+Shift+Arrow keys to move columns. On macOS, use Command+Shift+Arrow keys.',
  tableSummary: ({ visibleRowsText, totalRowsText, pageText, pageCountText }) =>
    `${visibleRowsText} of ${totalRowsText} rows visible. Page ${pageText} of ${pageCountText}.`,
  filteringChange: ({ query, visibleRowsText }) => `Filter ${query}. ${visibleRowsText} rows visible.`,
  sortingChange: ({ columnLabel, sortState }) => `${columnLabel} sorted ${sortState}.`,
};
```

`description`, `keyboardInstructions`, `emptyState`, `loadingState`, and `errorState` accept any string (set `description` or `keyboardInstructions` to `''` to suppress them). Generated table copy has English defaults and can be localized through `provideNatTableLocales()` plus `<nat-table [locale]="localeId()">`. Formatter contexts expose locale-formatted numbers and semantic state labels. When you want explicit types for formatter arguments, import the `NatTableA11y` namespace (for example `NatTableA11y.NatTableAccessibilitySortingAnnouncementContext`).

## Custom Cell Components

Use `flexRenderComponent(...)` from `@tanstack/angular-table` when a cell should render an Angular component instead of plain text.

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { flexRenderComponent, type ColumnDef } from '@tanstack/angular-table';

import { CustomTradeButton } from './custom-trade-button';

interface PositionRow {
  id: string;
  symbol: string;
}

@Component({
  selector: 'app-position-actions-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CustomTradeButton],
  template: `
    <custom-trade-button
      [accessibleName]="'Trade ' + row().symbol"
      (pressed)="trade.emit(row().id)"
    />
  `,
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
- Compose your own app or design-system components inside the cell; placeholder `custom-*` examples show where consumer UI belongs.
- Put `ngGridCellWidget` from `@angular/aria/grid` on the real focusable element. If the custom component renders the button, link, or input internally, apply it inside that component. If the custom host itself is focusable, apply it at the call site.
- Give icon-only buttons and ambiguous links a row-specific accessible name with `aria-label` or visible text.
- Use real interactive elements (`button`, `a[href]`, form controls, or accessible menu items from your UI library). Avoid clickable `<div>` and `<span>` content inside grid cells.
- `(rowActivate)` is for row-level primary actions only. It ignores events from interactive descendants; let cell widgets emit their own outputs for cell-level actions.
- Row menus are consumer-defined. Use your app's accessible menu primitive, and put `ngGridCellWidget` on the focusable trigger.

### Custom component accessibility

Most consumers should keep existing design-system or app components and adapt them at the cell boundary. The wrapper cell maps row data into custom-component inputs and custom outputs back to the container.

- The wrapper cell supplies row-specific labels and row ids.
- The custom component renders the real interactive element: button, anchor, input, menu trigger, or dialog trigger.
- The real focusable element gets `ngGridCellWidget`.
- The custom component owns normal accessibility behavior: names, disabled state, `aria-expanded`, menu keyboard behavior, focus return, and dialog focus management.

When the focusable element is inside the custom component, the component itself owns the grid widget marker:

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GridCellWidget } from '@angular/aria/grid';

@Component({
  selector: 'custom-pay-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GridCellWidget],
  template: `
    <button
      type="button"
      ngGridCellWidget
      [attr.aria-label]="accessibleName()"
      (click)="pressed.emit()"
    >
      Pay
    </button>
  `,
})
export class CustomPayButton {
  readonly accessibleName = input.required<string>();
  readonly pressed = output<void>();
}
```

For row action menus, keep the menu implementation in the consumer app:

```html
<custom-row-actions-menu
  [row]="row()"
  [accessibleName]="'Open actions for ' + row().name"
  (action)="action.emit($event)"
/>
```

That menu can use CDK Menu, a design-system menu, or another accessible implementation. It should provide the trigger name, roles, keyboard navigation, focus return, and dismiss behavior. The table-specific part is still `ngGridCellWidget` on the focusable trigger.

For dialog triggers, let the container open the dialog so focus management, async state, and errors stay outside the cell. The custom trigger should only emit intent.

For expand controls, pass the current state into the custom component and expose it on the real control with `aria-expanded` and a row-specific name:

```html
<custom-expand-button
  [expanded]="expanded()"
  [accessibleName]="(expanded() ? 'Collapse ' : 'Expand ') + row().name"
  (pressed)="toggle.emit(row().id)"
/>
```

For navigation, use a custom link component only if it renders or hosts a real anchor with `href`. `NatTable` treats anchors with `href` as interactive descendants, so clicking the link does not emit `(rowActivate)`.

If a consuming app builds a cell entirely from scratch rather than composing an existing component, the same rules apply. Plain buttons, anchors, form controls, and accessible menu primitives work fine. Angular CDK Menu is a good option for a from-scratch menu, but it is not required by `NatTable`.

## Row Selection

Row selection is a core capability: `NatTable` owns the selection state, `aria-selected`, `aria-multiselectable`, and live announcements, while `ng-advanced-table-ui` provides the optional checkbox column through `withNatTableSelectionColumn(...)`. Selection is keyed by `getRowId`, so it composes correctly with sorting, filtering, and pagination.

Enable it with two core inputs plus the column helper:

| Input                | Default      | Purpose                                                               |
| -------------------- | ------------ | --------------------------------------------------------------------- |
| `enableRowSelection` | `false`      | Turns on selection state, `aria-selected`, and `aria-multiselectable` |
| `selectionMode`      | `'multiple'` | `'multiple'` for many rows, `'single'` to keep at most one selected   |

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type RowSelectionState } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableSelectionColumn } from 'ng-advanced-table-ui';

interface ServiceRow {
  id: string;
  name: string;
  category: string;
}

const columns = withNatTableSelectionColumn<ServiceRow>([
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name', rowHeader: true },
    cell: (context) => context.getValue<string>(),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    meta: { label: 'Category' },
    cell: (context) => context.getValue<string>(),
  },
]);

@Component({
  selector: 'app-selectable-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (rowSelectionChange)="onSelectionChange($event)">
      <nat-table
        [data]="rows()"
        [columns]="columns"
        [enableRowSelection]="true"
        selectionMode="multiple"
        [getRowId]="getRowId"
        accessibleName="Selectable services"
      />
    </nat-table-surface>
  `,
})
export class SelectableTableComponent {
  readonly rows = signal<ServiceRow[]>([]);
  readonly columns = columns;
  readonly tableState = signal<Partial<NatTableState>>({ rowSelection: {} });
  readonly getRowId = (row: ServiceRow) => row.id;

  protected onSelectionChange(rowSelection: RowSelectionState): void {
    this.tableState.update((state) => ({ ...state, rowSelection }));
  }
}
```

### `withNatTableSelectionColumn(columns, options?)`

Prepends a leading checkbox column. The header renders a select-all checkbox with an indeterminate partial state in multiple mode (or the plain column label in single mode); each body row renders a checkbox bound to that row's selection state.

| Option               | Default                        | Purpose                                               |
| -------------------- | ------------------------------ | ----------------------------------------------------- |
| `columnId`           | `'__natSelect'`                | Id for the generated column                           |
| `label`              | locale `selection.columnLabel` | Accessible and visible column label                   |
| `size`               | `48`                           | Column width in pixels (`minSize` is `44`)            |
| `enablePinning`      | `true`                         | Whether the column may be pinned                      |
| `selectAllAriaLabel` | locale default                 | `aria-label` for the select-all checkbox              |
| `selectRowAriaLabel` | locale formatter               | `(row) => string` `aria-label` for a per-row checkbox |

Generated English copy lives in `ng-advanced-table-locales`; pass options only to override the active locale. Like the other column helpers, apply selection before `withNatTableHeaderActions(...)` when composing: `withNatTableHeaderActions(withNatTableSelectionColumn(columns), options)`.

### Controlled, uncontrolled, and `getRowId`

- **`getRowId` is strongly recommended.** Selection is stored as a `Record<rowId, boolean>`. Without `getRowId` the row id falls back to the array index, so selection follows positions rather than rows and breaks under sorting, filtering, pagination, and live data updates. Provide a stable `getRowId` for correct selection.
- **Uncontrolled:** omit `rowSelection` from `[state]`; the table manages it internally and emits `(rowSelectionChange)`.
- **Controlled:** include `rowSelection` in `[state]`, for example to persist it to the URL. The selection slice follows the same controlled/uncontrolled rule as every other slice — a slice is controlled only when it is present in `state`.
- **Single mode** normalizes the selection to keep the first selected row by key order, so controlled callers can pass any selection map and read back a normalized one.

### Interactions

- **Pagination, sorting, and filtering:** selection is keyed by `getRowId`, not by visible position, so selected rows stay selected when you page, sort, or filter — even when they leave the current view. The header checkbox selects or clears all rows in the current row model.
- **Row activation:** the checkbox cell stops click propagation, so toggling a checkbox never fires `(rowActivate)`. Wire `(rowActivate)` for "open the row" behavior independently of selection.
- **Custom interactive cells:** selection only prepends one leading column and does not change how other cells render. Interactive descendants (links, buttons, menus) keep working, and `(rowActivate)` already ignores activations that originate inside interactive cell descendants.

### Bulk actions

There is no bundled bulk-action bar — build one from the emitted selection so labels, keyboard behavior, and disabled states stay under your control. Read the selected ids from `rowSelection`, map them back to rows through `getRowId`, and render your own count, clear, and action controls:

```ts
protected readonly selectedRows = computed(() => {
  const selection = this.tableState().rowSelection ?? {};
  return this.rows().filter((row) => selection[row.id]);
});

protected deleteSelected(): void {
  const selectedIds = new Set(Object.keys(this.tableState().rowSelection ?? {}));
  this.rows.update((rows) => rows.filter((row) => !selectedIds.has(row.id)));
  this.tableState.update((state) => ({ ...state, rowSelection: {} }));
}
```

The showcase `/selection` route demonstrates single and multiple modes, a live selected-row summary, and a bulk "delete selected" action.

### Accessibility

- Rows expose `aria-selected` only while `enableRowSelection` is `true`.
- The grid sets `aria-multiselectable="true"` only in multiple mode.
- Selection changes are announced through the table's polite live region.
- Checkbox labels resolve from the active UI locale; override them per call through the helper options when needed.

## UI Package

`ng-advanced-table-ui` provides small companion controls that compose around any `NatTableUiController<TData>`. `<nat-table #grid="natTable">` already satisfies that contract.

Example, add stock controls around an existing table:

```html
<nat-table-surface>
  <nat-table
    #grid="natTable"
    [data]="rows()"
    [columns]="columns"
    [enablePagination]="true"
    accessibleName="Orders"
  />

  <nat-table-scroll-control />
  <nat-table-search />
  <nat-table-column-visibility />
  <nat-table-page-size [pageSizeOptions]="[25, 50, 100]" />
  <nat-table-pager />
</nat-table-surface>
```

UI exports:

- Components: `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, `NatTablePagination`, `NatTableScrollControl`, `NatTableToolbar`, `NatToolbarGroup`, `NatToolbarItem`, `NatTableSelectionCheckbox`
- Helpers and contracts: `withNatTableHeaderActions(...)`, `withNatTableSelectionColumn(...)`, `NatTableHeaderActionsOptions`, `NatTableHeaderActionsColumnOptions`, `NatTableSelectionColumnOptions`, `NatTableSortIndicatorContent`, `NatTableUiController`, `NatTableUiState`
- Canonical aliases: `NatTableColumnMeta`, `NatTableSortDirection`, `NatTableSortIndicatorContext`
- Shared UI types: `NatTableAccessibilityPageSizeOptionContext`, `NatTableAccessibilityPageSizeLabels`, `NatTableAccessibilityPagerContext`, `NatTableAccessibilityPagerLabels`, `NatTableAccessibilityScrollControlPositionContext`, `NatTableAccessibilityScrollControlLabels`, `NatTableAccessibilityColumnVisibilitySummaryContext`, `NatTableAccessibilityColumnVisibilityActionContext`, `NatTableAccessibilityColumnVisibilityStateContext`, `NatTableAccessibilityColumnVisibilityLabels`, `NatTableAccessibilityHeaderActionMenuContext`, `NatTableAccessibilityHeaderActionSortContext`, `NatTableAccessibilityHeaderActionPinContext`, `NatTableAccessibilityHeaderActionMoveContext`, `NatTableAccessibilityHeaderActionLabels`, `NatTableColumnMoveDirection`

| API                                | Purpose                                                                   | Key inputs or options                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `NatTableSurface`                  | Layout wrapper and default `--nat-table-*` CSS variables                  | none                                                                                                                 |
| `NatTableSearch`                   | Global filter input                                                       | `for`, `label`, `placeholder`                                                                                        |
| `NatTableColumnVisibility`         | Toggle hideable columns                                                   | `for`, `label`, `groupAriaLabel`, `accessibilityLabels`                                                              |
| `NatTablePageSize`                 | Chip-based page-size switcher                                             | `for`, `pageSizeOptions`, `groupAriaLabel`, `accessibilityLabels`                                                    |
| `NatTablePager`                    | Previous/next pagination control                                          | `for`, `groupAriaLabel`, `accessibilityLabels`                                                                       |
| `NatTableScrollControl`            | Horizontal scroll buttons and range control                               | `for`, `groupAriaLabel`, `scrollStep`, `accessibilityLabels`                                                         |
| `withNatTableHeaderActions(...)`   | Wraps header content with a built-in sort control and column actions menu | `sortIndicator`, `enableColumnPinActions`, `enableColumnReorderActions`, `accessibilityLabels`, `meta.headerActions` |
| `withNatTableSelectionColumn(...)` | Prepends an accessible select-all and per-row checkbox column             | `label`, `size`, `enablePinning`, `selectAllAriaLabel`, `selectRowAriaLabel`                                         |

Controller contract required by the UI package:

- `table: Table<TData>`
- `enableGlobalFilter(): boolean`
- `enablePagination(): boolean`
- `patchState(...)`
- `tableElementId: Signal<string>`
- `tableScrollContainer?: Signal<HTMLElement | null>`
- `localeId?: Signal<string>`

Notes:

- `NatTableSearch` is only useful when `enableGlobalFilter` is enabled. That is the core default.
- `NatTablePageSize` and `NatTablePager` assume `enablePagination` is enabled.
- `NatTableScrollControl` binds to the controller's `tableScrollContainer` when available and falls back to the rendered table's parent element.
- `NatTableSurface` owns the default `--nat-table-*` CSS variables that used to live in core.
- `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, and `NatTableScrollControl` are intentionally small wrappers over the controller contract.
- `withNatTableHeaderActions(...)` preserves the original header content and only adds controls when the underlying column supports sorting, pinning, or opt-in menu-based reordering. The compact three-dot menu includes left/right pin actions when `enableColumnPinActions` is not disabled and pinning is available, and Move left/Move right actions when `enableColumnReorderActions` is enabled and the column can reorder inside its current pinned region.
- Set `column.meta.hiddenHeaderLabel` to visually hide a redundant header title while keeping that label available to assistive technology; wrapped header actions keep their controls visible.
- Applying `withNatTableHeaderActions(...)` repeatedly is safe. If a reactive column builder receives already-wrapped columns, the helper updates the wrapper options instead of nesting another header action surface.
- For per-column behavior, set `column.meta.headerActions` to `false` to opt out, or provide `{ sortIndicator, enableColumnPinActions, enableColumnReorderActions, accessibilityLabels }` to override the helper-level options for that column only.
- When composing with column helpers that add or prepend columns, apply those helpers first and then call `withNatTableHeaderActions(...)`, for example `withNatTableHeaderActions(withRenderMetricsColumn(columns, metricsStore), options)`.
- `withNatTableSelectionColumn(...)` prepends a leading checkbox column (select-all header with an indeterminate partial state in multiple mode, plus per-row checkboxes) and renders the internal `NatTableSelectionCheckbox`. Enable selection on the core table with `[enableRowSelection]="true"`, and compose it before `withNatTableHeaderActions(...)`, for example `withNatTableHeaderActions(withNatTableSelectionColumn(columns), options)`. See [Row Selection](#row-selection) for the full guide.

## UI Accessibility Labels

The optional UI controls inherit the controlled table locale through `[for]="grid"` and resolve generated labels from `provideNatTableUiLocales()`. Use `label`, `placeholder`, `groupAriaLabel`, and `accessibilityLabels` inputs only for instance-specific copy. Header sort, pin, and move labels are configured through `withNatTableHeaderActions(...)`; `NatTableAccessibilityHeaderActionLabels` covers the sort button, overflow trigger, opened column actions menu label, pin action labels, move action labels, and visible menu item text.

See [Accessibility and internationalization](ACCESSIBILITY.md#optional-ui-controls) for the full label surface.

## Utils Package

`ng-advanced-table-utils` currently ships render-metrics helpers for measuring row paint time and surfacing that data in the table.

Example, wire metrics into an existing table:

```ts
readonly metrics = new NatTableRenderMetricsStore();
readonly columns = withRenderMetricsColumn(baseColumns, this.metrics);
```

```html
<nat-table-surface>
  <nat-table
    #grid="natTable"
    [data]="rows()"
    [columns]="columns"
    [emitRowRenderEvents]="true"
    accessibleName="Render metrics demo"
    (rowRendered)="metrics.record($event)"
  />

  <nat-render-metrics-panel [store]="metrics" />
  <nat-render-metrics-filter [for]="grid" [store]="metrics" />
</nat-table-surface>
```

Utils exports:

- Core helpers: `NatTableRenderMetricsStore`, `NatRenderMetricsPanel`, `NatRenderMetricsFilter`, `withRenderMetricsColumn(...)`
- Contracts and options: `WithRenderMetricsColumnOptions`, `NatTableRenderMetricsController`, `NatTableRenderMetricsEvent`, `NatTableRenderMetricsState`, `NatTableColumnMeta`
- Tone and filter helpers: `getRowRenderTone(...)`, `getRenderToneLabel(...)`, `isRenderFilterValue(...)`, `RENDER_FILTER_OPTIONS`, `RENDER_METRIC_COLUMN_ID`, `RowRenderFilterOption`, `RowRenderFilterValue`, `RowRenderMeasurement`, `RowRenderMetric`, `RowRenderTone`

| API                            | Purpose                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `NatTableRenderMetricsStore`   | Stores per-row timings, exposes `measurement()`, `rowMetrics()`, `rowMetric(rowId)`, `record(...)`, and `reset()` |
| `NatRenderMetricsPanel`        | Compact summary of the latest render cycle                                                                        |
| `NatRenderMetricsFilter`       | Chip group that filters the synthetic metrics column by tone                                                      |
| `withRenderMetricsColumn(...)` | Appends a synthetic metrics column to an existing `ColumnDef[]`                                                   |

`withRenderMetricsColumn(...)` accepts `size`, `minSize`, and `maxSize` for the synthetic metrics column.

### Render-metrics wiring

1. Create one `NatTableRenderMetricsStore`.
2. Enable `[emitRowRenderEvents]="true"` on `<nat-table>`.
3. Record each `(rowRendered)` event with `store.record($event)`.
4. Optionally wrap your columns with `withRenderMetricsColumn(...)`.
5. Render `NatRenderMetricsPanel` and `NatRenderMetricsFilter` against the same store.
