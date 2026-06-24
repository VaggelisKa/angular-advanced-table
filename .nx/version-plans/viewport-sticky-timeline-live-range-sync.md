---
ng-advanced-table: patch
---

Fix viewport-sticky headers drifting below page chrome on mobile by keeping scroll-timeline animation ranges stable between layout changes and applying a lightweight `--nat-table-sticky-vv-correction` term from live table geometry during scroll. Recomputing the range every frame had been shifting stacked tables further out of sync the deeper you scrolled.
