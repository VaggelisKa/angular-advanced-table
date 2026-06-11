import { OverlayModule } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import type { ElementRef, TemplateRef } from '@angular/core';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';

import type { NatTableUiIntl } from '../../../shared/table-ui-intl';
import { formatNatTableAccessibilityNumber } from '../../../shared/table-ui.helpers';
import { NAT_TABLE_TOOLBAR, NAT_TOOLBAR_MORE_BUTTON_ID } from '../common/toolbar-tokens.const';
import type { NatToolbarItemRef } from '../common/toolbar-tokens.type';
import { NAT_TOOLBAR_MENU_POSITIONS } from '../common/toolbar-menu-positions.const';
import { NatToolbarSubmenuPosition } from './toolbar-submenu-position.directive';

/** Mirror entry rendered in the More menu for one collapsed toolbar item. */
type NatToolbarMirrorEntry = {
  readonly item: NatToolbarItemRef;
  readonly kind: 'button' | 'submenu' | 'template';
  /** Resolved mirror label; '' only for 'template' entries. */
  readonly label: string;
  /** Mirror template for 'submenu' and 'template' entries. */
  readonly template: TemplateRef<unknown> | null;
};

/**
 * INTERNAL More-overflow menu for `nat-table-toolbar`. Not exported from the
 * public API. The shell renders it as the last direct flex child (`order: 3`
 * via :host CSS) and keeps it in the DOM at all times so its width can be
 * measured and cached; while nothing is collapsed the host is `display: none`.
 */
@Component({
  selector: 'nat-toolbar-overflow-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Menu,
    MenuContent,
    MenuItem,
    MenuTrigger,
    NatToolbarSubmenuPosition,
    NgTemplateOutlet,
    OverlayModule,
  ],
  templateUrl: './toolbar-overflow-menu.html',
  styleUrl: './toolbar-overflow-menu.css',
  host: {
    '[style.display]': "moreVisible() ? null : 'none'",
  },
})
export class NatToolbarOverflowMenu {
  /** Registered toolbar items in registry (DOM) order; the shell passes its contentChildren. */
  readonly items = input.required<readonly NatToolbarItemRef[]>();
  /** Locale-resolved intl bag provided by the shell. */
  readonly intl = input.required<NatTableUiIntl>();
  /** Locale id used when formatting the hidden count. */
  readonly localeId = input.required<string>();
  /** Roving tab stop for the More button; the shell binds its public `moreButtonTabIndex` computed. */
  readonly moreButtonTabIndex = input<0 | -1>(-1);

  private readonly toolbar = inject(NAT_TABLE_TOOLBAR);
  private previousHiddenKey: string | null = null;

  private readonly moreButton = viewChild.required<ElementRef<HTMLButtonElement>>('moreButton');
  protected readonly menuTrigger = viewChild<MenuTrigger<string>>('menuTrigger');
  protected readonly moreMenu = viewChild<Menu<string>>('moreMenu');

  protected readonly menuPositions = NAT_TOOLBAR_MENU_POSITIONS;

  protected readonly overflowedItems = computed(() => this.items().filter((item) => item.hidden()));

  private readonly overflowedCount = computed(() => this.overflowedItems().length);

  protected readonly moreVisible = computed(() => this.overflowedCount() > 0);

  protected readonly moreButtonLabel = computed(() => {
    const hiddenCountValue = this.overflowedCount();
    const hiddenCountText = formatNatTableAccessibilityNumber(
      hiddenCountValue,
      this.intl().formatNumber,
      undefined,
      this.localeId(),
    );

    return (
      this.intl().toolbar?.accessibilityLabels?.moreButton?.({
        hiddenCountValue,
        hiddenCountText,
      }) ?? ''
    );
  });

  protected readonly moreMenuLabel = computed(
    () => this.intl().toolbar?.accessibilityLabels?.moreMenuLabel?.() ?? '',
  );

  protected readonly mirrorEntries = computed<readonly NatToolbarMirrorEntry[]>(() => {
    // resolveOverflowLabel() reads non-reactive DOM (aria-label/textContent).
    // Depending on expanded() re-resolves labels on every open, which is the
    // "read lazily at More-menu open" contract: the lazy ngMenuContent only
    // pulls this computed while the menu is open.
    this.menuTrigger()?.expanded();

    return this.overflowedItems()
      .map((item) => this.toMirrorEntry(item))
      .filter((entry): entry is NatToolbarMirrorEntry => entry !== null);
  });

  constructor() {
    // ngMenuTrigger host-binds [attr.tabindex] (0 while closed), which would
    // defeat the toolbar's roving tabindex. Re-assert the roving value after
    // every render in which it, or the trigger's expanded state, changed.
    afterRenderEffect(() => {
      const tabIndex = this.moreButtonTabIndex();

      this.menuTrigger()?.expanded();
      this.moreButton().nativeElement.tabIndex = tabIndex;
    });

    // Hidden items without any menu representation can never be reached:
    // demote them to 'never' so the shell's fit pass re-shows them. SILENT by
    // decision — the one-shot missing-label dev warning is owned by
    // NatToolbarItem.resolveOverflowLabel() (section B2); no second warning here.
    effect(() => {
      for (const item of this.overflowedItems()) {
        if (item.effectiveOverflowMode() === 'never' || this.toMirrorEntry(item) !== null) {
          continue;
        }

        item.setOverflowSpec({ mode: 'never' });
      }
    });

    // Predictable over clever (design-doc edge cases): any change to the
    // hidden set while the More menu is open closes it and returns focus.
    effect(() => {
      const key = Array.from(this.toolbar.hiddenIds()).sort().join('|');
      const previousKey = this.previousHiddenKey;

      this.previousHiddenKey = key;

      if (previousKey === null || previousKey === key) {
        return;
      }

      untracked(() => {
        const trigger = this.menuTrigger();

        if (trigger === undefined || trigger.expanded()) {
          return;
        }

        trigger.close();

        if (this.moreVisible()) {
          this.moreButtonElement().focus();
        } else {
          this.items()
            .find((item) => !item.hidden())
            ?.focus();
        }
      });
    });
  }

  /**
   * More-button element; the shell's integration task registers it ONCE via
   * `registerMoreButtonElement(...)` (width measurement, focus rescue, roving).
   */
  private moreButtonElement(): HTMLElement {
    return this.moreButton().nativeElement;
  }

  protected onMoreButtonFocusIn(): void {
    this.toolbar.registerFocus(NAT_TOOLBAR_MORE_BUTTON_ID);
  }

  protected activateMirror(entry: NatToolbarMirrorEntry): void {
    // .click() works on display:none nodes; the original keeps all behavior.
    entry.item.element.click();
    this.menuTrigger()?.close();
  }

  private toMirrorEntry(item: NatToolbarItemRef): NatToolbarMirrorEntry | null {
    const template = item.natToolbarOverflowTemplate();

    if (template !== undefined) {
      const natToolbarMirrorEntry: NatToolbarMirrorEntry = {
        item,
        kind: 'template',
        label: '',
        template,
      };

      return natToolbarMirrorEntry;
    }

    const label = item.resolveOverflowLabel();
    if (label === '') return null;

    const menuContent = item.overflowSpec()?.menuContent?.() ?? null;

    if (menuContent !== null) {
      const natToolbarMirrorEntry: NatToolbarMirrorEntry = {
        item,
        kind: 'submenu',
        label,
        template: menuContent,
      };
      return natToolbarMirrorEntry;
    }

    const natToolbarMirrorEntry: NatToolbarMirrorEntry = {
      item,
      kind: 'button',
      label,
      template: null,
    };
    return natToolbarMirrorEntry;
  }
}
