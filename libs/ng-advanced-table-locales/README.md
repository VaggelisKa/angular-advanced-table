# ng-advanced-table-locales

Built-in locale registry for `ng-advanced-table`, `ng-advanced-table-ui`, and
`ng-advanced-table-utils`.

```ts
import { provideNatTableLocales } from 'ng-advanced-table-locales';

export const appConfig = {
  providers: [provideNatTableLocales()],
};
```

`provideNatTableLocales()` registers every locale shipped by this package. The
registry starts with English. If more locales are added in future releases, the
same provider call enables those built-in defaults too.

Pass configuration only to override built-ins or add custom locale ids:

```ts
import { NAT_EN_LOCALE_LABELS, provideNatTableLocales } from 'ng-advanced-table-locales';

export const appConfig = {
  providers: [
    provideNatTableLocales({
      en: {
        pageSize: {
          ariaLabel: 'Invoices per page',
        },
      },
      'en-GB': {
        ...NAT_EN_LOCALE_LABELS,
        pageSize: {
          ariaLabel: 'Invoices per page',
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

Importing `provideNatTableLocales()` intentionally imports all built-in locale
defaults shipped by this package.
