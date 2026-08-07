import type { CellContext, ColumnDef } from 'ng-advanced-table';
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

/**
 * Shared row shape for the table docs demos.
 *
 * Seven demos each carried a byte-identical copy of this type, its rows, and
 * its column defs. One source keeps sample data, value formatting, and column
 * labels identical across every table example.
 */
export type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

export const DEMO_ITEMS: readonly DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  { id: 'item-3', name: 'Gamma Processor', category: 'Data Science', status: 'Paused', value: 7800 },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 }
];

const CATEGORIES = ['Analytics', 'Infrastructure', 'Data Science', 'Security'] as const;
const STATUSES = ['Active', 'Paused', 'Alert', 'Halted'] as const;

/** Deterministic filler rows for demos that need a scrollable region. */
export const buildDemoItems = (count: number): DemoItem[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    return {
      id: `item-${id}`,
      name: `Resource Node ${id}`,
      category: CATEGORIES[id % CATEGORIES.length],
      status: STATUSES[id % STATUSES.length],
      value: 1000 + ((id * 235) % 9000)
    };
  });

const valueFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

/** Column defs without header actions, for demos that compose their own. */
export const demoItemBaseColumns: ColumnDef<DemoItem, unknown>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name', rowHeader: true }
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    meta: { label: 'Category' }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status' }
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: 'Value',
    meta: { label: 'Value', align: 'end' },
    cell: (context: CellContext<DemoItem, unknown>) => valueFormatter.format(context.getValue<number>())
  }
];

/** Column defs with the standard header-action menu wired up. */
export const demoItemColumns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions(demoItemBaseColumns);
