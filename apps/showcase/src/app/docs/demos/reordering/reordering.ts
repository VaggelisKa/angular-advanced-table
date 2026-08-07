import { TitleCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import { DemoAside, DemoLayout, DemoSection } from '../../../ui';
import { DEMO_ITEMS, demoItemBaseColumns } from '../demo-data';
import type { DemoItem } from '../demo-data';

@Component({
  selector: 'app-reordering',
  imports: [NatTable, NatTableSurface, TitleCasePipe, DemoAside, DemoLayout, DemoSection],
  templateUrl: './reordering.html',
  styleUrl: './reordering.css'
})
export class Reordering {
  protected readonly data = DEMO_ITEMS;

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions(demoItemBaseColumns, {
    enableColumnPinActions: false,
    enableColumnReorderActions: true
  });

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    columnOrder: ['name', 'category', 'status', 'value']
  });

  protected readonly currentOrder = computed(() => {
    return this.tableState().columnOrder ?? ['name', 'category', 'status', 'value'];
  });
}
