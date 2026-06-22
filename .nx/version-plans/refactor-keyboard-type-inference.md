---
ng-advanced-table: patch
---

Refactor the `NatTableKeyboard` interface in `libs/ng-advanced-table/src/lib/components/table/keybindings.ts` to be an inferred type alias via `ReturnType<typeof createNatTableKeyboard>`, eliminating redundant type maintenance.
