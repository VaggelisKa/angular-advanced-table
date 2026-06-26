## When To Use Selection

Use row selection when users need to compare, batch, or act on rows. Do not use selection for ordinary row activation; row activation and selection can coexist but they represent different intents.

## Selection State

Selection is stored by stable row id in the `rowSelection` state slice. Rows with a string or number `id` property use that value automatically. Provide `getRowId` when identity is composite or lives elsewhere.

## Single And Multiple Selection

Multiple selection is the default. Use `selectionMode="single"` only when the workflow allows one selected row at a time. Clear or normalize app-owned selection when switching modes.

## Bulk Actions

Bulk controls belong to the consuming application. Place them in a toolbar when they are table commands, but keep domain side effects such as deleting rows, opening dialogs, or calling APIs outside the table.

## Accessibility Notes

Rows expose `aria-selected` while selection is enabled. Multiple selection sets `aria-multiselectable="true"` on the grid, and selection changes are announced through the table live region.
