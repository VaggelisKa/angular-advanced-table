Columns are `ColumnDef<TData>[]` imported from `ng-advanced-table`. Put product-specific rendering in your column definitions and keep table-wide wiring in the surface.

## Basic Column Shape

Use `accessorKey` for fields and `id` for display or computed columns. Provide `meta.label` for every column.

```ts
import { type ColumnDef } from 'ng-advanced-table';

interface PositionRow {
  id: string;
  symbol: string;
  company: string;
  price: number;
  changePercent: number;
}

readonly columns: ColumnDef<PositionRow>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    meta: { label: 'Symbol', rowHeader: true },
  },
  {
    accessorKey: 'company',
    header: 'Company',
    meta: { label: 'Company', cellMaxLines: 2 },
  },
  {
    accessorKey: 'price',
    header: 'Last',
    meta: { label: 'Last', align: 'end' },
    cell: (context) => currency.format(context.getValue<number>()),
  },
];
```

## Column Metadata

`NatTableColumnMeta` adds table-specific behavior to `columnDef.meta`.

| Field               | Use it for                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`             | Stable human-readable label for announcements and companion UI                                                                                  |
| `hiddenHeaderLabel` | Screen-reader-only header text for compact utility columns                                                                                      |
| `align`             | `'start'` or `'end'` header and body alignment                                                                                                  |
| `rowHeader`         | Marks body cells in the column as row headers                                                                                                   |
| `reorderable`       | Per-column reordering override; `false` blocks grabbing/moving this column, while `true` opts keyboard/menu movement in when the surface is off |
| `cellTone`          | Semantic tone class for positive, negative, neutral, or warning cells                                                                           |
| `cellHeight`        | Fixed body-cell height for this column                                                                                                          |
| `cellMaxLines`      | Body-cell line clamp; defaults to `2`, use `Infinity` to disable                                                                                |
| `headerSize`        | Header-only width                                                                                                                               |
| `headerMinSize`     | Header-only minimum width                                                                                                                       |
| `headerMaxSize`     | Header-only maximum width                                                                                                                       |
| `export`            | Export participation, header, and value mapping                                                                                                 |

```ts
import type { NatTableColumnMeta } from 'ng-advanced-table';

type PositionColumnMeta = NatTableColumnMeta<PositionRow>;

const priceMeta: PositionColumnMeta = {
  label: 'Last',
  align: 'end',
  cellTone: (context) => {
    const change = context.row.original.changePercent;

    if (change > 0) return 'positive';
    if (change < 0) return 'negative';

    return 'neutral';
  }
};
```

## Sizing

Use `size`, `minSize`, and `maxSize` for body-cell sizing. Header-only sizing lives in metadata.

```ts
readonly columns: ColumnDef<PositionRow>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    size: 112,
    minSize: 96,
    meta: {
      label: 'Symbol',
      rowHeader: true,
      headerSize: 132,
    },
  },
  {
    accessorKey: 'company',
    header: 'Company',
    minSize: 180,
    maxSize: 360,
    meta: {
      label: 'Company',
      cellHeight: 64,
      cellMaxLines: 2,
    },
  },
];
```

Configure the table width model on the surface.

```html
<nat-table-surface columnSizingMode="fixed" columnResizeMode="onEnd" [enableColumnResizing]="true">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
  <nat-table-scroll-control />
</nat-table-surface>
```

`columnSizingMode="fill"` stretches columns to fill the container. `columnSizingMode="fixed"` treats widths as authoritative and lets the table scroll horizontally. Interactive resizing is off until the surface sets `[enableColumnResizing]="true"`; once enabled it applies to every column, and a single column opts out with `enableResizing: false`. `columnResizeMode="onEnd"` commits after pointer release; `"onChange"` updates during the drag.

## Pinning And Reordering

Pinning is enabled where the column allows it. Reordering is disabled by default; enable it on the surface when a table should expose drag/drop, keyboard column moves, or companion move actions. Reordering stays inside the current pinning zone: left, center, or right.

Reordering is enabled on the surface and applies to every column by default. Opt a column out with `meta: { reorderable: false }` to remove its drag, keyboard, and header-menu move affordances. The column is not itself grabbed, but another reorderable column can still move past it and displace it.

```ts
readonly initialState: Partial<NatTableUserState> = {
  columnPinning: {
    left: ['symbol'],
    right: ['actions'],
  },
  columnOrder: ['symbol', 'company', 'price', 'changePercent', 'actions'],
};
```

Columns in `baseColumns` reorder by default; add `meta: { reorderable: false }` to any column that should not be grabbed or moved directly while reordering is enabled.

```ts
const baseColumns: ColumnDef<PositionRow>[] = [
  { accessorKey: 'symbol', header: 'Symbol', meta: { label: 'Symbol', rowHeader: true } },
  { accessorKey: 'company', header: 'Company', meta: { label: 'Company' } },
  // Cannot be grabbed or moved directly.
  { accessorKey: 'price', header: 'Last', meta: { label: 'Last', align: 'end', reorderable: false } },
];

readonly columns = withNatTableHeaderActions(baseColumns, {
  enableColumnReorderActions: true,
});
```

The header actions helper adds sort buttons when the surface enables sorting (`[enableSorting]="true"`) and a column can sort, pin menu items when the surface enables pinning (`[enablePinning]="true"`) and the column can pin, and move menu items when the surface sets `[enableReordering]="true"` and `enableColumnReorderActions` is on. Sorting, pinning, and resizing resolve per column as `column.<flag> ?? surface.<enabler>`; reordering uses `column.meta.reorderable ?? surface.enableReordering`. It also accepts custom sort indicator content through `sortIndicator`, so custom sort icons should compose through the helper rather than through extra header rows.

Enable table-owned reordering on the surface for tables that should expose move affordances.

```html
<nat-table-surface [enableReordering]="true">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

## Custom Cell Components

Use `flexRenderComponent(...)` when a cell should render an Angular component. Keep data loading, mutations, and dialogs in the container; the cell component should emit intent.

```ts
import { Component, input, output } from '@angular/core';
import { GridCellWidget } from '@angular/aria/grid';
import { flexRenderComponent, type ColumnDef } from 'ng-advanced-table';

@Component({
  selector: 'app-position-actions-cell',
  imports: [GridCellWidget],
  template: `
    <button
      type="button"
      ngGridCellWidget
      [attr.aria-label]="'Open actions for ' + symbol()"
      (click)="opened.emit()"
    >
      Actions
    </button>
  `,
})
export class PositionActionsCell {
  readonly symbol = input.required<string>();
  readonly opened = output<void>();
}

readonly columns: ColumnDef<PositionRow>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    meta: { label: 'Symbol', rowHeader: true },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    meta: {
      label: 'Actions',
      hiddenHeaderLabel: 'Row actions',
      align: 'end',
      cellMaxLines: Infinity,
    },
    cell: (context) =>
      flexRenderComponent(PositionActionsCell, {
        inputs: { symbol: context.row.original.symbol },
        outputs: { opened: () => this.openActions(context.row.original.id) },
      }),
  },
];
```

Put `ngGridCellWidget` on the real focusable element. If a design-system component renders the button internally, apply the widget marker inside that component.

## Row Activation

Use `(rowActivate)` for row-level navigation or primary actions. It fires on a primary click or `Enter` / `Space`, but ignores activations that start inside interactive descendants.

```html
<nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" (rowActivate)="openPosition($event.rowData.id)" />
```

```ts
protected openPosition(positionId: string): void {
  this.router.navigate(['/positions', positionId]);
}
```

Keep cell-level buttons, links, menus, and inputs independent. They should emit their own outputs and should not depend on row activation.

## Export Metadata

Accessor columns export by default. Display columns opt out unless explicitly enabled. Use `meta.export` when exported data should differ from rendered text.

```ts
{
  accessorKey: 'price',
  header: 'Last',
  meta: {
    label: 'Last',
    align: 'end',
    export: {
      header: 'Last price',
      value: ({ value }) => Number(value),
    },
  },
  cell: (context) => currency.format(context.getValue<number>()),
}
```

Disable export for columns that are useful only on screen.

```ts
{
  id: 'actions',
  header: 'Actions',
  enableSorting: false,
  enableGlobalFilter: false,
  meta: {
    label: 'Actions',
    export: { enabled: false },
  },
  cell: (context) => renderActions(context.row.original),
}
```

## Common Mistakes

- Do not omit `meta.label` because the visible `header` happens to be a string today.
- Do not rely on namespaced positional fallback ids for interactive tables.
- Do not make clickable `<div>` or `<span>` content inside cells; use real controls.
- Do not add fake header rows to customize sorting; use `withNatTableHeaderActions(..., { sortIndicator })`.
- Do not leave resizing enabled on columns where it is not useful; the surface enables it for all columns, so opt individual ones out with `enableResizing: false`.
- Do not move workflow state such as filters, dialogs, or mutations into cell components.
