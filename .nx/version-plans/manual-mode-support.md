---
ng-advanced-table: minor
ng-advanced-table-ui: minor
---

Add support for granular manual mode configuration on `<nat-table-surface>` and `<nat-table>`. The `mode` option can now accept either a single string `'auto' | 'manual'`, or a custom object configuration `Partial<{ pagination: 'auto' | 'manual', sorting: 'auto' | 'manual', filtering: 'auto' | 'manual' }>` to control client-side processing of individual slices independently.
