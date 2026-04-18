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
  readonly ariaLabel = input('Page size');

  protected readonly sanitizedPageSizeOptions = computed(() =>
    sanitizePageSizeOptions(this.pageSizeOptions()),
  );

  protected setPageSize(pageSize: number): void {
    this.for().patchState({
      pagination: () => ({
        pageIndex: 0,
        pageSize,
      }),
    });
  }
}
