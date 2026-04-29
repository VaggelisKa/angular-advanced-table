import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import type { NatTableUiController } from '../../shared/table-ui.types';

import { formatNatTableAccessibilityNumber } from '../../shared/table-ui.helpers';
import type { NatTableAccessibilityPagerLabels } from '../../shared/table-ui.types';

@Component({
  selector: 'nat-table-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-pager.html',
  styleUrl: './table-pager.css',
})
export class NatTablePager<TData extends RowData = RowData> {
  readonly for = input.required<NatTableUiController<TData>>();
  readonly ariaLabel = input('Table pagination');
  readonly accessibilityLabels = input<NatTableAccessibilityPagerLabels | undefined>(undefined);

  protected readonly table = computed(() => this.for().table);
  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly pageIndex = computed(() => this.table().getState().pagination.pageIndex);
  protected readonly pageCount = computed(() => this.table().getPageCount() || 1);
  protected readonly currentPage = computed(() => this.pageIndex() + 1);
  protected readonly canPreviousPage = computed(() => this.table().getCanPreviousPage());
  protected readonly canNextPage = computed(() => this.table().getCanNextPage());
  private readonly resolvedAccessibilityLabels = computed(() => this.accessibilityLabels() ?? {});
  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.groupAriaLabel ?? this.ariaLabel();
  });
  protected readonly previousPageAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.previousPageAriaLabel ?? 'Previous page';
  });
  protected readonly nextPageAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.nextPageAriaLabel ?? 'Next page';
  });
  protected readonly pageIndicator = computed(() => {
    const labels = this.resolvedAccessibilityLabels();
    const page = this.currentPage();
    const pageCount = this.pageCount();
    const context = {
      pageValue: page,
      pageText: formatNatTableAccessibilityNumber(page),
      pageCountValue: pageCount,
      pageCountText: formatNatTableAccessibilityNumber(pageCount),
    };

    return labels.pageIndicator?.(context) ?? `Page ${page} / ${pageCount}`;
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
