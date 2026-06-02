import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_UI_INTL } from '../../shared/table-ui-intl';
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
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);

  private readonly tableUiIntl = inject(NAT_TABLE_UI_INTL);
  protected readonly inputId = `nat-table-search-${nextSearchFieldId++}`;
  protected readonly table = computed(() => this.for().table);
  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly value = computed(() => this.table().getState().globalFilter ?? '');
  protected readonly resolvedLabel = computed(
    () => this.label() ?? this.tableUiIntl.search?.label ?? 'Search rows',
  );
  protected readonly resolvedPlaceholder = computed(
    () => this.placeholder() ?? this.tableUiIntl.search?.placeholder ?? 'Search rows',
  );

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
