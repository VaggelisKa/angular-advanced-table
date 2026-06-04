import type { NatTableIntl, NatTableNumberFormatter } from 'ng-advanced-table';
import type { NatTableUiIntl } from 'ng-advanced-table-ui';
import type { NatTableUtilsIntl } from 'ng-advanced-table-utils';

/**
 * Flat locale defaults for generated table, companion UI, and utility labels.
 *
 * Case-specific table copy such as the table accessible name, captions,
 * table-specific descriptions, and column labels should stay on component
 * inputs or column definitions.
 */
export interface NatTableLocaleLabels {
  /** Generated core table accessibility copy and announcements. */
  accessibilityText?: NatTableIntl['accessibilityText'];
  /** Generated search control labels. */
  search?: NatTableUiIntl['search'];
  /** Generated column visibility control labels. */
  columnVisibility?: NatTableUiIntl['columnVisibility'];
  /** Generated page-size control labels. */
  pageSize?: NatTableUiIntl['pageSize'];
  /** Generated pager control labels. */
  pager?: NatTableUiIntl['pager'];
  /** Generated horizontal scroll control labels. */
  scrollControl?: NatTableUiIntl['scrollControl'];
  /** Generated header action labels. */
  headerActions?: NatTableUiIntl['headerActions'];
  /** Generated render-metrics labels. */
  renderMetrics?: NatTableUtilsIntl['renderMetrics'];
  /** Number formatter shared by generated table, UI, and utility copy. */
  formatNumber?: NatTableNumberFormatter;
}

/** Locale dictionaries keyed by locale id. */
export type NatTableLocaleLabelsMap = Record<string, NatTableLocaleLabels>;
