import type { RowData, Table } from '@tanstack/angular-table';

import type { NAT_TABLE_BODY_STATE } from './table-status.const';

/** Data lifecycle state rendered by `<nat-table>` when rows are unavailable. */
export type NatTableDataStatus = 'loading' | 'error' | 'success';

/** State row currently rendered in the table body. */
export type NatTableBodyState = 'rows' | 'loading' | 'empty' | 'error';

/** Shared context passed to custom table body state templates. */
type NatTableStateTemplateContext<TData extends RowData = RowData> = {
  /** TanStack table instance for advanced reads. */
  readonly table: Table<TData>;
  /** Rows currently rendered in the body. */
  readonly visibleRowsValue: number;
  /** Total rows represented by the current body state before filtering/pagination. */
  readonly totalRowsValue: number;
  /** Visible leaf columns in the current view. */
  readonly visibleColumnsValue: number;
  /** Whether the current view is filtered by global or column filters. */
  readonly filtered: boolean;
};

/** Context passed to `ng-template[natTableLoading]`. */
export type NatTableLoadingTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
  /** Alias for `status`, useful for `let-status` style template bindings. */
  readonly $implicit: typeof NAT_TABLE_BODY_STATE.loading;
  /** Current state row status. */
  readonly status: typeof NAT_TABLE_BODY_STATE.loading;
};

/** Context passed to `ng-template[natTableEmpty]`. */
export type NatTableEmptyTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
  /** Alias for `status`, useful for `let-status` style template bindings. */
  readonly $implicit: typeof NAT_TABLE_BODY_STATE.empty;
  /** Current state row status. */
  readonly status: typeof NAT_TABLE_BODY_STATE.empty;
};

/** Context passed to `ng-template[natTableError]`. */
export type NatTableErrorTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
  /** Alias for `error`, useful for `let-error` style template bindings. */
  readonly $implicit: unknown;
  /** Current state row status. */
  readonly status: typeof NAT_TABLE_BODY_STATE.error;
  /** Consumer-supplied error payload. */
  readonly error: unknown;
};
