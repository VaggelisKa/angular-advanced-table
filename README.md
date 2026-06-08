# angular-advanced-table

Signals-first Nx monorepo for composable Angular TanStack Table primitives.

## Documentation Map

This README is the canonical workspace reference. Package READMEs stay intentionally small and point back here for behavior, API shape, and composition rules. The `apps/showcase` project is the demo app, and publishable packages live under `libs/*`.

| Package                   | Use it for                           | Main exports                                                                                                                                                    |
| ------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ng-advanced-table`       | Core table primitive                 | `NatTable`, `NatTableState`, `NatTableColumnMeta`                                                                                                               |
| `ng-advanced-table-ui`    | Optional controls and header actions | `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, `NatTableScrollControl`, `withNatTableHeaderActions(...)` |
| `ng-advanced-table-utils` | Optional render-metrics tooling      | `NatTableRenderMetricsStore`, `NatRenderMetricsPanel`, `NatRenderMetricsFilter`, `withRenderMetricsColumn(...)`                                                 |
| `ng-advanced-table-locales` | Built-in locale registry           | `provideNatTableLocales(...)`, `provideNatTableUiLocales(...)`, `provideNatTableUtilsLocales(...)`                                                               |

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
        ariaLabel="Open positions"
      />

      <nat-table-scroll-control [for]="grid" />
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
- Common types: `NatTableState`, `NatTableRowIdGetter`, `NatTableRowActivateEvent`, `NatTableColumnMeta`, `NatTableRowRenderedEvent`, `NatTableCellTone`, `NatTableSortDirection`, `NatTableSortIndicatorContext`
- Accessibility: `NatTableAccessibilityText` at the package root; deep formatter context types live under the `NatTableA11y` namespace (for example `NatTableA11y.NatTableAccessibilitySummaryContext`).

## Core API

### Inputs

| Input                 | Default   | Notes                                                                                                              |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `data`                | required  | Row array rendered by the table                                                                                    |
| `columns`             | required  | TanStack `ColumnDef<TData>[]`                                                                                      |
| `ariaLabel`           | required  | Accessible name for the table region                                                                               |
| `accessibilityText`   | `{}`      | Overrides for description, keyboard instructions, empty-state copy, and announcements                              |
| `enableGlobalFilter`  | `true`    | Enables the global filter pipeline                                                                                 |
| `enableColumnPinning` | `true`    | Enables sticky pinning where columns allow it                                                                      |
| `enableColumnReorder` | `false`   | Enables drag/drop and keyboard reordering                                                                          |
| `enablePagination`    | `false`   | Enables the pagination row model                                                                                   |
| `globalFilterFn`      | built-in  | Replaces the generic global filter                                                                                 |
| `initialState`        | `{}`      | Uncontrolled initial state, read once                                                                              |
| `state`               | `{}`      | Controlled slices only; omitted slices stay internal                                                               |
| `getRowId`            | row index | Stable row id resolver (`NatTableRowIdGetter`); optional third argument matches TanStack's parent row when present |
| `emitRowRenderEvents` | `false`   | Enables `(rowRendered)` instrumentation                                                                            |
| `enableAnnouncements` | `true`    | Enables polite live announcements                                                                                  |

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
      ariaLabel="Filtered orders"
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
| `pagination`       | Page index and page size (still present in `NatTableState` when `enablePagination` is `false`; the client-side pagination row model is off, so only `stateChange` / UI that reads `pagination` will reflect it) |

The `pagination` slice always exists so controlled and uncontrolled code paths stay stable. When `enablePagination` is `false`, `pageIndex` / `pageSize` still update with defaults and filter-driven resets, but the table body is not paginated until you opt in.

### `NatTableColumnMeta`

Prefer the canonical import when metadata is shared across packages:

```ts
import type { NatTableColumnMeta } from 'ng-advanced-table';
```

`ng-advanced-table-ui` and `ng-advanced-table-utils` expose matching compatibility types for consumers already importing from those packages.

Attach metadata through `columnDef.meta`:

| Field           | Type                                                                      | Purpose                                                        |
| --------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `label`         | `string`                                                                  | Stable human-readable label for accessibility and companion UI |
| `align`         | `'start' \| 'end'`                                                        | Cell and header alignment                                      |
| `rowHeader`     | `boolean`                                                                 | Marks body cells in the column as row headers                  |
| `cellTone`      | `(context) => 'positive' \| 'negative' \| 'neutral' \| 'warning' \| null` | Maps a cell to a semantic tone                                 |
| `headerSize`    | `number \| string`                                                        | Optional header-only width in pixels                           |
| `headerMinSize` | `number \| string`                                                        | Optional header-only minimum width in pixels                   |
| `headerMaxSize` | `number \| string`                                                        | Optional header-only maximum width in pixels                   |

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

### Behavior rules

- A slice is controlled **only** when its property is _present_ in `state`, even if the value is an empty array or empty record. Omitted properties stay uncontrolled and are managed internally.
- `initialState` is a one-time seed read on the first render; once a slice is also controlled through `state`, the seed for that slice is ignored.
- Global filter and column-filter updates reset `pagination.pageIndex` to `0`.
- Reordering stays inside the current pinning zone. It does not move columns between left, center, and right groups.
- `(rowActivate)` ignores activations whose target sits inside an interactive cell descendant — `<a href>`, `<button>`, form controls, `<summary>`, `contenteditable`, or elements with `role="button" | "link" | "checkbox" | "menuitem" | "tab" | "switch" | "combobox" | "textbox" | "searchbox"`. Use it for row-level navigation; keep cell-level controls inside cells.
- `emitRowRenderEvents` is opt-in because it installs per-row render instrumentation.
- `enableAnnouncements` is on by default so sort, filter, visibility, and pagination changes are announced.

## Accessibility and Internationalization

Accessible copy is split by ownership. Set table-specific copy such as `ariaLabel`, captions, descriptions, and stable `columnDef.meta.label` values on the table or columns. Generated table copy has built-in English defaults and can be configured once with `provideNatTableLocales()` from `ng-advanced-table-locales`; UI and utils labels opt in through their companion locale entry points.

See [Accessibility and internationalization](ACCESSIBILITY.md) for the agent checklist, localization guidance, and examples.

`NatTableAccessibilityText` combines plain strings and formatter callbacks:

- `description` — supplemental description announced through `aria-describedby`
- `keyboardInstructions` — screen-reader instructions for grid navigation
- `emptyState` — visible message rendered when the current view contains no rows
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
  reorderKeyboardInstructions: 'Use Alt+Shift+Arrow keys to move columns.',
  tableSummary: ({ visibleRowsText, totalRowsText, pageText, pageCountText }) =>
    `${visibleRowsText} of ${totalRowsText} rows visible. Page ${pageText} of ${pageCountText}.`,
  filteringChange: ({ query, visibleRowsText }) => `Filter ${query}. ${visibleRowsText} rows visible.`,
  sortingChange: ({ columnLabel, sortState }) => `${columnLabel} sorted ${sortState}.`,
};
```

`description`, `keyboardInstructions`, and `emptyState` accept any string (set them to `''` to suppress the description or keyboard instructions). Generated table copy has English defaults and can be localized through `provideNatTableLocales()` plus `<nat-table [locale]="localeId()">`. Formatter contexts expose locale-formatted numbers and semantic state labels. When you want explicit types for formatter arguments, import the `NatTableA11y` namespace (for example `NatTableA11y.NatTableAccessibilitySortingAnnouncementContext`).

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
      [ariaLabel]="'Trade ' + row().symbol"
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
    <button type="button" ngGridCellWidget [attr.aria-label]="ariaLabel()" (click)="pressed.emit()">
      Pay
    </button>
  `,
})
export class CustomPayButton {
  readonly ariaLabel = input.required<string>();
  readonly pressed = output<void>();
}
```

For row action menus, keep the menu implementation in the consumer app:

```html
<custom-row-actions-menu
  [row]="row()"
  [ariaLabel]="'Open actions for ' + row().name"
  (action)="action.emit($event)"
/>
```

That menu can use CDK Menu, a design-system menu, or another accessible implementation. It should provide the trigger name, roles, keyboard navigation, focus return, and dismiss behavior. The table-specific part is still `ngGridCellWidget` on the focusable trigger.

For dialog triggers, let the container open the dialog so focus management, async state, and errors stay outside the cell. The custom trigger should only emit intent.

For expand controls, pass the current state into the custom component and expose it on the real control with `aria-expanded` and a row-specific name:

```html
<custom-expand-button
  [expanded]="expanded()"
  [ariaLabel]="(expanded() ? 'Collapse ' : 'Expand ') + row().name"
  (pressed)="toggle.emit(row().id)"
/>
```

For navigation, use a custom link component only if it renders or hosts a real anchor with `href`. `NatTable` treats anchors with `href` as interactive descendants, so clicking the link does not emit `(rowActivate)`.

If a consuming app builds a cell entirely from scratch rather than composing an existing component, the same rules apply. Plain buttons, anchors, form controls, and accessible menu primitives work fine. Angular CDK Menu is a good option for a from-scratch menu, but it is not required by `NatTable`.

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
    ariaLabel="Orders"
  />

  <nat-table-scroll-control [for]="grid" />
  <nat-table-search [for]="grid" />
  <nat-table-column-visibility [for]="grid" />
  <nat-table-page-size [for]="grid" [pageSizeOptions]="[25, 50, 100]" />
  <nat-table-pager [for]="grid" />
</nat-table-surface>
```

UI exports:

- Components: `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, `NatTableScrollControl`
- Helpers and contracts: `withNatTableHeaderActions(...)`, `NatTableHeaderActionsOptions`, `NatTableHeaderActionsColumnOptions`, `NatTableSortIndicatorContent`, `NatTableUiController`, `NatTableUiState`
- Canonical aliases: `NatTableColumnMeta`, `NatTableSortDirection`, `NatTableSortIndicatorContext`
- Shared UI types: `NatTableAccessibilityPageSizeOptionContext`, `NatTableAccessibilityPageSizeLabels`, `NatTableAccessibilityPagerContext`, `NatTableAccessibilityPagerLabels`, `NatTableAccessibilityScrollControlPositionContext`, `NatTableAccessibilityScrollControlLabels`, `NatTableAccessibilityColumnVisibilitySummaryContext`, `NatTableAccessibilityColumnVisibilityActionContext`, `NatTableAccessibilityColumnVisibilityStateContext`, `NatTableAccessibilityColumnVisibilityLabels`, `NatTableAccessibilityHeaderActionMenuContext`, `NatTableAccessibilityHeaderActionSortContext`, `NatTableAccessibilityHeaderActionPinContext`, `NatTableAccessibilityHeaderActionLabels`

| API                              | Purpose                                                        | Key inputs or options                                        |
| -------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| `NatTableSurface`                | Layout wrapper and default `--nat-table-*` CSS variables       | none                                                         |
| `NatTableSearch`                 | Global filter input                                            | `for`, `label`, `placeholder`                                |
| `NatTableColumnVisibility`       | Toggle hideable columns                                        | `for`, `label`, `ariaLabel`, `accessibilityLabels`           |
| `NatTablePageSize`               | Chip-based page-size switcher                                  | `for`, `pageSizeOptions`, `ariaLabel`, `accessibilityLabels` |
| `NatTablePager`                  | Previous/next pagination control                               | `for`, `ariaLabel`, `accessibilityLabels`                    |
| `NatTableScrollControl`          | Horizontal scroll buttons and range control                    | `for`, `ariaLabel`, `scrollStep`, `accessibilityLabels`      |
| `withNatTableHeaderActions(...)` | Wraps header content with a built-in sort control and pin menu | `sortIndicator`, `accessibilityLabels`, `meta.headerActions` |

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
- `withNatTableHeaderActions(...)` preserves the original header content and only adds controls when the underlying column supports sorting or pinning, including a compact three-dot menu for left and right pin actions.
- Applying `withNatTableHeaderActions(...)` repeatedly is safe. If a reactive column builder receives already-wrapped columns, the helper updates the wrapper options instead of nesting another header action surface.
- For per-column behavior, set `column.meta.headerActions` to `false` to opt out, or provide `{ sortIndicator, accessibilityLabels }` to override the helper-level options for that column only.
- When composing with column helpers that add or prepend columns, apply those helpers first and then call `withNatTableHeaderActions(...)`, for example `withNatTableHeaderActions(withRenderMetricsColumn(columns, metricsStore), options)`.

## UI Accessibility Labels

The optional UI controls inherit the controlled table locale through `[for]="grid"` and resolve generated labels from `provideNatTableUiLocales()`. Use `label`, `placeholder`, `ariaLabel`, and `accessibilityLabels` inputs only for instance-specific copy. Header sort and pin labels are configured through `withNatTableHeaderActions(...)`; `NatTableAccessibilityHeaderActionLabels` covers the sort button, overflow trigger, opened pin menu label, pin action labels, and visible pin item text.

See [Accessibility and internationalization](ACCESSIBILITY.md#optional-ui-controls) for the full label surface.

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
