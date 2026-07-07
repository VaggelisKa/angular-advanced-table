## Locale Providers

Generated table copy resolves from the `ng-advanced-table/locale` entry point. Add only the providers for entry points you use.

```ts
provideNatTableLocales(...);
provideNatTableControlsLocales(...);
provideNatTableRenderMetricsLocales(...);
```

Core table copy, companion UI controls, and render-metrics utilities have separate locale sections so applications can adopt them independently.

Provider helpers also accept a factory callback when copy comes from an injectable translation service. The callback runs inside Angular dependency injection, and its return value is merged with parent providers the same way static config is merged.

```ts
import { inject } from '@angular/core';
import { provideNatTableIntl, provideNatTableControlsIntl, provideNatTableRenderMetricsIntl } from 'ng-advanced-table/locale';

providers: [
  provideNatTableIntl(() => {
    const translate = inject(TranslateService);

    return {
      accessibilityText: {
        emptyState: translate.instant('table.empty'),
        loadingState: translate.instant('table.loading')
      }
    };
  }),
  provideNatTableControlsIntl(() => {
    const translate = inject(TranslateService);

    return {
      headerActions: {
        accessibilityLabels: {
          sortButton: ({ label }) => translate.instant('table.sortButton', { label })
        }
      }
    };
  }),
  provideNatTableRenderMetricsIntl(() => {
    const translate = inject(TranslateService);

    return {
      renderMetrics: {
        panel: {
          ariaLabel: translate.instant('table.renderMetrics.panel')
        }
      }
    };
  })
];
```

Return a single locale dictionary to override English defaults, or return `{ locales: { ... } }` when registering several locale ids.

## Runtime Locale Changes

Pass the active locale to `NatTableSurface` when the locale can change at runtime. Rebuild translated column definitions from the same translation source so headers, metadata labels, and generated helper text stay aligned.

## Accessible Names

When visible text changes, keep visible words inside accessible names. This matters for toolbar controls, selection checkboxes, export buttons, render-metrics controls, and custom icon-only buttons.

## Column Labels

`meta.label` is used by summaries, live announcements, companion controls, header actions, selection/export helpers, and custom sort indicators. Localize it whenever the column header is localized.
