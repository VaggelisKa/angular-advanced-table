import type { NatTableUserState } from 'ng-advanced-table';

import type { MockOrderRow } from '../../common';

export const mockOrderRows: readonly MockOrderRow[] = [
  {
    id: 'ord-1007',
    customer: 'Northstar Supply',
    owner: 'Northstar Global Distribution Cooperative',
    channel: 'Wholesale',
    region: 'West',
    status: 'Ready',
    items: 18,
    updatedAt: Date.UTC(2026, 5, 6),
    total: 18400
  },
  {
    id: 'ord-1002',
    customer: 'Juniper Foods',
    owner: 'Juniper Foods',
    channel: 'Online',
    region: 'Midwest',
    status: 'Queued',
    items: 7,
    updatedAt: Date.UTC(2026, 5, 4),
    total: 9200
  },
  {
    id: 'ord-1011',
    customer: 'Atlas Studio',
    owner: 'Atlas Studio International Design Group',
    channel: 'Retail',
    region: 'Northeast',
    status: 'Review',
    items: 12,
    updatedAt: Date.UTC(2026, 5, 7),
    total: 12750
  },
  {
    id: 'ord-1004',
    customer: 'Harbor Retail',
    owner: 'Harbor Retail',
    channel: 'Retail',
    region: 'South',
    status: 'Ready',
    items: 24,
    updatedAt: Date.UTC(2026, 5, 5),
    total: 22100
  },
  {
    id: 'ord-1009',
    customer: 'Pioneer Labs',
    owner: 'Pioneer Labs Advanced Fulfillment Partners',
    channel: 'Online',
    region: 'West',
    status: 'Review',
    items: 15,
    updatedAt: Date.UTC(2026, 5, 8),
    total: 14600
  }
];

export const preconfiguredTableState: Partial<NatTableUserState> = {
  columnPinning: {
    left: ['owner'],
    right: ['actions']
  }
};
