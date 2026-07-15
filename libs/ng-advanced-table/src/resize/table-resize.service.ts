import { Injectable, computed, effect, inject, signal } from '@angular/core';

import type { Column, Header, RowData } from '@tanstack/angular-table';

import { NatTableA11yService } from '../domain-logic/table-a11y.service';
import { NatTableState } from '../domain-logic/table.state';
import { canResizeColumn } from '../utils/interaction.util';

/**
 * Per-table service that manages column-resize DOM interactions.
 *
 * Owns the resize guide position state, pointer resize-start coordination,
 * and keyboard resize delegation. The `NatTable` component keeps the template
 * event bindings and delegates to methods on this service.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance service, provided by NatTable (providers: [...]), not root.
@Injectable()
export class NatTableResizeService<TData extends RowData = RowData> {
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private readonly a11yService = inject<NatTableA11yService<TData>>(NatTableA11yService);

  /** Pixel offset of the dragged column's resize edge within the scrollable region content box. */
  private readonly resizeGuideOrigin = signal<number | null>(null);

  /** True when the column being resized is pinned (sticky), so the guide must compensate for scroll. */
  private readonly resizeGuidePinned = signal(false);

  /** `region.scrollLeft` captured at drag start, the baseline for the pinned-guide scroll compensation. */
  private readonly resizeStartScrollLeft = signal(0);

  /** Live `region.scrollLeft`, updated by the scroll listener while a drag is active. */
  private readonly regionScrollLeft = signal(0);

  public constructor() {
    // A sticky (pinned) column edge stays viewport-fixed on horizontal scroll, but the
    // absolutely-positioned guide scrolls with the content — so mid-drag scroll drifts the
    // guide off the edge (#289). The guide recomputes on every pointer move, but a pure
    // wheel/trackpad scroll fires no pointer event, so feed scrollLeft in as a signal to
    // drive the recompute. Only written while resizing, to avoid change-detection churn on idle scroll.
    effect((onCleanup) => {
      const region = this.state.tableRegionRef()?.nativeElement;

      if (!region) return;

      const onScroll = (): void => {
        if (this.isColumnResizing()) this.regionScrollLeft.set(region.scrollLeft);
      };

      region.addEventListener('scroll', onScroll, { passive: true });
      onCleanup(() => region.removeEventListener('scroll', onScroll));
    });
  }

  /** Full-height drag guide position: column edge + live drag delta, or null when idle. */
  public readonly columnResizeGuide = computed<{ readonly left: number; readonly offset: number } | null>(() => {
    const info = this.state.table.getState().columnSizingInfo;
    const origin = this.resizeGuideOrigin();
    const resizingId = info.isResizingColumn;

    if (resizingId === false || origin === null) return null;

    // For a pinned (sticky) column the edge is viewport-fixed; cancel the guide's own scroll
    // translation so it stays glued to that edge. Center columns scroll with the content and
    // already track, so their origin stays in content space untouched.
    const left = this.resizeGuidePinned() ? origin + (this.regionScrollLeft() - this.resizeStartScrollLeft()) : origin;

    const widthDelta = info.deltaOffset ?? 0;
    const column = this.state.table.getColumn(resizingId);

    if (!column) return { left, offset: widthDelta };

    const { min, max } = this.state.getResizeFitBounds(column);
    const startSize = info.startSize ?? this.state.getColumnEffectiveWidth(column);
    const clampedDelta = Math.max(min - startSize, max !== null ? Math.min(max - startSize, widthDelta) : widthDelta);

    return {
      left,
      offset: this.state.resolvedDirection() === 'rtl' ? -clampedDelta : clampedDelta
    };
  });

  /** True while a pointer/touch column-resize drag is in progress. */
  public readonly isColumnResizing = computed(() => this.state.table.getState().columnSizingInfo.isResizingColumn !== false);

  /**
   * Start a pointer/touch column resize.
   * Called by the component's template `(mousedown)` / `(touchstart)` handler.
   */
  public startResize(event: MouseEvent | TouchEvent, header: Header<TData, unknown>): void {
    if (!canResizeColumn(header, this.state.resizingEnabled())) return;

    event.stopPropagation();
    this.state.clearResizeCommit();
    this.state.seedColumnSizingFromMeasuredWidth(header.column);
    this.captureGuideOrigin(event, header);
    header.getResizeHandler()(event);
    this.state.resizeSeedSizing.set({});
  }

  /**
   * Resize a column from a keyboard event (Alt+Arrow).
   * Called by the component's header keydown handler.
   */
  public resizeFromKey(event: KeyboardEvent, column: Column<TData, unknown>): void {
    const result = this.state.resizeColumnFromKey(event, column);

    if (result) {
      this.a11yService.announceColumnResize(column, result.width);
    }
  }

  private captureGuideOrigin(event: MouseEvent | TouchEvent, header: Header<TData, unknown>): void {
    const region = this.state.tableRegionRef()?.nativeElement;
    const handle = event.currentTarget as HTMLElement | null;

    if (!region || !handle) {
      this.resizeGuideOrigin.set(null);

      return;
    }

    const regionRect = region.getBoundingClientRect();
    const handleRect = handle.getBoundingClientRect();
    const edge = this.state.resolvedDirection() === 'rtl' ? handleRect.left : handleRect.right;
    const scrollLeft = region.scrollLeft;

    this.resizeGuidePinned.set(header.column.getIsPinned() !== false);
    this.resizeStartScrollLeft.set(scrollLeft);
    this.regionScrollLeft.set(scrollLeft);
    this.resizeGuideOrigin.set(edge - regionRect.left + scrollLeft);
  }
}
