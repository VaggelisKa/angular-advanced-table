---
ng-advanced-table: minor
---

Add text-direction support to `NatTable`: a new `direction` input (`'ltr' | 'rtl'`) that falls back to the inherited CDK `Directionality` and finally to `'ltr'`, a `dir` attribute reflected on the rendered grid, and a logical-property fix (`text-align: end`) so end-aligned columns mirror correctly in RTL.
