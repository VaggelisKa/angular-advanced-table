import { items, visibilityVerb, visibleFields } from './text.const';
import type { NatTableAccessibilityText } from '../../accessibility.type';

/**
 * Built-in Danish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Exported entry by entry and
 * referenced by name; the English `accessibility-list.const.ts` records why
 * they are never spread into the dictionary.
 */
export const listKeyboardInstructions: NatTableAccessibilityText['listKeyboardInstructions'] =
  'Brug Pil op og Pil ned til at flytte mellem elementer. Tryk på Enter for at bruge kontrollerne i et element, ' +
  'Tab for at flytte fremad mellem dem, Skift+Tab for at flytte tilbage og Esc for at vende tilbage til elementet.';

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
};

export const listColumnVisibilityChange: NatTableAccessibilityText['listColumnVisibilityChange'] = ({
  changedColumns,
  visibleColumnsValue,
  visibleColumnsText
}) => {
  const summary = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}.`;

  if (changedColumns.length === 1) {
    const [column] = changedColumns;

    return `Feltet ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
  }

  return summary;
};

export const listPageSizeChange: NatTableAccessibilityText['listPageSizeChange'] = ({
  pageCountText,
  pageSizeValue,
  pageSizeText,
  pageText
}) => `Viser ${pageSizeText} ${items(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`;

export const listPageChange: NatTableAccessibilityText['listPageChange'] = ({
  pageCountText,
  pageText,
  visibleRowsValue,
  visibleRowsText
}) => `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${items(visibleRowsValue)} vises.`;

export const listSubHeaderRow: NatTableAccessibilityText['listSubHeaderRow'] = ({ valueText, rowCountValue, rowCountText }) => {
  const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';

  return `${groupLabel}, ${rowCountText} ${items(rowCountValue)}.`;
};
