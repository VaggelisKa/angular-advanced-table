---
ng-advanced-table: patch
---

Limit `aria-sort` to the primary sorted header during multi-column sorts. The table still preserves the full multi-sort state, priority badges, and combined live announcement, but secondary sort columns no longer advertise competing header-level sort semantics.
