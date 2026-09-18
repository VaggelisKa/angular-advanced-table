import { items, visibilityVerb, visibleFields } from './text.const';
import type { NatTableAccessibilityText } from '../../accessibility.type';

/**
 * Built-in Norwegian Bokmål accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Exported entry by entry and
 * referenced by name; the English `accessibility-list.const.ts` records why
 * they are never spread into the dictionary.
 */
export const listKeyboardInstructions: NatTableAccessibilityText['listKeyboardInstructions'] =
  'Bruk Pil opp og Pil ned for å flytte mellom elementer. Trykk Enter for å bruke kontrollene i et element, Tab og Skift+Tab for å flytte mellom dem og Esc for å gå tilbake til elementet.';

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
    summary = `Ingen elementer vises. ${fields}.`;
  } else if (totalRowsValue !== visibleRowsValue) {
    summary = `Viser ${visibleRowsText} av ${totalRowsText} ${items(totalRowsValue)}, ${fields}.`;
  } else {
    summary = `Viser ${visibleRowsText} ${items(visibleRowsValue)}, ${fields}.`;
  }

  if (paginationState === 'enabled') {
    summary += ` Side ${pageText} av ${pageCountText}.`;
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
}) => `${pageSizeText} ${items(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`;

export const listPageChange: NatTableAccessibilityText['listPageChange'] = ({
  pageCountText,
  pageText,
  visibleRowsValue,
  visibleRowsText
}) => `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${items(visibleRowsValue)} vises.`;

export const listSubHeaderRow: NatTableAccessibilityText['listSubHeaderRow'] = ({ valueText, rowCountValue, rowCountText }) => {
  const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';

  return `${groupLabel}, ${rowCountText} ${items(rowCountValue)}.`;
};
