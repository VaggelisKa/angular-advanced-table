---
ng-advanced-table: minor
---

**Breaking:** `NatTableService` is now the single owner of table state, and the surface (or a host that provides the service) is the only thing that drives it. Renderers no longer keep their own copy of uncontrolled state: `<nat-table>`, `<nat-list>`, and `<nat-table-static>` read `NatTableService.state` and commit changes back to it. The service seeds from `initialState` once, so swapping renderers under a host-provided service keeps sorting, filters, pagination, and the other slices instead of re-seeding them.

Consumer changes for code that injects `NatTableService` directly:

- `patchState(config)` becomes `configure(config)`. The configuration options (`enableSorting`, `stickyHeader`, `locale`, and the others) are now read-only signals; set them through `configure()` instead of calling `.set()` on them.
- `state` is now the resolved view state (controlled slices over the state the service owns). The controlled `[(state)]` slices are `controlledState`, and `surfaceInitialState` becomes `initialState`.
- `stateChangeEvent` becomes `stateChanges`. `setState`, `updateState`, `notifyStateChange`, and `surfaceMode` are removed; write state through the active controller's `patchState()` or the surface `[(state)]` binding.

`NatTableSurface` inputs, outputs, and `[(state)]` behaviour are unchanged.
