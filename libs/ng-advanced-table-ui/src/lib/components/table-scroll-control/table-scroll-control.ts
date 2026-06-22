/* eslint-disable max-lines */
import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, afterRenderEffect, computed, inject, input, numberAttribute, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  mergeScrollControlLabels,
  resolveNatTableUiIntl
} from '../../shared/table-ui-intl';
import { formatNatTableAccessibilityNumber } from '../../shared/table-ui.helpers';
import type {
  NatTableAccessibilityScrollControlLabels,
  NatTableAccessibilityScrollControlPositionContext
} from '../../shared/table-ui.types';
import { NatTableService } from '../../shared/table.service';

const DEFAULT_SCROLL_STEP = 240;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

@Component({
  selector: 'nat-table-scroll-control',
  templateUrl: './table-scroll-control.html',
  styleUrl: './table-scroll-control.css'
})
export class NatTableScrollControl<TData extends RowData = RowData> {
  public readonly locale = input<string | undefined>(undefined);
  public readonly groupAriaLabel = input<string | undefined>(undefined);
  public readonly scrollStep = input(DEFAULT_SCROLL_STEP, { transform: numberAttribute });
  public readonly accessibilityLabels = input<NatTableAccessibilityScrollControlLabels | undefined>(undefined);

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  protected readonly controller = computed(() => this.natTableService.controller());

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);

  private readonly localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE);

  private readonly tableUiIntl = computed(() => resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()));

  private readonly scrollContainer = signal<HTMLElement | null>(null);
  private cleanupScrollTarget: (() => void) | null = null;

  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? '');
  protected readonly scrollLeft = signal(0);
  protected readonly maxScrollLeft = signal(0);
  protected readonly canScroll = computed(() => this.maxScrollLeft() > 0);
  protected readonly canScrollLeft = computed(() => this.scrollLeft() > 0);
  protected readonly canScrollRight = computed(() => this.scrollLeft() < this.maxScrollLeft());
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergeScrollControlLabels(this.tableUiIntl().scrollControl?.accessibilityLabels, this.accessibilityLabels())
  );

  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return this.groupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().scrollControl?.groupAriaLabel ?? '';
  });

  protected readonly scrollLeftAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.scrollLeftAriaLabel ?? '';
  });

  protected readonly scrollRightAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.scrollRightAriaLabel ?? '';
  });

  protected readonly scrollPositionAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.scrollPositionAriaLabel ?? '';
  });

  protected readonly positionText = computed(() => {
    const labels = this.resolvedAccessibilityLabels();
    const scrollLeft = this.scrollLeft();
    const maxScrollLeft = this.maxScrollLeft();
    const percentage = maxScrollLeft ? Math.round((scrollLeft / maxScrollLeft) * 100) : 0;
    const context: NatTableAccessibilityScrollControlPositionContext = {
      scrollLeftValue: scrollLeft,
      scrollLeftText: formatNatTableAccessibilityNumber(scrollLeft, this.tableUiIntl().formatNumber, undefined, this.localeId()),
      maxScrollLeftValue: maxScrollLeft,
      maxScrollLeftText: formatNatTableAccessibilityNumber(maxScrollLeft, this.tableUiIntl().formatNumber, undefined, this.localeId()),
      percentageValue: percentage,
      percentageText: formatNatTableAccessibilityNumber(percentage, this.tableUiIntl().formatNumber, undefined, this.localeId())
    };

    return labels.scrollPositionText?.(context) ?? '';
  });

  private readonly sanitizedScrollStep = computed(() => {
    const step = Math.trunc(this.scrollStep());

    return step > 0 ? step : DEFAULT_SCROLL_STEP;
  });

  public constructor() {
    afterRenderEffect(() => {
      const controller = this.controller();

      if (!controller) {
        this.setScrollContainer(null);

        return;
      }
      const container = controller.tableScrollContainer?.() ?? this.resolveScrollContainer(controller.tableElementId());

      this.setScrollContainer(container);
    });
    this.destroyRef.onDestroy(() => this.cleanupScrollTarget?.());
  }

  protected scrollByStep(direction: -1 | 1): void {
    this.setScrollLeft(this.scrollLeft() + direction * this.sanitizedScrollStep());
  }

  protected onRangeInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const nextScrollLeft = Number(target.value);

    if (Number.isFinite(nextScrollLeft)) {
      this.setScrollLeft(nextScrollLeft);
    }
  }

  private setScrollContainer(container: HTMLElement | null): void {
    if (container === this.scrollContainer()) {
      this.updateMetrics();

      return;
    }

    this.cleanupScrollTarget?.();
    this.cleanupScrollTarget = null;
    this.scrollContainer.set(container);

    if (!container) {
      this.scrollLeft.set(0);
      this.maxScrollLeft.set(0);

      return;
    }

    const update = (): void => this.updateMetrics();
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);

    container.addEventListener('scroll', update, { passive: true });
    resizeObserver?.observe(container);

    if (container.firstElementChild instanceof HTMLElement) {
      resizeObserver?.observe(container.firstElementChild);
    }

    this.cleanupScrollTarget = (): void => {
      container.removeEventListener('scroll', update);
      resizeObserver?.disconnect();
    };
    this.updateMetrics();
  }

  private setScrollLeft(value: number): void {
    const container = this.scrollContainer();

    if (!container) {
      return;
    }

    const nextScrollLeft = clamp(Math.round(value), 0, this.maxScrollLeft());

    container.scrollLeft = nextScrollLeft;

    if (typeof container.scrollTo === 'function') {
      container.scrollTo({ left: nextScrollLeft, behavior: 'auto' });
    }

    this.updateMetrics();
  }

  private updateMetrics(): void {
    const container = this.scrollContainer();

    if (!container) {
      this.scrollLeft.set(0);
      this.maxScrollLeft.set(0);

      return;
    }

    const maxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);
    const scrollLeft = clamp(Math.round(container.scrollLeft), 0, maxScrollLeft);

    this.maxScrollLeft.set(maxScrollLeft);
    this.scrollLeft.set(scrollLeft);
  }

  private resolveScrollContainer(tableElementId: string): HTMLElement | null {
    const table = this.document.getElementById(tableElementId);

    return table?.parentElement ?? null;
  }
}
