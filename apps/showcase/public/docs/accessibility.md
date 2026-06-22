Accessible table authoring is part of the table API. The core table handles grid roles, keyboard movement, state rows, live announcements, row selection attributes, and companion-control wiring. Your app still owns product copy, custom cells, dialogs, menus, and domain workflow accessibility.

## Minimum Checklist

Before shipping a table, verify this list:

| Requirement                                        | Where to set it                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Table has a clear accessible name                  | `caption` or `accessibleName`                                                                   |
| Every data column has a human label                | `columnDef.meta.label`                                                                          |
| One identifying column is a row header             | `columnDef.meta.rowHeader: true`                                                                |
| Icon-only or utility headers remain named          | `columnDef.meta.hiddenHeaderLabel`                                                              |
| Numeric cells align predictably                    | `columnDef.meta.align: 'end'`                                                                   |
| State rows have visible, meaningful text           | `natTableLoading`, `natTableEmpty`, `natTableError` templates or `accessibilityText`            |
| Custom cell controls have names                    | App-owned `aria-label`, visible text, or design-system labels                                   |
| Interactive cells integrate with grid focus        | `ngGridCellWidget` on the real focusable element                                                |
| Generated UI copy is localized                     | `provideNatTableLocales`, `provideNatTableUiLocales`, `provideNatTableUtilsLocales`             |
| Reordering and resizing have keyboard instructions | `accessibilityText.reorderKeyboardInstructions`, `accessibilityText.resizeKeyboardInstructions` |

## Table Name

Use `caption` when a visible table title belongs inside the grid. Use `accessibleName` when the page already has visible context and an extra caption would be redundant.

```html
<nat-table [data]="rows()" [columns]="columns" caption="Open positions" />
```

```html
<nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
```

A visible caption names the rendered grid. `accessibleName` remains the required captionless fallback for authoring.

## Column Metadata

Provide `meta.label` for every column. Mark the primary identifying column as the row header, and align numeric values to the end edge.

```ts
readonly columns: ColumnDef<PositionRow>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    meta: { label: 'Symbol', rowHeader: true },
  },
  {
    accessorKey: 'marketValue',
    header: 'Market value',
    meta: { label: 'Market value', align: 'end' },
    cell: (context) => currency.format(context.getValue<number>()),
  },
];
```

`meta.label` is used by summaries, live announcements, companion controls, header actions, selection/export helpers, and custom sort indicators. It is especially important when the header is a component, function, icon, or non-human id.

## Hidden Header Labels

Use `hiddenHeaderLabel` for compact utility columns where visible text would add clutter but assistive technology still needs a header label.

```ts
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
  },
  cell: (context) =>
    flexRenderComponent(RowActionsMenu, {
      inputs: { row: context.row.original },
    }),
}
```

The table renders hidden header labels as screen-reader-only text for both primitive and non-primitive headers, including columns wrapped with `withNatTableHeaderActions(...)`.

## Table-Specific Copy

Use `accessibilityText` for product-specific descriptions, state copy, and live-announcement formatters.

```ts
import type { NatTableAccessibilityText } from 'ng-advanced-table';

readonly accessibilityText: NatTableAccessibilityText = {
  description: 'Sortable table of open positions with a sticky symbol column.',
  emptyState: 'No positions match the current filters.',
  loadingState: 'Loading positions.',
  errorState: 'Positions could not be loaded.',
  reorderKeyboardInstructions:
    'Use Control+Shift+Arrow keys to move columns. On macOS, use Command+Shift+Arrow keys.',
  resizeKeyboardInstructions:
    'Use Alt+Left and Alt+Right to resize the focused column. Use Alt+Home and Alt+End for bounds.',
  tableSummary: ({ visibleRowsText, totalRowsText, pageText, pageCountText }) =>
    `${visibleRowsText} of ${totalRowsText} rows visible. Page ${pageText} of ${pageCountText}.`,
  sortingChange: ({ columnLabel, sortState }) =>
    columnLabel ? `${columnLabel} sorted ${sortState}.` : 'Sorting cleared.',
};
```

```html
<nat-table-surface [accessibilityText]="accessibilityText">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

Use table-specific copy for the instance. Use locale providers for common generated labels.

## Localization Providers

Generated copy resolves from locale providers. Add only the providers for packages you use.

```ts
import { ApplicationConfig } from '@angular/core';
import {
  provideNatTableLocales,
  provideNatTableUiLocales,
  provideNatTableUtilsLocales,
} from 'ng-advanced-table-locales';

export const appConfig: ApplicationConfig = {
  providers: [provideNatTableLocales(), provideNatTableUiLocales(), provideNatTableUtilsLocales()],
};
```

When locale changes at runtime, pass the active locale to the surface and rebuild translated column definitions from the same translation source.

```ts
readonly localeId = signal<'en' | 'da'>('en');
readonly copy = computed(() => translations[this.localeId()]);

readonly columns = computed<ColumnDef<OrderRow>[]>(() => {
  const labels = this.copy();

  return [
    {
      accessorKey: 'id',
      header: labels.order,
      meta: { label: labels.order, rowHeader: true },
    },
    {
      accessorKey: 'total',
      header: labels.total,
      meta: { label: labels.total, align: 'end' },
    },
  ];
});
```

```html
<nat-table-surface [locale]="localeId()">
  <nat-table [data]="rows()" [columns]="columns()" [accessibleName]="copy().ordersTable" />
</nat-table-surface>
```

Do not rely on placeholder text as a search input's only accessible label. Do not echo raw semantic tokens such as `ascending`, `pin`, or `hidden` directly into localized copy unless those tokens are translated for users.

## State Rows

Use `dataStatus` and state templates for loading, empty, and error rows. The table owns row placement; your app owns fetching, retrying, and error classification.

```html
<nat-table
  [data]="rows()"
  [columns]="columns"
  [dataStatus]="status()"
  [error]="error()"
  accessibleName="Open positions"
>
  <ng-template natTableLoading>
    <strong>Loading positions</strong>
    <span>Fetching the latest open positions.</span>
  </ng-template>

  <ng-template natTableEmpty let-filtered="filtered">
    <strong>No positions found</strong>
    <span>
      {{ filtered ? 'No rows match the active filters.' : 'There are no open positions.' }}
    </span>
  </ng-template>

  <ng-template natTableError let-error>
    <strong>Positions unavailable</strong>
    <button type="button" (click)="reload()">Retry</button>
  </ng-template>
</nat-table>
```

Custom state templates should include visible text or accessible names that make sense without color or icons. Focusable controls inside state templates can be normal buttons, links, or inputs.

## Custom Interactive Cells

Use `flexRenderComponent(...)` for Angular component cells. Put `ngGridCellWidget` from `@angular/aria/grid` on the real focusable element inside the custom component.

```ts
import { Component, input, output } from '@angular/core';
import { GridCellWidget } from '@angular/aria/grid';

@Component({
  selector: 'app-trade-button',
  imports: [GridCellWidget],
  template: `
    <button
      type="button"
      ngGridCellWidget
      [attr.aria-label]="accessibleName()"
      (click)="pressed.emit()"
    >
      Trade
    </button>
  `,
})
export class TradeButton {
  readonly accessibleName = input.required<string>();
  readonly pressed = output<void>();
}
```

```ts
{
  id: 'trade',
  header: 'Trade',
  enableSorting: false,
  enableGlobalFilter: false,
  meta: { label: 'Trade', hiddenHeaderLabel: 'Trade actions' },
  cell: (context) =>
    flexRenderComponent(TradeButton, {
      inputs: {
        accessibleName: `Trade ${context.row.original.symbol}`,
      },
      outputs: {
        pressed: () => this.openTradeTicket(context.row.original.id),
      },
    }),
}
```

`(rowActivate)` is for row-level primary actions. It ignores events from interactive descendants such as buttons, links, inputs, menu items, and contenteditable regions.

## Selection Accessibility

Row selection is enabled with `[enableRowSelection]="true"` and optionally a generated checkbox column from `withNatTableSelectionColumn(...)`.

```ts
readonly columns = withNatTableSelectionColumn(baseColumns, {
  label: 'Selection',
  selectAllAriaLabel: 'Select all positions',
  selectRowAriaLabel: (row) => `Select ${row.original.symbol}`,
});
```

```html
<nat-table-surface [state]="tableState()" (rowSelectionChange)="onRowSelectionChange($event)">
  <nat-table
    [data]="rows()"
    [columns]="columns"
    [enableRowSelection]="true"
    [getRowId]="getRowId"
    accessibleName="Selectable positions"
  />
</nat-table-surface>
```

Rows expose `aria-selected` while selection is enabled. The grid exposes `aria-multiselectable="true"` only in multiple mode. Selection changes are announced through the table live region.

## Final Review

Answer these questions before considering a table accessible:

- Can a screen-reader user identify the table without seeing the page?
- Are all column labels meaningful outside the visual layout?
- Do custom cells expose names and keyboard behavior through real controls?
- Do state rows communicate loading, empty, and error states through text?
- Are generated summaries, controls, and announcements localized?
- Do focus indicators, text, controls, pinned columns, and semantic tones meet WCAG AA contrast?
