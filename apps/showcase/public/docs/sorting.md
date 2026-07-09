## When To Use Sorting

Use sorting when the table can order the rows it currently receives, or when your app wants to expose sort state to Manual Data Handling. Keep domain ranking rules in the consuming app when sorting depends on permissions, remote scoring, or data that is not present in the current row set.

## Controlled Sorting

Sorting lives in the `sorting` state slice. Let the table manage it for simple client-side tables, or own the slice when you need URL persistence, custom buttons, analytics, or a manual row pipeline.

```ts
readonly tableState = signal<Partial<NatTableUserState>>({
  sorting: [{ id: 'name', desc: false }]
});
```

Header sort controls are added by wrapping columns with `withNatTableHeaderActions(...)`. Programmatic controls should update the same state slice instead of keeping a second sort model.

## Multi-Column Sorting

Enable multi-sort on the surface when users need priority order across multiple columns. The first sorting entry has the highest priority. Keep the priority visible when the workflow depends on it.

```html
<nat-table-surface [enableMultiSort]="true" [(state)]="tableState">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

```ts
readonly tableState = signal<Partial<NatTableUserState>>({
  sorting: [
    { id: 'sector', desc: false },
    { id: 'marketValue', desc: true },
  ],
});
```

Use the `sorting` array as the source of truth for priority. Header sort buttons add another sorted column when the user holds `Shift` while clicking, or `Shift` while pressing `Enter` on a focused sort button. Programmatic presets should write the same ordered array instead of keeping a separate priority model.

When multi-sort changes the meaning of the result set, show the priority near the table or in the sorted headers. The bundled header actions render a priority badge for sorted columns when more than one column is active.

## Custom Sort Indicators

Use `withNatTableHeaderActions(...)` when you want the bundled sort behavior, labels, and menu actions, but need indicator content that matches your product or design system.

Keep the table header structure intact. The composable pattern is to leave each column's label or component in `column.header`, wrap the final columns with `withNatTableHeaderActions(...)`, and pass replacement icon or badge content through `sortIndicator`. Do not add another header row, style a row to look like a header, or wire a separate sort button just to change the icon.

```ts
import { Component, input } from '@angular/core';
import { flexRenderComponent, type NatTableSortIndicatorContext } from 'ng-advanced-table';
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

@Component({
  selector: 'app-sort-indicator',
  template: `
    <span aria-hidden="true" [attr.data-sort-state]="context().sortState || 'none'" class="sort-indicator">
      {{ context().sortState === 'asc' ? 'Asc' : context().sortState === 'desc' ? 'Desc' : 'Sort' }}
    </span>
  `,
})
export class SortIndicator {
  readonly context = input.required<NatTableSortIndicatorContext>();
}

readonly columns = withNatTableHeaderActions(baseColumns, {
  sortIndicator: (context) =>
    flexRenderComponent(SortIndicator, {
      inputs: { context },
    }),
});
```

The indicator receives the current `sortState`, resolved column `label`, `ariaSort` token, and column object. Keep the indicator visual only; the generated sort button still owns the click handler, keyboard behavior, accessible name, multi-sort state, and `aria-sort`.

Override individual columns through `column.meta.headerActions` when one column needs a different indicator or should opt out.

```ts
{
  accessorKey: 'marketValue',
  header: 'Market value',
  meta: {
    label: 'Market value',
    align: 'end',
    headerActions: {
      sortIndicator: ({ sortState }) => (sortState === false ? 'No sort' : sortState.toUpperCase()),
    },
  },
}
```

Set `meta.headerActions` to `false` for action columns or utility columns that should keep their original header instead of receiving sort, pin, or move controls.

## Pinned Columns Variant

Sorting and pinning can coexist. Pinning affects where columns render; sorting still uses column ids and row data. Keep pinned columns stable when they carry row identity or row actions.

## Hiding Sort UI Does Not Disable Sorting

`withNatTableHeaderActions(columns, { enableSortActions: false })` removes the sort button and indicator from the header, but sorting itself keeps working: `table.setSorting(...)` and columnDef-level `enableSorting` are unaffected, and `aria-sort` still reflects the applied sort. This is the mechanism behind hiding capability UI on mobile while an app-owned control (a sort sheet, for example) drives sorting programmatically. See the Responsive Capabilities topic for the full pattern.
