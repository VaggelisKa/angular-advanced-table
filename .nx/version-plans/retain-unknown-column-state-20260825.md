---
ng-advanced-table: patch
---

Keep `columnPinning` and `columnOrder` entries for column ids the active renderer does not have. Shared surface state now survives table/list renderer swaps with differing column sets; only the TanStack-facing state filters unknown ids.
