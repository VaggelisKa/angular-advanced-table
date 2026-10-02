---
ng-advanced-table: patch
---

Docs and comment fixes: the Composition topic now lists the `/virtualization` entry point, states which inputs belong on `NatTable` versus `NatTableSurface`, names the two companions that accept `[for]` (`NatTableToolbar`, `NatTableExport`) with a working detached-controls example, and adds a Scope section (footer, aggregation, TanStack grouping, tree data, and expandable rows are not rendered; infinite scroll goes through virtualization). Quick start now states the versioning policy (breaking changes ship in minor releases, so prefer a tilde range or exact pin), the exact-version `@angular/aria`/`@angular/cdk` pairing, zoneless and SSR support, and the stock theme's `light-dark()` fallback. `NatTableUserState` JSDoc now points at the surface outputs and multi-sort, and `NatTableSurface` drops a redundant, always-empty content slot without changing projection.
