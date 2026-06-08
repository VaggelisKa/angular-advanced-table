# ng-advanced-table-locales

Built-in table, UI, and utils locale registry for `ng-advanced-table`.

```ts
import { provideNatTableLocales } from 'ng-advanced-table-locales';

export const appConfig = {
  providers: [provideNatTableLocales()],
};
```

`provideNatTableLocales()` registers every table locale shipped by this package.
The registry starts with English. If more table locales are added in future
releases, the same provider call enables those built-in defaults too.

Companion providers compose explicitly:

```ts
import {
  provideNatTableLocales,
  provideNatTableUiLocales,
  provideNatTableUtilsLocales,
} from 'ng-advanced-table-locales';

export const appConfig = {
  providers: [provideNatTableLocales(), provideNatTableUiLocales(), provideNatTableUtilsLocales()],
};
```

Pass configuration only to override built-ins or add custom locale ids:

```ts
import {
  NAT_EN_LOCALE_LABELS,
  NAT_EN_UI_LOCALE_LABELS,
  provideNatTableLocales,
  provideNatTableUiLocales,
} from 'ng-advanced-table-locales';

export const appConfig = {
  providers: [
    provideNatTableLocales({
      en: {
        accessibilityText: {
          emptyState: 'No invoices match the current filters.',
        },
      },
      'en-GB': {
        ...NAT_EN_LOCALE_LABELS,
      },
    }),
    provideNatTableUiLocales({
      en: {
        pageSize: {
          groupAriaLabel: 'Invoices per page',
        },
      },
      'en-GB': {
        ...NAT_EN_UI_LOCALE_LABELS,
        pageSize: {
          groupAriaLabel: 'Invoices per page',
        },
      },
    }),
  ],
};
```

Generated labels, announcements, and number formatting belong in locale
dictionaries. Case-specific copy such as table names, captions, table-specific
descriptions, and column labels should stay on component inputs or column
definitions.

Importing each provider intentionally imports the built-in locale defaults for
that provider's scope.
