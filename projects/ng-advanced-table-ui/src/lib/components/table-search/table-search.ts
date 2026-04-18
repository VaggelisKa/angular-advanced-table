import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';

let nextSearchFieldId = 0;

@Component({
  selector: 'nat-table-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-search.html',
  styleUrl: './table-search.css',
})
export class NatTableSearch<TData extends RowData = RowData> {
  readonly for = input.required<NatTable<TData>>();
  readonly label = input('Search rows');
  readonly placeholder = input('Search rows');

  protected readonly inputId = `nat-table-search-${nextSearchFieldId++}`;

  protected onInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.for().patchState({
      globalFilter: target.value,
      pagination: (currentPagination) => ({
        ...currentPagination,
        pageIndex: 0,
      }),
    });
  }
}
