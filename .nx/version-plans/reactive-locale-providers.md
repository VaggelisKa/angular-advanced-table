---
ng-advanced-table: minor
---

Allow the core, companion-control, and render-metrics intl and locale-map providers to consume signal-backed configurations. Reactive provider values now merge through nested injector scopes and update generated copy, accessible names, and formatters without remounting the table or provider scope, while existing static and dependency-injection factory forms continue to work.
