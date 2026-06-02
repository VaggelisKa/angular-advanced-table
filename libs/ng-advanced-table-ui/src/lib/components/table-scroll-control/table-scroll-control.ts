import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { formatNatTableAccessibilityNumber } from '../../shared/table-ui.helpers';
import { mergeScrollControlLabels, NAT_TABLE_UI_INTL } from '../../shared/table-ui-intl';
import type {
  NatTableAccessibilityScrollControlLabels,
  NatTableAccessibilityScrollControlPositionContext,
  NatTableUiController,
} from '../../shared/table-ui.types';

const DEFAULT_SCROLL_STEP = 240;

@Component({
  selector: 'nat-table-scroll-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-scroll-control.html',
  styleUrl: './table-scroll-control.css',
})
export class NatTableScrollControl<TData extends RowData = RowData> {
  readonly for = input.required<NatTableUiController<TData>>();
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly scrollStep = input(DEFAULT_SCROLL_STEP, { transform: numberAttribute });
  readonly accessibilityLabels = input<NatTableAccessibilityScrollControlLabels | undefined>(
    undefined,
  );

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tableUiIntl = inject(NAT_TABLE_UI_INTL);
  private readonly scrollContainer = signal<HTMLElement | null>(null);
  private cleanupScrollTarget: (() => void) | null = null;

  protected readonly tableElementId = computed(() => this.for().tableElementId());
  protected readonly scrollLeft = signal(0);
  protected readonly maxScrollLeft = signal(0);
  protected readonly canScroll = computed(() => this.maxScrollLeft() > 0);
  protected readonly canScrollLeft = computed(() => this.scrollLeft() > 0);
  protected readonly canScrollRight = computed(() => this.scrollLeft() < this.maxScrollLeft());
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergeScrollControlLabels(
      this.tableUiIntl.scrollControl?.accessibilityLabels,
      this.accessibilityLabels(),
    ),
  );
  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return (
      labels.groupAriaLabel ??
      this.ariaLabel() ??
      this.tableUiIntl.scrollControl?.ariaLabel ??
      'Table horizontal scroll'
    );
  });
  protected readonly scrollLeftAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.scrollLeftAriaLabel ?? 'Scroll table left';
  });
  protected readonly scrollRightAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.scrollRightAriaLabel ?? 'Scroll table right';
  });
  protected readonly scrollPositionAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.scrollPositionAriaLabel ?? 'Horizontal scroll position';
  });
  protected readonly positionText = computed(() => {
    const labels = this.resolvedAccessibilityLabels();
    const scrollLeft = this.scrollLeft();
    const maxScrollLeft = this.maxScrollLeft();
    const percentage = maxScrollLeft ? Math.round((scrollLeft / maxScrollLeft) * 100) : 0;
    const context: NatTableAccessibilityScrollControlPositionContext = {
      scrollLeftValue: scrollLeft,
      scrollLeftText: formatNatTableAccessibilityNumber(scrollLeft, this.tableUiIntl.formatNumber),
      maxScrollLeftValue: maxScrollLeft,
      maxScrollLeftText: formatNatTableAccessibilityNumber(
        maxScrollLeft,
        this.tableUiIntl.formatNumber,
      ),
      percentageValue: percentage,
      percentageText: formatNatTableAccessibilityNumber(percentage, this.tableUiIntl.formatNumber),
    };

    return labels.scrollPositionText?.(context) ?? `${context.percentageText}% scrolled`;
  });
  private readonly sanitizedScrollStep = computed(() => {
    const step = Math.trunc(this.scrollStep());

    return step > 0 ? step : DEFAULT_SCROLL_STEP;
  });

  constructor() {
    afterRenderEffect(() => {
      const controller = this.for();
      const container =
        controller.tableScrollContainer?.() ??
        this.resolveScrollContainer(controller.tableElementId());

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

    const update = () => this.updateMetrics();
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);

    container.addEventListener('scroll', update, { passive: true });
    resizeObserver?.observe(container);
    if (container.firstElementChild instanceof HTMLElement) {
      resizeObserver?.observe(container.firstElementChild);
    }

    this.cleanupScrollTarget = () => {
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
