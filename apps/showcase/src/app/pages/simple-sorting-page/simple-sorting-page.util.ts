export type MockOrderRow = {
  readonly id: string;
  readonly customer: string;
  readonly owner: string;
  readonly channel: 'Online' | 'Retail' | 'Wholesale';
  readonly region: string;
  readonly status: 'Ready' | 'Review' | 'Queued';
  readonly items: number;
  readonly updatedAt: number;
  readonly total: number;
};
