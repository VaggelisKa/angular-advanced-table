import type { NatTableAccessibilityText } from './accessibility.type';
import { visibilityVerb, visibleFields } from './locale-sv-text.const';

/**
 * Built-in Swedish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Spread into the Swedish
 * accessibility text; a consumer overriding only the grid formatter still
 * wins, because the renderer falls back to it when the list entry is absent.
 */
export const NAT_SV_LIST_ACCESSIBILITY_TEXT: Pick<
  NatTableAccessibilityText,
  | 'listSummary'
  | 'listColumnVisibilityChange'
  | 'listPageSizeChange'
  | 'listPageChange'
  | 'listSubHeaderRow'
  | 'listKeyboardInstructions'
> = {
  listKeyboardInstructions:
    'Använd Uppil och Nedpil för att flytta mellan objekt. Tryck på Retur för att använda kontrollerna i ett ' +
    'objekt, Tabb för att flytta framåt mellan dem, Skift+Tabb för att flytta bakåt och Esc för att återgå till ' +
    'objektet.',
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
  },
  listColumnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    const summary = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}.`;

    if (changedColumns.length === 1) {
      const [column] = changedColumns;

      return `Fältet ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
    }

    return summary;
  },
  listPageSizeChange: ({ pageCountText, pageSizeText, pageText }) =>
    `Visar ${pageSizeText} objekt per sida. Sida ${pageText} av ${pageCountText}.`,
  listPageChange: ({ pageCountText, pageText, visibleRowsText }) =>
    `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} objekt visas.`,
  listSubHeaderRow: ({ valueText, rowCountText }) => {
    const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Grupp';

    return `${groupLabel}, ${rowCountText} objekt.`;
  }
};
