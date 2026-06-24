import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

import { COLUMNS, DEMO_DATA } from './sticky-header-showcase.data';

@Component({
  selector: 'app-sticky-header-showcase',
  imports: [NatTable, NatTableSurface],
  templateUrl: './sticky-header-showcase.html',
  styleUrl: './sticky-header-showcase.css'
})
export class StickyHeaderShowcasePage {
  protected readonly data = DEMO_DATA;
  protected readonly columns = COLUMNS;
  protected readonly stickyHeaderEnabled = signal(true);
  protected readonly viewportTableIds = [1, 2, 3, 4, 5];
  protected readonly prototypeTableIds = [1, 2, 3];

  protected toggleStickyHeader(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.stickyHeaderEnabled.set(target.checked);
    }
  }
}
