---
ng-advanced-table: minor
---

Add styling hooks that replace common `::ng-deep` overrides on sub-headers, headers, and list items.

- Sub-header content now fills its row in `<nat-table>` (up to the visible region width) and `<nat-list>` instead of shrinking to its content, so a `natTableSubHeader` template can put a title at the start and a total at the end. New `--nat-table-sub-header-content-display`/`-gap`/`-align`/`-justify` and `--nat-list-sub-header-content-display`/`-gap`/`-align`/`-justify` tokens lay out the template's root nodes.
- `--nat-list-sub-header-columns` sets the grid tracks of a list sub-header whose content display is `grid`; it defaults to `--nat-list-item-columns`, so the sub-header follows the item columns.
- `--nat-table-group-last-row-border-width` and `--nat-list-group-last-item-border-width` style the last row or item of each group (the one before a sub-header). Both fall back to the regular divider, and the list token takes the 1-4 value `border-width` shorthand.
- `--nat-list-item-align` sets `align-items` for the fields of one list item (`stretch` by default); `start` keeps fields content-sized for projected components that use `height: 100%`.
- `--nat-table-header-background-hover` tints the header of a sortable column on hover; off by default. Header cells of sortable columns carry an `is-sortable` class.
- A custom `sortIndicator` now inherits the `--nat-table-sort-icon-color-idle`/`-hover`/`-active`/`-disabled` tokens through its text color. With the stock `theme.css` this changes the color of custom indicators drawn with `currentColor`; without those tokens set nothing changes.
- New `sortButtonFill` option on `withNatTableHeaderActions(...)` and `meta.headerActions` stretches the sort button's hit area over the whole header cell. The column menu and resize handle keep working, and the header can still be dragged to reorder.
