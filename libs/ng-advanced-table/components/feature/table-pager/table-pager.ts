import { Component, DestroyRef, computed, inject, input } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableService } from 'ng-advanced-table';
import { NAT_EN_LOCALE_ID, NAT_TABLE_CONTROLS_INTL, mergePagerLabels, resolveNatTableControlsIntl } from 'ng-advanced-table/locale';
import type { NatTableAccessibilityPagerLabels } from 'ng-advanced-table/locale';

import { formatNatTableAccessibilityNumber } from '../../utils/accessibility-number.util';

@Component({
  selector: 'nat-table-pager',
  templateUrl: './table-pager.html',
  styleUrl: './table-pager.css'
})
export class NatTablePager<TData extends RowData = RowData> {
  public readonly locale = input<string | undefined>(undefined);
  public readonly groupAriaLabel = input<string | undefined>(undefined);
  public readonly accessibilityLabels = input<NatTableAccessibilityPagerLabels | undefined>(undefined);

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

  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? '');
  protected readonly pageIndex = computed(() => this.controller()?.pagination().pageIndex ?? 0);
  protected readonly pageCount = computed(() => this.controller()?.pageCount() ?? 1);
  protected readonly currentPage = computed(() => this.pageIndex() + 1);
  protected readonly canPreviousPage = computed(() => this.controller()?.canPreviousPage() ?? false);
  protected readonly canNextPage = computed(() => this.controller()?.canNextPage() ?? false);
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergePagerLabels(this.tableUiIntl().pager?.accessibilityLabels, this.accessibilityLabels())
  );

  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return this.groupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pager?.groupAriaLabel ?? '';
  });

  protected readonly previousPageAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.previousPageAriaLabel ?? '';
  });

  protected readonly nextPageAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.nextPageAriaLabel ?? '';
  });

  protected readonly pageIndicator = computed(() => {
    const labels = this.resolvedAccessibilityLabels();
    const page = this.currentPage();
    const pageCount = this.pageCount();
    const context = {
      pageValue: page,
      pageText: formatNatTableAccessibilityNumber(page, this.tableUiIntl().formatNumber, undefined, this.localeId()),
      pageCountValue: pageCount,
      pageCountText: formatNatTableAccessibilityNumber(pageCount, this.tableUiIntl().formatNumber, undefined, this.localeId())
    };

    return labels.pageIndicator?.(context) ?? '';
  });

  protected previousPage(): void {
    if (!this.canPreviousPage()) {
      return;
    }

    this.controller()?.previousPage();
  }

  protected nextPage(): void {
    if (!this.canNextPage()) {
      return;
    }

    this.controller()?.nextPage();
  }
}
