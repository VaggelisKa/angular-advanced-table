---
'ng-advanced-table-ui': patch
'ng-advanced-table-utils': patch
---

Remove direct package coupling to `ng-advanced-table` by switching the companion UI and render-metrics packages to structural controller/event contracts.

`<nat-table #grid="natTable">` instances still work as the `for` input in consuming apps, but `ng-advanced-table-ui` and `ng-advanced-table-utils` no longer declare `ng-advanced-table` as a peer dependency or import its runtime/types internally.
