import type {
  DataStatePreview,
  DemoItem,
  FeatureCategoryDescriptor,
  FeatureDescriptor,
  TableBuilderFlags
} from './table-builder.type';

export const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 }
];

export const DEFAULT_FLAGS: TableBuilderFlags = {
  withGlobalFilter: true,
  withPagination: true,
  withSorting: true,
  showColumnVisibility: true,
  withColumnPinning: true,
  withColumnReorder: true,
  withColumnResizing: false,
  columnSizingMode: 'fill',
  showScrollControl: true,
  withStickyHeader: false,
  withExport: false,
  withRowSelection: false,
  withDataStates: false,
  withLocalization: false
};

export const FEATURE_CATEGORIES: FeatureCategoryDescriptor[] = [
  { id: 'data', label: 'Data operations' },
  { id: 'columns', label: 'Columns' },
  { id: 'layout', label: 'Layout' },
  { id: 'controls', label: 'Controls' },
  { id: 'states', label: 'States' },
  { id: 'i18n', label: 'Localization' }
];

export const FEATURE_DESCRIPTORS: FeatureDescriptor[] = [
  {
    key: 'withGlobalFilter',
    label: 'Global Search',
    category: 'data',
    help: 'Adds fuzzy-search inputs to query row content globally.'
  },
  {
    key: 'withPagination',
    label: 'Pagination',
    category: 'data',
    help: 'Enables paging logic with page-size chips and pager navigation.'
  },
  {
    key: 'withSorting',
    label: 'Sorting',
    category: 'data',
    help: 'Adds sortable headers; activate a header to cycle ascending and descending.'
  },
  {
    key: 'showColumnVisibility',
    label: 'Column Visibility',
    category: 'columns',
    help: 'Renders interactive visibility chips to toggle columns.'
  },
  {
    key: 'withColumnPinning',
    label: 'Column Pinning',
    category: 'columns',
    help: 'Allows columns to be stuck to the left/right boundaries.'
  },
  {
    key: 'withColumnReorder',
    label: 'Column Reordering',
    category: 'columns',
    help: 'Enables drag-and-drop, header-menu move actions, and Ctrl+Shift+Arrow keyboard column reordering (Command+Shift+Arrow on macOS).'
  },
  {
    key: 'withColumnResizing',
    label: 'Column Resizing',
    category: 'columns',
    help: 'Adds drag handles and Alt+Arrow keyboard resizing in fixed-width mode.'
  },
  {
    key: 'withStickyHeader',
    label: 'Sticky Header',
    category: 'layout',
    help: 'Pins the table header to the top of the viewport during scroll.'
  },
  {
    key: 'showScrollControl',
    label: 'Scroll Control',
    category: 'layout',
    help: 'Renders a horizontal scrolling slider for wide tables.'
  },
  {
    key: 'withExport',
    label: 'Data Export',
    category: 'controls',
    help: 'Adds a toolbar button that exports the current rows to CSV.'
  },
  {
    key: 'withRowSelection',
    label: 'Row Selection',
    category: 'controls',
    help: 'Adds a leading checkbox column with select-all; rows can be multi-selected.'
  },
  {
    key: 'withDataStates',
    label: 'Data States',
    category: 'states',
    help: 'Adds loading, empty, and error state templates; preview each one with the state selector.'
  },
  {
    key: 'withLocalization',
    label: 'Localization',
    category: 'i18n',
    help: 'Registers a Danish control-label dictionary; use the language selector to flip the preview between English and Danish.'
  }
];

export const DATA_STATE_PREVIEWS: { value: DataStatePreview; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: 'loading', label: 'Loading' },
  { value: 'empty', label: 'Empty' },
  { value: 'error', label: 'Error' }
];
