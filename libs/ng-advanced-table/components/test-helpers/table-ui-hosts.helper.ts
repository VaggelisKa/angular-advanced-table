import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';

import { baseColumns, buildRows, getRowId } from './table-ui-data.helper';
import type { Row } from './table-ui-data.helper';
import { NatTableColumnVisibility } from '../feature/table-column-visibility/table-column-visibility';
import { NatTablePageSize } from '../feature/table-page-size/table-page-size';
import { NatTablePager } from '../feature/table-pager/table-pager';
import { NatTablePagination } from '../feature/table-pagination/table-pagination';
import { NatTableScrollControl } from '../feature/table-scroll-control/table-scroll-control';
import { NatTableSurface } from '../feature/table-surface/table-surface';
import { withNatTableHeaderActions } from '../ui/table-header-actions/with-table-header-actions';

@Component({
  selector: 'nat-table-ui-host',
  imports: [NatTable, NatTableColumnVisibility, NatTablePageSize, NatTablePager, NatTableScrollControl, NatTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState" [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table-column-visibility />
      <nat-table-page-size [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />

      <nat-table [columns]="columns" [data]="rows()" [getRowId]="getRowId" accessibleName="Operations table" />

      <nat-table-scroll-control />
    </nat-table-surface>
  `
})
export class TableUiHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    enableColumnReorderActions: true
  });

  protected readonly getRowId = getRowId;
  protected readonly pageSizeOptions = [2, 3, 5] as const;
  public readonly tableState = signal<Partial<NatTableState>>({});
  protected readonly initialState: Partial<NatTableState> = {
    pagination: {
      pageIndex: 1,
      pageSize: 2
    }
  };

  public stateChangeCalls = 0;
  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.stateChangeCalls++;
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-pagination-toolbar-host',
  imports: [NatTable, NatTablePagination, NatTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
      <nat-table-pagination [pageSizeOptions]="pageSizeOptions" />
    </nat-table-surface>
  `
})
export class PaginationToolbarHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = baseColumns;
  protected readonly pageSizeOptions = [2, 3, 5] as const;
  protected readonly initialState: Partial<NatTableState> = {
    pagination: {
      pageIndex: 0,
      pageSize: 2
    }
  };
}
