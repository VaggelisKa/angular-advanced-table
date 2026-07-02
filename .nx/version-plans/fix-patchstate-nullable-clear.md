---
ng-advanced-table: patch
---

fix(core): allow nullable `patchState` fields to be cleared back to `undefined`

Remove the `!== undefined` guard from `manualPageCount`, `locale`, and `direction` in `NatTableService.patchState()` so that transitioning these optional inputs from a concrete value back to `undefined` propagates correctly instead of silently retaining the stale value.
