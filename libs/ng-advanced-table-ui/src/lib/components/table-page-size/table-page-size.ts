import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  formatNatTableAccessibilityNumber,
  sanitizePageSizeOptions,
} from '../../shared/table-ui.helpers';
import { mergePageSizeLabels, NAT_TABLE_UI_INTL } from '../../shared/table-ui-intl';
import type {
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPageSizeOptionContext,
  NatTableUiController,
} from '../../shared/table-ui.types';

interface PageSizeOption {
  pageSize: number;
  text: string;
  ariaLabel: string;
}

@Component({
  selector: 'nat-table-page-size',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-page-size.html',
  styleUrl: './table-page-size.css',
})
export class NatTablePageSize<TData extends RowData = RowData> {
  readonly for = input.required<NatTableUiController<TData>>();
  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly accessibilityLabels = input<NatTableAccessibilityPageSizeLabels | undefined>(undefined);

  private readonly tableUiIntl = inject(NAT_TABLE_UI_INTL);
  protected readonly table = computed(() => this.for().table);
  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly selectedPageSize = computed(() => this.table().getState().pagination.pageSize);
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergePageSizeLabels(this.tableUiIntl.pageSize?.accessibilityLabels, this.accessibilityLabels()),
  );
  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return (
      this.ariaLabel() ??
      labels.groupAriaLabel ??
      this.tableUiIntl.pageSize?.ariaLabel ??
      'Rows per page'
    );
  });
  protected readonly resolvedPageSizeOptions = computed<PageSizeOption[]>(() => {
    const labels = this.resolvedAccessibilityLabels();
    const selectedPageSize = this.selectedPageSize();

    return sanitizePageSizeOptions(this.pageSizeOptions()).map((pageSize) => {
      const pageSizeText = formatNatTableAccessibilityNumber(
        pageSize,
        this.tableUiIntl.formatNumber,
      );
      const context: NatTableAccessibilityPageSizeOptionContext = {
        pageSizeValue: pageSize,
        pageSizeText,
        selectionState: selectedPageSize === pageSize ? 'selected' : 'not-selected',
      };

      return {
        pageSize,
        text: labels.pageSizeOptionText?.(context) ?? `${pageSizeText} / page`,
        ariaLabel:
          labels.pageSizeOptionAriaLabel?.(context) ?? `Show ${pageSizeText} rows per page`,
      };
    });
  });

  protected setPageSize(pageSize: number): void {
    if (pageSize === this.selectedPageSize()) {
      return;
    }

    this.for().patchState({
      pagination: () => ({
        pageIndex: 0,
        pageSize,
      }),
    });
  }
}
