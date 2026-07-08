---
ng-advanced-table: minor
---

Expose separate CSS custom properties for header and data cell horizontal padding. Previously `--nat-table-space-cell-x` applied uniformly to both header and data cells, forcing a trade-off: increasing horizontal padding for data readability also opened visible gaps between header columns. Two new tokens now decouple the two: `--nat-table-space-header-cell-x` controls header cell inline padding and `--nat-table-space-data-cell-x` controls data cell inline padding. Both fall back to the existing `--nat-table-space-cell-x` shared base, so there is no visual change unless a consumer opts in. (#262)
