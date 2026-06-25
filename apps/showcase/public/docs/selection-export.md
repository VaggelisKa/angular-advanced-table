Selection and export are separate features. Selection is table state keyed by row id. Export is a host directive that reads the active table controller and runs a CSV or custom export operation.

## Row Selection

Enable selection on the core table and add the optional checkbox column from `ng-advanced-table-ui`.

```ts
import { Component, computed, signal } from '@angular/core';
import type { ColumnDef, RowSelectionState } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableSelectionColumn } from 'ng-advanced-table-ui';

interface ServiceRow {
  id: string;
  name: string;
  owner: string;
  status: string;
}

@Component({
  selector: 'app-services-table',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (rowSelectionChange)="onRowSelectionChange($event)">
      <nat-table [data]="rows()" [columns]="columns" [enableRowSelection]="true" accessibleName="Selectable services" />
    </nat-table-surface>
  `
})
export class ServicesTable {
  readonly rows = signal<readonly ServiceRow[]>([]);
  readonly rowSelection = signal<RowSelectionState>({});

  readonly tableState = computed<Partial<NatTableState>>(() => ({
    rowSelection: this.rowSelection()
  }));

  readonly columns: ColumnDef<ServiceRow>[] = withNatTableSelectionColumn(
    [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { label: 'Name', rowHeader: true }
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
        meta: { label: 'Owner' }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { label: 'Status' }
      }
    ],
    {
      label: 'Selection',
      selectAllAriaLabel: 'Select all services',
      selectRowAriaLabel: (row) => `Select ${row.original.name}`
    }
  );

  protected onRowSelectionChange(rowSelection: RowSelectionState): void {
    this.rowSelection.set(rowSelection);
  }
}
```

Selection is stored as `Record<rowId, boolean>`. Rows with a string or number `id` property use that value automatically. Provide `getRowId` when the stable id lives under another property, is composite, or needs parent-aware nested row keys. Without a stable id, selection follows namespaced row positions after sorting, filtering, paging, or data refreshes.

## Single And Multiple Selection

The default selection mode is multiple. Use `selectionMode="single"` when only one row can be selected.

```html
<nat-table
  [data]="rows()"
  [columns]="columns"
  [enableRowSelection]="true"
  selectionMode="single"
  accessibleName="Selectable services" />
```

When switching between modes, clear or normalize app-owned selection so the UI and business rules stay obvious.

```ts
protected setSelectionMode(mode: 'single' | 'multiple'): void {
  this.selectionMode.set(mode);
  this.rowSelection.set({});
}
```

## Self-Healing Selection

When data changes, prune selected ids that no longer exist.

```ts
readonly selectedRows = computed(() => {
  const selection = this.rowSelection();

  return this.rows().filter((row) => selection[row.id]);
});

protected pruneSelection(): void {
  const rowIds = new Set(this.rows().map((row) => row.id));

  this.rowSelection.update((selection) => {
    const next: RowSelectionState = {};

    for (const [rowId, selected] of Object.entries(selection)) {
      if (selected && rowIds.has(rowId)) {
        next[rowId] = true;
      }
    }

    return next;
  });
}
```

If the row list can change often, `linkedSignal` is a good fit because it can derive a valid selection from the current row ids and selection mode.

## Bulk Actions

Bulk action bars belong to the consuming app. They need domain labels, permissions, confirmation flows, and failure handling.

```html
<nat-table-toolbar accessibleName="Bulk actions">
  <button type="button" natToolbarItem [disabled]="selectedRows().length === 0" (click)="archiveSelected()">
    Archive selected ({{ selectedRows().length }})
  </button>

  <button type="button" natToolbarItem [disabled]="selectedRows().length === 0" (click)="clearSelection()">Clear selection</button>
</nat-table-toolbar>
```

```ts
protected archiveSelected(): void {
  const selectedIds = new Set(this.selectedRows().map((row) => row.id));

  if (selectedIds.size === 0) {
    return;
  }

  this.servicesApi.archive([...selectedIds]).subscribe({
    next: () => {
      this.rows.update((rows) => rows.filter((row) => !selectedIds.has(row.id)));
      this.rowSelection.set({});
    },
  });
}
```

Selection checkboxes do not fire `(rowActivate)`. Row activation and selection can coexist.

## Export Button

Use `NatTableExport` on a button or another interactive host.

```html
<nat-table-surface>
  <nat-table-toolbar accessibleName="Services toolbar">
    <button type="button" natToolbarItem natTableExport exportFileName="services">Export CSV</button>
  </nat-table-toolbar>

  <nat-table [data]="rows()" [columns]="columns" accessibleName="Services" />
</nat-table-surface>
```

The directive resolves the table controller from the surface. It sets busy/disabled state while exporting and downloads a CSV by default.

## Export Scope

The default CSV export uses:

- All client-held rows from the table core row model.
- Visible exportable leaf columns in current column order.
- Raw accessor values by default.
- `meta.export` overrides for headers, inclusion, and values.

It does not automatically mean "only selected rows" or "only the current server page from the backend". If your product needs that behavior, provide a custom handler.

## Column Export Metadata

```ts
readonly columns: ColumnDef<ServiceRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      label: 'Name',
      rowHeader: true,
      export: { header: 'Service name' },
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status' },
  },
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
  },
];
```

Accessor columns opt in by default. Display columns opt out unless `meta.export.enabled` is set.

## Custom Export Handler

Use a per-button handler when one export action needs custom behavior.

```ts
import type { NatTableExportHandler } from 'ng-advanced-table-ui';

readonly exportSelected: NatTableExportHandler<ServiceRow> = async (context) => {
  const selection = this.rowSelection();
  const selectedRows = context.rows.filter((row) => selection[row.id]);

  await this.exportApi.exportServices({
    fileName: `${context.fileName}.csv`,
    columns: context.columns.map((column) => column.id),
    rowIds: selectedRows.map((row) => row.id),
  });
};
```

```html
<button type="button" natToolbarItem natTableExport exportFileName="selected-services" [exportHandler]="exportSelected">
  Export selected
</button>
```

Use `context.getData()` when the custom handler needs normalized export data in the same shape as the built-in CSV export.

```ts
readonly auditThenExport: NatTableExportHandler<ServiceRow> = async (context) => {
  await this.auditLog.recordExport(context.fileName, context.getData());
  await context.exportCsv();
};
```

## App-Wide Export Provider

Use `provideNatTableExport(...)` when every export button should go through the same service.

```ts
import { inject } from '@angular/core';
import { provideNatTableExport } from 'ng-advanced-table-ui';

providers: [
  provideNatTableExport<ServiceRow>(() => {
    const exportApi = inject(ServiceExportApi);

    return {
      handler: (context) =>
        exportApi.exportCsv({
          fileName: context.fileName,
          data: context.getData()
        })
    };
  })
];
```

Per-button `exportHandler` takes precedence over the provider. If neither is set, the built-in CSV download runs.

## Accessibility Notes

- Row selection emits `aria-selected` on rows while selection is enabled.
- Multiple selection sets `aria-multiselectable="true"` on the grid.
- The selection checkbox labels resolve from UI locale defaults unless helper options override them.
- Icon-only export buttons need an `aria-label` supplied by the host application.
- When visible button text and `aria-label` both exist, keep the visible words inside the accessible name.
