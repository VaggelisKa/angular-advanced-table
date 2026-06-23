import type { CellContext, ColumnDef } from '@tanstack/angular-table';

import { withNatTableHeaderActions } from 'ng-advanced-table-ui';

export type DemoItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
  region: string;
  load: string;
  memory: string;
  connections: number;
  uptime: string;
  owner: string;
  lastUpdated: string;
  cost: number;
  risk: string;
  compliance: string;
};

const CATEGORIES = ['Analytics', 'Infrastructure', 'Data Science', 'Security'] as const;
const STATUSES = ['Active', 'Paused', 'Alert', 'Halted'] as const;

export const DEMO_DATA: DemoItem[] = Array.from({ length: 40 }, (_, index) => {
  const id = index + 1;
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
  const owners = ['Dev Team A', 'Dev Team B', 'Infra Team', 'SecOps'];
  const risks = ['Low', 'Medium', 'High', 'Critical'];
  const compliances = ['Passed', 'Failed', 'Pending', 'Warning'];

  return {
    id: `item-${id}`,
    name: `Resource Node ${id}`,
    category: CATEGORIES[id % CATEGORIES.length] ?? CATEGORIES[0],
    status: STATUSES[id % STATUSES.length] ?? STATUSES[0],
    value: 1000 + ((id * 235) % 9000),
    region: regions[id % regions.length] ?? '',
    load: `${(id * 17) % 100}%`,
    memory: `${((id * 7) % 32) + 2} GB`,
    connections: (id * 11) % 500,
    uptime: `${99.0 + (id % 10) * 0.1}%`,
    owner: owners[id % owners.length] ?? '',
    lastUpdated: `${id % 24} hours ago`,
    cost: 50 + ((id * 15) % 450),
    risk: risks[id % risks.length] ?? '',
    compliance: compliances[id % compliances.length] ?? ''
  };
});

export const COLUMNS: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
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
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status' }
  },
  {
    accessorKey: 'region',
    header: 'Region',
    meta: { label: 'Region' }
  },
  {
    accessorKey: 'load',
    header: 'Load',
    meta: { label: 'Load' }
  },
  {
    accessorKey: 'memory',
    header: 'Memory',
    meta: { label: 'Memory' }
  },
  {
    accessorKey: 'connections',
    header: 'Connections',
    meta: { label: 'Connections', align: 'end' }
  },
  {
    accessorKey: 'uptime',
    header: 'Uptime',
    meta: { label: 'Uptime' }
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    meta: { label: 'Owner' }
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
    meta: { label: 'Last Updated' }
  },
  {
    accessorKey: 'cost',
    header: 'Monthly Cost',
    meta: { label: 'Monthly Cost', align: 'end' },
    cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`
  },
  {
    accessorKey: 'risk',
    header: 'Risk Level',
    meta: { label: 'Risk Level' }
  },
  {
    accessorKey: 'compliance',
    header: 'Compliance',
    meta: { label: 'Compliance' }
  },
  {
    accessorKey: 'value',
    header: 'Value',
    meta: { label: 'Value', align: 'end' },
    cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`
  }
]);
