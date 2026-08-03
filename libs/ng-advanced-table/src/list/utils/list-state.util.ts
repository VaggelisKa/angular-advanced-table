import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_BODY_STATE } from '../../common/table-status.const';
import type {
  NatTableBodyState,
  NatTableEmptyTemplateContext,
  NatTableErrorTemplateContext,
  NatTableLoadingTemplateContext
} from '../../common/table-status.type';
import { LIST_STATE_VIEWS } from '../common/list-state.const';
import type { NatListStateKey, NatListStateView } from '../common/list-state.type';

/** Base context shared by every state template, captured from the state store. */
type StateTemplateBaseContext<TData extends RowData> = Omit<NatTableLoadingTemplateContext<TData>, '$implicit' | 'status'>;

/** Localized messages for the three non-row body states. */
type ListStateMessages = Record<NatListStateKey, string>;

/**
 * Presentation for the current body state, or `null` while rows are shown.
 * Keeps all three states on one markup shape so they share a base design.
 */
export const resolveListStateView = (bodyState: NatTableBodyState, messages: ListStateMessages): NatListStateView | null => {
  if (bodyState === NAT_TABLE_BODY_STATE.rows) {
    return null;
  }

  return { ...LIST_STATE_VIEWS[bodyState], state: bodyState, message: messages[bodyState] };
};

/**
 * Builds the context handed to a consumer state template. The error state also
 * carries the consumer-supplied payload, matching the table's contract.
 */
export const buildListStateTemplateContext = <TData extends RowData>(
  base: StateTemplateBaseContext<TData>,
  bodyState: NatListStateKey,
  error: unknown
): NatTableLoadingTemplateContext<TData> | NatTableEmptyTemplateContext<TData> | NatTableErrorTemplateContext<TData> => {
  if (bodyState === NAT_TABLE_BODY_STATE.error) {
    return { ...base, $implicit: error, status: NAT_TABLE_BODY_STATE.error, error };
  }

  if (bodyState === NAT_TABLE_BODY_STATE.loading) {
    return { ...base, $implicit: NAT_TABLE_BODY_STATE.loading, status: NAT_TABLE_BODY_STATE.loading };
  }

  return { ...base, $implicit: NAT_TABLE_BODY_STATE.empty, status: NAT_TABLE_BODY_STATE.empty };
};
