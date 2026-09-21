---
ng-advanced-table: patch
---

Refocus the `ng-advanced-table/locale` specs on the locale mechanism instead of the dictionaries. The specs that pinned exact English and Nordic strings are removed; what remains checks that registering a dictionary under an id resolves that dictionary (exact, region-tagged, and case-folded ids), that unknown ids fall back to English, that partial overrides merge field by field through nested and reactive providers, and that every shipped dictionary defines the same keys as English and produces non-empty copy for every context. Fallback assertions compare against the English dictionary rather than literal strings, so copy edits no longer break mechanism tests.
