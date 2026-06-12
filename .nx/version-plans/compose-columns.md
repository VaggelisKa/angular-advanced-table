---
ng-advanced-table: minor
---

Add the `composeColumns` utility and its `NatTableColumnTransform` type: a left-to-right column-transform composition helper that applies `(columns) => columns` transforms in order, so chained `withX(...)` column helpers read top to bottom instead of inside-out. With no transforms it returns a shallow copy of the input columns.
