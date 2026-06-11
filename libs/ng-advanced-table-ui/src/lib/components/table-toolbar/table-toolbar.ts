import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import type { RowData } from '@tanstack/angular-table';
import { Directionality } from '@angular/cdk/bidi';

import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';
import { injectNatTableUiController } from '../../shared/resolve-ui-controller';
import type { NatTableUiController } from '../../shared/table-ui.types';
import {
  NAT_TABLE_TOOLBAR,
  NAT_TOOLBAR_ITEM,
  NAT_TOOLBAR_MORE_BUTTON_ID,
} from './common/toolbar-tokens.const';
import type { NatTableToolbarRef, NatToolbarItemRef } from './common/toolbar-tokens.type';
import type { NatToolbarFitResult } from './common/toolbar-fit.type';
import { fitNatToolbarItems } from './utils/toolbar-fit.util';
import {
  buildNatToolbarFocusStops,
  findNatToolbarHiddenFocusedItem,
  resolveNatToolbarNavigationTarget,
} from './utils/toolbar-focus.util';
import { NatToolbarOverflowMenu } from './toolbar-overflow-menu/toolbar-overflow-menu';

const EMPTY_HIDDEN_IDS: ReadonlySet<string> = new Set<string>();

const NAT_TOOLBAR_TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
]);

/** True when the event target owns a text caret — toolbar keys must not steal it. */
const isNatToolbarTextEntryElement = (target: EventTarget | null): boolean => {
  if (target instanceof HTMLTextAreaElement) {
    return true;
  }

  if (target instanceof HTMLElement && target.isContentEditable) {
    return true;
  }

  return target instanceof HTMLInputElement && NAT_TOOLBAR_TEXT_INPUT_TYPES.has(target.type);
};

/** Width reserved for the More button until the overflow menu reports a measurement. */
const MORE_BUTTON_WIDTH_ESTIMATE = 40;

@Component({
  selector: 'nat-table-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-toolbar.html',
  styleUrl: './table-toolbar.css',
  imports: [NatToolbarOverflowMenu],
  providers: [{ provide: NAT_TABLE_TOOLBAR, useExisting: NatTableToolbar }],
  host: {
    role: 'toolbar',
    'aria-orientation': 'horizontal',
    '[attr.aria-label]': 'resolvedAccessibleName()',
    '[attr.aria-controls]': 'ariaControls()',
    '(focusout)': 'onFocusOut($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NatTableToolbar<TData extends RowData = RowData> implements NatTableToolbarRef {
  readonly for = input<NatTableUiController<TData> | undefined>(undefined);
  readonly accessibleName = input<string | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);

  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly controller = injectNatTableUiController(this.for, 'nat-table-toolbar');
  private readonly directionality = inject(Directionality);
  private readonly document = inject(DOCUMENT);

  protected readonly items = contentChildren(NAT_TOOLBAR_ITEM, { descendants: true });

  private readonly containerWidthSignal = signal(0);
  private readonly gapSignal = signal(0);
  private readonly widthByItemSignal = signal<ReadonlyMap<string, number>>(new Map());
  private readonly moreButtonWidthSignal = signal(MORE_BUTTON_WIDTH_ESTIMATE);
  private readonly focusWithinItemIdSignal = signal<string | null>(null);
  /**
   * Last item id that had focus inside the toolbar. Unlike `focusWithinItemIdSignal`,
   * this is NOT cleared by focusout — it persists so `rescueFocusFromHidden` can
   * identify the item that was focused even when display:none auto-blurs it in
   * the same CD pass that updates hiddenIds.
   */
  private lastFocusedItemId: string | null = null;

  private readonly overflowMenuRef = viewChild.required(NatToolbarOverflowMenu, {
    read: ElementRef,
  });

  private moreButtonElement: HTMLElement | null = null;
  private pendingMeasureFrame: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private readonly observedElements = new Set<HTMLElement>();

  protected readonly localeId = computed(
    () => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );
  protected readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );
  protected readonly resolvedAccessibleName = computed(
    () => this.accessibleName() ?? this.tableUiIntl().toolbar?.toolbarLabel ?? null,
  );
  protected readonly ariaControls = computed(() => this.controller()?.tableElementId() ?? null);

  readonly containerWidth = this.containerWidthSignal.asReadonly();

  private readonly fitResult = computed<NatToolbarFitResult>(() => {
    const containerWidth = this.containerWidthSignal();
    const items = this.items();

    // fitNatToolbarItems does not handle width 0 (hidden tab) — skip the pass.
    if (containerWidth === 0 || items.length === 0) {
      return { hiddenIds: EMPTY_HIDDEN_IDS, moreVisible: false };
    }

    const widths = this.widthByItemSignal();
    const focusWithinItemId = this.focusWithinItemIdSignal();

    return fitNatToolbarItems({
      containerWidth,
      gap: this.gapSignal(),
      moreButtonWidth: this.moreButtonWidthSignal(),
      items: items.map((item, domIndex) => ({
        id: item.id,
        width: widths.get(item.id) ?? 0,
        position: item.position(),
        overflowMode: item.effectiveOverflowMode(),
        priority: item.effectivePriority(),
        domIndex,
        focused: item.id === focusWithinItemId,
      })),
    });
  });

  readonly hiddenIds = computed(() => this.fitResult().hiddenIds);
  /**
   * Drives the More button rendered by the internal overflow menu (section C,
   * wired into this template by Task G2). PUBLIC and derived from the fit
   * result — B2's focus-stop builder and G2's integration specs consume it;
   * later sections must not redefine it.
   */
  readonly moreVisible = computed(() => this.fitResult().moreVisible);

  private readonly activeItemIdSignal = signal<string | null>(null);

  private readonly focusStops = computed(() =>
    buildNatToolbarFocusStops(
      this.items().map((item) => ({ id: item.id, position: item.position() })),
      this.hiddenIds(),
      this.moreVisible(),
    ),
  );

  readonly activeItemId = computed<string | null>(() => {
    const stops = this.focusStops();
    const requested = this.activeItemIdSignal();

    if (requested !== null && stops.includes(requested)) {
      return requested;
    }

    return stops[0] ?? null;
  });

  /**
   * Tab stop for the More button. Single owner of this value — the overflow
   * menu reflects it onto its `.more-button` element (sections C/G2).
   */
  readonly moreButtonTabIndex = computed<0 | -1>(() =>
    this.activeItemId() === NAT_TOOLBAR_MORE_BUTTON_ID ? 0 : -1,
  );

  private readonly warnedNonDirectChildIds = new Set<string>();

  constructor() {
    let previousHiddenIds: ReadonlySet<string> = EMPTY_HIDDEN_IDS;

    effect(() => {
      const items = this.items();

      untracked(() => this.syncObservedItems(items));
    });

    effect(() => {
      const hiddenIds = this.hiddenIds();

      untracked(() => {
        for (const item of this.items()) {
          const isHidden = hiddenIds.has(item.id);

          if (previousHiddenIds.has(item.id) !== isHidden) {
            item.notifyOverflowChange(isHidden);
          }
        }
      });

      previousHiddenIds = hiddenIds;
    });

    afterNextRender(() => {
      // jsdom guard: vitest specs run without ResizeObserver; real measurement
      // behavior is covered by the Playwright section.
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      this.resizeObserver = new ResizeObserver(() => this.scheduleMeasure());
      this.resizeObserver.observe(this.elementRef.nativeElement);
      this.syncObservedItems(this.items());
      this.scheduleMeasure();
    });

    afterNextRender(() => {
      // Single More-button seam: width measurement (B1), focus rescue and
      // arrow navigation (B2) all read the element stored here.
      const menuHost = this.overflowMenuRef().nativeElement as HTMLElement;

      this.registerMoreButtonElement(menuHost.querySelector<HTMLElement>('.more-button'));
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();

      if (this.pendingMeasureFrame !== null) {
        cancelAnimationFrame(this.pendingMeasureFrame);
      }
    });

    effect(() => {
      const hiddenIds = this.hiddenIds();

      untracked(() => this.rescueFocusFromHidden(hiddenIds));
    });

    if (isDevMode()) {
      effect(() => {
        const host = this.elementRef.nativeElement;

        for (const item of this.items()) {
          if (
            item.element.parentElement === host ||
            this.warnedNonDirectChildIds.has(item.id)
          ) {
            continue;
          }

          this.warnedNonDirectChildIds.add(item.id);
          console.error(
            `[ng-advanced-table-ui] nat-table-toolbar: item "${item.id}" is ` +
              `not a direct child of the toolbar row. Flex order, measurement, ` +
              `and overflow hiding only apply to direct children — remove the ` +
              `wrapper element or move natToolbarItem onto it.`,
          );
        }
      });
    }
  }

  /**
   * Single focus registrar (locked NatTableToolbarRef member): moves the
   * roving tab stop AND pins the item visible for the fit pass. B1's
   * `onFocusOut` clears only the pin — the roving position survives focus
   * leaving the toolbar.
   */
  registerFocus(itemId: string): void {
    this.activeItemIdSignal.set(itemId);
    this.focusWithinItemIdSignal.set(itemId);
    this.lastFocusedItemId = itemId;
  }

  /** Registers the More button so its live width replaces the reservation estimate. */
  registerMoreButtonElement(element: HTMLElement | null): void {
    if (this.moreButtonElement !== null) {
      this.resizeObserver?.unobserve(this.moreButtonElement);
      this.observedElements.delete(this.moreButtonElement);
    }

    this.moreButtonElement = element;

    if (element !== null && this.resizeObserver !== null) {
      this.resizeObserver.observe(element);
      this.observedElements.add(element);
      this.scheduleMeasure();
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;

    if (next instanceof Node && this.elementRef.nativeElement.contains(next)) {
      return;
    }

    this.focusWithinItemIdSignal.set(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    if (isNatToolbarTextEntryElement(event.target)) {
      return;
    }

    const targetId = resolveNatToolbarNavigationTarget(
      this.focusStops(),
      this.activeItemId(),
      event.key,
      this.directionality.value === 'rtl',
    );

    if (targetId === null) {
      return;
    }

    event.preventDefault();
    this.focusStopById(targetId);
  }

  private focusStopById(stopId: string): void {
    if (stopId === NAT_TOOLBAR_MORE_BUTTON_ID) {
      // B1's field, populated via registerMoreButtonElement (Task G2 wires the
      // overflow menu's button into it; null until then, so this branch is a
      // no-op in these specs — stops only include the More id once items hide).
      this.moreButtonElement?.focus();
    } else {
      this.items()
        .find((item) => item.id === stopId)
        ?.focus();
    }

    this.registerFocus(stopId);
  }

  /**
   * Safety net behind the fit engine's focused-item pin: if an item hides
   * while containing focus (e.g. switched to overflow 'always' at runtime),
   * focus jumps to the More button instead of dropping to <body>.
   *
   * Checks both live `document.activeElement` AND `lastFocusedItemId` to
   * handle the race where the browser auto-blurs an element the instant it
   * becomes display:none (same CD pass that updates hiddenIds).
   */
  private rescueFocusFromHidden(hiddenIds: ReadonlySet<string>): void {
    const items = this.items();

    // Primary check: live DOM active element (handles all normal cases).
    let focusedHidden = findNatToolbarHiddenFocusedItem(
      items,
      hiddenIds,
      this.document.activeElement,
    );

    // Fallback: the plain-field tracked focused item id covers the race where
    // display:none fires in the same CD pass and auto-blurs the element before
    // this effect can read document.activeElement. Unlike focusWithinItemIdSignal,
    // this field is NOT cleared by onFocusOut so it survives the auto-blur.
    if (focusedHidden === null) {
      const lastId = this.lastFocusedItemId;

      if (lastId !== null && hiddenIds.has(lastId)) {
        focusedHidden = items.find((item) => item.id === lastId) ?? null;
      }
    }

    if (focusedHidden === null) {
      return;
    }

    // B1's field — populated once Task G2 registers the overflow menu's button.
    const moreButton = this.moreButtonElement;

    if (moreButton === null) {
      return;
    }

    moreButton.focus();

    // Guard for the case where the More button's parent container is still
    // display:none when this effect fires (e.g. the overflow menu host binding
    // updates in the same CD pass but AFTER effects run). If focus didn't land,
    // retry once after the browser's next paint.
    if (this.document.activeElement !== moreButton) {
      requestAnimationFrame(() => {
        moreButton.focus();
      });
    }

    this.registerFocus(NAT_TOOLBAR_MORE_BUTTON_ID);
  }

  private scheduleMeasure(): void {
    if (this.pendingMeasureFrame !== null) {
      return;
    }

    this.pendingMeasureFrame = requestAnimationFrame(() => {
      this.pendingMeasureFrame = null;
      this.measureNow();
    });
  }

  private measureNow(): void {
    const host = this.elementRef.nativeElement;
    // Snapshot BEFORE writing measurement signals so this pass's notion of
    // "hidden" cannot shift mid-measure.
    const hiddenIds = untracked(() => this.hiddenIds());
    const items = untracked(() => this.items());
    const widths = new Map(untracked(() => this.widthByItemSignal()));
    let widthsChanged = false;

    for (const item of items) {
      if (hiddenIds.has(item.id)) {
        continue; // display:none measures 0 — keep the last-visible width.
      }

      const width = measureOuterWidth(item.element);

      if (widths.get(item.id) !== width) {
        widths.set(item.id, width);
        widthsChanged = true;
      }
    }

    if (this.moreButtonElement !== null) {
      const moreButtonWidth = measureOuterWidth(this.moreButtonElement);

      if (moreButtonWidth > 0) {
        this.moreButtonWidthSignal.set(moreButtonWidth);
      }
    }

    if (widthsChanged) {
      this.widthByItemSignal.set(widths);
    }

    const style = getComputedStyle(host);
    const paddingX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);

    this.gapSignal.set(parseFloat(style.columnGap) || 0);
    this.containerWidthSignal.set(Math.max(0, host.clientWidth - paddingX));
  }

  private syncObservedItems(items: readonly NatToolbarItemRef[]): void {
    const liveElements = new Set(items.map((item) => item.element));

    if (this.moreButtonElement !== null) {
      liveElements.add(this.moreButtonElement);
    }

    if (this.resizeObserver !== null) {
      for (const element of [...this.observedElements]) {
        if (!liveElements.has(element)) {
          this.resizeObserver.unobserve(element);
          this.observedElements.delete(element);
        }
      }

      for (const element of liveElements) {
        if (!this.observedElements.has(element)) {
          this.resizeObserver.observe(element);
          this.observedElements.add(element);
        }
      }
    }

    const liveIds = new Set(items.map((item) => item.id));
    const widths = untracked(() => this.widthByItemSignal());

    if ([...widths.keys()].some((id) => !liveIds.has(id))) {
      this.widthByItemSignal.set(new Map([...widths].filter(([id]) => liveIds.has(id))));
    }
  }
}

const measureOuterWidth = (element: HTMLElement): number => {
  const style = getComputedStyle(element);

  return (
    element.getBoundingClientRect().width +
    (parseFloat(style.marginLeft) || 0) +
    (parseFloat(style.marginRight) || 0)
  );
};
