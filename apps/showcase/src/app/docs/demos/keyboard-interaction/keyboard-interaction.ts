import { Component, computed, signal } from '@angular/core';

import { NatTable, flexRenderComponent } from 'ng-advanced-table';
import type { CellContext, ColumnDef } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import { KeyboardDemoAcknowledgeButton } from './keyboard-demo-acknowledge-button';
import { KeyboardDemoStatusCell } from './keyboard-demo-status-cell';
import { DemoAside, DemoFacts, DemoLayout, DemoSection } from '../../../ui';
import type { DemoFact } from '../../../ui';
import { DEMO_ITEMS, demoItemBaseColumns } from '../demo-data';
import type { DemoItem } from '../demo-data';

@Component({
  selector: 'app-keyboard-interaction',
  imports: [NatTable, NatTableSurface, DemoAside, DemoFacts, DemoLayout, DemoSection],
  templateUrl: './keyboard-interaction.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class KeyboardInteraction {
  protected readonly data = signal<DemoItem[]>([...DEMO_ITEMS]);
  protected readonly lastAction = signal('None yet');

  protected readonly facts = computed<DemoFact[]>(() => [
    { label: 'Last action', value: this.lastAction(), testId: 'keyboard-last-action' }
  ]);

  private readonly textColumns = demoItemBaseColumns.filter((column) => column.id !== 'status');

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    ...this.textColumns,
    {
      id: 'status',
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
