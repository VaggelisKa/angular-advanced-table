import { Component, signal } from '@angular/core';

import type { ColumnDef, NatTableUserState, SortingState } from 'ng-advanced-table';
import { NatTable, NatTableStatic, flexRenderComponent } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { TableToStaticActionButton } from './table-to-static-action-button';
import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import type { MockOrderRow } from '../../mock-order/mock-order.type';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { DemoCode } from '../../ui';

const mockOrderRows = generateMockOrderRows(12);

// The mock row-actions column renders an `ngGridCellWidget` cell component,
// which requires the Aria grid-cell context and cannot render in the static
// table — this demo shares one column set, so it swaps that column for a
// plain-button actions column that renders in both interaction models.
const demoBaseColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

const EXAMPLE_MARKUP = `<!-- Same surface, same state — swap the interaction model. -->
<nat-table-surface [enableSorting]="true" [(state)]="state">
  @if (view() === 'grid') {
    <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
  } @else {
    <nat-table-static [columns]="columns" [data]="rows" accessibleName="Orders" />
  }
</nat-table-surface>`;

const EXAMPLE_TS = `// component.ts — both renderers consume the same engine state, so sorting and
// pinning survive the swap. The static table keeps native table semantics and
// natural tab order; it has no grid keyboard model.
protected readonly view = signal<'grid' | 'static'>('grid');
// The actions column starts right-pinned; pinning is engine state, so it
// renders sticky in both interaction models.
protected readonly state = signal<Partial<NatTableUserState>>({
  columnPinning: { left: [], right: ['actions'] }
});

// A plain-button actions column renders in both interaction models. (Cells
// built on ngGridCellWidget need the grid context and cannot render in the
// static table.)
const actionsColumn: ColumnDef<Order, unknown> = {
  id: 'actions',
  header: 'Actions',
  enableSorting: false,
  cell: (info) =>
    flexRenderComponent(OrderActionButton, {
      inputs: { orderId: info.row.original.id },
      outputs: { viewOrder: (orderId) => this.onViewOrder(orderId) }
    })
};`;

type DemoViewMode = 'grid' | 'static';

/**
 * Demo: one `nat-table-surface` driving either the ARIA grid table or the
 * static semantic-table renderer. Both consume the same engine state, so
 * sorting and column pinning survive toggling between the two interaction
 * models. The static table has no grid keyboard model — header sort buttons
 * and any in-cell controls sit in the natural tab order instead.
 */
@Component({
  selector: 'app-table-to-static',
  imports: [DemoCode, NatTable, NatTableStatic, NatTableSurface],
  templateUrl: './table-to-static.html',
  styleUrl: './table-to-static.css'
})
export class TableToStatic {
  protected readonly rows = mockOrderRows;
  protected readonly getRowId = getMockOrderRowId;

  /** Order id of the row whose View button was last activated, or null. */
  protected readonly lastViewedOrder = signal<string | null>(null);

  /**
   * Shared column set plus a plain-button actions column. A native button
   * works in both interaction models: the grid manages it into the cell
   * keyboard model, the static table leaves it in the natural tab order.
   */
  protected readonly columns: ColumnDef<MockOrderRow, unknown>[] = [
    ...demoBaseColumns,
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enablePinning: false,
      size: 92,
      minSize: 80,
      meta: {
        hiddenHeaderLabel: 'Row actions',
        align: 'end'
      },
      cell: (info) =>
        flexRenderComponent(TableToStaticActionButton, {
          inputs: {
            orderId: info.row.original.id
          },
          outputs: {
            viewOrder: (orderId: string) => this.lastViewedOrder.set(orderId)
          }
        })
    }
  ];

  protected readonly view = signal<DemoViewMode>('grid');
  /** The actions column starts right-pinned so it stays visible while the region scrolls. */
  protected readonly state = signal<Partial<NatTableUserState>>({ columnPinning: { left: [], right: ['actions'] } });
  protected readonly exampleMarkup = EXAMPLE_MARKUP;
  protected readonly exampleTs = EXAMPLE_TS;

  protected isSorted(columnId: string, desc: boolean): boolean {
    const sorting = this.state().sorting ?? [];

    return sorting.some((sort) => sort.id === columnId && sort.desc === desc);
  }

  protected sortBy(columnId: string, desc: boolean): void {
    const sorting: SortingState = this.isSorted(columnId, desc) ? [] : [{ id: columnId, desc }];

    this.state.update((current) => ({ ...current, sorting }));
  }

  protected isOrderColumnPinned(): boolean {
    return (this.state().columnPinning?.left ?? []).includes('id');
  }

  protected togglePinOrderColumn(): void {
    const left = this.isOrderColumnPinned() ? [] : ['id'];

    this.state.update((current) => ({
      ...current,
      columnPinning: { left, right: current.columnPinning?.right ?? [] }
    }));
  }
}
