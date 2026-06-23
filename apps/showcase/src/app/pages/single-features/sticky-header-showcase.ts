import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

import { StickyDebugOverlay } from './sticky-debug-overlay';
import { COLUMNS, DEMO_DATA } from './sticky-header-showcase.data';

@Component({
  selector: 'app-sticky-header-showcase',
  imports: [NatTable, NatTableSurface, StickyDebugOverlay],
  templateUrl: './sticky-header-showcase.html',
  styleUrl: './sticky-header-showcase.css'
})
export class StickyHeaderShowcasePage {
  protected readonly data = DEMO_DATA;
  protected readonly columns = COLUMNS;
  protected readonly stickyHeaderEnabled = signal(true);
  protected readonly simulateTopbar = signal(false);

  protected toggleStickyHeader(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.stickyHeaderEnabled.set(target.checked);
    }
  }

  protected toggleTopbarSimulation(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.simulateTopbar.set(target.checked);
    }
  }
}
