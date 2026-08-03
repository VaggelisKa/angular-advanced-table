import type { NatTableAccessibilityText } from './accessibility.type';
import { pluralize } from './pluralize.util.const';

/**
 * Built-in English accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Spread into the English
 * accessibility text; a consumer overriding only the grid formatter still
 * wins, because the renderer falls back to it when the list entry is absent.
 */
export const NAT_EN_LIST_ACCESSIBILITY_TEXT: Pick<NatTableAccessibilityText, 'listSummary' | 'listColumnVisibilityChange'> = {
  listSummary: ({
    filterState,
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

    if (visibleRowsValue === 0) {
      summary = `No items are currently shown. ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    } else if (filterState === 'filtered' && totalRowsValue !== visibleRowsValue) {
      summary = `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize(
        'item',
        totalRowsValue
      )} across ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    } else {
      summary = `Showing ${visibleRowsText} ${pluralize(
        'item',
        visibleRowsValue
      )} across ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    }

    if (paginationState === 'enabled') {
      summary += ` Page ${pageText} of ${pageCountText}.`;
    }

    return summary;
  },
  listColumnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    if (changedColumns.length === 1) {
      const [column] = changedColumns;

      return `${column.label} field ${
        column.visibilityState === 'visible' ? 'shown' : 'hidden'
      }. ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    }

    return `${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
  }
};
