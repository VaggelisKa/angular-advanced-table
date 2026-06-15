import { ChangeDetectionStrategy, Component, computed, inject, input, DestroyRef } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { NatTableService } from '../../shared/table.service';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  formatNatTableAccessibilityNumber,
  sanitizePageSizeOptions,
} from '../../shared/table-ui.helpers';
import {
  mergePageSizeLabels,
  NAT_TABLE_UI_INTL,
  NAT_TABLE_UI_ENGLISH_LOCALE,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';
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
  readonly locale = input<string | undefined>(undefined);
  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  readonly groupAriaLabel = input<string | undefined>(undefined);
  readonly accessibilityLabels = input<NatTableAccessibilityPageSizeLabels | undefined>(undefined);

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly controller = computed(() => this.natTableService.controller());

  constructor() {
    this.natTableService.registerPagination();
    this.destroyRef.onDestroy(() => {
      this.natTableService.unregisterPagination();
    });
  }

  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  private readonly localeId = computed(
    () => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );
  protected readonly table = computed(() => this.controller()?.table);
  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? '');
  protected readonly selectedPageSize = computed(() => this.table()?.getState().pagination.pageSize ?? 0);
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergePageSizeLabels(
      this.tableUiIntl().pageSize?.accessibilityLabels,
      this.accessibilityLabels(),
    ),
  );
  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return (
      this.groupAriaLabel() ??
      labels.groupAriaLabel ??
      this.tableUiIntl().pageSize?.groupAriaLabel ??
      ''
    );
  });
  protected readonly resolvedPageSizeOptions = computed<PageSizeOption[]>(() => {
    const labels = this.resolvedAccessibilityLabels();
    const selectedPageSize = this.selectedPageSize();

    return sanitizePageSizeOptions(this.pageSizeOptions()).map((pageSize) => {
      const pageSizeText = formatNatTableAccessibilityNumber(
        pageSize,
        this.tableUiIntl().formatNumber,
        undefined,
        this.localeId(),
      );
      const context: NatTableAccessibilityPageSizeOptionContext = {
        pageSizeValue: pageSize,
        pageSizeText,
        selectionState: selectedPageSize === pageSize ? 'selected' : 'not-selected',
      };

      return {
        pageSize,
        text: labels.pageSizeOptionText?.(context) ?? '',
        ariaLabel: labels.pageSizeOptionAriaLabel?.(context) ?? '',
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
        pageSize,
      }),
    });
  }
}
