import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityScrollControlLabels,
  NatTableAccessibilitySelectionLabels
} from '../common/controls.type';

/** Merges the visible column-visibility labels, override values winning. */
const mergeColumnVisibilityText = (
  parent?: NatTableAccessibilityColumnVisibilityLabels,
  override?: NatTableAccessibilityColumnVisibilityLabels
): Partial<NatTableAccessibilityColumnVisibilityLabels> => ({
  heading: override?.heading ?? parent?.heading,
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel
});

/** Merges the column-visibility formatter callbacks, override values winning. */
const mergeColumnVisibilityFormatters = (
  parent?: NatTableAccessibilityColumnVisibilityLabels,
  override?: NatTableAccessibilityColumnVisibilityLabels
): Partial<NatTableAccessibilityColumnVisibilityLabels> => ({
  visibilitySummary: override?.visibilitySummary ?? parent?.visibilitySummary,
  toggleColumnAriaLabel: override?.toggleColumnAriaLabel ?? parent?.toggleColumnAriaLabel,
  columnState: override?.columnState ?? parent?.columnState
});

/** Merges column visibility labels and formatters field by field. */
export const mergeColumnVisibilityLabels = (
  parent?: NatTableAccessibilityColumnVisibilityLabels,
  override?: NatTableAccessibilityColumnVisibilityLabels
): NatTableAccessibilityColumnVisibilityLabels => ({
  ...mergeColumnVisibilityText(parent, override),
  ...mergeColumnVisibilityFormatters(parent, override)
});

/** Merges page-size labels and formatters field by field. */
export const mergePageSizeLabels = (
  parent?: NatTableAccessibilityPageSizeLabels,
  override?: NatTableAccessibilityPageSizeLabels
): NatTableAccessibilityPageSizeLabels => ({
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
  pageSizeOptionText: override?.pageSizeOptionText ?? parent?.pageSizeOptionText,
  pageSizeOptionAriaLabel: override?.pageSizeOptionAriaLabel ?? parent?.pageSizeOptionAriaLabel
});

/** Merges the pager button labels, override values winning. */
const mergePagerButtonLabels = (
  parent?: NatTableAccessibilityPagerLabels,
  override?: NatTableAccessibilityPagerLabels
): Partial<NatTableAccessibilityPagerLabels> => ({
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
  previousPageAriaLabel: override?.previousPageAriaLabel ?? parent?.previousPageAriaLabel
});

/** Merges the remaining pager labels and indicators, override values winning. */
const mergePagerIndicatorLabels = (
  parent?: NatTableAccessibilityPagerLabels,
  override?: NatTableAccessibilityPagerLabels
): Partial<NatTableAccessibilityPagerLabels> => ({
  nextPageAriaLabel: override?.nextPageAriaLabel ?? parent?.nextPageAriaLabel,
  pageIndicator: override?.pageIndicator ?? parent?.pageIndicator
});

/** Merges pager labels and formatters field by field. */
export const mergePagerLabels = (
  parent?: NatTableAccessibilityPagerLabels,
  override?: NatTableAccessibilityPagerLabels
): NatTableAccessibilityPagerLabels => ({
  ...mergePagerButtonLabels(parent, override),
  ...mergePagerIndicatorLabels(parent, override)
});

/** Merges the scroll-control button labels, override values winning. */
const mergeScrollControlButtonLabels = (
  parent?: NatTableAccessibilityScrollControlLabels,
  override?: NatTableAccessibilityScrollControlLabels
): Partial<NatTableAccessibilityScrollControlLabels> => ({
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
  scrollLeftAriaLabel: override?.scrollLeftAriaLabel ?? parent?.scrollLeftAriaLabel,
  scrollRightAriaLabel: override?.scrollRightAriaLabel ?? parent?.scrollRightAriaLabel
});

/** Merges the scroll-position labels and formatters, override values winning. */
const mergeScrollControlPositionLabels = (
  parent?: NatTableAccessibilityScrollControlLabels,
  override?: NatTableAccessibilityScrollControlLabels
): Partial<NatTableAccessibilityScrollControlLabels> => ({
  scrollPositionAriaLabel: override?.scrollPositionAriaLabel ?? parent?.scrollPositionAriaLabel,
  scrollPositionText: override?.scrollPositionText ?? parent?.scrollPositionText
});

/** Merges horizontal scroll-control labels and formatters field by field. */
export const mergeScrollControlLabels = (
  parent?: NatTableAccessibilityScrollControlLabels,
  override?: NatTableAccessibilityScrollControlLabels
): NatTableAccessibilityScrollControlLabels => ({
  ...mergeScrollControlButtonLabels(parent, override),
  ...mergeScrollControlPositionLabels(parent, override)
});

/** Merges selection-column labels and formatters field by field. */
export const mergeSelectionLabels = (
  parent?: NatTableAccessibilitySelectionLabels,
  override?: NatTableAccessibilitySelectionLabels
): NatTableAccessibilitySelectionLabels => ({
  selectAllAriaLabel: override?.selectAllAriaLabel ?? parent?.selectAllAriaLabel,
  selectRowAriaLabel: override?.selectRowAriaLabel ?? parent?.selectRowAriaLabel
});

/** Merges the header sort and menu labels, override values winning. */
const mergeHeaderSortAndMenuLabels = (
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels
): Partial<NatTableAccessibilityHeaderActionLabels> => ({
  sortButton: override?.sortButton ?? parent?.sortButton,
  menuButton: override?.menuButton ?? parent?.menuButton,
  menuLabel: override?.menuLabel ?? parent?.menuLabel
});

/** Merges the header pin labels, override values winning. */
const mergeHeaderPinLabels = (
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels
): Partial<NatTableAccessibilityHeaderActionLabels> => ({
  pinButton: override?.pinButton ?? parent?.pinButton,
  pinButtonText: override?.pinButtonText ?? parent?.pinButtonText
});

/** Merges the header move labels, override values winning. */
const mergeHeaderMoveLabels = (
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels
): Partial<NatTableAccessibilityHeaderActionLabels> => ({
  moveButton: override?.moveButton ?? parent?.moveButton,
  moveButtonText: override?.moveButtonText ?? parent?.moveButtonText
});

/** Merges header action labels and formatters field by field. */
export const mergeHeaderActionLabels = (
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels
): NatTableAccessibilityHeaderActionLabels => ({
  ...mergeHeaderSortAndMenuLabels(parent, override),
  ...mergeHeaderPinLabels(parent, override),
  ...mergeHeaderMoveLabels(parent, override)
});
