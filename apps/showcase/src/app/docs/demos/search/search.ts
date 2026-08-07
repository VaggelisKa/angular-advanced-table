import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { TableSearch } from '../../../ui';
import { DEMO_ITEMS, demoItemColumns } from '../demo-data';

@Component({
  selector: 'app-search',
  imports: [NatTable, NatTableSurface, TableSearch],
  templateUrl: './search.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class Search {
  protected readonly data = DEMO_ITEMS;
  protected readonly columns = demoItemColumns;

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    globalFilter: ''
  });
}
