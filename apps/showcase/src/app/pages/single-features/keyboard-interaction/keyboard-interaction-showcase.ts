import { Component, signal } from '@angular/core';

import { flexRenderComponent } from '@tanstack/angular-table';
import type { CellContext, ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

import { KeyboardDemoAcknowledgeButton } from './keyboard-demo-acknowledge-button';
import { KeyboardDemoStatusCell } from './keyboard-demo-status-cell';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 }
];

@Component({
  selector: 'app-keyboard-interaction-showcase',
  imports: [NatTable, NatTableSurface],
  templateUrl: './keyboard-interaction-showcase.html'
})
export class KeyboardInteractionShowcasePage {
  protected readonly data = signal<DemoItem[]>(DEMO_DATA);
  protected readonly lastAction = signal('None yet');

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' }
    },
    {
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      enableGlobalFilter: false,
      meta: { label: 'Status', headerActions: false },
      cell: (context: CellContext<DemoItem, unknown>) =>
        flexRenderComponent(KeyboardDemoStatusCell, {
          inputs: {
            name: context.row.original.name,
            status: context.row.original.status
          },
          outputs: { toggled: () => this.onToggleStatus(context.row.original.id) }
        })
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableGlobalFilter: false,
      meta: { label: 'Actions', headerActions: false },
      cell: (context: CellContext<DemoItem, unknown>) =>
        flexRenderComponent(KeyboardDemoAcknowledgeButton, {
          inputs: { name: context.row.original.name },
          outputs: { pressed: (name: string) => this.onAcknowledge(name) }
        })
    }
  ]);

  private onAcknowledge(name: string): void {
    this.lastAction.set(`Acknowledged ${name}`);
  }

  private onToggleStatus(id: string): void {
    this.data.update((items) =>
      items.map((item) => {
        if (item.id !== id) return item;

        const status = item.status === 'Active' ? 'Paused' : 'Active';

        this.lastAction.set(`${status === 'Active' ? 'Resumed' : 'Paused'} ${item.name}`);

        return { ...item, status };
      })
    );
  }
}
