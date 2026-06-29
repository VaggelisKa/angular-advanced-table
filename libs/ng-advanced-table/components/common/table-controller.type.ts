import type { RowData } from '@tanstack/angular-table';

import type {
  NatTableUiController as CoreNatTableUiController,
  NatTableUiState as CoreNatTableUiState
} from 'ng-advanced-table';

export type NatTableUiState = CoreNatTableUiState;

export type NatTableUiController<TData extends RowData = RowData> = CoreNatTableUiController<TData>;
