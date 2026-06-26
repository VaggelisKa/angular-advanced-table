import { Component, DestroyRef, booleanAttribute, computed, inject, input } from '@angular/core';

import type { PaginationState, RowData } from '@tanstack/angular-table';
import { NatTableService, NatToolbarItem } from 'ng-advanced-table/ui';

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
  public readonly label = input('Search table');
  public readonly placeholder = input('Type to search...');

  public readonly toolbar = input(false, { transform: booleanAttribute });

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly inputId = `app-table-search-${nextSearchFieldId++}`;
  protected readonly controller = computed(() => this.natTableService.controller());
  protected readonly table = computed(() => this.controller()?.table);
  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? '');
  protected readonly value = computed<string>(() => String(this.table()?.getState().globalFilter ?? ''));

  public constructor() {
    this.natTableService.registerSearch();
    this.destroyRef.onDestroy(() => this.natTableService.unregisterSearch());
  }

  protected onInput(event: Event): void {
    const target = event.target;
    const isInstanceOfInput = target instanceof HTMLInputElement;

    if (!isInstanceOfInput || target.value === this.value()) return;

    this.controller()?.patchState({
      globalFilter: target.value,
      pagination: (current: PaginationState) => ({ ...current, pageIndex: 0 })
    });
  }
}
