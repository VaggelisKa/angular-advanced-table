import { visibilityVerb, visibleFields } from './text.const';
import type { NatTableAccessibilityText } from '../../accessibility.type';

/**
 * Built-in Swedish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Exported entry by entry and
 * referenced by name; the English `accessibility-list.const.ts` records why
 * they are never spread into the dictionary.
 */
export const listKeyboardInstructions: NatTableAccessibilityText['listKeyboardInstructions'] =
  'Använd Uppil och Nedpil för att flytta mellan objekt. Tryck på Retur för att använda kontrollerna i ett objekt, Tabb och Skift+Tabb för att flytta mellan dem och Esc för att återgå till objektet.';

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
    summary = `Inga objekt visas. ${fields}.`;
  } else if (totalRowsValue !== visibleRowsValue) {
    summary = `Visar ${visibleRowsText} av ${totalRowsText} objekt, ${fields}.`;
  } else {
    summary = `Visar ${visibleRowsText} objekt, ${fields}.`;
  }

  if (paginationState === 'enabled') {
    summary += ` Sida ${pageText} av ${pageCountText}.`;
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

    return `Fältet ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
  }

  return summary;
};

export const listPageSizeChange: NatTableAccessibilityText['listPageSizeChange'] = ({ pageCountText, pageSizeText, pageText }) =>
  `${pageSizeText} objekt per sida. Sida ${pageText} av ${pageCountText}.`;

export const listPageChange: NatTableAccessibilityText['listPageChange'] = ({ pageCountText, pageText, visibleRowsText }) =>
  `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} objekt visas.`;

export const listSubHeaderRow: NatTableAccessibilityText['listSubHeaderRow'] = ({ valueText, rowCountText }) => {
  const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Grupp';

  return `${groupLabel}, ${rowCountText} objekt.`;
};
