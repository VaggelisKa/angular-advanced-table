import type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnResizeAnnouncementContext,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilityPaginationAnnouncementContext,
  NatTableAccessibilityRowPlaceholderContext,
  NatTableAccessibilitySelectionAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilitySubHeaderContext
} from '../common/accessibility.type';

export const SORTING_CONTEXTS: readonly NatTableAccessibilitySortingAnnouncementContext[] = [
  { columnId: null, columnLabel: null, sortState: 'none', sortedColumns: [] },
  { columnId: 'service', columnLabel: 'Service', sortState: 'none', sortedColumns: [] },
  {
    columnId: 'service',
    columnLabel: 'Service',
    sortState: 'ascending',
    sortedColumns: [{ id: 'service', label: 'Service', sortState: 'ascending' }]
  },
  {
    columnId: 'service',
    columnLabel: 'Service',
    sortState: 'descending',
    sortedColumns: [{ id: 'service', label: 'Service', sortState: 'descending' }]
  },
  {
    columnId: 'service',
    columnLabel: 'Service',
    sortState: 'ascending',
    sortedColumns: [
      { id: 'service', label: 'Service', sortState: 'ascending' },
      { id: 'region', label: 'Region', sortState: 'descending' }
    ]
  }
];

export const FILTERING_CONTEXTS: readonly NatTableAccessibilityFilteringAnnouncementContext[] = [
  { query: 'alpha', filterState: 'global', visibleRowsValue: 0, visibleRowsText: '0', totalRowsValue: 20, totalRowsText: '20' },
  { query: '', filterState: 'column', visibleRowsValue: 0, visibleRowsText: '0', totalRowsValue: 20, totalRowsText: '20' },
  { query: 'alpha', filterState: 'global', visibleRowsValue: 1, visibleRowsText: '1', totalRowsValue: 20, totalRowsText: '20' },
  { query: 'alpha', filterState: 'global', visibleRowsValue: 3, visibleRowsText: '3', totalRowsValue: 20, totalRowsText: '20' },
  { query: '', filterState: 'column', visibleRowsValue: 1, visibleRowsText: '1', totalRowsValue: 20, totalRowsText: '20' },
  { query: '', filterState: 'column', visibleRowsValue: 3, visibleRowsText: '3', totalRowsValue: 20, totalRowsText: '20' },
  { query: '', filterState: 'none', visibleRowsValue: 1, visibleRowsText: '1', totalRowsValue: 1, totalRowsText: '1' },
  { query: '', filterState: 'none', visibleRowsValue: 20, visibleRowsText: '20', totalRowsValue: 20, totalRowsText: '20' }
];

export const VISIBILITY_CONTEXTS: readonly NatTableAccessibilityColumnVisibilityAnnouncementContext[] = [
  {
    changedColumns: [{ id: 'service', label: 'Service', visibilityState: 'visible' }],
    visibleColumnsValue: 4,
    visibleColumnsText: '4',
    totalColumnsValue: 5,
    totalColumnsText: '5'
  },
  {
    changedColumns: [{ id: 'service', label: 'Service', visibilityState: 'hidden' }],
    visibleColumnsValue: 1,
    visibleColumnsText: '1',
    totalColumnsValue: 5,
    totalColumnsText: '5'
  },
  {
    changedColumns: [
      { id: 'service', label: 'Service', visibilityState: 'hidden' },
      { id: 'region', label: 'Region', visibilityState: 'visible' }
    ],
    visibleColumnsValue: 3,
    visibleColumnsText: '3',
    totalColumnsValue: 5,
    totalColumnsText: '5'
  }
];

export const PAGINATION_CONTEXTS: readonly NatTableAccessibilityPaginationAnnouncementContext[] = [
  {
    pageIndex: 1,
    pageValue: 2,
    pageText: '2',
    pageCountValue: 5,
    pageCountText: '5',
    pageSizeValue: 25,
    pageSizeText: '25',
    visibleRowsValue: 25,
    visibleRowsText: '25'
  },
  {
    pageIndex: 0,
    pageValue: 1,
    pageText: '1',
    pageCountValue: 1,
    pageCountText: '1',
    pageSizeValue: 1,
    pageSizeText: '1',
    visibleRowsValue: 1,
    visibleRowsText: '1'
  }
];

export const REORDER_CONTEXTS: readonly NatTableAccessibilityColumnReorderAnnouncementContext[] = [
  { columnId: 'service', label: 'Service', zone: 'left', positionValue: 1, positionText: '1', totalValue: 2, totalText: '2' },
  { columnId: 'service', label: 'Service', zone: 'center', positionValue: 2, positionText: '2', totalValue: 5, totalText: '5' },
  { columnId: 'service', label: 'Service', zone: 'right', positionValue: 3, positionText: '3', totalValue: 3, totalText: '3' }
];

export const RESIZE_CONTEXTS: readonly NatTableAccessibilityColumnResizeAnnouncementContext[] = [
  { columnId: 'service', label: 'Service', widthValue: 160, widthText: '160' },
  { columnId: 'service', label: 'Service', widthValue: 80, widthText: '80', atMinimum: true },
  { columnId: 'service', label: 'Service', widthValue: 480, widthText: '480', atMaximum: true }
];

export const SELECTION_CONTEXTS: readonly NatTableAccessibilitySelectionAnnouncementContext[] = [
  { selectedCountValue: 0, selectedCountText: '0', totalRowsValue: 20, totalRowsText: '20' },
  { selectedCountValue: 1, selectedCountText: '1', totalRowsValue: 20, totalRowsText: '20' },
  { selectedCountValue: 3, selectedCountText: '3', totalRowsValue: 20, totalRowsText: '20' },
  { selectedCountValue: 1, selectedCountText: '1', totalRowsValue: 1, totalRowsText: '1' },
  { selectedCountValue: 20, selectedCountText: '20', totalRowsValue: 20, totalRowsText: '20' },
  { selectedCountValue: 2, selectedCountText: '2', totalRowsValue: 0, totalRowsText: '0' }
];

export const SUB_HEADER_CONTEXTS: readonly NatTableAccessibilitySubHeaderContext[] = [
  { value: 'Cloud', valueText: 'Cloud', rowCountValue: 3, rowCountText: '3' },
  { value: null, valueText: '', rowCountValue: 1, rowCountText: '1' }
];

export const PLACEHOLDER_CONTEXT: NatTableAccessibilityRowPlaceholderContext = {
  positionValue: 42,
  positionText: '42',
  totalRowsValue: 500,
  totalRowsText: '500'
};

/** Raw contract tokens that must never reach a translated announcement. */
