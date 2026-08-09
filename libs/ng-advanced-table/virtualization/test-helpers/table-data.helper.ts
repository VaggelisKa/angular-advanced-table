import type { ColumnDef, FilterFn } from 'ng-advanced-table';

export type Row = {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly status: 'Healthy' | 'Pending' | 'Alert';
  readonly throughput: number;
};

// Multi-select status filter: selecting every status keeps the whole row set,
// which is how the reset spec changes filter state without changing row ids.
const statusFilter: FilterFn<Row> = (row, columnId, filterValue) => {
  const selectedStatuses = (filterValue ?? []) as Row['status'][];

  if (!selectedStatuses.length) {
    return true;
  }

  return selectedStatuses.includes(row.getValue(columnId) as Row['status']);
};

export const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    size: 180,
    minSize: 120,
    meta: { label: 'Service', rowHeader: true },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'region',
    header: 'Region',
    size: 140,
    minSize: 100,
    meta: { label: 'Region' },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    meta: { label: 'Status' },
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'throughput',
    header: 'Throughput',
    size: 160,
    meta: { label: 'Throughput', align: 'end' },
    cell: (info) => String(info.getValue<number>())
  }
];

export const buildRows = (size: number): Row[] => {
  const statuses: Row['status'][] = ['Healthy', 'Pending', 'Alert'];

  return Array.from({ length: size }, (_, index) => ({
    id: `svc-${String(index + 1).padStart(5, '0')}`,
    name: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'][index] ?? `Service ${index + 1}`,
    region: ['us-east-1', 'eu-west-3'][index % 2],
    status: statuses[index % statuses.length],
    throughput: 1000 + index * 1000
  }));
};
