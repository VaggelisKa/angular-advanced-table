import { Component, input } from '@angular/core';

import type { MockOrderRow } from '../../common';

@Component({
  selector: 'app-order-status-badge',
  template: `<span>{{ status() }}</span>`,
  styleUrl: './order-status-badge.css',
  host: {
    '[attr.data-status]': 'status()'
  }
})
export class OrderStatusBadge {
  public readonly status = input.required<MockOrderRow['status']>();
}
