import { Component, DestroyRef, computed, inject, input } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableService } from 'ng-advanced-table';
import {
  NAT_EN_LOCALE_ID,
  NAT_TABLE_CONTROLS_INTL,
  mergePageSizeLabels,
  mergePagerLabels,
  resolveNatTableControlsIntl
} from 'ng-advanced-table/locale';
import type {
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPageSizeOptionContext,
  NatTableAccessibilityPagerLabels
} from 'ng-advanced-table/locale';

import { NatToolbarGroup } from '../../ui/toolbar-group/toolbar-group';
import { NatToolbarItem } from '../../ui/toolbar-item/toolbar-item.directive';
import { formatNatTableAccessibilityNumber } from '../../utils/accessibility-number.util';
import { DEFAULT_PAGE_SIZE_OPTIONS, sanitizePageSizeOptions } from '../../utils/page-size.util';
import { NatTableToolbar } from '../table-toolbar/table-toolbar';

type PageSizeOption = {
  readonly pageSize: number;
  readonly text: string;
  readonly ariaLabel: string;
};

@Component({
  selector: 'nat-table-pagination',
  imports: [NatTableToolbar, NatToolbarGroup, NatToolbarItem],
  templateUrl: './table-pagination.html',
  styleUrl: './table-pagination.css'
})
export class NatTablePagination<TData extends RowData = RowData> {
  public readonly locale = input<string | undefined>(undefined);
  public readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  public readonly pageSizeGroupAriaLabel = input<string | undefined>(undefined);
  public readonly pageSizeAccessibilityLabels = input<NatTableAccessibilityPageSizeLabels | undefined>(undefined);

  public readonly pagerGroupAriaLabel = input<string | undefined>(undefined);
  public readonly pagerAccessibilityLabels = input<NatTableAccessibilityPagerLabels | undefined>(undefined);

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

  // Page Size Logic
  protected readonly selectedPageSize = computed(() => this.table()?.getState().pagination.pageSize ?? 0);

  private readonly resolvedPageSizeAccessibilityLabels = computed(() =>
    mergePageSizeLabels(this.tableUiIntl().pageSize?.accessibilityLabels, this.pageSizeAccessibilityLabels())
  );

  protected readonly resolvedPageSizeAriaLabel = computed(() => {
    const labels = this.resolvedPageSizeAccessibilityLabels();

    return this.pageSizeGroupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pageSize?.groupAriaLabel ?? '';
  });

  protected readonly resolvedPageSizeOptions = computed<PageSizeOption[]>(() => {
    const labels = this.resolvedPageSizeAccessibilityLabels();
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

  // Pager Logic
  protected readonly pageIndex = computed(() => this.table()?.getState().pagination.pageIndex ?? 0);
  protected readonly pageCount = computed(() => Math.max(1, this.table()?.getPageCount() ?? 0));
  protected readonly currentPage = computed(() => this.pageIndex() + 1);
  protected readonly canPreviousPage = computed(() => this.table()?.getCanPreviousPage() ?? false);
  protected readonly canNextPage = computed(() => this.table()?.getCanNextPage() ?? false);
  private readonly resolvedPagerAccessibilityLabels = computed(() =>
    mergePagerLabels(this.tableUiIntl().pager?.accessibilityLabels, this.pagerAccessibilityLabels())
  );

  protected readonly resolvedPagerAriaLabel = computed(() => {
    const labels = this.resolvedPagerAccessibilityLabels();

    return this.pagerGroupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pager?.groupAriaLabel ?? '';
  });

  protected readonly previousPageAriaLabel = computed(() => {
    const labels = this.resolvedPagerAccessibilityLabels();

    return labels.previousPageAriaLabel ?? '';
  });

  protected readonly nextPageAriaLabel = computed(() => {
    const labels = this.resolvedPagerAccessibilityLabels();

    return labels.nextPageAriaLabel ?? '';
  });

  protected readonly pageIndicator = computed(() => {
    const labels = this.resolvedPagerAccessibilityLabels();
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
    this.table()?.previousPage();
  }

  protected nextPage(): void {
    if (!this.canNextPage()) {
      return;
    }
    this.table()?.nextPage();
  }
}
