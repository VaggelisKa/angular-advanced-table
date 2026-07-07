---
ng-advanced-table: minor
---

Allow locale provider helpers to accept DI-backed factory callbacks, so `provideNatTableIntl(...)`, `provideNatTableControlsIntl(...)`, and `provideNatTableRenderMetricsIntl(...)` can build translated copy from injectable runtime services while preserving parent merge semantics.
