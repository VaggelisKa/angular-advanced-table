import { GridCellWidget } from '@angular/aria/grid';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import { Component, computed, inject, input, viewChild } from '@angular/core';

import { FlexRender } from '@tanstack/angular-table';
import type { HeaderContext, RowData } from '@tanstack/angular-table';

import type { NatTableColumnMoveDirection } from 'ng-advanced-table';
import {
  NAT_EN_LOCALE_ID,
  NAT_TABLE_CONTROLS_INTL,
  mergeHeaderActionLabels,
  resolveNatTableControlsIntl
} from 'ng-advanced-table/locale';
import type { NatTableAccessibilityHeaderActionLabels } from 'ng-advanced-table/locale';

import {
  NAT_HEADER_ACTIONS_MOVE_DIRECTIONS,
  NAT_HEADER_ACTIONS_PIN_MENU_POSITIONS,
  NAT_HEADER_ACTIONS_PIN_SIDES
} from './table-header-actions.const';
import type {
  NatTableHeaderRenderContent,
  NatTableSortDirection,
  NatTableSortIndicatorContent,
  NatTableSortIndicatorContext
} from '../../common/header-actions.type';
import {
  buildSortIndicatorContext,
  resolveMenuButtonLabel,
  resolveMenuLabel,
  resolveMoveLabel,
  resolveMoveText,
  resolvePinLabel,
  resolvePinText,
  resolveSortLabel,
  toAriaSort
} from '../../utils/header-actions-labels.util';
import type { NatTablePinSide } from '../../utils/header-actions-labels.util';

@Component({
  selector: 'nat-table-header-actions',
  imports: [FlexRender, GridCellWidget, Menu, MenuContent, MenuItem, MenuTrigger, OverlayModule],
  templateUrl: './table-header-actions.html',
  styleUrl: './table-header-actions.css'
})
export class NatTableHeaderActions {
  private readonly tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
  private readonly localeId = computed(() => this.locale() ?? NAT_EN_LOCALE_ID);
  private readonly tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()));

  protected readonly pinSides = NAT_HEADER_ACTIONS_PIN_SIDES;
  protected readonly moveDirections = NAT_HEADER_ACTIONS_MOVE_DIRECTIONS;
  protected readonly pinMenu = viewChild<Menu<string>>('pinMenu');
  protected readonly pinMenuPositions = [...NAT_HEADER_ACTIONS_PIN_MENU_POSITIONS];

  public readonly context = input.required<HeaderContext<RowData, unknown>>();
  public readonly content = input.required<NatTableHeaderRenderContent>();
  public readonly label = input.required<string>();
  public readonly hideLabel = input(false);
  public readonly locale = input<string | undefined>(undefined);
  public readonly sortIndicator = input<NatTableSortIndicatorContent>(undefined);
  public readonly accessibilityLabels = input<NatTableAccessibilityHeaderActionLabels | undefined>(undefined);

  public readonly enableColumnPinActions = input(true);
  public readonly enableColumnReorderActions = input(false);

  protected canSort(): boolean {
    return this.column().getCanSort();
  }

  protected canPin(): boolean {
    return this.enableColumnPinActions() && this.column().getCanPin();
  }

  protected canShowMenu(): boolean {
    return this.canPin() || this.hasColumnMoveActions();
  }

  protected hasColumnMoveActions(): boolean {
    return this.enableColumnReorderActions() && (this.canMoveColumn('left') || this.canMoveColumn('right'));
  }

  protected isPinned(side?: NatTablePinSide): boolean {
    const pinnedSide = this.pinnedSide();

    return side ? pinnedSide === side : pinnedSide !== null;
  }

  protected isAlignedEnd(): boolean {
    return this.column().columnDef.meta?.align === 'end';
  }

  protected hasCustomSortIndicator(): boolean {
    const indicator = this.sortIndicator();

    return indicator !== undefined && indicator !== null;
  }

  protected sortState(): NatTableSortDirection {
    return this.column().getIsSorted();
  }

  protected ariaSort(): 'ascending' | 'descending' | 'none' {
    return toAriaSort(this.sortState());
  }

  protected sortIndicatorContext(): NatTableSortIndicatorContext<RowData> {
    return buildSortIndicatorContext(this.sortState(), this.ariaSort(), this.column(), this.label());
  }

  protected togglePin(side: NatTablePinSide): void {
    const column = this.column();

    column.pin(this.isPinned(side) ? false : side);
  }

  protected onSortClick(event: MouseEvent): void {
    this.column().toggleSorting(undefined, event.shiftKey);
  }

  protected sortPriority(): number | null {
    if (this.context().table.getState().sorting.length <= 1) return null;

    const index = this.column().getSortIndex();

    return index >= 0 ? index + 1 : null;
  }

  protected getSortLabel(): string {
    return resolveSortLabel(this.resolveAccessibilityLabels(), this.label(), {
      ariaSort: this.ariaSort(),
      sortPriority: this.sortPriority(),
      sortCount: this.context().table.getState().sorting.length
    });
  }

  protected getPinLabel(side: NatTablePinSide): string {
    return resolvePinLabel(this.resolveAccessibilityLabels(), this.label(), side, this.pinnedSide());
  }

  protected getPinText(side: NatTablePinSide): string {
    return resolvePinText(this.resolveAccessibilityLabels(), this.label(), side, this.pinnedSide());
  }

  protected canMoveColumn(direction: NatTableColumnMoveDirection): boolean {
    return this.context().table.options.meta?.natTableCanMoveColumn?.(this.column().id, direction) ?? false;
  }

  protected moveColumn(direction: NatTableColumnMoveDirection): void {
    if (!this.canMoveColumn(direction)) {
      return;
    }

    this.context().table.options.meta?.natTableMoveColumn?.(this.column().id, direction);
  }

  protected getMoveLabel(direction: NatTableColumnMoveDirection): string {
    return resolveMoveLabel(this.resolveAccessibilityLabels(), this.label(), direction);
  }

  protected getMoveText(direction: NatTableColumnMoveDirection): string {
    return resolveMoveText(this.resolveAccessibilityLabels(), this.label(), direction);
  }

  protected getMenuButtonLabel(): string {
    return resolveMenuButtonLabel(this.resolveAccessibilityLabels(), this.label());
  }

  protected getMenuLabel(): string {
    return resolveMenuLabel(this.resolveAccessibilityLabels(), this.label());
  }

  protected column(): HeaderContext<RowData, unknown>['column'] {
    return this.context().column;
  }

  private pinnedSide(): NatTablePinSide | null {
    const pinState = this.column().getIsPinned();

    return pinState === 'left' || pinState === 'right' ? pinState : null;
  }

  private resolveAccessibilityLabels(): NatTableAccessibilityHeaderActionLabels {
    return mergeHeaderActionLabels(this.tableUiIntl().headerActions?.accessibilityLabels, this.accessibilityLabels());
  }
}
