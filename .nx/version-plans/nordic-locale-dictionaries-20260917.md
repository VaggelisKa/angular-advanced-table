---
ng-advanced-table: minor
---

Ship built-in Danish, Swedish, Finnish, and Norwegian Bokmål dictionaries from `ng-advanced-table/locale`. Each language covers all three locale domains and is split by domain like the English copy, so `provideNatTableLocales()`, `provideNatTableControlsLocales()`, and `provideNatTableRenderMetricsLocales()` now register `da`, `fi`, `nb`, `no`, and `sv` alongside `en` with no extra configuration; `[locale]` on `NatTableSurface` selects one. The dictionaries are also exported individually (`NAT_DA_LOCALE_LABELS`, `NAT_DA_CONTROLS_LOCALE_LABELS`, `NAT_DA_RENDER_METRICS_LOCALE_LABELS`, and the `NAT_FI_*`/`NAT_NB_*`/`NAT_SV_*` equivalents) together with their locale ids, so an application can register them under region-tagged ids such as `da-DK`. `no` is an alias of the Bokmål dictionary; Nynorsk is not covered. Each language supplies its own plural and agreement forms rather than the English `+s` rule.
