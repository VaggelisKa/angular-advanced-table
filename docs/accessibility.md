# Accessibility and Internationalization

`ng-advanced-table` ships English defaults for generated screen-reader copy. Consumers should treat those defaults as fallbacks and provide localized labels, descriptions, summaries, and live announcements for their product language.

This guide focuses on text that the consuming application owns. It does not replace normal accessibility review for custom cells, custom controls, dialogs, menus, or product-specific workflows.

## Machine-readable API map (agents)

This section exists so automated tooling can validate implementations against the **actual exported surface** without guessing from prose.

### Core (`ng-advanced-table`)

| Symbol                      | Kind              | Notes                                                                                                     |
| --------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `NatTable`                  | component         | Primary grid primitive                                                                                    |
| `NatTableAccessibilityText` | type              | Primary bag for consumer-owned accessibility strings + announcement formatters                            |
| `NatTableA11y`              | namespace         | Formatter context types for explicit typing (example: `NatTableA11y.NatTableAccessibilitySummaryContext`) |
| `enableAnnouncements`       | input (`boolean`) | Turn built-in polite live-region announcements on/off                                                     |

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
import type * as NatTableA11y from 'ng-advanced-table';
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

Companion controls accept localized visible strings plus structured `accessibilityLabels` bags:

| Component / helper               | Primary localization inputs                                         |
| -------------------------------- | ------------------------------------------------------------------- |
| `NatTableSearch`                 | `label`, `placeholder`                                              |
| `NatTableColumnVisibility`       | `label`, `ariaLabel`, `NatTableAccessibilityColumnVisibilityLabels` |
| `NatTablePageSize`               | `ariaLabel`, `NatTableAccessibilityPageSizeLabels`                  |
| `NatTablePager`                  | `ariaLabel`, `NatTableAccessibilityPagerLabels`                     |
| `withNatTableHeaderActions(...)` | `NatTableAccessibilityHeaderActionLabels`                           |

Note: some header chrome strings are still English defaults unless overridden upstream (for example the pin menu container label). Treat missing overrides as a localization gap, not an API gap.

## Agent Contract

When generating or modifying a table for a consuming app, treat accessibility copy as required product copy, not as optional polish.

Always do this:

- Give every `<nat-table>` a localized `ariaLabel`.
- Set `columnDef.meta.label` for each data column. This is required when the header is not a plain string and recommended for all columns.
- Provide localized `accessibilityText` strings (`description`, `keyboardInstructions`, `emptyState`) whenever the product language is not English or you need custom wording.
- Localize optional UI controls through `label`, `placeholder`, `ariaLabel`, and `accessibilityLabels`.
- Translate semantic state values such as `ascending`, `descending`, `visible`, `hidden`, `show`, `hide`, `pin`, `unpin`, `left`, and `right` before presenting them to users.
- Recreate translated column definitions when the active locale can change at runtime.

Do not do this:

- Do not rely on the built-in English fallback strings for a localized product.
- Do not use placeholder text as the only accessible label for search.
- Do not echo raw semantic tokens like `sortState`, `toggleAction`, `visibilityState`, `pinSide`, or `pinState` directly into localized copy.
- Do not assume `Intl.NumberFormat()` uses the app locale. Use numeric `...Value` fields if the app locale can differ from the browser default.
- Do not add custom interactive cell controls without giving those controls their own accessible names.

## Implementation Checklist

For every generated table, verify these items before considering the work complete:

- `<nat-table>` has a localized `ariaLabel`.
- `accessibilityText.description` is present when users need extra context before navigating the grid.
- `accessibilityText.keyboardInstructions` is localized when the product language is not English.
- `accessibilityText.emptyState` is localized.
- Each column has a stable localized `meta.label`.
- `accessibilityText` is provided when summaries or live announcements need product-specific copy.
- Every rendered `ng-advanced-table-ui` companion control has localized visible labels and group or button labels.
- Runtime locale changes rebuild `columns`, `accessibilityText`, and UI `accessibilityLabels` from the same translation source.

## Core Table

The core table exposes these localization inputs:

| Surface                      | API                                      | Purpose                                                             |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Table name                   | `ariaLabel`                              | Required accessible name for the grid.                              |
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

Formatter callbacks receive semantic state and both raw numeric values and preformatted text values. The text values are formatted with `Intl.NumberFormat()` using the runtime default locale. If your app locale can differ from the browser default, use the numeric `...Value` fields and format them with your own locale-aware formatter.

## Optional UI Controls

The `ng-advanced-table-ui` package exposes copy overrides without requiring consumers to rebuild table state.

| Component or helper              | Consumer-owned copy                                                 |
| -------------------------------- | ------------------------------------------------------------------- |
| `NatTableSearch`                 | `label`, `placeholder`                                              |
| `NatTableColumnVisibility`       | `label`, `ariaLabel`, `NatTableAccessibilityColumnVisibilityLabels` |
| `NatTablePageSize`               | `ariaLabel`, `NatTableAccessibilityPageSizeLabels`                  |
| `NatTablePager`                  | `ariaLabel`, `NatTableAccessibilityPagerLabels`                     |
| `withNatTableHeaderActions(...)` | `NatTableAccessibilityHeaderActionLabels`                           |

Use `label` for visible control labels, `ariaLabel` for group names, and `accessibilityLabels` for generated button text, summaries, and per-state labels. Do not rely on placeholder text as the only accessible label for search.

Decision rules for agents:

- If `NatTableSearch` is rendered, localize both `label` and `placeholder`.
- If `NatTableColumnVisibility` is rendered, pass `NatTableAccessibilityColumnVisibilityLabels`.
- If `NatTablePageSize` is rendered, pass `NatTableAccessibilityPageSizeLabels`.
- If `NatTablePager` is rendered, pass `NatTableAccessibilityPagerLabels`.
- If `withNatTableHeaderActions(...)` is used, pass `NatTableAccessibilityHeaderActionLabels` through its options.

## Runtime Locale Changes

When translations can change while the component is alive, build the table copy and column definitions from signals or another reactive source. This keeps headers, `meta.label`, live announcements, and companion-control labels in sync.

Use this pattern:

- Store all table copy in one typed object per locale.
- Derive `copy` with `computed(...)`.
- Derive `columns` with `computed(...)`, so headers and `meta.label` update together.
- Pass UI label objects from the same `copy()` result used by the table.

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableAccessibilityText, type NatTableState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePageSize,
  NatTablePager,
  NatTableSearch,
  NatTableSurface,
  withNatTableHeaderActions,
  type NatTableAccessibilityColumnVisibilityLabels,
  type NatTableAccessibilityHeaderActionLabels,
  type NatTableAccessibilityPagerLabels,
  type NatTableAccessibilityPageSizeLabels,
} from 'ng-advanced-table-ui';

interface OrderRow {
  id: string;
  symbol: string;
  notional: number;
}

interface TableCopy {
  tableLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  columns: {
    symbol: string;
    notional: string;
  };
  tableText: NatTableAccessibilityText;
  columnVisibility: NatTableAccessibilityColumnVisibilityLabels;
  pageSize: NatTableAccessibilityPageSizeLabels;
  pager: NatTableAccessibilityPagerLabels;
  headerActions: NatTableAccessibilityHeaderActionLabels;
}

const tableCopy: Record<'en' | 'da', TableCopy> = {
  en: {
    tableLabel: 'Orders',
    searchLabel: 'Search orders',
    searchPlaceholder: 'Search orders',
    columns: {
      symbol: 'Symbol',
      notional: 'Notional',
    },
    tableText: {
      description: 'Sortable and filterable order table.',
      keyboardInstructions:
        'Use arrow keys to move between cells. Use Tab to move into controls within a cell.',
      emptyState: 'No orders match the current view.',
      tableSummary: ({ visibleRowsText, totalRowsText, pageText, pageCountText }) =>
        `${visibleRowsText} of ${totalRowsText} rows shown. Page ${pageText} of ${pageCountText}.`,
      sortingChange: ({ columnLabel, sortState }) =>
        columnLabel
          ? `${columnLabel} is ${sortState === 'none' ? 'not sorted' : `sorted ${sortState}`}.`
          : 'Sorting cleared.',
      filteringChange: ({ query, visibleRowsText }) =>
        query ? `${visibleRowsText} rows match "${query}".` : `${visibleRowsText} rows shown.`,
      pageSizeChange: ({ pageSizeText, pageText, pageCountText }) =>
        `Showing ${pageSizeText} rows per page. Page ${pageText} of ${pageCountText}.`,
      pageChange: ({ pageText, pageCountText, visibleRowsText }) =>
        `Page ${pageText} of ${pageCountText}. ${visibleRowsText} rows shown.`,
    },
    columnVisibility: {
      heading: 'Columns',
      groupAriaLabel: 'Column visibility',
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} of ${totalColumnCountText} visible`,
      toggleColumnAriaLabel: ({ columnLabel, toggleAction }) =>
        `${toggleAction === 'hide' ? 'Hide' : 'Show'} ${columnLabel} column`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Shown' : 'Hidden'),
    },
    pageSize: {
      groupAriaLabel: 'Rows per page',
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} / page`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `Show ${pageSizeText} rows per page`,
    },
    pager: {
      groupAriaLabel: 'Table pagination',
      previousPageAriaLabel: 'Previous page',
      nextPageAriaLabel: 'Next page',
      pageIndicator: ({ pageText, pageCountText }) => `Page ${pageText} of ${pageCountText}`,
    },
    headerActions: {
      sortButton: ({ label }) => `Change sorting for ${label}`,
      menuButton: ({ label }) => `Open column actions for ${label}`,
      pinButton: ({ label, toggleAction, pinSide }) =>
        `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${label} column ${
          toggleAction === 'unpin' ? 'from' : 'to'
        } the ${pinSide}`,
      pinButtonText: ({ pinSide }) => (pinSide === 'left' ? 'Pin left' : 'Pin right'),
    },
  },
  da: {
    tableLabel: 'Ordrer',
    searchLabel: 'Sog i ordrer',
    searchPlaceholder: 'Sog i ordrer',
    columns: {
      symbol: 'Symbol',
      notional: 'Nominel vaerdi',
    },
    tableText: {
      description: 'Sorterbar og filtrerbar ordretabel.',
      keyboardInstructions:
        'Brug piletasterne til at flytte mellem celler. Brug Tab til kontroller i en celle.',
      emptyState: 'Ingen ordrer matcher den aktuelle visning.',
      tableSummary: ({ visibleRowsText, totalRowsText, pageText, pageCountText }) =>
        `${visibleRowsText} af ${totalRowsText} raekker vises. Side ${pageText} af ${pageCountText}.`,
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
      filteringChange: ({ query, visibleRowsText }) =>
        query
          ? `${visibleRowsText} raekker matcher "${query}".`
          : `${visibleRowsText} raekker vises.`,
      pageSizeChange: ({ pageSizeText, pageText, pageCountText }) =>
        `Viser ${pageSizeText} raekker per side. Side ${pageText} af ${pageCountText}.`,
      pageChange: ({ pageText, pageCountText, visibleRowsText }) =>
        `Side ${pageText} af ${pageCountText}. ${visibleRowsText} raekker vises.`,
    },
    columnVisibility: {
      heading: 'Kolonner',
      groupAriaLabel: 'Kolonnesynlighed',
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} af ${totalColumnCountText} synlige`,
      toggleColumnAriaLabel: ({ columnLabel, toggleAction }) =>
        `${toggleAction === 'hide' ? 'Skjul' : 'Vis'} kolonnen ${columnLabel}`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Synlig' : 'Skjult'),
    },
    pageSize: {
      groupAriaLabel: 'Raekker per side',
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} / side`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `Vis ${pageSizeText} raekker per side`,
    },
    pager: {
      groupAriaLabel: 'Tabelpagination',
      previousPageAriaLabel: 'Forrige side',
      nextPageAriaLabel: 'Naeste side',
      pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`,
    },
    headerActions: {
      sortButton: ({ label }) => `Skift sortering for ${label}`,
      menuButton: ({ label }) => `Aabn kolonnehandlinger for ${label}`,
      pinButton: ({ label, toggleAction, pinSide }) =>
        `${toggleAction === 'unpin' ? 'Frigor' : 'Fastgor'} kolonnen ${label} ${
          toggleAction === 'unpin' ? 'fra' : 'til'
        } ${pinSide === 'left' ? 'venstre' : 'hojre'}`,
      pinButtonText: ({ pinSide }) =>
        pinSide === 'left' ? 'Fastgor til venstre' : 'Fastgor til hojre',
    },
  },
};

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableSearch,
    NatTableSurface,
  ],
  template: `
    @let labels = copy();

    <nat-table
      #grid="natTable"
      [data]="rows()"
      [columns]="columns()"
      [state]="tableState()"
      [enablePagination]="true"
      [ariaLabel]="labels.tableLabel"
      [accessibilityText]="labels.tableText"
      (stateChange)="tableState.set($event)"
    />

    <nat-table-surface>
      <nat-table-search
        [for]="grid"
        [label]="labels.searchLabel"
        [placeholder]="labels.searchPlaceholder"
      />
      <nat-table-column-visibility
        [for]="grid"
        [label]="labels.columnVisibility.heading ?? 'Columns'"
        [ariaLabel]="labels.columnVisibility.groupAriaLabel ?? 'Column visibility'"
        [accessibilityLabels]="labels.columnVisibility"
      />
      <nat-table-page-size
        [for]="grid"
        [ariaLabel]="labels.pageSize.groupAriaLabel ?? 'Rows per page'"
        [accessibilityLabels]="labels.pageSize"
      />
      <nat-table-pager
        [for]="grid"
        [ariaLabel]="labels.pager.groupAriaLabel ?? 'Table pagination'"
        [accessibilityLabels]="labels.pager"
      />
    </nat-table-surface>
  `,
})
export class OrdersTableComponent {
  readonly locale = signal<'en' | 'da'>('en');
  readonly rows = signal<readonly OrderRow[]>([]);
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly copy = computed(() => tableCopy[this.locale()]);
  readonly columns = computed<ColumnDef<OrderRow>[]>(() => {
    const labels = this.copy();

    return withNatTableHeaderActions<OrderRow>(
      [
        {
          accessorKey: 'symbol',
          header: labels.columns.symbol,
          meta: { label: labels.columns.symbol, rowHeader: true },
          cell: (context) => context.getValue<string>(),
        },
        {
          accessorKey: 'notional',
          header: labels.columns.notional,
          meta: { label: labels.columns.notional, align: 'end' },
          cell: (context) => String(context.getValue<number>()),
        },
      ],
      {
        accessibilityLabels: labels.headerActions,
      },
    );
  });
}
```

## Custom Cells and Actions

Any custom cell renderer, row action, menu, dialog trigger, or expandable detail panel is outside the built-in label system. Localize those controls in the consuming app and make sure interactive elements have their own accessible names.

When a focusable widget is rendered inside a grid cell, use the appropriate Angular Aria grid primitive, such as `ngGridCellWidget`, so keyboard users can move between grid navigation and the widget predictably.

## Final Agent Review

Before finishing a table accessibility/i18n change, answer these questions:

- Can a screen-reader user identify the table from `ariaLabel` without seeing the page?
- Are all generated summaries, announcements, and button labels in the product language?
- Are column labels meaningful if header content is rendered by a component, icon, or function?
- Do page, row, and column counts use the app's locale when required?
- Do custom cells and row actions provide accessible names outside the table's built-in label system?
- Does changing the locale update headers, `meta.label`, table announcements, and companion controls together?

## Reference Notes

- `columnDef.meta.label` is the label used when headers are rendered by templates, functions, icons, or other non-string content.
- `withNatTableHeaderActions(...)` resolves labels when columns are wrapped, so translated columns should be rebuilt when the active locale changes.
- Built-in fallback copy is English. Passing only some overrides is valid, but any omitted key falls back to English.
- Live announcements can be disabled with `[enableAnnouncements]="false"` if the consumer owns a different announcement strategy.
