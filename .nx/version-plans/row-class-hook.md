---
ng-advanced-table: minor
---

Add the `rowClass` input to `NatTable`: an optional per-row CSS class callback for state-driven row styling (e.g. highlighting halted or overdue rows). The hook is purely visual; consumers must keep the underlying state visible as text or another non-color indicator per WCAG 1.4.1.
