import type { ElementRef, Signal } from '@angular/core';
import { Component, DestroyRef, Injector, afterNextRender, computed, inject, input, viewChild } from '@angular/core';

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
  private readonly injector = inject(Injector);
  private readonly previousButton = viewChild<ElementRef<HTMLButtonElement>>('previousButton');
  private readonly nextButton = viewChild<ElementRef<HTMLButtonElement>>('nextButton');

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
  protected readonly pageIndex = computed(() => this.table()?.getState().pagination.pageIndex ?? 0);
  protected readonly pageCount = computed(() => Math.max(1, this.table()?.getPageCount() ?? 0));
  protected readonly currentPage = computed(() => this.pageIndex() + 1);
  protected readonly canPreviousPage = computed(() => this.table()?.getCanPreviousPage() ?? false);
  protected readonly canNextPage = computed(() => this.table()?.getCanNextPage() ?? false);
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

    this.keepFocusOnBoundary(this.previousButton, this.nextButton);
    this.table()?.previousPage();
  }

  protected nextPage(): void {
    if (!this.canNextPage()) {
      return;
    }

    this.keepFocusOnBoundary(this.nextButton, this.previousButton);
    this.table()?.nextPage();
  }

  /**
   * Reaching the first or last page disables the button that was just
   * activated, and a disabled button drops focus to `<body>`. When the
   * activated button held focus, hand it to the surviving sibling once the
   * new page has rendered, so keyboard users stay in the pager.
   */
  private keepFocusOnBoundary(
    source: Signal<ElementRef<HTMLButtonElement> | undefined>,
    sibling: Signal<ElementRef<HTMLButtonElement> | undefined>
  ): void {
    const sourceButton = source()?.nativeElement;

    if (!sourceButton?.isSameNode(sourceButton.ownerDocument.activeElement)) {
      return;
    }

    afterNextRender(
      {
        write: () => {
          const siblingButton = sibling()?.nativeElement;
          const activeElement = sourceButton.ownerDocument.activeElement;
          const focusLost =
            activeElement === sourceButton || activeElement === null || activeElement === sourceButton.ownerDocument.body;

          if (sourceButton.disabled && focusLost && siblingButton && !siblingButton.disabled) {
            siblingButton.focus();
          }
        }
      },
      { injector: this.injector }
    );
  }
}
