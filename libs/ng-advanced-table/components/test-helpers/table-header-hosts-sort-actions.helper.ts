import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';

import { baseColumns, buildRows, buildSortActionsColumnOverrideColumns } from './table-data.helper';
import type { Row } from './table-data.helper';
import { NatTableSurface } from '../feature/table-surface/table-surface';
import { withNatTableHeaderActions } from '../ui/table-header-actions/with-table-header-actions';

@Component({
  selector: 'nat-pin-only-header-actions-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
export class PinOnlyHeaderActionsHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    enableSortActions: false,
    enableColumnPinActions: true
  });

  public readonly tableState = signal<Partial<NatTableUserState>>({});

  protected onTableStateChange(state: Partial<NatTableUserState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-sort-actions-override-disabled-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
export class SortActionsOverrideDisabledHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(buildSortActionsColumnOverrideColumns(false), {
    enableSortActions: true
  });

  public readonly tableState = signal<Partial<NatTableUserState>>({});

  protected onTableStateChange(state: Partial<NatTableUserState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-sort-actions-override-enabled-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
export class SortActionsOverrideEnabledHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(buildSortActionsColumnOverrideColumns(true), {
    enableSortActions: false
  });

  public readonly tableState = signal<Partial<NatTableUserState>>({});

  protected onTableStateChange(state: Partial<NatTableUserState>): void {
    this.tableState.set(state);
  }
}
