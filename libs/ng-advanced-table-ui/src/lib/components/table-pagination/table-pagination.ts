import { Component, computed, inject, input, DestroyRef } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { NatTableToolbar } from '../table-toolbar/table-toolbar';
import { NatToolbarGroup } from '../table-toolbar/toolbar-group/toolbar-group';
import { NatToolbarItem } from '../table-toolbar/toolbar-item/toolbar-item.directive';
import { NatTableService } from '../../shared/table.service';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  formatNatTableAccessibilityNumber,
  sanitizePageSizeOptions,
} from '../../shared/table-ui.helpers';
import {
  mergePageSizeLabels,
  mergePagerLabels,
  NAT_TABLE_UI_INTL,
  NAT_TABLE_UI_ENGLISH_LOCALE,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';
import type {
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPageSizeOptionContext,
  NatTableAccessibilityPagerLabels,
} from '../../shared/table-ui.types';

interface PageSizeOption {
  pageSize: number;
  text: string;
  ariaLabel: string;
}

@Component({
  selector: 'nat-table-pagination',
  imports: [NatTableToolbar, NatToolbarGroup, NatToolbarItem],
  templateUrl: './table-pagination.html',
  styleUrl: './table-pagination.css',
})
export class NatTablePagination<TData extends RowData = RowData> {
  readonly locale = input<string | undefined>(undefined);
  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  readonly pageSizeGroupAriaLabel = input<string | undefined>(undefined);
  readonly pageSizeAccessibilityLabels = input<NatTableAccessibilityPageSizeLabels | undefined>(
    undefined,
  );
  readonly pagerGroupAriaLabel = input<string | undefined>(undefined);
  readonly pagerAccessibilityLabels = input<NatTableAccessibilityPagerLabels | undefined>(
    undefined,
  );

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

  // Page Size Logic
  protected readonly selectedPageSize = computed(
    () => this.table()?.getState().pagination.pageSize ?? 0,
  );
  private readonly resolvedPageSizeAccessibilityLabels = computed(() =>
    mergePageSizeLabels(
      this.tableUiIntl().pageSize?.accessibilityLabels,
      this.pageSizeAccessibilityLabels(),
    ),
  );
  protected readonly resolvedPageSizeAriaLabel = computed(() => {
    const labels = this.resolvedPageSizeAccessibilityLabels();
    return (
      this.pageSizeGroupAriaLabel() ??
      labels.groupAriaLabel ??
      this.tableUiIntl().pageSize?.groupAriaLabel ??
      ''
    );
  });
  protected readonly resolvedPageSizeOptions = computed<PageSizeOption[]>(() => {
    const labels = this.resolvedPageSizeAccessibilityLabels();
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

  // Pager Logic
  protected readonly pageIndex = computed(() => this.table()?.getState().pagination.pageIndex ?? 0);
  protected readonly pageCount = computed(() => this.table()?.getPageCount() || 1);
  protected readonly currentPage = computed(() => this.pageIndex() + 1);
  protected readonly canPreviousPage = computed(() => this.table()?.getCanPreviousPage() ?? false);
  protected readonly canNextPage = computed(() => this.table()?.getCanNextPage() ?? false);
  private readonly resolvedPagerAccessibilityLabels = computed(() =>
    mergePagerLabels(
      this.tableUiIntl().pager?.accessibilityLabels,
      this.pagerAccessibilityLabels(),
    ),
  );
  protected readonly resolvedPagerAriaLabel = computed(() => {
    const labels = this.resolvedPagerAccessibilityLabels();
    return (
      this.pagerGroupAriaLabel() ??
      labels.groupAriaLabel ??
      this.tableUiIntl().pager?.groupAriaLabel ??
      ''
    );
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
    this.table()?.previousPage();
  }

  protected nextPage(): void {
    if (!this.canNextPage()) {
      return;
    }
    this.table()?.nextPage();
  }
}
