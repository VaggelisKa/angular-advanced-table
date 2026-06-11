import { NgTemplateOutlet } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import type { RowData } from '@tanstack/angular-table';

import { injectNatTableUiController } from '../../../shared/resolve-ui-controller';
import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  resolveNatTableUiIntl,
} from '../../../shared/table-ui-intl';
import { getNatTableColumnLabel } from '../../../shared/table-ui.helpers';
import type { NatTableUiController } from '../../../shared/table-ui.types';
import { NatToolbarItem } from '../toolbar-item.directive';
import { NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import { NAT_TOOLBAR_MENU_POSITIONS } from '../common/toolbar-menu-positions.const';

type ToolbarColumnItem = {
  readonly id: string;
  readonly label: string;
  readonly visible: boolean;
  readonly canToggle: boolean;
  readonly ariaLabel: string;
};

@Component({
  selector: 'nat-toolbar-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Menu, MenuContent, MenuItem, MenuTrigger, NgTemplateOutlet, OverlayModule],
  hostDirectives: [{ directive: NatToolbarItem, inputs: ['natToolbarItem'] }],
  templateUrl: './toolbar-view.html',
  styleUrl: './toolbar-view.css',
})
export class NatToolbarView<TData extends RowData = RowData> {
  readonly for = input<NatTableUiController<TData> | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);

  private readonly toolbarItem = inject(NAT_TOOLBAR_ITEM, { self: true });
  protected readonly controller = injectNatTableUiController(this.for, 'nat-toolbar-view');
  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  private readonly localeId = computed(
    () => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );

  protected readonly viewMenu = viewChild<Menu<string>>('viewMenu');
  protected readonly menuTrigger = viewChild<MenuTrigger<string>>('menuTrigger');
  private readonly menuContentTemplate = viewChild<TemplateRef<unknown>>('menuContentTpl');
  private readonly triggerElement = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly menuPositions = NAT_TOOLBAR_MENU_POSITIONS;

  protected readonly resolvedTriggerLabel = computed(
    () => this.tableUiIntl().toolbar?.viewMenuLabel ?? '',
  );
  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? null);
  protected readonly toolbarTabIndex = computed(() => this.toolbarItem.tabIndex());
  protected readonly hasController = computed(() => this.controller() !== null);

  protected readonly columnItems = computed<ToolbarColumnItem[]>(() => {
    const controller = this.controller();

    if (controller === null) {
      return [];
    }

    const visibleColumnCount = controller.table.getVisibleLeafColumns().length;
    const labels = this.tableUiIntl().toolbar?.accessibilityLabels;

    return controller.table
      .getAllLeafColumns()
      .filter((column) => column.getCanHide())
      .map((column) => {
        const visible = column.getIsVisible();
        const label = getNatTableColumnLabel(column);

        return {
          id: column.id,
          label,
          visible,
          canToggle: !visible || visibleColumnCount > 1,
          ariaLabel: labels?.viewMenuItem?.({ columnLabel: label, visible }) ?? label,
        };
      });
  });

  constructor() {
    this.toolbarItem.setOverflowSpec({
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
    afterRenderEffect(() => {
      const tableId = this.tableElementId();
      const el = this.triggerElement().nativeElement;

      if (tableId) {
        el.setAttribute('aria-controls', tableId);
      } else {
        el.removeAttribute('aria-controls');
      }
    });
  }

  protected toggleColumn(item: ToolbarColumnItem): void {
    const controller = this.controller();

    if (controller === null || !item.canToggle) {
      return;
    }

    controller.patchState({
      columnVisibility: (currentVisibility) => ({
        ...currentVisibility,
        [item.id]: !item.visible,
      }),
    });
  }
}
