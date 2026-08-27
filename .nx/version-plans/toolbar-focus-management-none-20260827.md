---
ng-advanced-table: minor
---

Add `focusManagement` to `<nat-table-toolbar>` (`'roving'` default, `'none'` opt-out) with the exported `NatToolbarFocusManagement` type. `'none'` disables all toolbar focus management for sealed projected controls (e.g. closed-shadow-root custom elements): no host or item tabindex, no arrow-key roving, native Tab order throughout, and no empty-toolbar fallback `tabindex="0"`/`aria-disabled` on the container. The toolbar landmark role and accessible name are kept, and a dev-mode warning fires when `natToolbarItem`/`NatToolbarGroup` widgets register while the mode is `'none'`.
