import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { DemoAside, DemoLayout, DemoSection, DemoSwitch } from '../../../ui';
import { buildDemoItems, demoItemColumns } from '../demo-data';

@Component({
  selector: 'app-sticky-header',
  imports: [NatTable, NatTableSurface, DemoAside, DemoLayout, DemoSection, DemoSwitch],
  templateUrl: './sticky-header.html',
  styleUrl: './sticky-header.css'
})
export class StickyHeader {
  // Enough rows that the capped region scrolls.
  protected readonly data = buildDemoItems(40);
  protected readonly columns = demoItemColumns;

  protected readonly stickyHeaderEnabled = signal(true);
}
