import { NAT_TABLE_BODY_STATE } from '../../common/table-status.const';

/**
 * Presentation for the non-row body states. All three share the `list-state`
 * base class and add one state modifier, so consumers can theme them together
 * through the shared `--nat-table-list-state-*` tokens or individually through
 * the per-state accent tokens.
 */
export const LIST_STATE_VIEWS = {
  [NAT_TABLE_BODY_STATE.loading]: { className: 'list-state list-state-loading', testId: 'nat-list-loading-state' },
  [NAT_TABLE_BODY_STATE.empty]: { className: 'list-state list-state-empty', testId: 'nat-list-empty-state' },
  [NAT_TABLE_BODY_STATE.error]: { className: 'list-state list-state-error', testId: 'nat-list-error-state' }
} as const;

export type NatListStateKey = keyof typeof LIST_STATE_VIEWS;
