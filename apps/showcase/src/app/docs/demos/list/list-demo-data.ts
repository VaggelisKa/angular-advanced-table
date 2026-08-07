import type { ColumnDef } from 'ng-advanced-table';
import { flexRenderComponent } from 'ng-advanced-table';

import { OrderStatusBadge } from '../../../ui/order-status-badge/order-status-badge';

/** Shared order shape for the list docs demos. */
export type ListDemoOrder = {
  id: string;
  customer: string;
  status: 'Ready' | 'Review' | 'Queued';
  total: number;
};

const DEMO_CUSTOMERS = [
  'Aster Logistics',
  'Briar Supply Co',
  'Cobalt Freight',
  'Dune Retail',
  'Ember Works',
  'Fjord Trading'
] as const;

const DEMO_STATUSES: readonly ListDemoOrder['status'][] = ['Ready', 'Review', 'Queued'];

/** Deterministic demo rows: ids count up, customers and statuses rotate. */
export const buildListDemoRows = (count: number): ListDemoOrder[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `ORD-${String(201 + index)}`,
    customer: DEMO_CUSTOMERS[index % DEMO_CUSTOMERS.length],
    status: DEMO_STATUSES[index % DEMO_STATUSES.length],
    total: 980 + ((index * 1735) % 6500)
  }));

export const LIST_DEMO_ROWS: ListDemoOrder[] = [
  { id: 'ORD-201', customer: 'Aster Logistics', status: 'Ready', total: 4820 },
  { id: 'ORD-202', customer: 'Briar Supply Co', status: 'Review', total: 1260 },
  { id: 'ORD-203', customer: 'Cobalt Freight', status: 'Queued', total: 7410 },
  { id: 'ORD-204', customer: 'Dune Retail', status: 'Ready', total: 3095 },
  { id: 'ORD-205', customer: 'Ember Works', status: 'Queued', total: 980 },
  { id: 'ORD-206', customer: 'Fjord Trading', status: 'Review', total: 5150 }
];

/** Shared currency formatting so every list demo renders `total` identically. */
export const listDemoTotalFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

/** Shared columns: text cells plus the status badge rendered through flexRender. */
export const LIST_DEMO_COLUMNS: ColumnDef<ListDemoOrder, unknown>[] = [
  { accessorKey: 'id', header: 'Order', meta: { label: 'Order' } },
  { accessorKey: 'customer', header: 'Customer', meta: { label: 'Customer' } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status' },
    cell: (info) => flexRenderComponent(OrderStatusBadge, { inputs: { status: info.getValue<ListDemoOrder['status']>() } })
  },
  {
    accessorKey: 'total',
    header: 'Total',
    meta: { label: 'Total', align: 'end' },
    cell: (info) => listDemoTotalFormatter.format(info.getValue<number>())
  }
];
