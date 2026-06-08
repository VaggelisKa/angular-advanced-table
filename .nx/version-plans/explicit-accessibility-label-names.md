---
ng-advanced-table: minor
ng-advanced-table-ui: minor
ng-advanced-table-locales: minor
---

Replace ambiguous accessibility naming inputs for table and companion UI controls. `NatTable` now uses `accessibleName` for hidden grid names and supports a semantic visible `caption`; companion UI controls and UI locale dictionaries now use `groupAriaLabel` for group names. This intentionally removes the previous `ariaLabel` public inputs for these surfaces while keeping the release plan at `minor` per current project policy.
