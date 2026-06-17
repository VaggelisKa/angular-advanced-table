---
ng-advanced-table-ui: minor
---

Remove the `<nat-table-search>` component (class `NatTableSearch`) and its internal `createIdGenerator` helper from `ng-advanced-table-ui`. Global search builds on the public `NatTableService` registration API, so it belongs in consumer code rather than the library. The showcase ships a reference `app-table-search` implementation that consumers can copy and own.
