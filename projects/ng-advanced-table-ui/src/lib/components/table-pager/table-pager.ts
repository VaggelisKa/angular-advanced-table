import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import type { NatTableUiController } from '../../shared/table-ui.types';

@Component({
  selector: 'nat-table-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-pager.html',
  styleUrl: './table-pager.css',
})
export class NatTablePager<TData extends RowData = RowData> {
  readonly for = input.required<NatTableUiController<TData>>();
  readonly ariaLabel = input('Table pagination');

  protected readonly table = computed(() => this.for().table);
  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly pageIndex = computed(() => this.table().getState().pagination.pageIndex);
  protected readonly pageCount = computed(() => this.table().getPageCount() || 1);
  protected readonly canPreviousPage = computed(() => this.table().getCanPreviousPage());
  protected readonly canNextPage = computed(() => this.table().getCanNextPage());

  protected previousPage(): void {
    if (!this.canPreviousPage()) {
      return;
    }

    this.table().previousPage();
  }

  protected nextPage(): void {
    if (!this.canNextPage()) {
      return;
    }

    this.table().nextPage();
  }
}
