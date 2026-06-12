---
ng-advanced-table: minor
---

Add `localeSortingFn`, an `Intl.Collator`-backed locale-aware string `sortingFn` factory exported from the public API. Attach it to a column's `sortingFn` for correct ordering of accented and locale-specific text (for example Danish Æ/Ø/Å collating after Z and the digraph "Aa" collating as Å), with an optional locale id and `Intl.CollatorOptions` to tune sensitivity and numeric collation.
