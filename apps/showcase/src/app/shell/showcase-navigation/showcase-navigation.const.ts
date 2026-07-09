import type { ShowcaseDoc } from './showcase-navigation.type';

export const showcaseDocs: readonly ShowcaseDoc[] = [
  {
    id: 'quick-start',
    label: 'Quick start',
    description: 'Install and first table',
    path: '/docs/quick-start'
  },
  {
    id: 'composition',
    label: 'Composition',
    description: 'Core table and companion controls',
    path: '/docs/composition'
  },
  {
    id: 'columns',
    label: 'Columns',
    description: 'Metadata, sizing, and cells',
    path: '/docs/columns'
  },
  {
    id: 'state',
    label: 'State',
    description: 'Controlled and uncontrolled slices',
    path: '/docs/state'
  },
  {
    id: 'data-lifecycle',
    label: 'Data lifecycle',
    description: 'Loading, empty, error, and manual data',
    path: '/docs/data-lifecycle'
  },
  {
    id: 'sorting',
    label: 'Sorting',
    description: 'Single, multi, and controlled sorting',
    path: '/docs/sorting'
  },
  {
    id: 'filtering-search',
    label: 'Filtering and search',
    description: 'Consumer-owned search and filters',
    path: '/docs/filtering-search'
  },
  {
    id: 'pagination',
    label: 'Pagination',
    description: 'Client and manual pagination',
    path: '/docs/pagination'
  },
  {
    id: 'column-layout',
    label: 'Column layout',
    description: 'Pinning, resizing, order, visibility',
    path: '/docs/column-layout'
  },
  {
    id: 'responsive-capabilities',
    label: 'Responsive capabilities',
    description: 'Opt out of capability UI per viewport',
    path: '/docs/responsive-capabilities'
  },
  {
    id: 'row-selection',
    label: 'Row selection',
    description: 'Selection state and bulk workflows',
    path: '/docs/row-selection'
  },
  {
    id: 'toolbar-actions',
    label: 'Toolbar and actions',
    description: 'Toolbar shell and table actions',
    path: '/docs/toolbar-actions'
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Names, state rows, and custom cells',
    path: '/docs/accessibility'
  },
  {
    id: 'keyboard-interaction',
    label: 'Keyboard interaction',
    description: 'Grid navigation and shortcuts',
    path: '/docs/keyboard-interaction'
  },
  {
    id: 'theming',
    label: 'Theming',
    description: 'CSS token scopes and states',
    path: '/docs/theming'
  },
  {
    id: 'localization',
    label: 'Localization',
    description: 'Locale providers and accessible copy',
    path: '/docs/localization'
  },
  {
    id: 'export',
    label: 'Export',
    description: 'CSV defaults and custom handlers',
    path: '/docs/export'
  },
  {
    id: 'render-metrics',
    label: 'Render metrics',
    description: 'Opt-in row render diagnostics',
    path: '/docs/render-metrics'
  }
];
