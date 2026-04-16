# ng-advanced-table

`ng-advanced-table` is a signals-first Angular data table built on [TanStack Table](https://tanstack.com/table). It ships a standalone `<nat-table>` component with built-in global search, column visibility controls, sticky pinning, pagination, accessible grid semantics, and typed hooks for controlled state.

## What It Solves

- Standalone Angular integration. Import `NatTable` directly into feature components.
- TanStack-powered sorting, filtering, pagination, visibility, and pinning.
- Built-in UI for search, column visibility, page size, pager controls, and pinned columns.
- Controlled or uncontrolled state per slice through `NatTableState`.
- Typed column metadata for labels, alignment, and semantic cell tones.
- Optional per-row render instrumentation through `(rowRendered)`.

## Installation

The current package peer ranges target Angular `21.2+` and TanStack Table `v8`.

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/aria
```

`@angular/core`, `@angular/common`, and the rest of Angular should already come from your application.

## Quick Start

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

interface PositionRow {
  id: string;
  symbol: string;
  desk: string;
  price: number;
  changePercent: number;
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

@Component({
  selector: 'app-positions-table',
  imports: [NatTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [initialState]="initialState"
      [pageSizeOptions]="[25, 50, 100]"
      [getRowId]="getRowId"
      ariaLabel="Open positions"
    />
  `,
})
export class PositionsTableComponent {
  readonly rows = signal<PositionRow[]>([
    {
      id: 'pos-001',
      symbol: 'AAPL',
      desk: 'Growth',
      price: 213.54,
      changePercent: 3.2,
    },
    {
      id: 'pos-002',
      symbol: 'MSFT',
      desk: 'Core',
      price: 487.12,
      changePercent: -1.4,
    },
  ]);

  readonly columns: ColumnDef<PositionRow>[] = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      enablePinning: true,
      meta: {
        label: 'Symbol',
      },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'desk',
      header: 'Desk',
      meta: {
        label: 'Desk',
      },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      meta: {
        label: 'Price',
        align: 'end',
      },
      cell: (context) => usd.format(context.getValue<number>()),
    },
    {
      accessorKey: 'changePercent',
      header: '24h %',
      meta: {
        label: '24h %',
        align: 'end',
        cellTone: (context) => {
          const value = context.getValue<number>();

          if (value > 0) {
            return 'positive';
          }

          if (value < 0) {
            return 'negative';
          }

          return 'neutral';
        },
      },
      cell: (context) => `${context.getValue<number>().toFixed(2)}%`,
    },
  ];

  readonly initialState: Partial<NatTableState> = {
    sorting: [{ id: 'changePercent', desc: true }],
    columnPinning: {
      left: ['symbol'],
      right: [],
    },
    pagination: {
      pageIndex: 0,
      pageSize: 25,
    },
  };

  readonly getRowId = (row: PositionRow) => row.id;
}
```

## Column Definitions

`<nat-table>` expects standard TanStack `ColumnDef<TData>` definitions. The library adds a small amount of typed column metadata through `NatTableColumnMeta`:

- `meta.label`: text used for the column visibility chips and ARIA labels. Set this whenever the header is not a plain string.
- `meta.align`: use `'end'` to right-align numeric columns.
- `meta.cellTone`: returns `'positive'`, `'negative'`, `'neutral'`, `'warning'`, or `null`. The result is exposed as a `data-tone` attribute on body cells.

Column behavior still comes from TanStack:

- Set `enablePinning: true` on columns that should expose pin controls.
- Set `enableHiding: false` on columns that must always stay visible.
- Use TanStack `filterFn`, `sortingFn`, accessors, and custom cell renderers as usual.

## State Model

The table supports both uncontrolled and partially controlled usage:

- `initialState` seeds the table once on first render.
- `state` lets you control any subset of `NatTableState`.
- Any slice you pass through `state` becomes controlled. The table will emit `stateChange`, but it will not persist that slice internally unless you feed the updated value back in.
- Global search and column-filter updates reset pagination back to page `0`.
- When `showPagination` is `false`, the table renders all filtered rows.

A common pattern is to control only the state you need for external UI:

```ts
readonly tableState = signal<Partial<NatTableState>>({
  columnFilters: [],
});

onTableStateChange(state: NatTableState): void {
  this.tableState.set({
    columnFilters: state.columnFilters,
  });
}
```

```html
<nat-table
  [data]="rows()"
  [columns]="columns"
  [state]="tableState()"
  ariaLabel="Orders"
  (stateChange)="onTableStateChange($event)"
/>
```

## Public API

### Inputs

| Name | Required | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `data` | Yes | `readonly TData[]` | none | Table rows. |
| `columns` | Yes | `readonly ColumnDef<TData, unknown>[]` | none | TanStack column definitions. |
| `ariaLabel` | Yes | `string` | none | Accessible name for the table. |
| `pageSizeOptions` | No | `readonly number[]` | `[10, 25, 50]` | Values are sanitized to positive integers. |
| `enableGlobalFilter` | No | `boolean` | `true` | Shows the search input and applies global filtering. |
| `searchLabel` | No | `string` | `'Search rows'` | Label for the search field. |
| `searchPlaceholder` | No | `string` | `'Search rows'` | Placeholder for the search field. |
| `showColumnVisibility` | No | `boolean` | `true` | Shows the built-in visibility controls. |
| `showPagination` | No | `boolean` | `true` | Enables page size controls and the pager. |
| `allowColumnPinning` | No | `boolean` | `true` | Enables sticky pinning where the column allows it. |
| `emptyStateLabel` | No | `string` | `'No rows match the current view.'` | Empty-state message. |
| `globalFilterFn` | No | `FilterFn<TData>` | built-in generic filter | Override the default case-insensitive `Object.values(row.original)` search. |
| `initialState` | No | `Partial<NatTableState>` | `{}` | Seed state applied once. |
| `state` | No | `Partial<NatTableState>` | `{}` | Controlled slices of table state. |
| `getRowId` | No | `(row: TData, index: number) => string` | index-based fallback | Strongly recommended when your rows have stable ids. |
| `emitRowRenderEvents` | No | `boolean` | `false` | Emits one `rowRendered` event per visible row per render cycle. |

### Outputs

| Name | Payload | Notes |
| --- | --- | --- |
| `stateChange` | `NatTableState` | Fires whenever the user changes sorting, filters, visibility, pinning, or pagination. |
| `rowRendered` | `NatTableRowRenderedEvent` | Only fires when `emitRowRenderEvents` is enabled. Useful for perf instrumentation. |

### Template Ref API

The component is exported as `natTable`, so you can grab a template ref:

```html
<nat-table #grid="natTable" ... />
```

That ref exposes:

- `grid.table`: the underlying TanStack `Table<TData>` instance.
- `grid.patchState(...)`: a typed way to apply state updaters from external controls.

`patchState(...)` accepts the same state slices as `NatTableState`, with TanStack-style updater functions or direct values.

### Exported Types

```ts
interface NatTableState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

interface NatTableColumnMeta<TData, TValue> {
  label?: string;
  align?: 'start' | 'end';
  cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
}
```

## Styling And Theming

The component ships with a complete default visual treatment, but it is intentionally themeable through CSS custom properties. Override them on a wrapper or on the component host:

```css
.orders-surface {
  --accent: #00a3ff;
  --surface: rgba(6, 18, 29, 0.78);
  --surface-elevated: #08141f;
  --surface-contrast: #102234;
  --text: #f3fbff;
  --text-soft: #abc2d2;
  --success: #34d399;
  --danger: #ff7a7a;
  --warning: #f4c15d;
}
```

Useful styling hooks:

- Header and body cells expose `data-column-id="<columnId>"`.
- Body cells expose `data-tone="positive|negative|neutral|warning"` when `meta.cellTone` returns a value.
- Sticky columns apply pinned classes automatically and compute offsets from real rendered widths.

## Row Render Metrics

If you set `emitRowRenderEvents` to `true`, the table emits:

```ts
interface NatTableRowRenderedEvent {
  rowId: string;
  renderToken: number;
  durationMs: number;
}
```

This is disabled by default because it adds an `afterRenderEffect` per rendered row. It is intended for performance dashboards and is the integration point used by the companion `ng-advanced-table-utils` package.

## Accessibility

- `ariaLabel` is required and becomes the accessible name for the table.
- Sortable headers publish `aria-sort`.
- Search, column visibility, and pagination controls are labeled out of the box.
- Focus-visible styles are included for interactive controls and grid cells.
- The table uses Angular's `@angular/aria/grid` primitives rather than raw div-based grid emulation.

## Companion Package

This repository also publishes `ng-advanced-table-utils`, which adds optional performance-oriented helpers:

- `NatTableRenderMetricsStore`
- `NatRenderMetricsFilter`
- `NatRenderMetricsPanel`
- `withRenderMetricsColumn(...)`

Use it only if you need render timing overlays or diagnostics. The core table does not depend on it.
