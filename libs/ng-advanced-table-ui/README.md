# ng-advanced-table-ui

Optional UI package for the `angular-advanced-table` workspace.

## Canonical Docs

- Workspace and package docs: [../../README.md](../../README.md)
- UI package reference: [../../README.md#ui-package](../../README.md#ui-package)
- Accessibility and internationalization: [../../ACCESSIBILITY.md](../../ACCESSIBILITY.md)
- Core table reference: [../../README.md#core-table](../../README.md#core-table)
- Install options: [../../README.md#install](../../README.md#install)

This package README is intentionally scoped to package entry-point information. The root README is the canonical source for controller behavior and composition rules.

## Package Scope

Use this package when you want optional companions around `NatTable`:

- `NatTableSurface`
- `NatTableColumnVisibility`
- `NatTablePageSize`
- `NatTablePager`
- `NatTableScrollControl`
- `withNatTableHeaderActions(...)`

The package accepts any compatible `NatTableUiController<TData>`. `<nat-table #grid="natTable">` satisfies that contract directly.

## Install

```bash
npm install ng-advanced-table ng-advanced-table-ui @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

For app-level UI localization through `provideNatTableUiLocales()`, also install
`ng-advanced-table-locales` and import it from `ng-advanced-table-locales`.

## Zoneless Compatibility

- `ng-advanced-table-ui` is validated in a zoneless Angular `TestBed` configuration.
- Angular 21+ consumers do not need `zone.js` to use this package.

## Public Exports

- `NatTableSurface`
- `NatTableColumnVisibility`
- `NatTablePageSize`
- `NatTablePager`
- `NatTableScrollControl`
- `withNatTableHeaderActions(...)`
- `NatTableHeaderActionsOptions`
- `NatTableHeaderActionsColumnOptions`
- `NatTableSortIndicatorContent`
- `NatTableAccessibilityScrollControlLabels`
- `NatTableAccessibilityScrollControlPositionContext`
- `NatTableAccessibilityPageSizeOptionContext`
- `NatTableAccessibilityPageSizeLabels`
- `NatTableAccessibilityPagerContext`
- `NatTableAccessibilityPagerLabels`
- `NatTableAccessibilityColumnVisibilitySummaryContext`
- `NatTableAccessibilityColumnVisibilityActionContext`
- `NatTableAccessibilityColumnVisibilityStateContext`
- `NatTableAccessibilityColumnVisibilityLabels`
- `NatTableAccessibilityHeaderActionMenuContext`
- `NatTableAccessibilityHeaderActionSortContext`
- `NatTableAccessibilityHeaderActionPinContext`
- `NatTableAccessibilityHeaderActionMoveContext`
- `NatTableAccessibilityHeaderActionLabels`
- `NatTableColumnMoveDirection`
- `NatTableUiController`
- `NatTableUiState`
- `NatTableColumnMeta`
- `NatTableSortDirection`
- `NatTableSortIndicatorContext`

`NatTableColumnMeta`, `NatTableSortDirection`, and `NatTableSortIndicatorContext` are kept aligned with the workspace's internal contract checks. Prefer importing shared contracts from `ng-advanced-table` when a column definition is used by multiple packages.

## Package Notes

- `NatTableSurface` owns the default `--nat-table-*` CSS variables.
- The controller contract is intentionally small: `table`, `enableGlobalFilter()`, `enablePagination()`, `patchState(...)`, `tableElementId` (`Signal<string>` — call `tableElementId()` for the DOM id string), and optional `localeId`.
- Companion controls inherit the controlled table locale and expose label inputs only for instance-specific overrides.
- `NatTableScrollControl` connects to the table scroll container and provides horizontal scroll buttons plus a range control.
- `withNatTableHeaderActions(...)` preserves the original header content and only adds controls when the column can sort, pin, or opt into reorder actions. Its compact three-dot menu includes pin actions unless `enableColumnPinActions` is disabled, and Move left/Move right actions when `enableColumnReorderActions` is enabled and those actions are available.
- `withNatTableHeaderActions(...)` is idempotent. Reapplying it to already-wrapped columns updates the wrapper options instead of nesting header controls.
- Set `column.meta.hiddenHeaderLabel` to visually hide the header title while keeping the sort button and three-dot menu visible with generated accessible labels.
- Core table body cells clamp content to two lines by default; use `column.meta.cellHeight`, finite `column.meta.cellMaxLines` values, or `column.meta.cellMaxLines = Infinity` on shared column definitions when companion UI columns need specific body-cell sizing.
- Use `column.meta.headerActions = false` to opt out per column, or provide `{ sortIndicator, enableColumnPinActions, enableColumnReorderActions, accessibilityLabels }` there to override the helper-level options for one column.
- Apply other column helpers first, then wrap the final column list with `withNatTableHeaderActions(...)`, for example `withNatTableHeaderActions(withRenderMetricsColumn(columns, metricsStore), options)`.
- If you enable drag/drop reordering without this helper, provide your own non-drag pointer controls. Custom header menus can call `headerContext.table.options.meta?.natTableMoveColumn?.(column.id, direction)`, where `direction` is `'left'` or `'right'`, and read `natTableCanMoveColumn` to disable unavailable directions.
- Row-level action menus are intentionally not bundled. Build them as normal cell renderers, for example with an `Actions` column that renders a CDK menu trigger.
- You can use any subset of this package or replace all of it with custom controls.

## Minimal Example

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';
import {
  NatTablePager,
  NatTableScrollControl,
  NatTableSurface,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface OrderRow {
  id: string;
  symbol: string;
  notional: number;
}

const columns = withNatTableHeaderActions<OrderRow>([
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    meta: { label: 'Symbol' },
    cell: (context) => context.getValue<string>(),
  },
  {
    accessorKey: 'notional',
    header: 'Notional',
    meta: { label: 'Notional', align: 'end' },
    cell: (context) => `$${context.getValue<number>().toFixed(0)}`,
  },
]);

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTablePager, NatTableScrollControl, NatTableSurface],
  template: `
    <nat-table-surface>
      <nat-table
        #grid="natTable"
        [data]="rows()"
        [columns]="columns"
        [enablePagination]="true"
        accessibleName="Orders"
      />

      <nat-table-scroll-control />
      <nat-table-pager />
    </nat-table-surface>
  `,
})
export class OrdersTableComponent {
  readonly rows = signal<OrderRow[]>([]);
  readonly columns = columns;
}
```
