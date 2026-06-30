import { UpperCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';

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

@Component({
  selector: 'app-order-code',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      max-inline-size: 100%;
      min-height: 1.75rem;
      padding-inline: 0.62rem;
      border: 1px solid color-mix(in srgb, var(--showcase-page-text) 12%, transparent);
      border-radius: 6px;
      background: color-mix(in srgb, var(--showcase-page-text) 4%, var(--showcase-page-surface));
      color: var(--showcase-page-text);
      font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, ui-monospace, monospace;
      font-size: 0.78rem;
      font-weight: 650;
      line-height: 1;
      letter-spacing: 0;
      overflow: hidden;
      overflow-wrap: normal;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: normal;
    }
  `,
  imports: [UpperCasePipe],
  template: `{{ code() | uppercase }}`
})
export class OrderCode {
  public readonly code = input.required<string>();
}

@Component({
  selector: 'app-order-status-badge',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.42rem;
      min-height: 1.75rem;
      padding-inline: 0.62rem;
      border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, currentColor 9%, transparent);
      color: var(--showcase-page-text-soft);
      font-size: 0.78rem;
      font-weight: 650;
      line-height: 1;
    }

    :host::before {
      width: 0.45rem;
      height: 0.45rem;
      flex: 0 0 auto;
      border-radius: 999px;
      background: currentColor;
      content: '';
    }

    :host([data-status='Ready']) {
      color: var(--showcase-page-positive);
    }

    :host([data-status='Review']) {
      color: var(--showcase-page-warning);
    }
  `,
  template: `<span>{{ status() }}</span>`,
  host: {
    '[attr.data-status]': 'status()'
  }
})
export class OrderStatusBadge {
  public readonly status = input.required<MockOrderRow['status']>();
}
