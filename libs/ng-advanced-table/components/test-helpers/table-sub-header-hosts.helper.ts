import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';

import { buildRows, reorderableColumns } from './table-data.helper';
import type { Row } from './table-data.helper';
import { NatTableSurface } from '../feature/table-surface/table-surface';
import { withNatTableHeaderActions } from '../ui/table-header-actions/with-table-header-actions';

/** Header-actions host with an active sub-header column and multi-sort enabled. */
@Component({
  selector: 'nat-sub-header-actions-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [enableMultiSort]="true" [enableSorting]="true" [state]="tableState()" (stateChange)="tableState.set($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" subHeaderColumn="status" />
    </nat-table-surface>
  `
})
export class SubHeaderActionsHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(reorderableColumns, {});
  public readonly tableState = signal<Partial<NatTableUserState>>({});
}
