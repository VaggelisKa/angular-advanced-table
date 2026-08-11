import { Component, computed, signal, viewChild } from '@angular/core';

import type { CellContext, ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';
import { NatTableVirtualScroll } from 'ng-advanced-table/virtual-scroll';

import type { MockOrderRow } from '../../../mock-order/mock-order.type';
import { currencyFormatter, dateFormatter, generateMockOrderRows, integerFormatter } from '../../../mock-order/mock-order.util';
import { DemoAside, DemoFacts, DemoLayout, DemoSection } from '../../../ui';
import type { DemoFact } from '../../../ui';

const TOTAL_ROWS = 10_000;

@Component({
  selector: 'app-virtual-scroll',
  imports: [NatTable, NatTableSurface, NatTableVirtualScroll, DemoAside, DemoFacts, DemoLayout, DemoSection],
  templateUrl: './virtual-scroll.html',
  styleUrl: './virtual-scroll.css'
})
export class VirtualScroll {
  protected readonly data = generateMockOrderRows(TOTAL_ROWS);

  /**
   * Wide enough to scroll horizontally, with a pinned column on each edge:
   * virtualization only windows rows, so pinning, resizing, and reordering
   * keep working across the full column set. Every column is capped at one
   * line because the row height is a contract, not a suggestion.
   */
  protected readonly columns: ColumnDef<MockOrderRow, unknown>[] = withNatTableHeaderActions(
    [
      { accessorKey: 'customer', header: 'Customer', size: 190, meta: { label: 'Customer', rowHeader: true, cellMaxLines: 1 } },
      { accessorKey: 'owner', header: 'Company', size: 230, meta: { label: 'Company', cellMaxLines: 1 } },
      { accessorKey: 'channel', header: 'Channel', size: 130, meta: { label: 'Channel', cellMaxLines: 1 } },
      { accessorKey: 'region', header: 'Region', size: 130, meta: { label: 'Region', cellMaxLines: 1 } },
      { accessorKey: 'status', header: 'Status', size: 120, meta: { label: 'Status', cellMaxLines: 1 } },
      {
        accessorKey: 'items',
        header: 'Items',
        size: 110,
        meta: { label: 'Items', align: 'end', cellMaxLines: 1 },
        cell: (context: CellContext<MockOrderRow, number>) => integerFormatter.format(context.getValue())
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        size: 140,
        meta: { label: 'Updated', cellMaxLines: 1 },
        cell: (context: CellContext<MockOrderRow, number>) => dateFormatter.format(context.getValue())
      },
      {
        accessorKey: 'total',
        header: 'Total',
        size: 150,
        meta: { label: 'Total', align: 'end', cellMaxLines: 1 },
        cell: (context: CellContext<MockOrderRow, number>) => currencyFormatter.format(context.getValue())
      }
    ],
    { enableColumnReorderActions: true }
  );

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    columnPinning: { left: ['customer'], right: ['total'] }
  });

  protected readonly virtualScroll = viewChild.required<NatTableVirtualScroll<MockOrderRow>>('virtualScroll');

  protected readonly facts = computed<DemoFact[]>(() => {
    const range = this.virtualScroll().renderedRowRange();

    return [
      { label: 'Total rows', value: String(this.data.length), testId: 'virtual-scroll-total-rows' },
      { label: 'Columns', value: String(this.columns.length), testId: 'virtual-scroll-total-columns' },
      {
        label: 'Mounted window',
        value: `${range.start + 1} – ${Math.min(range.end, this.data.length)}`,
        testId: 'virtual-scroll-mounted-window'
      }
    ];
  });

  protected scrollToRow(index: number): void {
    this.virtualScroll().scrollToIndex(index);
  }
}
