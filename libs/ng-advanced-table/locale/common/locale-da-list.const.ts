import type { NatTableAccessibilityText } from './accessibility.type';
import { items, visibilityVerb, visibleFields } from './locale-da-text.const';

/**
 * Built-in Danish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Spread into the Danish
 * accessibility text; a consumer overriding only the grid formatter still
 * wins, because the renderer falls back to it when the list entry is absent.
 */
export const NAT_DA_LIST_ACCESSIBILITY_TEXT: Pick<
  NatTableAccessibilityText,
  | 'listSummary'
  | 'listColumnVisibilityChange'
  | 'listPageSizeChange'
  | 'listPageChange'
  | 'listSubHeaderRow'
  | 'listKeyboardInstructions'
> = {
  listKeyboardInstructions:
    'Brug Pil op og Pil ned til at flytte mellem elementer. Tryk på Enter for at bruge kontrollerne i et element, ' +
    'Tab for at flytte fremad mellem dem, Skift+Tab for at flytte tilbage og Esc for at vende tilbage til elementet.',
  listSummary: ({
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
    const fields = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}`;
    let summary: string;

    if (visibleRowsValue === 0) {
      summary = `Der vises ingen elementer lige nu. ${fields}.`;
    } else if (totalRowsValue !== visibleRowsValue) {
      summary = `Viser ${visibleRowsText} af ${totalRowsText} ${items(totalRowsValue)} fordelt på ${fields}.`;
    } else {
      summary = `Viser ${visibleRowsText} ${items(visibleRowsValue)} fordelt på ${fields}.`;
    }

    if (paginationState === 'enabled') {
      summary += ` Side ${pageText} af ${pageCountText}.`;
    }

    return summary;
  },
  listColumnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    const summary = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}.`;

    if (changedColumns.length === 1) {
      const [column] = changedColumns;

      return `Feltet ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
    }

    return summary;
  },
  listPageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
    `Viser ${pageSizeText} ${items(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`,
  listPageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
    `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${items(visibleRowsValue)} vises.`,
  listSubHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
    const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';

    return `${groupLabel}, ${rowCountText} ${items(rowCountValue)}.`;
  }
};
