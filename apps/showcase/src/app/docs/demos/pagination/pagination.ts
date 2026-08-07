import { Component, computed, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { NatTablePagination, NatTableSurface } from 'ng-advanced-table/components';

import { DEMO_ITEMS, demoItemColumns } from '../demo-data';

const PAGE_SIZE = 3;

@Component({
  selector: 'app-pagination',
  imports: [NatTable, NatTableSurface, NatTablePagination],
  templateUrl: './pagination.html',
  styles: `
    :host {
      display: grid;
      gap: 32px;
    }

    .pagination-note {
      margin-bottom: 12px;
    }
  `
})
export class Pagination {
  protected readonly data = DEMO_ITEMS;
  protected readonly columns = demoItemColumns;
  protected readonly pageSizeOptions = [3, 5, 10];

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    pagination: {
      pageIndex: 0,
      pageSize: PAGE_SIZE
    }
  });

  // Mixed Mode State & Computing
  protected readonly manualTableState = signal<Partial<NatTableUserState>>({
    pagination: {
      pageIndex: 0,
      pageSize: PAGE_SIZE
    }
  });

  protected readonly manualData = computed(() => {
    const pageState = this.manualTableState().pagination ?? { pageIndex: 0, pageSize: PAGE_SIZE };
    const start = pageState.pageIndex * pageState.pageSize;

    return DEMO_ITEMS.slice(start, start + pageState.pageSize);
  });

  protected readonly manualPageCount = computed(() => {
    const pageState = this.manualTableState().pagination ?? { pageIndex: 0, pageSize: PAGE_SIZE };

    return Math.ceil(DEMO_ITEMS.length / pageState.pageSize);
  });
}
