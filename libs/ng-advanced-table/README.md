# ng-advanced-table

Core table package for the `angular-advanced-table` workspace.

## Canonical Docs

- Workspace and package docs: [../../README.md](../../README.md)
- Core table overview: [../../README.md#core-table](../../README.md#core-table)
- Core API reference: [../../README.md#core-api](../../README.md#core-api)
- Custom cell component guidance: [../../README.md#custom-cell-components](../../README.md#custom-cell-components)
- Core accessibility overrides: [../../README.md#accessibility-text-overrides](../../README.md#accessibility-text-overrides)

This package README is intentionally scoped to package entry-point information. The root README is the canonical source for table behavior and API details.

## Package Scope

Use this package when you want:

- The `NatTable` component.
- Controlled or uncontrolled `NatTableState`.
- Sorting, filtering, visibility, pinning, ordering, and optional pagination state.
- Optional expandable detail rows driven by `expandedRow` and `state.expanded`.
- Sticky headers and sticky pinned columns.
- Optional `(rowRendered)` instrumentation.
- Custom accessibility summaries and live announcements through `accessibilityText`.

This package does not include:

- Search UI.
- Column visibility UI.
- Page-size UI.
- Pager UI.
- Header action buttons.
- Surface styling.

Use [`ng-advanced-table-ui`](../ng-advanced-table-ui/README.md) for optional UI and [`ng-advanced-table-utils`](../ng-advanced-table-utils/README.md) for render-metrics tooling.

## Install

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/aria @angular/cdk
```

## Zoneless Compatibility

- `ng-advanced-table` is validated in a zoneless Angular `TestBed` configuration.
- Angular 21+ consumers do not need `zone.js` to use this package.

## Public Exports

- `NatTable`
- `NatTableRowRenderedEvent`
- `NatTableAccessibilityText`
- `NatTableA11y` (namespace of deep accessibility formatter context types)
- `NatTableExpandedState`
- `NatTableExpandedRowContext`
- `NatTableRowExpandablePredicate`
- `NatTableRowIdGetter`
- `NatTableRowActivateEvent`
- `NatTableState`
- `NatTableColumnMeta`
- `NatTableCellTone`
- `NatTableSortDirection`
- `NatTableSortIndicatorContext`

## Minimal Example

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

interface ServiceRow {
  id: string;
  service: string;
  latencyMs: number;
}

@Component({
  selector: 'app-service-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [enablePagination]="true"
      ariaLabel="Service latency"
      (stateChange)="tableState.set($event)"
    />
  `,
})
export class ServiceTableComponent {
  readonly rows = signal<ServiceRow[]>([]);
  readonly tableState = signal<Partial<NatTableState>>({});
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

For Angular component-backed cells and more interactive cell UIs, see [Custom cell components](../../README.md#custom-cell-components) in the root README.
