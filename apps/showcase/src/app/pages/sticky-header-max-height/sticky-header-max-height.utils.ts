export type MockOrderRow = {
  id: string;
  customer: string;
  owner: string;
  channel: 'Online' | 'Retail' | 'Wholesale';
  region: string;
  status: 'Ready' | 'Review' | 'Queued';
  items: number;
  updatedAt: number;
  total: number;
};

export const getMockOrderRowId = (row: MockOrderRow): string => row.id;

const customers = [
  { name: 'Summit Crest', owner: 'Summit Crest Logistics' },
  { name: 'Beacon Tech', owner: 'Beacon Tech Labs' },
  { name: 'Horizon Ventures', owner: 'Horizon Ventures Group' },
  { name: 'Vanguard Systems', owner: 'Vanguard Systems Corp' },
  { name: 'Zenith Logistics', owner: 'Zenith Logistics Services' },
  { name: 'Quantum Energy', owner: 'Quantum Energy Group' },
  { name: 'Pacific Trade', owner: 'Pacific Trade & Supply' },
  { name: 'Caliber Manufacturing', owner: 'Caliber Manufacturing Co' }
];

const channels: MockOrderRow['channel'][] = ['Online', 'Retail', 'Wholesale'];
const regions = ['West', 'Midwest', 'Northeast', 'South'];
const statuses: MockOrderRow['status'][] = ['Ready', 'Review', 'Queued'];

export function generateMockOrderRows(count: number): MockOrderRow[] {
  return Array.from({ length: count }, (_, i) => {
    const customerObj = customers[i % customers.length];
    const items = 5 + ((i * 7) % 45);
    const total = items * (300 + ((i * 150) % 1500));
    const day = 1 + (i % 28);

    return {
      id: `ord-${10000 + i}`,
      customer: customerObj.name,
      owner: customerObj.owner,
      channel: channels[i % channels.length],
      region: regions[i % regions.length],
      status: statuses[i % statuses.length],
      items,
      updatedAt: Date.UTC(2026, 5, day),
      total
    };
  });
}
