import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import type { RowData } from '@tanstack/angular-table';

import { injectNatTableUiController } from '../../../shared/resolve-ui-controller';
import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  resolveNatTableUiIntl,
} from '../../../shared/table-ui-intl';
import type { NatTableUiController } from '../../../shared/table-ui.types';
import { NatToolbarItem } from '../toolbar-item.directive';
import { NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import { NAT_TOOLBAR_MENU_POSITIONS } from '../common/toolbar-menu-positions.const';
import type { NatToolbarActionItem } from './common/toolbar-actions.type';

@Component({
  selector: 'nat-toolbar-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Menu, MenuContent, MenuItem, MenuTrigger, NgTemplateOutlet, OverlayModule],
  hostDirectives: [{ directive: NatToolbarItem, inputs: ['natToolbarItem'] }],
  templateUrl: './toolbar-actions.html',
  styleUrl: './toolbar-actions.css',
})
export class NatToolbarActions<TData extends RowData = RowData> {
  readonly items = input.required<readonly NatToolbarActionItem[]>();
  readonly for = input<NatTableUiController<TData> | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);

  private readonly toolbarItem = inject(NAT_TOOLBAR_ITEM, { self: true });
  // optionalUsage: true — actions renders client-supplied items and works without
  // a controller; suppress the spurious "no controller resolved" dev warning.
  private readonly controller = injectNatTableUiController(this.for, 'nat-toolbar-actions', {
    optionalUsage: true,
  });
  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  private readonly localeId = computed(
    () => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );

  protected readonly resolvedTriggerLabel = computed(
    () => this.tableUiIntl().toolbar?.actionsMenuLabel ?? '',
  );
  protected readonly toolbarTabIndex = computed(() => this.toolbarItem.tabIndex());

  protected readonly actionsMenu = viewChild<Menu<string>>('actionsMenu');
  protected readonly menuTrigger = viewChild<MenuTrigger<string>>('menuTrigger');
  private readonly menuContentTemplate = viewChild<TemplateRef<unknown>>('menuContentTpl');
  private readonly triggerElement = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly menuPositions = NAT_TOOLBAR_MENU_POSITIONS;

  constructor() {
    this.toolbarItem.setOverflowSpec({
      // Priority -100 ensures the actions menu collapses into More before any
      // other end item. This prevents two dot/kebab menus appearing side by side
      // (Fluent CommandBar pattern). Not exposed as an input — always -100.
      priority: -100,
      label: () => this.resolvedTriggerLabel(),
      menuContent: () => this.menuContentTemplate() ?? null,
      onOverflowChange: (hidden) => {
        if (hidden) {
          this.menuTrigger()?.close();
        }
      },
    });
    afterNextRender(() => {
      this.toolbarItem.setFocusTarget(this.triggerElement().nativeElement);
    });
  }

  protected runAction(entry: NatToolbarActionItem): void {
    if (entry.disabled) {
      return;
    }

    entry.action();
    this.menuTrigger()?.close();
  }
}
