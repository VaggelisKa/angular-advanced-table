import type { NatTableAccessibilityText } from './accessibility.type';
import { pluralize } from './pluralize.const';

/**
 * Built-in English accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Each entry is exported on its
 * own and referenced by name from the dictionary rather than spread into it:
 * an object spread is not provably side-effect free, so a bundler keeps the
 * whole dictionary even for an application that never registers this locale.
 */
export const listSubHeaderRow: NatTableAccessibilityText['listSubHeaderRow'] = ({ valueText, rowCountValue, rowCountText }) => {
  const groupLabel = valueText.trim() ? `${valueText} group` : 'Group';

  return `${groupLabel}, ${rowCountText} ${pluralize('item', rowCountValue)}.`;
};

export const listKeyboardInstructions: NatTableAccessibilityText['listKeyboardInstructions'] =
  'Use Up and Down arrows to move between items. Press Enter to use the controls in an item, ' +
  'Tab and Shift+Tab to move between them, and Escape to return to the item.';

export const listSummary: NatTableAccessibilityText['listSummary'] = ({
  pageCountText,
  pageText,
  paginationState,
  totalRowsValue,
  totalRowsText,
  visibleColumnsValue,
  visibleColumnsText,
  visibleRowsValue,
  visibleRowsText
}) => {
  let summary: string;

  // The subset phrasing fires whenever the shown items are fewer than the
  // represented total — filtered views, paginated pages, and remote windows
  // alike — so the summary can never contradict the grid's aria-rowcount.
  if (visibleRowsValue === 0) {
    summary = `No items shown. ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
  } else if (totalRowsValue !== visibleRowsValue) {
    summary = `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize(
      'item',
      totalRowsValue
    )}, ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
  } else {
    summary = `Showing ${visibleRowsText} ${pluralize(
      'item',
      visibleRowsValue
    )}, ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
  }

  if (paginationState === 'enabled') {
    summary += ` Page ${pageText} of ${pageCountText}.`;
  }

  return summary;
};

export const listColumnVisibilityChange: NatTableAccessibilityText['listColumnVisibilityChange'] = ({
  changedColumns,
  visibleColumnsValue,
  visibleColumnsText
}) => {
  if (changedColumns.length === 1) {
    const [column] = changedColumns;

    return `${column.label} field ${
      column.visibilityState === 'visible' ? 'shown' : 'hidden'
    }. ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
  }

  return `${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
};

export const listPageSizeChange: NatTableAccessibilityText['listPageSizeChange'] = ({
  pageCountText,
  pageSizeValue,
  pageSizeText,
  pageText
}) => `${pageSizeText} ${pluralize('item', pageSizeValue)} per page. Page ${pageText} of ${pageCountText}.`;

export const listPageChange: NatTableAccessibilityText['listPageChange'] = ({
  pageCountText,
  pageText,
  visibleRowsValue,
  visibleRowsText
}) => `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize('item', visibleRowsValue)} shown.`;
