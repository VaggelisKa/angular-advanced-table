---
ng-advanced-table: patch
---

Refactor the `NatTableHotkeyA11y` directive mutation observer spec to wait deterministically for the DOM changes via a `MutationObserver` promise helper instead of using a hardcoded `setTimeout(50)` delay.
