import type { Row, RowData } from '@tanstack/angular-table';

export type NatTableRowExpansionState = 'collapsed' | 'expanded' | 'unavailable';

export interface NatTableRowExpansionToggle<TData extends RowData = RowData> {
  /** TanStack row instance for advanced consumers. */
  row: Row<TData>;
  /** Original row object supplied in `NatTable.data`. */
  rowData: TData;
  /** Resolved row id, including any consumer-provided `getRowId` value. */
  rowId: string;
  /** Whether the row can currently render expandable detail content. */
  canExpand: boolean;
  /** Whether the row is currently expanded. Always `false` when `canExpand` is false. */
  isExpanded: boolean;
  /** ARIA value for custom toggle buttons. Use `null` when the row cannot expand. */
  ariaExpanded: 'true' | 'false' | null;
  /** Current expansion availability and state. */
  expansionState: NatTableRowExpansionState;
  /** Toggle the row, or force a target expanded state. No-ops when unavailable. */
  toggle: (expanded?: boolean) => void;
  /** Expand the row. No-ops when unavailable. */
  expand: () => void;
  /** Collapse the row. No-ops when unavailable. */
  collapse: () => void;
}

/**
 * Builds a small expansion view model for consumer-owned toggle UI.
 *
 * Use this from custom cell renderers when you want expandable rows without
 * importing any `ng-advanced-table-ui` components.
 */
export function getNatTableRowExpansionToggle<TData extends RowData>(
  row: Row<TData>,
): NatTableRowExpansionToggle<TData> {
  const canExpand = row.getCanExpand();
  const isExpanded = canExpand && row.getIsExpanded();

  return {
    row,
    rowData: row.original,
    rowId: row.id,
    canExpand,
    isExpanded,
    ariaExpanded: canExpand ? (isExpanded ? 'true' : 'false') : null,
    expansionState: canExpand ? (isExpanded ? 'expanded' : 'collapsed') : 'unavailable',
    toggle: (expanded) => {
      if (canExpand) {
        row.toggleExpanded(expanded);
      }
    },
    expand: () => {
      if (canExpand) {
        row.toggleExpanded(true);
      }
    },
    collapse: () => {
      if (canExpand) {
        row.toggleExpanded(false);
      }
    },
  };
}
