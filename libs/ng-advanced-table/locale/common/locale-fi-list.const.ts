import type { NatTableAccessibilityText } from './accessibility.type';
import { fields, items, visibilityVerb } from './locale-fi-text.const';

/**
 * Built-in Finnish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Spread into the Finnish
 * accessibility text; a consumer overriding only the grid formatter still
 * wins, because the renderer falls back to it when the list entry is absent.
 */
export const NAT_FI_LIST_ACCESSIBILITY_TEXT: Pick<
  NatTableAccessibilityText,
  | 'listSummary'
  | 'listColumnVisibilityChange'
  | 'listPageSizeChange'
  | 'listPageChange'
  | 'listSubHeaderRow'
  | 'listKeyboardInstructions'
> = {
  listKeyboardInstructions:
    'Siirry kohteiden välillä Nuoli ylös- ja Nuoli alas -näppäimillä. Käytä kohteen ohjaimia painamalla Enter, ' +
    'siirry eteenpäin sarkaimella, taaksepäin näppäinyhdistelmällä Vaihto+Sarkain ja palaa kohteeseen ' +
    'painamalla Esc.',
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
    const visible = `Näkyvissä ${visibleColumnsText} ${fields(visibleColumnsValue)}`;
    let summary: string;

    if (visibleRowsValue === 0) {
      summary = `Yhtään kohdetta ei näytetä juuri nyt. ${visible}.`;
    } else if (totalRowsValue !== visibleRowsValue) {
      summary = `Näytetään ${visibleRowsText} ${items(visibleRowsValue)} ${totalRowsText} kohteesta. ${visible}.`;
    } else {
      summary = `Näytetään ${visibleRowsText} ${items(visibleRowsValue)}. ${visible}.`;
    }

    if (paginationState === 'enabled') {
      summary += ` Sivu ${pageText} / ${pageCountText}.`;
    }

    return summary;
  },
  listColumnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    const summary = `Näkyvissä ${visibleColumnsText} ${fields(visibleColumnsValue)}.`;

    if (changedColumns.length === 1) {
      const [column] = changedColumns;

      return `Kenttä ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
    }

    return summary;
  },
  listPageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
    `Näytetään ${pageSizeText} ${items(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`,
  listPageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
    `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${items(visibleRowsValue)}.`,
  listSubHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
    const groupLabel = valueText.trim() ? `Ryhmä ${valueText}` : 'Ryhmä';

    return `${groupLabel}, ${rowCountText} ${items(rowCountValue)}.`;
  }
};
