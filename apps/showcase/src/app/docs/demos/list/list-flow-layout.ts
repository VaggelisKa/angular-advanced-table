import { Component, signal } from '@angular/core';

import type { ColumnDef, NatListItemLayout } from 'ng-advanced-table';
import { NatList } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { listDemoTotalFormatter } from './list-demo-data';
import { DemoToggleGroup } from '../../../ui';
import type { DemoToggleOption } from '../../../ui';

type FlowDemoOrder = {
  id: string;
  customer: string;
  total: number;
  change: string;
  note: string;
};

type DemoWidth = 'wide' | 'narrow';

const LAYOUT_OPTIONS: readonly DemoToggleOption<NatListItemLayout>[] = [
  { value: 'flow', label: 'Flow' },
  { value: 'grid', label: 'Grid' }
];

const WIDTH_OPTIONS: readonly DemoToggleOption<DemoWidth>[] = [
  { value: 'wide', label: 'Wide' },
  { value: 'narrow', label: 'Narrow' }
];

/** One order carries a total far wider than its slot, so only that item wraps. */
const FLOW_DEMO_ROWS: FlowDemoOrder[] = [
  { id: 'ORD-201', customer: 'Aster Logistics', total: 4820, change: '+12.5% (vs. last month)', note: 'Pallets, dock B.' },
  { id: 'ORD-202', customer: 'Briar Supply Co', total: 1260, change: '-3.1% (vs. last month)', note: 'Leave at reception.' },
  { id: 'ORD-203', customer: 'Cobalt Freight', total: 1_234_567_890.5, change: '+248% (vs. last month)', note: 'Annual contract.' },
  { id: 'ORD-204', customer: 'Dune Retail', total: 3095, change: '+0.4% (vs. last month)', note: 'Call before delivery.' },
  { id: 'ORD-205', customer: 'Ember Works', total: 980, change: '-18.9% (vs. last month)', note: 'Fragile.' },
  { id: 'ORD-206', customer: 'Fjord Trading', total: 5150, change: '+6.2% (vs. last month)', note: 'Second attempt.' }
];

/**
 * Weighted slots: the customer field takes two shares of the line, total and
 * change one each, and the note always takes a line of its own.
 */
const FLOW_DEMO_COLUMNS: ColumnDef<FlowDemoOrder, unknown>[] = [
  { accessorKey: 'customer', header: 'Customer', meta: { label: 'Customer', listFieldSpan: 2 } },
  {
    accessorKey: 'total',
    header: 'Total',
    meta: { label: 'Total', listFieldSpan: 1 },
    cell: (info) => listDemoTotalFormatter.format(info.getValue<number>())
  },
  { accessorKey: 'change', header: 'Change', meta: { label: 'Change', listFieldSpan: 1 } },
  { accessorKey: 'note', header: 'Note', meta: { label: 'Note', listFieldSpan: 'full' } }
];

/**
 * Docs demo: the `flow` item layout. Fields that fit their slot stay on one
 * line and align across items; the one order whose total is wider than its
 * slot widens that field, and the change field that no longer fits wraps to
 * the next line in that item only. Narrowing the container shows the
 * difference against the fixed `grid` tracks.
 */
@Component({
  selector: 'app-list-flow-layout',
  imports: [NatList, NatTableSurface, DemoToggleGroup],
  templateUrl: './list-flow-layout.html',
  styleUrl: './list-flow-layout.css'
})
export class ListFlowLayout {
  protected readonly rows = FLOW_DEMO_ROWS;
  protected readonly columns = FLOW_DEMO_COLUMNS;
  protected readonly layoutOptions = LAYOUT_OPTIONS;
  protected readonly widthOptions = WIDTH_OPTIONS;

  protected readonly layout = signal<NatListItemLayout>('flow');
  protected readonly width = signal<DemoWidth>('narrow');
}
