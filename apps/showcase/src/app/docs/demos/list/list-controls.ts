import { Component, signal } from '@angular/core';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatList } from 'ng-advanced-table';
import { NatTableColumnVisibility, NatTablePagination, NatTableSurface } from 'ng-advanced-table/components';

import { LIST_DEMO_COLUMNS, buildListDemoRows } from './list-demo-data';

const PAGE_SIZE = 5;

/**
 * Docs demo: surface-bound companion controls resolve the list exactly as
 * they resolve a table — the pagination companion pages it and the
 * column-visibility chips toggle fields. Nothing here is list-specific.
 */
@Component({
  selector: 'app-list-controls',
  imports: [NatList, NatTableColumnVisibility, NatTablePagination, NatTableSurface],
  templateUrl: './list-controls.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class ListControls {
  protected readonly rows = buildListDemoRows(23);
  protected readonly columns = LIST_DEMO_COLUMNS;
  protected readonly pageSizeOptions = [PAGE_SIZE, 10, 20];

  // Seeded so the page-size control and the rendered page agree from the first
  // paint; without it the engine defaults to 10 while the select shows its
  // first option.
  protected readonly state = signal<Partial<NatTableUserState>>({
    pagination: { pageIndex: 0, pageSize: PAGE_SIZE }
  });
}
