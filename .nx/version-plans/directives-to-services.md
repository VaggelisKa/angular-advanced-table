---
ng-advanced-table: minor
---

refactor: convert host directives to injectable services

Replace `NatTableA11yDirective`, `NatTableResizeDirective`, `NatTableReorderDirective`, and `NatTableHeaderObservationDirective` with injectable services (`NatTableA11yService`, `NatTableResizeService`, `NatTableReorderService`, `NatTableHeaderMeasurementService`).

The directives were not using any directive-specific features (host bindings, host listeners, ElementRef). They all accessed the DOM through a manually-wired `tableRegionRef` signal, making them effectively services wrapped in `@Directive`. Converting them to `@Injectable` services:

- Removes the `hostDirectives` array and the 4-way `tableRegionRef` fan-out effect
- Consolidates `tableRegionRef` on `NatTableState` as a single shared signal
- Merges the a11y directive's snapshot/diffing/announce logic into the existing `NatTableA11yService`
- Makes all services injectable from anywhere in the DI subtree
- Moves the component closer to a pure presentational shell

**Breaking:** The public API no longer exports `NatTableA11yDirective`, `NatTableResizeDirective`, `NatTableReorderDirective`, or `NatTableHeaderObservationDirective`. These were internal implementation details and should not have been consumed directly.
