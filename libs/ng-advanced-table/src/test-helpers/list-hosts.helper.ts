import { Component, signal } from '@angular/core';

import { buildRows, columns } from './table-data.helper';
import type { Row } from './table-data.helper';
import { TestTableSurface } from './table-hosts.helper';
import type { NatTableRowActivateEvent, NatTableRowIdGetter } from '../common/row.type';
import type { NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';
import { NatList } from '../list/list';

/** NatList integration-test host extracted from list.spec.ts (mirrors table-hosts.helper.ts). */
@Component({
  selector: 'test-list-host',
  imports: [NatList, TestTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState()" enableReordering>
      <nat-list
        [columns]="columns"
        [data]="rows()"
        [dataStatus]="dataStatus()"
        [enableItemNavigation]="enableItemNavigation()"
        [enableRowActivation]="enableRowActivation()"
        [enableRowSelection]="enableRowSelection()"
        [getRowId]="getRowId()"
        [selectionMode]="selectionMode()"
        accessibleName="Operations list"
        (rowActivate)="activated.set([...activated(), $event])" />
    </nat-table-surface>
  `
})
export class ListHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly columns = columns;
  public readonly initialState = signal<Partial<NatTableUserState>>({});
  public readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  public readonly enableRowSelection = signal(false);
  public readonly selectionMode = signal<'single' | 'multiple'>('multiple');
  public readonly enableRowActivation = signal(false);
  public readonly enableItemNavigation = signal(false);
  public readonly getRowId = signal<NatTableRowIdGetter<Row> | undefined>(undefined);
  public readonly activated = signal<NatTableRowActivateEvent<Row>[]>([]);
}
