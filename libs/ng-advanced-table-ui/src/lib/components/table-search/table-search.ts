import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { PaginationState, RowData } from '@tanstack/angular-table';

import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';
import { NatTableUiService } from '../../shared/table-ui.service';
import type { NatTableUiController } from '../../shared/table-ui.types';

let nextSearchFieldId = 0;

@Component({
  selector: 'nat-table-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-search.html',
  styleUrl: './table-search.css',
})
export class NatTableSearch<TData extends RowData = RowData> {
  readonly for = input<NatTableUiController<TData> | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);

  private readonly uiService = inject<NatTableUiService<TData>>(NatTableUiService, { optional: true });
  protected readonly controller = computed(
    () => this.for() ?? this.uiService?.controller() ?? null,
  );

  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  protected readonly inputId = `nat-table-search-${nextSearchFieldId++}`;
  private readonly localeId = computed(
    () => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );
  protected readonly table = computed(() => this.controller()?.table);
  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? '');
  protected readonly value = computed(() => this.table()?.getState().globalFilter ?? '');
  protected readonly resolvedLabel = computed(
    () => this.label() ?? this.tableUiIntl().search?.label ?? '',
  );
  protected readonly resolvedPlaceholder = computed(
    () => this.placeholder() ?? this.tableUiIntl().search?.placeholder ?? '',
  );

  protected onInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.value === this.value()) {
      return;
    }

    this.controller()?.patchState({
      globalFilter: target.value,
      pagination: (currentPagination: PaginationState) => ({
        ...currentPagination,
        pageIndex: 0,
      }),
    });
  }
}
