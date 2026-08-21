---
ng-advanced-table: patch
---

Let `--nat-list-item-border-width` accept 1-4 value shorthand (e.g. `1px 0` for divider-only items). The list item previously fed the token into the `border` shorthand, which takes a single width, so a multi-value width silently invalidated the whole border; the item now uses the `border-width`/`border-style`/`border-color` longhands.
