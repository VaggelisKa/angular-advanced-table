import type { NatTableAccessibilityText } from './accessibility.type';
import { visibilityVerb, visibleFields } from './locale-sv-text.const';

/**
 * Built-in Swedish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Each entry is exported on its
 * own and referenced by name from the dictionary rather than spread into it:
 * an object spread is not provably side-effect free, so a bundler keeps the
 * whole dictionary even for an application that never registers this locale.
 */
export const listKeyboardInstructions: NatTableAccessibilityText['listKeyboardInstructions'] =
  'Använd Uppil och Nedpil för att flytta mellan objekt. Tryck på Retur för att använda kontrollerna i ett ' +
  'objekt, Tabb för att flytta framåt mellan dem, Skift+Tabb för att flytta bakåt och Esc för att återgå till ' +
  'objektet.';

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
    summary = `Inga objekt visas just nu. ${fields}.`;
  } else if (totalRowsValue !== visibleRowsValue) {
    summary = `Visar ${visibleRowsText} av ${totalRowsText} objekt i ${fields}.`;
  } else {
    summary = `Visar ${visibleRowsText} objekt i ${fields}.`;
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
  `Visar ${pageSizeText} objekt per sida. Sida ${pageText} av ${pageCountText}.`;

export const listPageChange: NatTableAccessibilityText['listPageChange'] = ({ pageCountText, pageText, visibleRowsText }) =>
  `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} objekt visas.`;

export const listSubHeaderRow: NatTableAccessibilityText['listSubHeaderRow'] = ({ valueText, rowCountText }) => {
  const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Grupp';

  return `${groupLabel}, ${rowCountText} objekt.`;
};
