/* eslint-disable max-lines -- topic registry intentionally keeps docs IA, snippets, and embedded examples together */
import type { DocsCodeSnippet, DocsTopicContent } from './docs-topic.type';
import { ThemingShowcase } from './theming-showcase';
import { KeyboardInteraction } from '../demos/keyboard-interaction/keyboard-interaction';
import { Pagination } from '../demos/pagination/pagination';
import { Pinning } from '../demos/pinning/pinning';
import { Reordering } from '../demos/reordering/reordering';
import { Resizing } from '../demos/resizing/resizing';
import { Search } from '../demos/search/search';
import { Selection } from '../demos/selection/selection';
import { SimpleSorting } from '../demos/simple-sorting/simple-sorting';
import { Sorting } from '../demos/sorting/sorting';
import { States } from '../demos/states/states';
import { StickyHeader } from '../demos/sticky-header/sticky-header';
import { Toolbar } from '../demos/toolbar/toolbar';
import { Visibility } from '../demos/visibility/visibility';

const snippet = (id: string, label: string, language: string, code: string): DocsCodeSnippet => ({
  id,
  label,
  language,
  code: code.trim()
});

const sortingSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table-surface [(state)]="tableState">
  <nat-table [columns]="columns" [data]="data" accessibleName="Sorting demo table" />
</nat-table-surface>

<button type="button" (click)="sortBy('value', 'asc')">Sort by Value</button>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly tableState = signal<Partial<NatTableUserState>>({
  sorting: [{ id: 'name', desc: false }]
});

readonly columns = withNatTableHeaderActions([
  { accessorKey: 'name', header: 'Name', meta: { label: 'Name', rowHeader: true } },
  { accessorKey: 'value', header: 'Value', meta: { label: 'Value', align: 'end' } }
]);

sortBy(id: string, dir: 'asc' | 'desc'): void {
  this.tableState.update((state) => ({
    ...state,
    sorting: [{ id, desc: dir === 'desc' }]
  }));
}
`
  )
];

const columnLayoutSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table-surface [enableReordering]="true" [stickyHeader]="true" [(state)]="tableState">
  <nat-table [columns]="columns" [data]="data" accessibleName="Column layout demo table" />
</nat-table-surface>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly tableState = signal<Partial<NatTableUserState>>({
  columnOrder: ['name', 'status', 'value'],
  columnPinning: { left: ['name'], right: ['value'] },
  columnVisibility: { status: false }
});

readonly columns = withNatTableHeaderActions(
  [
    { accessorKey: 'name', header: 'Name', enablePinning: true, enableResizing: true },
    { accessorKey: 'status', header: 'Status', enablePinning: true },
    { accessorKey: 'value', header: 'Value', enablePinning: true, enableResizing: true }
  ],
  { enableColumnReorderActions: true }
);
`
  )
];

const paginationSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table-surface [(state)]="tableState">
  <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />
  <nat-table [columns]="columns" [data]="rows()" accessibleName="Paginated table" />
</nat-table-surface>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly tableState = signal<Partial<NatTableUserState>>({
  pagination: { pageIndex: 0, pageSize: 25 }
});
`
  )
];

const filteringSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table-surface [(state)]="tableState">
  <app-table-search label="Search rows" placeholder="Type to filter" />
  <nat-table [columns]="columns" [data]="rows" accessibleName="Searchable table" />
</nat-table-surface>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly tableState = signal<Partial<NatTableUserState>>({
  globalFilter: ''
});

readonly columns = withNatTableHeaderActions([
  { accessorKey: 'name', header: 'Name', meta: { label: 'Name', rowHeader: true } },
  { accessorKey: 'status', header: 'Status', meta: { label: 'Status' } }
]);
`
  )
];

const selectionSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table-surface [state]="tableState()" (rowSelectionChange)="onRowSelectionChange($event)">
  <nat-table-toolbar accessibleName="Bulk actions">
    <button type="button" natToolbarItem [disabled]="selectedRows().length === 0">Delete selected</button>
  </nat-table-toolbar>

  <nat-table
    [columns]="columns"
    [data]="rows()"
    [enableRowSelection]="true"
    selectionMode="multiple"
    accessibleName="Selectable rows" />
</nat-table-surface>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly tableState = signal<Partial<NatTableUserState>>({ rowSelection: {} });

readonly columns = withNatTableSelectionColumn(
  withNatTableHeaderActions(baseColumns),
  { label: 'Select service' }
);

onRowSelectionChange(rowSelection: RowSelectionState): void {
  this.tableState.update((state) => ({ ...state, rowSelection }));
}
`
  )
];

const toolbarSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table-toolbar accessibleName="Table actions">
  <button type="button" natToolbarItem natToolbarItemPosition="start">Refresh</button>
  <button type="button" natToolbarItem natTableExport exportFileName="positions">Export CSV</button>
</nat-table-toolbar>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly exportHandler: NatTableExportHandler<PositionRow> = async (context) => {
  const data = await context.getData();
  await this.exportApi.createFile(data);
};
`
  )
];

const keyboardSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table-surface [keybindings]="keybindings">
  <nat-table [columns]="columns" [data]="rows" accessibleName="Keyboard demo table" />
</nat-table-surface>

<button type="button" natHotkeyA11y="rowActivate">Acknowledge row</button>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly keybindings: NatTableKeybindings = {
  rowActivate: ['Enter', 'Space'],
  columnReorderLeft: 'Control+Shift+ArrowLeft',
  columnReorderRight: 'Control+Shift+ArrowRight'
};
`
  )
];

const statesSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table [data]="rows()" [columns]="columns" [dataStatus]="status()" [error]="error()" accessibleName="Open positions">
  <ng-template natTableLoading>Loading positions</ng-template>
  <ng-template natTableEmpty let-filtered>
    {{ filtered ? 'No rows match the active filters.' : 'There are no positions.' }}
  </ng-template>
  <ng-template natTableError let-error>Positions could not be loaded</ng-template>
</nat-table>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly status = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.loading);
readonly rows = signal<readonly PositionRow[]>([]);
readonly error = signal<unknown>(undefined);
`
  )
];

const themingSnippets = [
  snippet(
    'html',
    'HTML',
    'html',
    `
<nat-table-surface [initialState]="initialState" class="ledger-surface">
  <nat-table [columns]="columns" [data]="rows" accessibleName="Themed orders table" />
</nat-table-surface>
`
  ),
  snippet(
    'ts',
    'TS',
    'typescript',
    `
readonly rows = generateMockOrderRows(5);
readonly initialState = {
  sorting: [{ id: 'total', desc: true }],
} satisfies Partial<NatTableUserState>;

readonly columns = withNatTableHeaderActions(baseColumns, {
  enableColumnPinActions: false,
  sortIndicator: ({ sortState }) => (sortState === 'asc' ? '↑' : sortState === 'desc' ? '↓' : '↕'),
});
`
  ),
  snippet(
    'css',
    'Theme CSS',
    'css',
    `
.ledger-surface {
  --nat-table-color-text: #26312f;
  --nat-table-color-text-muted: #667570;
  --nat-table-color-accent: #0f766e;
  --nat-table-color-success: #0f766e;
  --nat-table-color-warning: #9a5b13;
  --nat-table-card-background: #edf3f1;
  --nat-table-card-border-color: #cbd8d4;
  --nat-table-card-shadow: 0 18px 42px rgb(31 49 45 / 12%);
  --nat-table-space-card: 18px;
  --nat-table-radius-card: 6px;
  --nat-table-font-family: 'Aptos', 'Segoe UI', system-ui, sans-serif;
  --nat-table-font-size-header: 0.82rem;
  --nat-table-letter-spacing-header: 0;
  --nat-table-text-transform-header: none;
  --nat-table-line-height-cell: 1.5;
  --nat-table-font-weight-row-header: 700;
  --nat-table-region-background: #fbfcfb;
  --nat-table-region-border-color: #cbd8d4;
  --nat-table-region-border-width: 1px;
  --nat-table-header-background: #26312f;
  --nat-table-header-color: #f8fbfa;
  --nat-table-header-border-color: #26312f;
  --nat-table-row-background: #fbfcfb;
  --nat-table-row-background-hover: #eef6f3;
  --nat-table-row-background-focus: #e4efec;
  --nat-table-cell-border-color: #dde7e3;
  --nat-table-cell-color-positive: #0f766e;
  --nat-table-cell-color-warning: #9a5b13;
  --nat-table-cell-color-neutral: #667570;
  --nat-table-focus-ring-color: #0f766e;
  --nat-table-sort-icon-color-active: #f8fbfa;
  --nat-table-sort-icon-color-idle: rgb(248 251 250 / 68%);
  --nat-table-sort-icon-color-hover: #f8fbfa;
  --nat-table-sort-button-color-sorted: #f8fbfa;
  --nat-table-space-header-actions-gap: 8px;
  --nat-table-sort-icon-min-width: 1rem;
  --nat-table-space-cell-y: 15px;
  --nat-table-space-cell-x: 18px;
  --nat-table-radius-region: 4px;
  --nat-table-hover-lift: none;
  --nat-table-focus-ring-width: 3px;

  display: block;
  color-scheme: light;
}

[data-theme='dark'] .ledger-surface {
  --nat-table-color-text: #dfe8e5;
  --nat-table-color-text-muted: #9fb1ab;
  --nat-table-color-accent: #5eead4;
  --nat-table-color-success: #5eead4;
  --nat-table-color-warning: #f8c572;
  --nat-table-card-background: #111c1a;
  --nat-table-card-border-color: #30413d;
  --nat-table-card-shadow: 0 18px 44px rgb(3 10 9 / 46%);
  --nat-table-region-background: #15211f;
  --nat-table-region-border-color: #30413d;
  --nat-table-header-background: #dce8e4;
  --nat-table-header-color: #17211f;
  --nat-table-header-border-color: #dce8e4;
  --nat-table-row-background: #15211f;
  --nat-table-row-background-hover: #1d2d2a;
  --nat-table-row-background-focus: #243632;
  --nat-table-cell-border-color: #253632;
  --nat-table-cell-color-positive: #5eead4;
  --nat-table-cell-color-warning: #f8c572;
  --nat-table-cell-color-neutral: #c5d3cf;
  --nat-table-focus-ring-color: #5eead4;
  --nat-table-sort-icon-color-active: #17211f;
  --nat-table-sort-icon-color-idle: rgb(23 33 31 / 62%);
  --nat-table-sort-icon-color-hover: #17211f;
  --nat-table-sort-button-color-sorted: #17211f;

  color-scheme: dark;
}
`
  )
];

const TOPIC_CONTENT: readonly DocsTopicContent[] = [
  {
    id: 'quick-start',
    blocks: [{ kind: 'markdown', id: 'quick-start-prose', markdownPath: '/docs/quick-start.md' }],
    related: [
      { label: 'Composition', path: '/docs/composition' },
      { label: 'Columns', path: '/docs/columns' }
    ]
  },
  {
    id: 'composition',
    contents: [
      { label: 'Package responsibilities', path: '#package-responsibilities' },
      { label: 'Surface and controller', path: '#surface-and-controller' },
      { label: 'Consumer-owned controls', path: '#consumer-owned-controls' }
    ],
    blocks: [{ kind: 'markdown', id: 'composition-prose', markdownPath: '/docs/composition.md' }],
    related: [
      { label: 'Toolbar and actions', path: '/docs/toolbar-actions' },
      { label: 'Render metrics', path: '/docs/render-metrics' }
    ]
  },
  {
    id: 'columns',
    contents: [
      { label: 'Basic shape', path: '#basic-column-shape' },
      { label: 'Metadata', path: '#column-metadata' },
      { label: 'Custom cells', path: '#custom-cell-components' }
    ],
    blocks: [{ kind: 'markdown', id: 'columns-prose', markdownPath: '/docs/columns.md' }],
    related: [
      { label: 'Column layout', path: '/docs/column-layout' },
      { label: 'Export', path: '/docs/export' }
    ]
  },
  {
    id: 'state',
    contents: [
      { label: 'State slices', path: '#state-slices' },
      { label: 'Controlled state', path: '#own-one-slice' },
      { label: 'Manual data handling', path: '#manual-data-handling' }
    ],
    blocks: [{ kind: 'markdown', id: 'state-prose', markdownPath: '/docs/state.md' }],
    related: [
      { label: 'Data lifecycle', path: '/docs/data-lifecycle' },
      { label: 'Pagination', path: '/docs/pagination' }
    ]
  },
  {
    id: 'data-lifecycle',
    contents: [
      { label: 'State model', path: '#state-model' },
      { label: 'State rows', path: '#basic-fetching' },
      { label: 'Manual data handling', path: '#manual-data-handling' }
    ],
    blocks: [
      { kind: 'markdown', id: 'data-lifecycle-prose', markdownPath: '/docs/data-lifecycle.md' },
      {
        kind: 'example',
        id: 'table-states',
        title: 'State rows stay inside the table',
        description: 'Loading, empty, error, transition, and refresh states use table-owned body rows with app-owned lifecycle logic.',
        component: States,
        snippets: statesSnippets
      }
    ],
    related: [
      { label: 'State', path: '/docs/state' },
      { label: 'Filtering and search', path: '/docs/filtering-search' }
    ]
  },
  {
    id: 'sorting',
    contents: [
      { label: 'When to use sorting', path: '#when-to-use-sorting' },
      { label: 'Controlled sorting', path: '#controlled-sorting' },
      { label: 'Multi-column sorting', path: '#multi-column-sorting' },
      { label: 'Custom sort indicators', path: '#custom-sort-indicators' },
      { label: 'Pinned columns variant', path: '#pinned-columns-variant' }
    ],
    blocks: [
      { kind: 'markdown', id: 'sorting-prose', markdownPath: '/docs/sorting.md' },
      {
        kind: 'example',
        id: 'sorting',
        title: 'Single and multi-column sorting',
        description: 'The table state owns sorting while header actions and app controls can update the same slice.',
        component: Sorting,
        snippets: sortingSnippets
      },
      {
        kind: 'example',
        id: 'sorting-pinned-columns',
        title: 'Sorting with pinned columns',
        description: 'Pinned columns stay fixed while sortable headers continue to update table state.',
        component: SimpleSorting,
        snippets: sortingSnippets
      }
    ],
    related: [
      { label: 'State', path: '/docs/state' },
      { label: 'Column layout', path: '/docs/column-layout' }
    ]
  },
  {
    id: 'filtering-search',
    contents: [
      { label: 'Search is app-owned', path: '#search-is-app-owned' },
      { label: 'Global filters', path: '#global-filters' },
      { label: 'Column filters', path: '#column-filters' }
    ],
    blocks: [
      { kind: 'markdown', id: 'filtering-search-prose', markdownPath: '/docs/filtering-search.md' },
      {
        kind: 'example',
        id: 'filtering-search',
        title: 'Consumer-owned search',
        description: 'A product-owned search input patches table state without becoming a bundled table primitive.',
        component: Search,
        snippets: filteringSnippets
      }
    ],
    related: [
      { label: 'Data lifecycle', path: '/docs/data-lifecycle' },
      { label: 'Pagination', path: '/docs/pagination' }
    ]
  },
  {
    id: 'pagination',
    contents: [
      { label: 'When to use pagination', path: '#when-to-use-pagination' },
      { label: 'Client pagination', path: '#client-pagination' },
      { label: 'Split controls', path: '#split-page-size-and-pager-controls' },
      { label: 'Manual pagination', path: '#manual-pagination' }
    ],
    blocks: [
      { kind: 'markdown', id: 'pagination-prose', markdownPath: '/docs/pagination.md' },
      {
        kind: 'example',
        id: 'pagination',
        title: 'Client and manual pagination',
        description: 'The pagination companion control can drive automatic row models or an app-owned data pipeline.',
        component: Pagination,
        snippets: paginationSnippets
      }
    ],
    related: [
      { label: 'State', path: '/docs/state' },
      { label: 'Data lifecycle', path: '/docs/data-lifecycle' }
    ]
  },
  {
    id: 'column-layout',
    contents: [
      { label: 'Layout responsibilities', path: '#layout-responsibilities' },
      { label: 'Pinning and visibility', path: '#pinning-and-visibility' },
      { label: 'Reordering and resizing', path: '#reordering-and-resizing' },
      { label: 'Horizontal scroll controls', path: '#horizontal-scroll-controls' }
    ],
    blocks: [
      { kind: 'markdown', id: 'column-layout-prose', markdownPath: '/docs/column-layout.md' },
      {
        kind: 'example',
        id: 'column-pinning',
        title: 'Column pinning',
        description: 'Pinning state keeps important columns visible at the left or right boundary.',
        component: Pinning,
        snippets: columnLayoutSnippets
      },
      {
        kind: 'example',
        id: 'column-reordering',
        title: 'Column reordering',
        description: 'Drag, menu actions, and keyboard shortcuts all update the same column order state.',
        component: Reordering,
        snippets: columnLayoutSnippets
      },
      {
        kind: 'example',
        id: 'column-resizing',
        title: 'Column resizing',
        description: 'Resizable columns can use fill or fixed width modes with pointer and keyboard input.',
        component: Resizing,
        snippets: columnLayoutSnippets
      },
      {
        kind: 'example',
        id: 'column-visibility',
        title: 'Column visibility',
        description: 'The visibility companion control patches column visibility without owning table data.',
        component: Visibility,
        snippets: columnLayoutSnippets
      },
      {
        kind: 'example',
        id: 'sticky-header',
        title: 'Sticky header',
        description: 'Sticky headers keep column context visible in vertically scrollable table regions.',
        component: StickyHeader,
        snippets: columnLayoutSnippets
      }
    ],
    related: [
      { label: 'Columns', path: '/docs/columns' },
      { label: 'Keyboard interaction', path: '/docs/keyboard-interaction' }
    ]
  },
  {
    id: 'row-selection',
    contents: [
      { label: 'When to use selection', path: '#when-to-use-selection' },
      { label: 'Selection state', path: '#selection-state' },
      { label: 'Selection column', path: '#selection-column' },
      { label: 'Single and multiple selection', path: '#single-and-multiple-selection' },
      { label: 'Direct selection checkboxes', path: '#direct-selection-checkboxes' },
      { label: 'Bulk actions', path: '#bulk-actions' }
    ],
    blocks: [
      { kind: 'markdown', id: 'row-selection-prose', markdownPath: '/docs/row-selection.md' },
      {
        kind: 'example',
        id: 'row-selection',
        title: 'Row selection and bulk actions',
        description: 'Selection state is keyed by stable row id and can drive app-owned bulk controls.',
        component: Selection,
        snippets: selectionSnippets
      }
    ],
    related: [
      { label: 'State', path: '/docs/state' },
      { label: 'Toolbar and actions', path: '/docs/toolbar-actions' }
    ]
  },
  {
    id: 'toolbar-actions',
    contents: [
      { label: 'Toolbar shell', path: '#toolbar-shell' },
      { label: 'Table actions', path: '#table-actions' },
      { label: 'Keyboard order', path: '#keyboard-order' }
    ],
    blocks: [
      { kind: 'markdown', id: 'toolbar-actions-prose', markdownPath: '/docs/toolbar-actions.md' },
      {
        kind: 'example',
        id: 'toolbar-actions',
        title: 'Toolbar groups and action placement',
        description: 'Toolbar items keep DOM, screen-reader, and roving-keyboard order aligned.',
        component: Toolbar,
        snippets: toolbarSnippets
      }
    ],
    related: [
      { label: 'Export', path: '/docs/export' },
      { label: 'Keyboard interaction', path: '/docs/keyboard-interaction' }
    ]
  },
  {
    id: 'accessibility',
    contents: [
      { label: 'Minimum checklist', path: '#minimum-checklist' },
      { label: 'Names and labels', path: '#table-name' },
      { label: 'Custom cells', path: '#custom-interactive-cells' }
    ],
    blocks: [{ kind: 'markdown', id: 'accessibility-prose', markdownPath: '/docs/accessibility.md' }],
    related: [
      { label: 'Keyboard interaction', path: '/docs/keyboard-interaction' },
      { label: 'Localization', path: '/docs/localization' }
    ]
  },
  {
    id: 'keyboard-interaction',
    contents: [
      { label: 'Grid navigation', path: '#grid-navigation' },
      { label: 'Interactive cells', path: '#interactive-cells' },
      { label: 'Custom keybindings', path: '#custom-keybindings' }
    ],
    blocks: [
      { kind: 'markdown', id: 'keyboard-interaction-prose', markdownPath: '/docs/keyboard-interaction.md' },
      {
        kind: 'example',
        id: 'keyboard-interaction',
        title: 'Keyboard cell interaction',
        description: 'Grid navigation, interactive controls, and row activation share one keyboard model.',
        component: KeyboardInteraction,
        snippets: keyboardSnippets
      }
    ],
    related: [
      { label: 'Accessibility', path: '/docs/accessibility' },
      { label: 'Column layout', path: '/docs/column-layout' }
    ]
  },
  {
    id: 'theming',
    contents: [
      { label: 'Recommended shape', path: '#recommended-shape' },
      { label: 'Theme scope', path: '#theme-scope' },
      { label: 'Theme example', path: '#docs-example-theme-example-title' },
      { label: 'Tokens', path: '#core-table-tokens' }
    ],
    blocks: [
      { kind: 'markdown', id: 'theming-prose', markdownPath: '/docs/theming.md' },
      {
        kind: 'example',
        id: 'theme-example',
        title: 'Theme example',
        description: 'A scoped consumer theme with a visibly different table treatment and matching token CSS.',
        component: ThemingShowcase,
        snippets: themingSnippets
      }
    ],
    related: [
      { label: 'Accessibility', path: '/docs/accessibility' },
      { label: 'Composition', path: '/docs/composition' }
    ]
  },
  {
    id: 'localization',
    contents: [
      { label: 'Locale providers', path: '#locale-providers' },
      { label: 'Runtime locale changes', path: '#runtime-locale-changes' },
      { label: 'Accessible names', path: '#accessible-names' }
    ],
    blocks: [{ kind: 'markdown', id: 'localization-prose', markdownPath: '/docs/localization.md' }],
    related: [
      { label: 'Accessibility', path: '/docs/accessibility' },
      { label: 'Render metrics', path: '/docs/render-metrics' }
    ]
  },
  {
    id: 'export',
    contents: [
      { label: 'Export button', path: '#export-button' },
      { label: 'Export scope', path: '#export-scope' },
      { label: 'Custom handlers', path: '#custom-export-handler' }
    ],
    blocks: [{ kind: 'markdown', id: 'export-prose', markdownPath: '/docs/export.md' }],
    related: [
      { label: 'Toolbar and actions', path: '/docs/toolbar-actions' },
      { label: 'Columns', path: '/docs/columns' }
    ]
  },
  {
    id: 'render-metrics',
    contents: [
      { label: 'Install', path: '#install' },
      { label: 'Panel and filter', path: '#panel-and-filter' },
      { label: 'Production guidance', path: '#production-guidance' }
    ],
    blocks: [{ kind: 'markdown', id: 'render-metrics-prose', markdownPath: '/docs/render-metrics.md' }],
    related: [
      { label: 'Composition', path: '/docs/composition' },
      { label: 'Filtering and search', path: '/docs/filtering-search' }
    ]
  }
];

const FALLBACK_TOPIC = TOPIC_CONTENT[0];

export const findDocsTopicContent = (topicId: string | undefined): DocsTopicContent => {
  return TOPIC_CONTENT.find((topic) => topic.id === topicId) ?? FALLBACK_TOPIC;
};
