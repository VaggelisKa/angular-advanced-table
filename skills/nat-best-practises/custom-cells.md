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

## Cell Templates

Prefer a projected `natTableCell` template when the cell markup belongs to one screen and needs the host component's state or methods. Import `NatTableCellTemplate` from `ng-advanced-table`.

```html
<nat-table [columns]="columns" [data]="invoices()" accessibleName="Invoices">
  <ng-template natTableCell="status" [natTableCellOf]="columns" let-row="row">
    <app-invoice-status [status]="row.original.status" (retry)="retry(row.original.id)" />
  </ng-template>
</nat-table>
```

- Key the template by column id (`id`, or `accessorKey` when no `id` is set; dots become underscores, `owner.name` → `owner_name`).
- The implicit value is `unknown`; bind typed inputs from `row.original`.
- Keep accessor, sorting, filtering, export, and `meta` on the column definition; the template only replaces the cell content.
- The template wins over the column's `cell`.
- The same directive works in `<nat-table-static>` and `<nat-list>`; declare it inside each renderer.
- Use `flexRenderComponent(...)` instead when the column definitions are shared across screens.

## List Item Templates

Use a projected `natListItem` template when a `<nat-list>` item should be a custom card instead of labelled fields. Import `NatListItemTemplate` and `NatListItemLabel` from `ng-advanced-table`.

```html
<nat-list [columns]="columns" [data]="invoices()" accessibleName="Invoices" enableRowActivation (rowActivate)="open($event.rowData)">
  <ng-template natListItem [natListItemOf]="columns" let-invoice>
    <app-invoice-card [invoice]="invoice">
      <span natListItemLabel>{{ invoice.number }}</span>
    </app-invoice-card>
  </ng-template>
</nat-list>
```

- The template replaces the fields, labels, and field layout; the list keeps the item element, selection, navigation, and activation.
- Mark the identifying element with `natListItemLabel` whenever `enableRowActivation` is on.
- Column visibility and order do not apply inside the template; read `visibleColumnIds` from the context when they should.
- To change one field only, use a `natTableCell` template and keep the built-in item.

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
