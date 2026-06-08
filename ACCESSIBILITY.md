# Accessibility and Internationalization

For workspace install, core API tables, and composition overview, see [README.md](README.md).

`ng-advanced-table` ships English defaults for generated screen-reader copy and companion-control labels. `ng-advanced-table-locales` provides a built-in locale registry that starts with English and can grow as more locales are contributed. Consumers should only pass case-specific copy at the table instance, such as the table's accessible name, visible caption, column labels, and product-specific descriptions. Common UI and announcement copy should live in locale dictionaries.

Generated copy resolves in this order:

1. Built-in English locale defaults.
2. The locale selected by `<nat-table [locale]="localeId()">`, or English when no table locale is set.
3. Per-table, per-control, or per-helper inputs/options for instance-specific copy.

Use `provideNatTableLocales()` for table locale dictionaries and number formatting. Add `provideNatTableUiLocales()` or `provideNatTableUtilsLocales()` only when using those companion packages.

This guide focuses on text that the consuming application owns. It does not replace normal accessibility review for custom cells, custom controls, dialogs, menus, or product-specific workflows.

## Machine-readable API map (agents)

This section exists so automated tooling can validate implementations against the **actual exported surface** without guessing from prose.

### Core (`ng-advanced-table`)

| Symbol                      | Kind              | Notes                                                                                                     |
| --------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `NatTable`                  | component         | Primary grid primitive. Accepts `locale` for generated labels.                                            |
| `provideNatTableIntl(...)`  | provider          | Advanced core-only override provider used by the locale registry for table copy and number formatting     |
| `NatTableAccessibilityText` | type              | Primary bag for consumer-owned accessibility strings + announcement formatters                            |
| `NatTableA11y`              | namespace         | Formatter context types for explicit typing (example: `NatTableA11y.NatTableAccessibilitySummaryContext`) |
| `enableAnnouncements`       | input (`boolean`) | Turn built-in polite live-region announcements on/off                                                     |

### Locales (`ng-advanced-table-locales`)

| Symbol                        | Kind     | Notes                                                                               |
| ----------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `provideNatTableLocales(...)` | provider | Registers every table locale shipped by the locale package, plus optional overrides |
| `NAT_TABLE_BUILT_IN_LOCALES`  | constant | Built-in table locale registry. Starts with English                                 |
| `NAT_EN_LOCALE_ID`            | constant | Built-in English locale id (`en`)                                                   |
| `NAT_EN_LOCALE_LABELS`        | constant | English table locale labels for spreading and overrides                             |
| `NatTableLocaleLabels`        | type     | Table locale label shape for generated table copy and number formatting             |
| `NatTableLocaleLabelsMap`     | type     | Locale dictionaries keyed by locale id                                              |

Table, UI, and utils locale providers are exported from `ng-advanced-table-locales`.

### UI Locales (`ng-advanced-table-locales`)

| Symbol                          | Kind     | Notes                                      |
| ------------------------------- | -------- | ------------------------------------------ |
| `provideNatTableUiLocales(...)` | provider | Registers companion UI locale dictionaries |
| `NAT_TABLE_BUILT_IN_UI_LOCALES` | constant | Built-in UI locale registry                |
| `NAT_EN_UI_LOCALE_LABELS`       | constant | English UI locale labels                   |
| `NatTableUiLocaleLabels`        | type     | UI locale label shape                      |
| `NatTableUiLocaleLabelsMap`     | type     | UI locale dictionaries keyed by locale id  |

### Utils Locales (`ng-advanced-table-locales`)

| Symbol                             | Kind     | Notes                                        |
| ---------------------------------- | -------- | -------------------------------------------- |
| `provideNatTableUtilsLocales(...)` | provider | Registers render-metrics locale dictionaries |
| `NAT_TABLE_BUILT_IN_UTILS_LOCALES` | constant | Built-in utils locale registry               |
| `NAT_EN_UTILS_LOCALE_LABELS`       | constant | English utils locale labels                  |
| `NatTableUtilsLocaleLabels`        | type     | Utils locale label shape                     |
| `NatTableUtilsLocaleLabelsMap`     | type     | Utils locale dictionaries keyed by locale id |

#### `NatTableAccessibilityText` keys

Strings:

- `description`
- `keyboardInstructions`
- `emptyState`
- `reorderKeyboardInstructions`

Formatters:

- `tableSummary`
- `sortingChange`
- `filteringChange`
- `columnVisibilityChange`
- `pageSizeChange`
- `pageChange`
- `columnReorder`

#### `NatTableA11y` formatter context exports

Import like:

```ts
import type { NatTableA11y } from 'ng-advanced-table';
```

Context types:

- `NatTableA11y.NatTableAccessibilitySummaryContext`
- `NatTableA11y.NatTableAccessibilitySortingAnnouncementContext`
- `NatTableA11y.NatTableAccessibilityFilteringAnnouncementContext`
- `NatTableA11y.NatTableAccessibilityColumnVisibilityAnnouncementChange`
- `NatTableA11y.NatTableAccessibilityColumnVisibilityAnnouncementContext`
- `NatTableA11y.NatTableAccessibilityPaginationAnnouncementContext`
- `NatTableA11y.NatTableAccessibilityColumnReorderAnnouncementContext`

### UI (`ng-advanced-table-ui`)

Companion controls inherit the controlled table's `locale` through `[for]="grid"` and accept localized visible strings plus structured `accessibilityLabels` bags for instance-specific overrides:

| Component / helper               | Primary localization inputs                                              |
| -------------------------------- | ------------------------------------------------------------------------ |
| `NatTableSearch`                 | `label`, `placeholder`                                                   |
| `NatTableColumnVisibility`       | `label`, `groupAriaLabel`, `NatTableAccessibilityColumnVisibilityLabels` |
| `NatTablePageSize`               | `groupAriaLabel`, `NatTableAccessibilityPageSizeLabels`                  |
| `NatTablePager`                  | `groupAriaLabel`, `NatTableAccessibilityPagerLabels`                     |
| `NatTableScrollControl`          | `groupAriaLabel`, `NatTableAccessibilityScrollControlLabels`             |
| `withNatTableHeaderActions(...)` | `NatTableAccessibilityHeaderActionLabels`                                |
| `provideNatTableUiIntl(...)`     | Advanced UI-only override provider used by the locale registry           |

Header action labels include the sort button, menu trigger, menu content, pin buttons, and visible pin menu item text.

### Utils (`ng-advanced-table-utils`)

| Symbol                          | Kind      | Notes                                                                                     |
| ------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `provideNatTableUtilsIntl(...)` | provider  | Advanced utils-only override provider used by the locale registry for render-metrics copy |
| `NatRenderMetricsFilter`        | component | Accepts provider defaults plus per-instance `labels`                                      |
| `NatRenderMetricsPanel`         | component | Accepts provider defaults plus per-instance `labels`                                      |
| `withRenderMetricsColumn(...)`  | helper    | Accepts provider defaults when called in Angular DI plus per-call options                 |

`withRenderMetricsColumn(...)` can also be called outside Angular. In that case provider defaults are unavailable, but explicit options still localize the generated column header, pending label, and duration text. Because the helper creates static column definitions, rebuild those columns when the locale changes or pass `options.locale` when building them.

## Agent Contract

When generating or modifying a table for a consuming app, treat accessibility copy as required product copy, not as optional polish.

Always do this:

- Give every `<nat-table>` a localized `accessibleName` or visible `caption`.
- Set `columnDef.meta.label` for each data column. This is required when the header is not a plain string and recommended for all columns.
- Provide generated table labels through `provideNatTableLocales()`. Pass overrides only when adding custom locale ids or changing built-in generated table copy.
- When rendering `ng-advanced-table-ui` controls, provide common generated UI labels through `provideNatTableUiLocales()`.
- When rendering `ng-advanced-table-utils` controls/helpers, provide common generated utility labels through `provideNatTableUtilsLocales()`.
- Keep table-specific copy such as accessible names, captions, descriptions, empty-state wording that differs per table, and column labels on table inputs or column definitions.
- Use `label`, `placeholder`, `groupAriaLabel`, and `accessibilityLabels` only for instance-specific control overrides.
- Translate semantic state values such as `ascending`, `descending`, `visible`, `hidden`, `show`, `hide`, `pin`, `unpin`, `left`, and `right` before presenting them to users.
- Pass `<nat-table [locale]="localeId()">` when the active locale can change at runtime. Companion UI controls inherit that locale through `[for]="grid"`.

Do not do this:

- Do not rely on the built-in English locale for a localized product.
- Do not use placeholder text as the only accessible label for search.
- Do not echo raw semantic tokens like `sortState`, `toggleAction`, `visibilityState`, `pinSide`, or `pinState` directly into localized copy.
- Do not assume browser-default number formatting matches the table locale. Provider number formatters receive the active locale id as their third argument.
- Do not add custom interactive cell controls without giving those controls their own accessible names.

## Implementation Checklist

For every generated table, verify these items before considering the work complete:

- `<nat-table>` has a localized `accessibleName` or visible `caption`.
- `accessibilityText.description` is present when users need extra context before navigating the grid.
- `accessibilityText.keyboardInstructions` is localized when the product language is not English.
- `accessibilityText.emptyState` is localized.
- Each column has a stable localized `meta.label`.
- `accessibilityText` is provided when summaries or live announcements need product-specific copy.
- Every rendered `ng-advanced-table-ui` companion control has localized visible labels and group or button labels.
- Runtime locale changes update `<nat-table [locale]>`, companion controls, and any translated column definitions/helpers from the same translation source.

## App-Level Localization Providers

Configure locale dictionaries once at app or feature scope. `provideNatTableLocales()` registers table locales. Add `provideNatTableUiLocales()` and `provideNatTableUtilsLocales()` only when the app uses those packages. Pass configuration only to override built-ins or add custom locale ids. Per-instance inputs and helper options remain useful for table-specific copy and always take precedence over provider locale defaults.

```ts
import { ApplicationConfig } from '@angular/core';
import {
  provideNatTableLocales,
  provideNatTableUiLocales,
  provideNatTableUtilsLocales,
} from 'ng-advanced-table-locales';

const formatNumber = (value: number, options?: Intl.NumberFormatOptions, locale = 'en') =>
  new Intl.NumberFormat(locale, options).format(value);

export const appConfig: ApplicationConfig = {
  providers: [
    provideNatTableLocales({
      da: {
        formatNumber,
        accessibilityText: {
          keyboardInstructions:
            'Brug piletasterne til at flytte mellem celler. Brug Tab til kontroller i en celle.',
          emptyState: 'Ingen rækker matcher den aktuelle visning.',
          tableSummary: ({ visibleRowsText, totalRowsText, visibleColumnsText }) =>
            `${visibleRowsText} af ${totalRowsText} rækker vises på tværs af ${visibleColumnsText} kolonner.`,
          sortingChange: ({ columnLabel, sortState }) =>
            columnLabel
              ? `${columnLabel} er ${
                  sortState === 'ascending'
                    ? 'sorteret stigende'
                    : sortState === 'descending'
                      ? 'sorteret faldende'
                      : 'ikke sorteret'
                }.`
              : 'Sortering ryddet.',
        },
      },
    }),
    provideNatTableUiLocales({
      da: {
        formatNumber,
        search: {
          label: 'Søg i rækker',
          placeholder: 'Søg i rækker',
        },
        pageSize: {
          groupAriaLabel: 'Rækker pr. side',
          accessibilityLabels: {
            pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rækker`,
            pageSizeOptionAriaLabel: ({ pageSizeText }) => `Vis ${pageSizeText} rækker`,
          },
        },
        pager: {
          groupAriaLabel: 'Sideskift',
          accessibilityLabels: {
            previousPageAriaLabel: 'Forrige side',
            nextPageAriaLabel: 'Næste side',
            pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`,
          },
        },
        headerActions: {
          accessibilityLabels: {
            menuLabel: ({ label }) => `Kolonnehandlinger for ${label}`,
          },
        },
      },
    }),
    provideNatTableUtilsLocales({
      da: {
        formatNumber,
        renderMetrics: {
          filter: {
            heading: 'Renderhastighed',
            groupAriaLabel: 'Rækkernes renderhastighed',
          },
          panel: {
            ariaLabel: 'Renderprøve for rækker',
            duration: ({ durationMsText }) => `${durationMsText} ms`,
          },
          column: {
            header: 'Render',
            pendingLabel: 'Afventer',
          },
        },
      },
    }),
  ],
};
```

Feature routes can provide a smaller override. Nested providers merge with their parent provider per locale, so a feature can replace only the copy it owns while keeping the app-level formatter and labels. Low-level `provideNatTableIntl(...)`, `provideNatTableUiIntl(...)`, and `provideNatTableUtilsIntl(...)` remain available for package-internal advanced use.

Use the table locale to switch generated copy at runtime:

```html
<nat-table
  #grid="natTable"
  [locale]="localeId()"
  [data]="rows()"
  [columns]="columns()"
  accessibleName="Operations table"
/>

<nat-table-search [for]="grid" />
<nat-table-page-size [for]="grid" />
<nat-table-pager [for]="grid" />
```

## Core Table

The core table exposes these localization inputs:

| Surface                      | API                                      | Purpose                                                             |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Grid accessible name         | `accessibleName`                         | Required accessible name when no visible `caption` is rendered.     |
| Table caption                | `caption`                                | Visible table caption; when present, it names the grid.             |
| Supplemental description     | `accessibilityText.description`          | Optional hidden description referenced by `aria-describedby`.       |
| Grid instructions            | `accessibilityText.keyboardInstructions` | Hidden navigation instructions for screen-reader users.             |
| Empty state                  | `accessibilityText.emptyState`           | Visible text when no rows match the current view.                   |
| Column labels                | `columnDef.meta.label`                   | Stable human-readable label used by announcements and companion UI. |
| Generated accessibility text | `accessibilityText`                      | Overrides summaries and live announcements.                         |

Decision rules for agents:

- If a table is localized, pass all table-level copy through the app's translation source.
- If a header is a template, component, icon, function, or nonlocalized id, set `meta.label` to the translated human label.
- If `allowColumnReorder` is enabled, include `reorderKeyboardInstructions` in `accessibilityText`.
- If `enableAnnouncements` remains `true`, localize every announcement formatter that can be triggered by enabled table features.
- If a feature is not enabled, do not invent labels for controls or announcements that the table cannot render.

`accessibilityText` accepts these keys:

- `description`
- `keyboardInstructions`
- `emptyState`
- `reorderKeyboardInstructions`
- `tableSummary(...)`
- `sortingChange(...)`
- `filteringChange(...)`
- `columnVisibilityChange(...)`
- `pageSizeChange(...)`
- `pageChange(...)`
- `columnReorder(...)`

Formatter callbacks receive semantic state and both raw numeric values and preformatted text values. The text values use the active locale dictionary's number formatter and receive the active locale id. If one table needs a different format, use the numeric `...Value` fields inside that table's formatter.

## Optional UI Controls

The `ng-advanced-table-ui` package consumes locale dictionaries from `provideNatTableUiLocales()` and exposes per-instance copy overrides without requiring consumers to rebuild table state.

| Component or helper              | Consumer-owned copy                                                      |
| -------------------------------- | ------------------------------------------------------------------------ |
| `NatTableSearch`                 | `label`, `placeholder`                                                   |
| `NatTableColumnVisibility`       | `label`, `groupAriaLabel`, `NatTableAccessibilityColumnVisibilityLabels` |
| `NatTablePageSize`               | `groupAriaLabel`, `NatTableAccessibilityPageSizeLabels`                  |
| `NatTablePager`                  | `groupAriaLabel`, `NatTableAccessibilityPagerLabels`                     |
| `NatTableScrollControl`          | `groupAriaLabel`, `NatTableAccessibilityScrollControlLabels`             |
| `withNatTableHeaderActions(...)` | `NatTableAccessibilityHeaderActionLabels`                                |

Use `provideNatTableUiLocales()` for common UI locale labels. Use `label` for visible control labels, `groupAriaLabel` for control group names, and `accessibilityLabels` for generated button text, summaries, and per-state labels only when one control needs instance-specific copy. Do not rely on placeholder text as the only accessible label for search.

Decision rules for agents:

- If `NatTableSearch` is rendered in a non-English product, localize both `label` and `placeholder` through `provideNatTableUiLocales()` or inputs.
- If one `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, or `NatTableScrollControl` instance needs different wording from the active locale, pass its specific label input or `accessibilityLabels` bag.
- If `withNatTableHeaderActions(...)` is used and one table/column needs wording different from the active locale, pass `NatTableAccessibilityHeaderActionLabels` through helper options or column metadata. This label surface covers the sort button, overflow trigger, opened pin menu label, pin action labels, and visible pin menu item text.

## Runtime Locale Changes

When translations can change while the component is alive, pass the active locale id to `<nat-table>`. Generated core labels and companion controls that receive `[for]="grid"` resolve from the matching locale dictionaries automatically.

Use this pattern:

- Store common generated table copy in `provideNatTableLocales()` dictionaries.
- Store common generated companion copy in `provideNatTableUiLocales()` or `provideNatTableUtilsLocales()` dictionaries when those packages are used.
- Pass `<nat-table [locale]="localeId()">`.
- Keep `accessibleName`, visible `caption`, and column `meta.label` as table-specific product copy.
- Derive translated `columns` with `computed(...)` when headers or `meta.label` change with the locale.
- Rebuild static helpers such as `withRenderMetricsColumn(...)` when the locale changes, or pass their `locale` option when constructing columns.

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';
import { NatTablePageSize, NatTablePager, NatTableSearch } from 'ng-advanced-table-ui';

interface OrderRow {
  id: string;
  symbol: string;
  notional: number;
}

const columnCopy = {
  en: { table: 'Orders', symbol: 'Symbol', notional: 'Notional' },
  da: { table: 'Ordrer', symbol: 'Symbol', notional: 'Nominel vaerdi' },
} as const;

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSearch, NatTablePageSize, NatTablePager],
  template: `
    <nat-table
      #grid="natTable"
      [locale]="localeId()"
      [data]="rows()"
      [columns]="columns()"
      [enablePagination]="true"
      [accessibleName]="copy().table"
    />

    <nat-table-search [for]="grid" />
    <nat-table-page-size [for]="grid" />
    <nat-table-pager [for]="grid" />
  `,
})
export class OrdersTableComponent {
  readonly localeId = signal<keyof typeof columnCopy>('en');
  readonly rows = signal<readonly OrderRow[]>([]);
  readonly copy = computed(() => columnCopy[this.localeId()]);
  readonly columns = computed<ColumnDef<OrderRow>[]>(() => {
    const labels = this.copy();

    return [
      {
        accessorKey: 'symbol',
        header: labels.symbol,
        meta: {
          label: labels.symbol,
          rowHeader: true,
        },
      },
      {
        accessorKey: 'notional',
        header: labels.notional,
        meta: {
          label: labels.notional,
          align: 'end',
        },
      },
    ];
  });
}
```

## Custom Cells and Actions

Any custom cell renderer, row action, menu, dialog trigger, or custom detail panel is outside the built-in label system. Localize those controls in the consuming app and make sure interactive elements have their own accessible names.

When a focusable widget is rendered inside a grid cell, use the appropriate Angular Aria grid primitive, such as `ngGridCellWidget`, so keyboard users can move between grid navigation and the widget predictably.

## Final Agent Review

Before finishing a table accessibility/i18n change, answer these questions:

- Can a screen-reader user identify the table from `accessibleName` or `caption` without seeing the page?
- Are all generated summaries, announcements, and button labels in the product language?
- Are column labels meaningful if header content is rendered by a component, icon, or function?
- Do page, row, and column counts use the app's locale when required?
- Do custom cells and row actions provide accessible names outside the table's built-in label system?
- Does changing the locale update headers, `meta.label`, table announcements, and companion controls together?

## Reference Notes

- `columnDef.meta.label` is the label used when headers are rendered by templates, functions, icons, or other non-string content.
- `withNatTableHeaderActions(...)` is idempotent and resolves generated action labels from the rendered column definition. Translated column definitions should still be rebuilt when the active locale changes so visible headers, `meta.label`, and table announcements update from the same source.
- Built-in fallback copy is English. Passing only some overrides is valid, but any omitted key falls back to English.
- Live announcements can be disabled with `[enableAnnouncements]="false"` if the consumer owns a different announcement strategy.
