## Locale Providers

Generated table copy resolves from the `ng-advanced-table/locale` entry point. Add only the providers for the entry points you use.

```ts
provideNatTableLocales(...);
provideNatTableControlsLocales(...);
provideNatTableRenderMetricsLocales(...);
```

Core table copy, companion UI controls, and render-metrics utilities have separate locale sections so applications can adopt them independently. The `provideNatTable*Locales(...)` helpers register locale dictionaries. Use the corresponding `provideNatTable*Intl(...)` helper when an application supplies a partial override rather than a map keyed by locale id.

## Provider Forms

All three intl providers accept the same three source forms: a static configuration, an Angular signal containing the current configuration, or a dependency-injection factory returning either form. Their `provideNatTable*Locales(...)` convenience providers likewise accept a static locale map, a signal containing one, or a factory returning either form.

### Static Configuration

Static copy remains the simplest option when it will not change while an injector is alive.

```ts
import { provideNatTableIntl } from 'ng-advanced-table/locale';

providers: [
  provideNatTableIntl({
    accessibilityText: {
      emptyState: 'No rows',
      loadingState: 'Loading rows'
    }
  })
];
```

### Dependency-Injection Factory

A provider factory runs once inside an Angular injection context. It can inject a translation service, but returning a plain object intentionally captures a synchronous snapshot.

```ts
import { inject } from '@angular/core';
import { provideNatTableIntl } from 'ng-advanced-table/locale';

providers: [
  provideNatTableIntl(() => {
    const translate = inject(TranslateService);

    return {
      accessibilityText: {
        emptyState: translate.instant('table.empty'),
        loadingState: translate.instant('table.loading')
      }
    };
  })
];
```

Use this form for services that are injectable but whose copy does not need to update in the lifetime of the provider scope.

### Signal-Backed Configuration

Return a signal when copy can change at runtime. The factory still runs once, but the signal it returns remains live for that injector.

```ts
import { computed, inject } from '@angular/core';
import { provideNatTableIntl } from 'ng-advanced-table/locale';

providers: [
  provideNatTableIntl(() => {
    const translations = inject(TableTranslations);

    return computed(() => ({
      accessibilityText: {
        emptyState: translations.text('table.empty'),
        loadingState: translations.text('table.loading'),
        errorState: translations.text('table.error')
      }
    }));
  })
];
```

The same pattern applies to `provideNatTableControlsIntl(...)` and `provideNatTableRenderMetricsIntl(...)`. A signal can also be passed directly when it is already available where application providers are assembled.

```ts
provideNatTableControlsIntl(controlsIntlSignal);
```

Reactive locale maps use the convenience providers in the same way:

```ts
provideNatTableLocales(() => tableLocalesSignal);
provideNatTableControlsLocales(controlsLocalesSignal);
provideNatTableRenderMetricsLocales(() => renderMetricsLocalesSignal);
```

Prefer creating mutable signals per application or injector. Do not keep request-specific translation state in a module-global signal in an SSR application.

## How Reactive Copy Reaches the Table

Angular dependency injection resolves and caches each locale provider once. The library keeps the returned signal instead of taking its current value as a snapshot:

```text
consumer signal
  -> reactive parent/child provider merge
  -> table or control locale computed
  -> visible labels, accessible names, and formatters
```

The injected token remains one stable configuration object. Reading its locale dictionaries from a library `computed(...)` reads the latest provider signal value, so Angular records the dependency. When the consumer signal changes, Angular invalidates the provider merge and the affected table computations. The provider factory, injector, table component, controller state, focus, and DOM node do not need to be recreated.

## Provider Source Snapshot Semantics

Each signal value is the complete current override for its injector scope:

- A new value replaces the previous local override; provider emissions are not accumulated as patches.
- Omitting a field that existed in the previous value removes that local override, revealing the closest parent value or built-in default.
- The library performs no deep comparison and does not observe nested mutation.
- Angular's source-signal equality decides whether the source invalidates. With the default equality, setting the same object reference again is not an update.
- A consumer-provided computed signal may use custom equality; the provider honors that decision and does not add another equality policy.

Publish immutable replacement objects with `set(...)` or `update(...)`:

```ts
intl.set({
  accessibilityText: {
    emptyState: 'No matching rows'
  }
});

// The previous emptyState override is removed; it now falls back.
intl.set({
  accessibilityText: {
    loadingState: 'Loading translated rows'
  }
});
```

## Observable-Backed Translation Services

Adapt an Observable to a signal inside the provider factory with Angular's [`toSignal`](https://angular.dev/ecosystem/rxjs-interop) API.

```ts
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { provideNatTableControlsIntl } from 'ng-advanced-table/locale';

providers: [
  provideNatTableControlsIntl(() => {
    const translations = inject(TranslationService);
    const errors = inject(TranslationErrorReporter);

    return toSignal(
      translations.tableControls$.pipe(
        map((copy) => ({
          pager: {
            accessibilityLabels: {
              previousPageAriaLabel: copy.previousPage,
              nextPageAriaLabel: copy.nextPage
            }
          }
        })),
        catchError((error: unknown) => {
          errors.report(error);
          return of({});
        })
      ),
      { initialValue: {} }
    );
  })
];
```

Calling `toSignal` inside the provider factory gives it the provider's injection context, so Angular disposes the subscription with that injector. Handle Observable errors before returning the signal: an unhandled Observable error is thrown when `toSignal` is read and could otherwise surface from a table template.

The provider does not add an async state machine around the adapted signal. The adapter determines whether a reload retains the last successful value, temporarily exposes `{}`, or emits another fallback. If it exposes `{}` during a reload, generated copy temporarily falls back to the parent or built-in locale and may visibly change. Retain the last good value in the adapter when that flicker is undesirable.

## Promise-Backed Translation Loaders

Adapt asynchronous loading to a synchronous signal before returning it. Angular [`resource`](https://angular.dev/guide/signals/resource) is a good fit when the request depends on a reactive locale id.

```ts
import { computed, inject, resource } from '@angular/core';
import { provideNatTableRenderMetricsIntl } from 'ng-advanced-table/locale';

providers: [
  provideNatTableRenderMetricsIntl(() => {
    const loader = inject(LocaleLoader);
    const locale = inject(LocaleState).locale;

    const bundle = resource({
      params: () => locale(),
      loader: ({ params }) => loader.loadRenderMetrics(params),
      id: 'nat-render-metrics-intl'
    });

    return computed(() => (bundle.hasValue() ? bundle.value() : {}));
  })
];
```

Every provider signal must always expose a synchronous configuration value. Recommended async behavior is:

- During initial loading, return `{}` so the closest parent or built-in English copy remains available.
- On success, replace the whole local override atomically.
- During a reload, retain the last successful value where possible to avoid visible-label and accessible-name flicker.
- On failure, report the error in the consumer adapter and retain the last good value or return a safe fallback.
- On completion, retain the latest successful value.

The locale provider does not use the table's `dataStatus` for translation loading. `dataStatus` continues to describe table data only.

Core, controls, and render-metrics sources settle independently. Updating them from separate asynchronous requests can temporarily produce mixed-language copy. For an atomic language switch, load one application translation bundle and derive all three provider signals from that single bundle value.

For SSR, create sources per application injector so requests cannot share mutable locale state. Passing a signal directly does not make that signal injector-local: a module-global signal remains shared by every injector that receives it. Prefer a provider factory that reads request-scoped state. A static or synchronously seeded signal renders deterministically. For asynchronous copy, either preload/transfer the resolved value (a resource `id` can participate in SSR transfer) or ensure server and client render the same fallback first and update after hydration.

## Provider Hierarchy And Precedence

Nested locale providers remain reactive and merge with the latest value from their parent:

```text
built-in English
  -> application provider
    -> route provider
      -> component provider
```

A child can override only the fields it owns while continuing to receive updates to other fields from its parent. Sibling injectors stay isolated. Runtime precedence remains:

```text
per-instance explicit labels
  > closest provider override
  > parent provider overrides
  > selected locale dictionary
  > built-in English defaults
```

For an atomic language switch across core, controls, and render metrics, derive all three provider signals from the same application translation-bundle signal.

## Runtime Locale Changes

The active locale id and the available locale dictionaries are separate reactive inputs:

- `[locale]` on `NatTableSurface` selects the dictionary for one table.
- Signal-backed locale providers update the dictionaries and generated copy available in their injector scope.

Keeping them separate allows two tables to select different locales. Bind the current locale id to the surface and return reactive provider configurations when either can change at runtime.

## Static Column Definitions

Reactive providers update generated table copy and Angular controls automatically. Static TanStack column definitions remain snapshots.

`withRenderMetricsColumn(...)` captures its header, `meta.label`, pending label, formatter, and cell closure when it constructs a column. Capture the live provider config during construction, pass it to the helper, and rebuild the columns from a `computed(...)`:

```ts
import { computed } from '@angular/core';

import { injectNatTableRenderMetricsIntl } from 'ng-advanced-table/locale';
import { withRenderMetricsColumn } from 'ng-advanced-table/render-metrics';

private readonly renderMetricsIntl = injectNatTableRenderMetricsIntl();

readonly columns = computed(() =>
  withRenderMetricsColumn(baseColumns(), this.metricsStore, {
    locale: this.localeId(),
    intlConfig: this.renderMetricsIntl
  })
);
```

`injectNatTableRenderMetricsIntl()` must run in an injection context, such as a component field initializer. The helper reads its live `locales` getter while the computed is evaluating, so both locale-id changes and provider-signal changes rebuild the definitions.

The same rule applies to consumer-owned translated column headers and `meta.label`: read the consumer translation signal in the computed and pass the current strings to the column builder. The library does not mutate existing column definitions behind the consumer.

## Accessible Names

When visible text changes, keep visible words inside accessible names. This matters for toolbar controls, selection checkboxes, export buttons, render-metrics controls, and custom icon-only buttons.

A copy-only provider update changes visible labels and accessible names together. It preserves the existing table/controller state, DOM nodes, open menus, and focused control. It does not create a live-region announcement by itself; the next sorting, filtering, pagination, resizing, reordering, or selection interaction uses the latest announcement formatter.

That stability guarantee assumes structural keys remain stable. Replacing option identifiers, adding or removing options, or otherwise changing control structure can legitimately create or remove DOM nodes. Applications making structural locale changes are responsible for the resulting focus transition.

## Column Labels

`meta.label` is used by summaries, live announcements, companion controls, header actions, selection/export helpers, and custom sort indicators. Localize it whenever the column header is localized, and rebuild the column definition when that label changes.
