---
ng-advanced-table: patch
---

Fix sticky header offset calculation to read the `--nat-table-sticky-top` custom property directly instead of the computed CSS `top` property. This prevents the browser from natively shifting the sticky cells vertically inside horizontal scroll containers when the page is not scrolled.
