import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import type { NatTableUiController } from '../../shared/table-ui.types';

import { formatNatTableAccessibilityNumber } from '../../shared/table-ui.helpers';
import {
  mergePagerLabels,
  NAT_TABLE_UI_INTL,
  readNatTableUiDefaultLocale,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';
import type { NatTableAccessibilityPagerLabels } from '../../shared/table-ui.types';

@Component({
  selector: 'nat-table-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-pager.html',
  styleUrl: './table-pager.css',
})
export class NatTablePager<TData extends RowData = RowData> {
  readonly for = input.required<NatTableUiController<TData>>();
  readonly locale = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly accessibilityLabels = input<NatTableAccessibilityPagerLabels | undefined>(undefined);

  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  private readonly localeId = computed(
    () =>
      this.locale() ??
      this.for().localeId?.() ??
      readNatTableUiDefaultLocale(this.tableUiIntlConfig),
  );
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );
  protected readonly table = computed(() => this.for().table);
  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly pageIndex = computed(() => this.table().getState().pagination.pageIndex);
  protected readonly pageCount = computed(() => this.table().getPageCount() || 1);
  protected readonly currentPage = computed(() => this.pageIndex() + 1);
  protected readonly canPreviousPage = computed(() => this.table().getCanPreviousPage());
  protected readonly canNextPage = computed(() => this.table().getCanNextPage());
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergePagerLabels(this.tableUiIntl().pager?.accessibilityLabels, this.accessibilityLabels()),
  );
  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return this.ariaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pager?.ariaLabel ?? '';
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
      pageText: formatNatTableAccessibilityNumber(
        page,
        this.tableUiIntl().formatNumber,
        undefined,
        this.localeId(),
      ),
      pageCountValue: pageCount,
      pageCountText: formatNatTableAccessibilityNumber(
        pageCount,
        this.tableUiIntl().formatNumber,
        undefined,
        this.localeId(),
      ),
    };

    return labels.pageIndicator?.(context) ?? '';
  });

  protected previousPage(): void {
    if (!this.canPreviousPage()) {
      return;
    }

    this.table().previousPage();
  }

  protected nextPage(): void {
    if (!this.canNextPage()) {
      return;
    }

    this.table().nextPage();
  }
}
