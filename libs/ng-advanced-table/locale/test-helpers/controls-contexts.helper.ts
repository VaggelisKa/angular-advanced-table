import type {
  NatTableAccessibilityColumnVisibilityActionContext,
  NatTableAccessibilityColumnVisibilitySummaryContext,
  NatTableAccessibilityHeaderActionPinContext,
  NatTableAccessibilityHeaderActionSortContext,
  NatTableAccessibilityPageSizeOptionContext,
  NatTableAccessibilityPagerContext,
  NatTableAccessibilityScrollControlPositionContext
} from '../common/controls.type';

export const pageSizeContext: NatTableAccessibilityPageSizeOptionContext = {
  pageSizeValue: 25,
  pageSizeText: '25',
  selectionState: 'not-selected'
};

// Nordic plurals inflect the modifier along with the noun, so a page size of
// one is a distinct phrase rather than the plural minus a suffix.
export const singlePageSizeContext: NatTableAccessibilityPageSizeOptionContext = {
  pageSizeValue: 1,
  pageSizeText: '1',
  selectionState: 'selected'
};

export const pagerContext: NatTableAccessibilityPagerContext = {
  pageValue: 2,
  pageText: '2',
  pageCountValue: 5,
  pageCountText: '5'
};

export const scrollPositionContext: NatTableAccessibilityScrollControlPositionContext = {
  scrollLeftValue: 50,
  scrollLeftText: '50',
  maxScrollLeftValue: 200,
  maxScrollLeftText: '200',
  percentageValue: 25,
  percentageText: '25'
};

export const columnVisibilitySummaryContext: NatTableAccessibilityColumnVisibilitySummaryContext = {
  visibleColumnCountValue: 3,
  visibleColumnCountText: '3',
  totalColumnCountValue: 5,
  totalColumnCountText: '5'
};

export const visibleColumnContext: NatTableAccessibilityColumnVisibilityActionContext = {
  columnLabel: 'Service',
  visibilityState: 'visible',
  toggleAction: 'hide'
};

export const hiddenColumnContext: NatTableAccessibilityColumnVisibilityActionContext = {
  columnLabel: 'Service',
  visibilityState: 'hidden',
  toggleAction: 'show'
};

export const sortedHeaderContext: NatTableAccessibilityHeaderActionSortContext = {
  label: 'Service',
  sortState: 'ascending',
  sortPriority: 1,
  sortCount: 2
};

export const unsortedHeaderContext: NatTableAccessibilityHeaderActionSortContext = {
  label: 'Service',
  sortState: 'none',
  sortPriority: null,
  sortCount: 0
};

export const soleSortedHeaderContext: NatTableAccessibilityHeaderActionSortContext = {
  label: 'Service',
  sortState: 'descending',
  sortPriority: 1,
  sortCount: 1
};

export const unpinnedHeaderContext: NatTableAccessibilityHeaderActionPinContext = {
  label: 'Service',
  pinState: 'unpinned',
  toggleAction: 'pin',
  pinSide: 'left',
  pinnedSide: null
};

export const pinnedHeaderContext: NatTableAccessibilityHeaderActionPinContext = {
  label: 'Service',
  pinState: 'pinned',
  toggleAction: 'unpin',
  pinSide: 'right',
  pinnedSide: 'right'
};
