---
ng-advanced-table: minor
---

Rename the list renderer's public theming tokens from `--nat-table-list-*` to `--nat-list-*` (breaking; internal `--sys-nat-table-list-*` bridges are unchanged), add list field layout tokens (`--nat-list-field-flex-direction`, `--nat-list-field-justify`, label font-size/color) plus a `.list-field-value--fill` behavior for sr-only-label fields, introduce configurable sub-header border/background/spacing tokens for both renderers, and add `subHeaderLayout` (`'colspan' | 'cells'`) to `NatTable` so sub-header rows can preserve pinned-column boundaries.
