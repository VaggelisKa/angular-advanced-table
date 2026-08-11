import { DestroyRef, Injectable, inject, signal, untracked } from '@angular/core';

import type { NatTableVirtualScrollGridContext } from '../common/virtual-scroll-internals.type';
import { isRowIndexMounted } from '../utils/row-window-indexes.util';
import {
  computeStickyOcclusionPx,
  focusMountedRowCell,
  measureStickyHeaderOverlayHeight,
  resolveBodyRowIndex,
  resolveCellPositionInRow,
  resolveVerticalNavigationTarget
} from '../utils/virtual-scroll-keyboard.util';

/** Frames to wait for a scrolled-to row to mount before giving up a focus handover. */
const FOCUS_HANDOVER_FRAME_BUDGET = 20;

/**
 * Grid-focus concerns the CDK engine cannot know about.
 *
 * Tracks which body row owns the aria grid's roving focus (so the directive
 * can keep that row mounted), takes over vertical keys whose target row is
 * not in the DOM yet — pre-scrolling and handing focus over once the row
 * mounts — and nudges rows revealed under the sticky header clear of it.
 *
 * The keydown listener runs in the capture phase so unmounted-target moves
 * are settled before the aria grid's own positional navigation sees the
 * event; mounted-target moves are left entirely to the grid.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to the NatTableVirtualScroll directive.
@Injectable()
export class NatTableVirtualScrollGridFocus {
  private readonly destroyRef = inject(DestroyRef);
  private context: NatTableVirtualScrollGridContext | null = null;

  /** Body index of the row owning the grid's roving focus, if any. */
  public readonly focusedRowIndex = signal<number | null>(null);
  private readonly focusedRowId = signal<string | null>(null);

  /** Wires the service to the live grid and starts the capture-phase keydown takeover. */
  public connect(context: NatTableVirtualScrollGridContext): void {
    const listener = (event: KeyboardEvent): void => this.onKeydownCapture(event);

    this.context = context;
    context.hostElement.addEventListener('keydown', listener, true);
    this.destroyRef.onDestroy(() => context.hostElement.removeEventListener('keydown', listener, true));
  }

  /** Host `focusin`: pin the focused body row (or clear when focus sits outside the data rows). */
  public trackFocusIn(target: EventTarget | null): void {
    const context = this.context;

    if (!context || !(target instanceof Element)) {
      return;
    }

    const focusedRowIndex = resolveBodyRowIndex(target, untracked(context.headerRowCount));

    this.focusedRowIndex.set(focusedRowIndex);
    this.focusedRowId.set(focusedRowIndex === null ? null : (untracked(context.rowIds)[focusedRowIndex] ?? null));
  }

  /** Host `focusout`: release the pin once focus leaves the table entirely. */
  public trackFocusOut(relatedTarget: EventTarget | null): void {
    if (!(relatedTarget instanceof Node) || !this.context?.hostElement.contains(relatedTarget)) {
      this.releasePin();
    }
  }

  /** Drops the pin without waiting for a focus event (row-model resets). */
  public releasePin(): void {
    this.focusedRowIndex.set(null);
    this.focusedRowId.set(null);
  }

  /** Restores focus by stable row identity after sorting, filtering, paging, or data replacement. */
  public restoreAfterRowModelChange(): void {
    const context = this.context;
    const focusedRowId = untracked(this.focusedRowId);

    const nextRowIndex = context && focusedRowId !== null ? untracked(context.rowIds).indexOf(focusedRowId) : -1;

    if (context && nextRowIndex >= 0) {
      this.focusedRowIndex.set(nextRowIndex);
      context.scrollToIndex(nextRowIndex);

      return;
    }

    this.releasePin();
    context?.scrollToIndex(0);
  }

  private onKeydownCapture(event: KeyboardEvent): void {
    const context = this.context;
    const target = event.target;

    // Cell-level navigation only; widgets inside cells keep their own keys.
    if (!context || !(target instanceof Element) || !target.matches('[role="gridcell"], [role="rowheader"], [role="columnheader"]')) {
      return;
    }

    const headerRowCount = untracked(context.headerRowCount);
    const isPageMove = event.key === 'PageUp' || event.key === 'PageDown';
    const isLogicalEnd = event.key === 'End' && (event.ctrlKey || event.metaKey);
    const pageSize = isPageMove
      ? Math.max(
          1,
          Math.floor((context.region.clientHeight - measureStickyHeaderOverlayHeight(context.region)) / untracked(context.rowHeight))
        )
      : 1;
    const targetIndex = resolveVerticalNavigationTarget(
      event,
      resolveBodyRowIndex(target, headerRowCount),
      untracked(context.rowCount),
      pageSize
    );

    if (targetIndex === null) {
      return;
    }

    if (isPageMove || !isRowIndexMounted(untracked(context.renderedRowIndexes), targetIndex)) {
      event.preventDefault();
      event.stopPropagation();
      context.scrollToIndex(targetIndex);
      this.handOverFocusWhenMounted(
        headerRowCount + targetIndex + 1,
        isLogicalEnd ? Number.MAX_SAFE_INTEGER : resolveCellPositionInRow(target)
      );

      return;
    }

    if (event.key === 'ArrowUp') {
      // The grid will move focus natively; the browser's minimal reveal can
      // leave the row under the sticky header, so nudge it clear afterwards.
      requestAnimationFrame(() => this.revealFocusedRowBelowStickyHeader());
    }
  }

  private handOverFocusWhenMounted(ariaRowIndex: number, cellPosition: number, framesLeft = FOCUS_HANDOVER_FRAME_BUDGET): void {
    const region = this.context?.region;

    if (!region || focusMountedRowCell(region, ariaRowIndex, cellPosition) || framesLeft <= 0) {
      return;
    }

    requestAnimationFrame(() => this.handOverFocusWhenMounted(ariaRowIndex, cellPosition, framesLeft - 1));
  }

  private revealFocusedRowBelowStickyHeader(): void {
    const region = this.context?.region;
    const active = region?.ownerDocument.activeElement;

    if (!region || !active || !region.contains(active)) {
      return;
    }

    const overlayHeight = measureStickyHeaderOverlayHeight(region);

    if (overlayHeight <= 0) {
      return;
    }

    const occlusion = computeStickyOcclusionPx(active, region, overlayHeight);

    if (occlusion > 0) {
      region.scrollTop -= occlusion;
    }
  }
}
