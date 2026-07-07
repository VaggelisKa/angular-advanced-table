---
ng-advanced-table: patch
---

Let consumer `--nat-table-*` theme tokens set on wrapper ancestors flow through `NatTableSurface`: the surface now provides its stock theme via internal `--sys-nat-table-*` bridge variables instead of declaring public tokens on its host, so the documented wrapper theming contract works. Behavioral note: wrapper-scoped tokens that were previously silently masked when a surface was present will now apply. Also anchor header resize handles to their own header cells in non-sticky, unpinned tables so each handle stays on the column it resizes.
