import type { ColumnDef, FilterFn } from '@tanstack/angular-table';

export type Row = {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly status: 'Healthy' | 'Pending' | 'Alert';
  readonly throughput: number;
};

export const getRowId = (row: Row): string => row.id;

export const sortIndicatorGlyph = (sortState: 'asc' | 'desc' | false): string => {
  if (sortState === 'asc') return 'A';

  if (sortState === 'desc') return 'D';

  return '-';
};

export const danishPinLabel = (params: {
  readonly label: string;
  readonly toggleAction: 'pin' | 'unpin';
  readonly pinSide: 'left' | 'right';
}): string => {
  const verb = { pin: 'Fastgør', unpin: 'Frigør' }[params.toggleAction];
  const preposition = { pin: 'til', unpin: 'fra' }[params.toggleAction];
  const side = { left: 'venstre', right: 'højre' }[params.pinSide];

  return `${verb} kolonne ${params.label} ${preposition} ${side}`;
};

export const statusFilter: FilterFn<Row> = (row, columnId, filterValue) => {
  const selectedStatuses = (filterValue ?? []) as Row['status'][];

  if (!selectedStatuses.length) return true;

  return selectedStatuses.includes(row.getValue(columnId) as Row['status']);
};

export const baseColumns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    size: 180,
    meta: {
      label: 'Service',
      rowHeader: true
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'region',
    header: 'Region',
    size: 140,
    meta: {
      label: 'Region'
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    meta: {
      label: 'Status'
    },
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'throughput',
    header: 'Throughput',
    size: 160,
    meta: {
      label: 'Throughput',
      align: 'end'
    },
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

export const buildHeaderActionCompositionColumns = (): ColumnDef<Row, unknown>[] =>
  baseColumns.map((column) => {
    const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

    if (accessorKey === 'region') {
      return {
        ...column,
        meta: {
          ...column.meta,
          headerActions: false
        }
      };
    }

    if (accessorKey === 'status') {
      return {
        ...column,
        meta: {
          ...column.meta,
          headerActions: {
            sortIndicator: 'Column',
            accessibilityLabels: {
              sortButton: ({ label }): string => `Column override for ${label}`
            }
          }
        }
      };
    }

    return column;
  });

export const buildSortActionsColumnOverrideColumns = (enableSortActions: boolean): ColumnDef<Row, unknown>[] =>
  baseColumns.map((column) => {
    const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

    if (accessorKey !== 'name') {
      return column;
    }

    return {
      ...column,
      meta: {
        ...column.meta,
        headerActions: { enableSortActions }
      }
    };
  });
