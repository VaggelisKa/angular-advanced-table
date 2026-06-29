## When To Use Selection

Use row selection when users need to compare, batch, or act on rows. Do not use selection for ordinary row activation; row activation and selection can coexist but they represent different intents.

## Selection State

Selection is stored by stable row id in the `rowSelection` state slice. Rows with a string or number `id` property use that value automatically. Provide `getRowId` when identity is composite or lives elsewhere.

```ts
readonly tableState = signal<Partial<NatTableState>>({
  rowSelection: {
    'position-1': true,
  },
});
```

```html
<nat-table-surface [(state)]="tableState">
  <nat-table [data]="rows()" [columns]="columns" [enableRowSelection]="true" accessibleName="Selectable positions" />
</nat-table-surface>
```

Keep `rowSelection` in app state when bulk actions, URL persistence, or saved views need to survive table rerenders. Clear stale selected ids when the backing data set changes and selected rows no longer exist.

## Selection Column

Use `withNatTableSelectionColumn(...)` for the standard leading checkbox column. Pair the helper with `[enableRowSelection]="true"` on `<nat-table>`.

```ts
import { withNatTableSelectionColumn } from 'ng-advanced-table/ui';

readonly columns = withNatTableSelectionColumn(baseColumns, {
  label: 'Select rows',
  selectAllAriaLabel: 'Select all positions',
  selectRowAriaLabel: (row) => `Select ${row.original.symbol}`,
});
```

The helper prepends a non-sortable, non-hideable, non-resizable column. It defaults to a 48px width, can be pinned, and uses generated locale labels unless you pass explicit overrides. Pin it with the normal `columnPinning` state when selection should stay visible during horizontal scrolling.

## Single And Multiple Selection

Multiple selection is the default. Use `selectionMode="single"` only when the workflow allows one selected row at a time. Clear or normalize app-owned selection when switching modes.

```html
<nat-table
  [data]="rows()"
  [columns]="columns"
  [enableRowSelection]="true"
  selectionMode="single"
  accessibleName="Selectable positions" />
```

In single-selection mode, the generated selection column renders the header as a plain column label instead of a select-all checkbox. Select-all is only meaningful for multiple selection.

## Direct Selection Checkboxes

Most tables should use `withNatTableSelectionColumn(...)`. Use `NatTableSelectionCheckbox` directly only when you are building a custom selection column or need to place the checkbox in a custom header or cell renderer.

```ts
import { flexRenderComponent } from '@tanstack/angular-table';
import { NatTableSelectionCheckbox } from 'ng-advanced-table/ui';

readonly columns = [
  {
    id: 'select',
    header: (context) =>
      flexRenderComponent(NatTableSelectionCheckbox, {
        inputs: {
          mode: 'all',
          table: context.table,
          label: 'Select rows',
        },
      }),
    cell: (context) =>
      flexRenderComponent(NatTableSelectionCheckbox, {
        inputs: {
          mode: 'row',
          table: context.table,
          row: context.row,
          ariaLabel: `Select ${context.row.original.symbol}`,
        },
      }),
  },
  ...baseColumns,
];
```

The checkbox component expects the TanStack `table` instance in both modes and the current `row` in row mode. Prefer locale providers for shared generated labels; pass `ariaLabel` only for table-specific copy.

## Bulk Actions

Bulk controls belong to the consuming application. Place them in a toolbar when they are table commands, but keep domain side effects such as deleting rows, opening dialogs, or calling APIs outside the table.

## Accessibility Notes

Rows expose `aria-selected` while selection is enabled. Multiple selection sets `aria-multiselectable="true"` on the grid, and selection changes are announced through the table live region.
