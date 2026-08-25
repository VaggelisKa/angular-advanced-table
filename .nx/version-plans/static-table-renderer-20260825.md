---
ng-advanced-table: minor
---

Add the `NatTableStatic` renderer (`<nat-table-static>`): a semantic-table renderer on the shared table engine with no ARIA grid, grid keyboard model, cell tab stops, or managed in-cell controls. It implements `NatTableUiController`, renders surface-driven sorting, pinning, sub-headers, and data states, and imports neither `@angular/aria` nor the CDK drag machinery, so static-only consumers tree-shake them away.
