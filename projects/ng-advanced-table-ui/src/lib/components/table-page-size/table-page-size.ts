import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';

import { DEFAULT_PAGE_SIZE_OPTIONS, sanitizePageSizeOptions } from '../../shared/table-ui.helpers';

@Component({
  selector: 'nat-table-page-size',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-page-size.html',
  styleUrl: './table-page-size.css',
})
export class NatTablePageSize<TData extends RowData = RowData> {
  readonly for = input.required<NatTable<TData>>();
  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  readonly ariaLabel = input('Rows per page');

  protected readonly table = computed(() => this.for().table);
  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly sanitizedPageSizeOptions = computed(() =>
    sanitizePageSizeOptions(this.pageSizeOptions()),
  );
  protected readonly selectedPageSize = computed(() => this.table().getState().pagination.pageSize);

  protected setPageSize(pageSize: number): void {
    if (pageSize === this.selectedPageSize()) {
      return;
    }

    this.for().patchState({
      pagination: () => ({
        pageIndex: 0,
        pageSize,
      }),
    });
  }
}
