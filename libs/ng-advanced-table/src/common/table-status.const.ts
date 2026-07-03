import type { NatTableBodyState, NatTableDataStatus } from './table-status.type';

/** Named data lifecycle states accepted by `<nat-table>`. */
export const NAT_TABLE_DATA_STATUS = {
  loading: 'loading',
  error: 'error',
  success: 'success'
} as const satisfies Record<NatTableDataStatus, NatTableDataStatus>;

/** Named state rows rendered in the table body. */
export const NAT_TABLE_BODY_STATE = {
  rows: 'rows',
  loading: 'loading',
  empty: 'empty',
  error: 'error'
} as const satisfies Record<NatTableBodyState, NatTableBodyState>;
