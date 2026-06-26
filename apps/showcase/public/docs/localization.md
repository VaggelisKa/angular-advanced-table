## Locale Providers

Generated table copy resolves from the `ng-advanced-table/locale` entry point. Add only the providers for entry points you use.

```ts
provideNatTableLocales(...);
provideNatTableUiLocales(...);
provideNatTableUtilsLocales(...);
```

Core table copy, companion UI controls, and render-metrics utilities have separate locale sections so applications can adopt them independently.

## Runtime Locale Changes

Pass the active locale to `NatTableSurface` when the locale can change at runtime. Rebuild translated column definitions from the same translation source so headers, metadata labels, and generated helper text stay aligned.

## Accessible Names

When visible text changes, keep visible words inside accessible names. This matters for toolbar controls, selection checkboxes, export buttons, render-metrics controls, and custom icon-only buttons.

## Column Labels

`meta.label` is used by summaries, live announcements, companion controls, header actions, selection/export helpers, and custom sort indicators. Localize it whenever the column header is localized.
