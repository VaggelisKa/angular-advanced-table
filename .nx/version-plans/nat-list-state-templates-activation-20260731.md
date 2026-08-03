---
ng-advanced-table: minor
---

Align `NatList` with the table's body-state and interaction contracts. It now accepts the same `natTableLoading` / `natTableEmpty` / `natTableError` templates as `nat-table`, rendering them inside the shared `list-state` shell, which also gives the previously unused `[error]` input its purpose (the error template receives the consumer payload). Adds an opt-in `enableRowActivation` input plus a `rowActivate` output that emits on click and Enter/Space; activation is opt-in because a plain `<li>` needs `tabindex` to stay keyboard-operable. Adds a `listSummary` accessibility locale entry so a list announces items and fields instead of rows and columns, falling back to `tableSummary` when only that one is overridden. `NatList` is confirmed public API.
