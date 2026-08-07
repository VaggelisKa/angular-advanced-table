import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { NatTableColumnVisibility, NatTableSurface } from 'ng-advanced-table/components';

import { DEMO_ITEMS, demoItemColumns } from '../demo-data';

@Component({
  selector: 'app-visibility',
  imports: [NatTable, NatTableSurface, NatTableColumnVisibility],
  templateUrl: './visibility.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class Visibility {
  protected readonly data = DEMO_ITEMS;
  protected readonly columns = demoItemColumns;

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    columnVisibility: {
      name: true,
      category: true,
      status: false,
      value: true
    }
  });
}
