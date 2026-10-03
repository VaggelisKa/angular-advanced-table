---
ng-advanced-table: patch
---

`<nat-table>`, `<nat-table-static>`, and `<nat-list>` used without a `NatTableService` now throw an error that names both fixes (wrap the renderer in `<nat-table-surface>`, or add `providers: [NatTableService]` on a host) instead of a raw `NG0201`. With no search control registered, the table still ignores `globalFilter` for rows, but emitted state now keeps your value, so a `[(state)]` binding no longer has its `globalFilter` reset to `''`. The State, Pagination, Filtering and Search, and Toolbar documentation and the `nat-best-practises` skill now spell out that `pagination` and `globalFilter` apply only while a matching control is mounted, and that toolbar positions must be static attributes.
