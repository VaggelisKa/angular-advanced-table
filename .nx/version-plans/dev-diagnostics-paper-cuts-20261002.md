---
ng-advanced-table: patch
---

Clearer development diagnostics. `<nat-table>`, `<nat-table-static>`, and `<nat-list>` used without a `NatTableService` now throw an error that names both fixes (wrap the renderer in `<nat-table-surface>`, or add `providers: [NatTableService]` on a host) instead of a raw `NG0201`. In development builds, each renderer warns once after its first render when you pass a non-default `pagination` or a non-empty `globalFilter` that no registered pagination or search control will apply. With no search control registered, the table still ignores `globalFilter` for rows, but emitted state now keeps your value, so a `[(state)]` binding no longer has its `globalFilter` reset to `''`. `natToolbarItem` warns once in development when a bound `natToolbarItemPosition` names a slot other than the one the toolbar projects it into, and the Toolbar documentation now explains the static-attribute rule.
