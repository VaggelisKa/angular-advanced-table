import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';

@Component({
  selector: 'nat-table-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-pager.html',
  styleUrl: './table-pager.css',
})
export class NatTablePager<TData extends RowData = RowData> {
  readonly for = input.required<NatTable<TData>>();
  readonly ariaLabel = input('Table pagination');

  protected readonly pageIndex = computed(() => this.for().table.getState().pagination.pageIndex);
  protected readonly pageCount = computed(() => this.for().table.getPageCount() || 1);
}
