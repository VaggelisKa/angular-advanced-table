import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import type { NatTableUiController } from '../../shared/table-ui.types';

let nextSearchFieldId = 0;

@Component({
  selector: 'nat-table-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-search.html',
  styleUrl: './table-search.css',
})
export class NatTableSearch<TData extends RowData = RowData> {
  readonly for = input.required<NatTableUiController<TData>>();
  readonly label = input('Search rows');
  readonly placeholder = input('Search rows');

  protected readonly inputId = `nat-table-search-${nextSearchFieldId++}`;
  protected readonly table = computed(() => this.for().table);
  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly value = computed(() => this.table().getState().globalFilter ?? '');

  protected onInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.value === this.value()) {
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
