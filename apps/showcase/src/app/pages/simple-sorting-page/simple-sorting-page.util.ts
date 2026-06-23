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
