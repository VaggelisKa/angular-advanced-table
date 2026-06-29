import { Component, DestroyRef, computed, inject, input } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableService } from 'ng-advanced-table';
import { NAT_EN_LOCALE_ID, NAT_TABLE_CONTROLS_INTL, mergePageSizeLabels, resolveNatTableControlsIntl } from 'ng-advanced-table/locale';

import type { NatTableAccessibilityPageSizeLabels, NatTableAccessibilityPageSizeOptionContext } from '../../common/table-ui.type';
import { DEFAULT_PAGE_SIZE_OPTIONS, formatNatTableAccessibilityNumber, sanitizePageSizeOptions } from '../../utils/table-ui.helpers';

type PageSizeOption = {
  readonly pageSize: number;
  readonly text: string;
  readonly ariaLabel: string;
};

@Component({
  selector: 'nat-table-page-size',
  templateUrl: './table-page-size.html',
  styleUrl: './table-page-size.css'
})
export class NatTablePageSize<TData extends RowData = RowData> {
  public readonly locale = input<string | undefined>(undefined);
  public readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  public readonly groupAriaLabel = input<string | undefined>(undefined);
  public readonly accessibilityLabels = input<NatTableAccessibilityPageSizeLabels | undefined>(undefined);

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly controller = computed(() => this.natTableService.controller());

  public constructor() {
    this.natTableService.registerPagination();
    this.destroyRef.onDestroy(() => {
      this.natTableService.unregisterPagination();
    });
  }

  private readonly tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
  private readonly localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID);

  private readonly tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()));

  protected readonly table = computed(() => this.controller()?.table);
  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? '');
  protected readonly selectedPageSize = computed(() => this.table()?.getState().pagination.pageSize ?? 0);

  private readonly resolvedAccessibilityLabels = computed(() =>
    mergePageSizeLabels(this.tableUiIntl().pageSize?.accessibilityLabels, this.accessibilityLabels())
  );

  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return this.groupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pageSize?.groupAriaLabel ?? '';
  });

  protected readonly resolvedPageSizeOptions = computed<PageSizeOption[]>(() => {
    const labels = this.resolvedAccessibilityLabels();
    const selectedPageSize = this.selectedPageSize();

    return sanitizePageSizeOptions(this.pageSizeOptions()).map((pageSize) => {
      const pageSizeText = formatNatTableAccessibilityNumber(pageSize, this.tableUiIntl().formatNumber, undefined, this.localeId());
      const context: NatTableAccessibilityPageSizeOptionContext = {
        pageSizeValue: pageSize,
        pageSizeText,
        selectionState: selectedPageSize === pageSize ? 'selected' : 'not-selected'
      };

      return {
        pageSize,
        text: labels.pageSizeOptionText?.(context) ?? '',
        ariaLabel: labels.pageSizeOptionAriaLabel?.(context) ?? ''
      };
    });
  });

  protected setPageSize(pageSize: number): void {
    if (pageSize === this.selectedPageSize()) {
      return;
    }

    this.controller()?.patchState({
      pagination: () => ({
        pageIndex: 0,
        pageSize
      })
    });
  }
}
