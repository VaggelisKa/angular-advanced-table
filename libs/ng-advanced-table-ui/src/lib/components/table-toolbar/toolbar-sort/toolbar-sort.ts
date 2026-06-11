import { OverlayModule } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import type { RowData } from '@tanstack/angular-table';

import { injectNatTableUiController } from '../../../shared/resolve-ui-controller';
import { getNatTableColumnLabel } from '../../../shared/table-ui.helpers';
import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  resolveNatTableUiIntl,
} from '../../../shared/table-ui-intl';
import type { NatTableUiController } from '../../../shared/table-ui.types';
import { NatToolbarItem } from '../toolbar-item.directive';
import { NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import { NAT_TOOLBAR_MENU_POSITIONS } from '../common/toolbar-menu-positions.const';

type NatToolbarSortDirection = 'ascending' | 'descending' | 'none';

type NatToolbarSortMenuItem = {
  readonly columnId: string;
  readonly columnLabel: string;
  readonly direction: NatToolbarSortDirection;
  readonly active: boolean;
  readonly label: string;
};

const SORT_DIRECTIONS: NatToolbarSortDirection[] = ['ascending', 'descending', 'none'];

@Component({
  selector: 'nat-toolbar-sort',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Menu, MenuContent, MenuItem, MenuTrigger, NgTemplateOutlet, OverlayModule],
  templateUrl: './toolbar-sort.html',
  styleUrl: './toolbar-sort.css',
  hostDirectives: [{ directive: NatToolbarItem, inputs: ['natToolbarItem'] }],
})
export class NatToolbarSort<TData extends RowData = RowData> {
  readonly for = input<NatTableUiController<TData> | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);

  protected readonly toolbarItem = inject(NAT_TOOLBAR_ITEM, { self: true });
  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  protected readonly controller = injectNatTableUiController(this.for, 'nat-toolbar-sort');

  protected readonly sortMenu = viewChild<Menu<string>>('sortMenu');
  private readonly menuTrigger = viewChild<MenuTrigger<string>>('menuTrigger');
  private readonly triggerElement = viewChild<ElementRef<HTMLButtonElement>>('menuOrigin');
  private readonly menuContentTemplate = viewChild<TemplateRef<unknown>>('sortMenuContent');

  protected readonly menuPositions = NAT_TOOLBAR_MENU_POSITIONS;

  private readonly localeId = computed(
    () => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );
  protected readonly triggerLabel = computed(() => this.tableUiIntl().toolbar?.sortMenuLabel ?? '');
  protected readonly menuItems = computed<NatToolbarSortMenuItem[]>(() => {
    const controller = this.controller();

    if (controller === null) {
      return [];
    }

    const labelFormatter = this.tableUiIntl().toolbar?.accessibilityLabels?.sortMenuItem;

    return controller.table
      .getAllLeafColumns()
      .filter((column) => column.getCanSort())
      .flatMap((column) => {
        const columnLabel = getNatTableColumnLabel(column);
        const sortState = column.getIsSorted();

        return SORT_DIRECTIONS.map((direction) => {
          const active =
            direction === 'ascending'
              ? sortState === 'asc'
              : direction === 'descending'
                ? sortState === 'desc'
                : sortState === false;

          return {
            columnId: column.id,
            columnLabel,
            direction,
            active,
            label: labelFormatter?.({ columnLabel, direction, active }) ?? '',
          };
        });
      });
  });

  constructor() {
    this.toolbarItem.setOverflowSpec({
      label: () => this.triggerLabel(),
      menuContent: () => this.menuContentTemplate() ?? null,
      onOverflowChange: (hidden) => {
        if (hidden) {
          this.menuTrigger()?.close();
        }
      },
    });

    effect(() => {
      this.toolbarItem.setFocusTarget(this.triggerElement()?.nativeElement ?? null);
    });
  }

  protected onMenuItemClick(item: NatToolbarSortMenuItem): void {
    const controller = this.controller();

    if (controller === null) {
      return;
    }

    if (item.direction === 'none') {
      controller.patchState({
        sorting: (currentSorting) => currentSorting.filter((entry) => entry.id !== item.columnId),
      });
    } else {
      controller.patchState({
        sorting: [{ id: item.columnId, desc: item.direction === 'descending' }],
      });
    }

    this.menuTrigger()?.close();
  }
}
