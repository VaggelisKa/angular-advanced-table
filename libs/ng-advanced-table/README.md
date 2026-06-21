# ng-advanced-table

Core table package for the `angular-advanced-table` workspace.

## Canonical Docs

- Workspace and package docs: [../../README.md](../../README.md)
- Core table overview: [../../README.md#core-table](../../README.md#core-table)
- Core API reference: [../../README.md#core-api](../../README.md#core-api)
- Custom cell component guidance: [../../README.md#custom-cell-components](../../README.md#custom-cell-components)
- Accessibility and internationalization: [../../ACCESSIBILITY.md](../../ACCESSIBILITY.md)

This package README is intentionally scoped to package entry-point information. The root README is the canonical source for table behavior and API details.

## Package Scope

Use this package when you want:

- The `NatTable` component.
- Controlled or uncontrolled `NatTableState`.
- Sorting, filtering, visibility, pinning, ordering, and optional pagination state.
- Optional row selection state through `enableRowSelection` and `selectionMode`.
- Sticky headers and sticky pinned columns.
- Optional `(rowRendered)` instrumentation.
- Custom accessibility summaries and live announcements through `accessibilityText`.
- Built-in loading, empty, and error body rows with optional custom state templates.

This package does not include:

- Search UI.
- Column visibility UI.
- Page-size UI.
- Pager UI.
- Header action buttons.
- Surface styling.

Use [`ng-advanced-table-ui`](../ng-advanced-table-ui/README.md) for optional UI and [`ng-advanced-table-utils`](../ng-advanced-table-utils/README.md) for render-metrics tooling.

Body cell sizing is controlled by TanStack `ColumnDef.size`, `minSize`, and `maxSize`. Headers are intrinsic unless `meta.headerSize`, `meta.headerMinSize`, or `meta.headerMaxSize` are set.
`NatTableColumnMeta`, `NatTableState`, `NatTableSortDirection`, and `NatTableSortIndicatorContext` are the preferred public imports when table contracts are shared across companion UI and utils usage.

## Install

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

## Zoneless Compatibility

- `ng-advanced-table` is validated in a zoneless Angular `TestBed` configuration.
- Angular 22+ consumers do not need `zone.js` to use this package.

## Public Exports

- `NatTable`
- `NatTableService`
- `NAT_TABLE_UI_CONTROLLER`
- `NatTableLoadingTemplate`
- `NatTableEmptyTemplate`
- `NatTableErrorTemplate`
- `NAT_TABLE_DATA_STATUS`
- `NAT_TABLE_BODY_STATE`
- `provideNatTableIntl(...)`
- `NatTableRowRenderedEvent`
- `NatTableAccessibilityText`
- `NatTableA11y` (namespace of deep accessibility formatter context types)
- `NatTableDataStatus`
- `NatTableBodyState`
- `NatTableStateTemplateContext`
- `NatTableLoadingTemplateContext`
- `NatTableEmptyTemplateContext`
- `NatTableErrorTemplateContext`
- `NatTableRowIdGetter`
- `NatTableRowActivateEvent`
- `NatTableMode`
- `NatTableModeConfiguration`
- `NatTableState`
- `NatTableUiController`
- `NatTableUiState`
- `NatTableColumnMeta`
- `NatTableColumnMoveDirection`
- `NatTableCellTone`
- `NatTableSortDirection`
- `NatTableSortIndicatorContext`

## Minimal Example

```ts
import { Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';

interface ServiceRow {
  id: string;
  service: string;
  latencyMs: number;
}

@Component({
  selector: 'app-service-table',
  imports: [NatTable],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [enablePagination]="true"
      accessibleName="Service latency"
    />
  `,
})
export class ServiceTableComponent {
  readonly rows = signal<ServiceRow[]>([]);
  readonly columns: ColumnDef<ServiceRow>[] = [
    {
      accessorKey: 'service',
      header: 'Service',
      meta: { label: 'Service' },
      cell: (context) => context.getValue<string>(),
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

Use `meta.hiddenHeaderLabel: 'Row actions'` for compact utility columns where the visible title is redundant. The table renders that value as screen-reader-only text, and `withNatTableHeaderActions(...)` hides only the label while keeping sort and menu controls visible.

Body cell content is clamped to two lines by default. Set `meta.cellHeight` to give a column's body cells a fixed height, set `meta.cellMaxLines` to a different line count, or set `meta.cellMaxLines: Infinity` for custom interactive renderers that should not be line-clamped. Invalid explicit `meta.cellMaxLines` values fall back to two lines.

For Angular component-backed cells and more interactive cell UIs, see [Custom cell components](../../README.md#custom-cell-components) in the root README.
