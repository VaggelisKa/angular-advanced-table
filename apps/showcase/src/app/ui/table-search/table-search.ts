import { Component, DestroyRef, booleanAttribute, computed, inject, input } from '@angular/core';

import { NatTableService } from 'ng-advanced-table';
import type { PaginationState, RowData } from 'ng-advanced-table';
import { NatToolbarItem } from 'ng-advanced-table/components';
import { NAT_EN_LOCALE_ID, NAT_TABLE_CONTROLS_INTL, resolveNatTableControlsIntl } from 'ng-advanced-table/locale';

let nextSearchFieldId = 0;

/**
 * User-defined global-search field for `nat-table`.
 *
 * Lives in consumer code, not the library: it injects the public
 * `NatTableService`, registers itself so the table enables global filtering,
 * and pushes the query into the real table state through the controller. Set
 * `toolbar` to drop it into a `nat-table-toolbar` as a roving item.
 */
@Component({
  selector: 'app-table-search',
  imports: [NatToolbarItem],
  templateUrl: './table-search.html',
  styleUrl: './table-search.css'
})
export class TableSearch<TData extends RowData = RowData> {
  public readonly label = input<string>();
  public readonly placeholder = input<string>();

  public readonly toolbar = input(false, { transform: booleanAttribute });
  public readonly showLabel = input(false, { transform: booleanAttribute });

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly inputId = `app-table-search-${nextSearchFieldId++}`;
  protected readonly controller = computed(() => this.natTableService.controller());
  private readonly localeId = computed(() => this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID);
  private readonly tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()));
  protected readonly resolvedLabel = computed(() => this.label() ?? this.tableUiIntl().search?.label ?? 'Search');
  protected readonly resolvedPlaceholder = computed(() => this.placeholder() ?? this.tableUiIntl().search?.placeholder ?? '');
  protected readonly table = computed(() => this.controller()?.table);
  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? '');
  protected readonly value = computed<string>(() => this.controller()?.globalFilter() ?? '');

  public constructor() {
    this.natTableService.registerSearch();
    this.destroyRef.onDestroy(() => this.natTableService.unregisterSearch());
  }

  protected onInput(event: Event): void {
    const target = event.target;
    const isInstanceOfInput = target instanceof HTMLInputElement;

    if (!isInstanceOfInput || target.value === this.value()) return;

    this.controller()?.setGlobalFilter(target.value);
  }
}
