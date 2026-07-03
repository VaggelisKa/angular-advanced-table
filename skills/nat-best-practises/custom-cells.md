# Custom Cells And Row Actions

Use custom cells for formatting, links, controls, status indicators, menus, and row actions.

## Cell Contract

- Keep the row type explicit and stable.
- Use `ColumnDef<TData, TValue>` from `ng-advanced-table`.
- Put table metadata in `meta`, especially `meta.label`, `meta.rowHeader`, `meta.align`, and export behavior.
- Use simple `cell` callbacks only for pure formatting.
- Use `flexRenderComponent(...)` from `ng-advanced-table` for Angular cell components.
- Pass only the row/context data the cell needs.
- Emit events to the host for navigation, dialogs, API calls, and state changes.

## Pure Formatting Cells

Use simple callbacks for pure formatting.

```ts
readonly columns: ColumnDef<InvoiceRow, unknown>[] = [
  {
    accessorKey: 'amount',
    header: 'Amount',
    meta: { label: 'Amount', align: 'end' },
    cell: (context) => currencyFormatter.format(context.getValue<number>())
  }
];
```

## Angular Cell Components

Use `flexRenderComponent` for Angular cell components. Import it from `ng-advanced-table`.

```ts
import { type ColumnDef, flexRenderComponent } from 'ng-advanced-table';

readonly columns: ColumnDef<InvoiceRow, unknown>[] = [
  {
    accessorKey: 'customer',
    header: 'Customer',
    meta: { label: 'Customer', rowHeader: true },
    cell: (context) =>
      flexRenderComponent(InvoiceCustomerCell, {
        inputs: {
          invoice: context.row.original,
          value: context.getValue<string>()
        },
        outputs: {
          opened: () => this.openInvoice(context.row.original.id)
        }
      })
  }
];
```

The component receives row data and emits events. The host updates rows and table state.

```ts
readonly invoice = input.required<InvoiceRow>();
readonly value = input.required<string>();

readonly opened = output<void>();
```

```html
<button type="button" (click)="opened.emit()">Open {{ invoice().customerName }}</button>
```

## Row Actions

- Keep per-row actions in a custom cell only when the action is tied to that row.
- Keep bulk actions in a consumer toolbar, not repeated in every row.
- Include stable row identity in emitted events.
- If an action removes rows, clear or reconcile stale `rowSelection` ids.
- If an action changes filtering, sorting, or pagination, patch the relevant `NatTableUserState` slice and preserve unrelated slices.
- For icon-only or menu actions, apply the naming and keyboard rules in [accessibility.md](accessibility.md).

## State Updates

- Patch table state from the host, not from pure column helper code.
- For row deletion, remove data by stable row id and clear affected row selection entries.
- For inline edits, update product state first, then pass the new rows back to the table.
- For actions that change filtering or sorting, patch the relevant `NatTableUserState` slice and preserve unrelated slices.
