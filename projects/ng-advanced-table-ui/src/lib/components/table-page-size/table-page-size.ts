import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';

import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  formatNatTableAccessibilityNumber,
  sanitizePageSizeOptions,
} from '../../shared/table-ui.helpers';
import type {
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPageSizeOptionContext,
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
  readonly for = input.required<NatTable<TData>>();
  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  readonly ariaLabel = input('Rows per page');
  readonly accessibilityLabels = input<NatTableAccessibilityPageSizeLabels | undefined>(undefined);

  protected readonly table = computed(() => this.for().table);
  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly selectedPageSize = computed(() => this.table().getState().pagination.pageSize);
  private readonly resolvedAccessibilityLabels = computed(() => this.accessibilityLabels() ?? {});
  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.groupAriaLabel ?? this.ariaLabel();
  });
  protected readonly resolvedPageSizeOptions = computed<PageSizeOption[]>(() => {
    const labels = this.resolvedAccessibilityLabels();
    const selectedPageSize = this.selectedPageSize();

    return sanitizePageSizeOptions(this.pageSizeOptions()).map((pageSize) => {
      const pageSizeText = formatNatTableAccessibilityNumber(pageSize);
      const context: NatTableAccessibilityPageSizeOptionContext = {
        pageSizeValue: pageSize,
        pageSizeText,
        selectionState: selectedPageSize === pageSize ? 'selected' : 'not-selected',
      };

      return {
        pageSize,
        text: labels.pageSizeOptionText?.(context) ?? `${pageSize} / page`,
        ariaLabel:
          labels.pageSizeOptionAriaLabel?.(context) ?? `Show ${pageSize} rows per page`,
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
