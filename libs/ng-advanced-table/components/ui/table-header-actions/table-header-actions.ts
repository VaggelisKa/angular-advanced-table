/* eslint-disable max-lines */
import { GridCellWidget } from '@angular/aria/grid';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import type { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, inject, input, viewChild } from '@angular/core';

import { FlexRender } from '@tanstack/angular-table';
import type { HeaderContext, RowData } from '@tanstack/angular-table';

import {
  NAT_EN_LOCALE_ID,
  NAT_TABLE_CONTROLS_INTL,
  mergeHeaderActionLabels,
  resolveNatTableControlsIntl
} from 'ng-advanced-table/locale';

import type {
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityHeaderActionMenuContext,
  NatTableAccessibilityHeaderActionMoveContext,
  NatTableAccessibilityHeaderActionPinContext,
  NatTableColumnMoveDirection,
  NatTableHeaderRenderContent,
  NatTableSortDirection,
  NatTableSortIndicatorContent,
  NatTableSortIndicatorContext
} from '../../common/table-ui.type';

type NatTablePinSide = 'left' | 'right';

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

  protected readonly pinSides: readonly NatTablePinSide[] = ['left', 'right'];
  protected readonly moveDirections: readonly NatTableColumnMoveDirection[] = ['left', 'right'];
  protected readonly pinMenu = viewChild<Menu<string>>('pinMenu');
  protected readonly pinMenuPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 6
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 6
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -6
    }
  ];

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
    const sortState = this.sortState();

    if (sortState === 'asc') {
      return 'ascending';
    }

    if (sortState === 'desc') {
      return 'descending';
    }

    return 'none';
  }

  protected sortIndicatorContext(): NatTableSortIndicatorContext<RowData> {
    const sortState = this.sortState();

    return {
      $implicit: sortState,
      sortState,
      ariaSort: this.ariaSort(),
      column: this.column(),
      label: this.label()
    };
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
    const labels = this.resolveAccessibilityLabels();
    const sortPriority = this.sortPriority();
    const sortCount = this.context().table.getState().sorting.length;

    return (
      labels.sortButton?.({
        label: this.label(),
        sortState: this.ariaSort(),
        sortPriority,
        sortCount
      }) ?? ''
    );
  }

  protected getPinLabel(side: NatTablePinSide): string {
    const context = this.getPinContext(side);
    const labels = this.resolveAccessibilityLabels();

    return labels.pinButton?.(context) ?? '';
  }

  protected getPinText(side: NatTablePinSide): string {
    const context = this.getPinContext(side);
    const labels = this.resolveAccessibilityLabels();

    return labels.pinButtonText?.(context) ?? '';
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
    const context = this.getMoveContext(direction);
    const labels = this.resolveAccessibilityLabels();

    return labels.moveButton?.(context) ?? '';
  }

  protected getMoveText(direction: NatTableColumnMoveDirection): string {
    const context = this.getMoveContext(direction);
    const labels = this.resolveAccessibilityLabels();

    return labels.moveButtonText?.(context) ?? '';
  }

  protected getMenuButtonLabel(): string {
    const labels = this.resolveAccessibilityLabels();

    return labels.menuButton?.(this.getMenuContext()) ?? '';
  }

  protected getMenuLabel(): string {
    const labels = this.resolveAccessibilityLabels();

    return labels.menuLabel?.(this.getMenuContext()) ?? '';
  }

  protected column(): HeaderContext<RowData, unknown>['column'] {
    return this.context().column;
  }

  private pinnedSide(): NatTablePinSide | null {
    const pinState = this.column().getIsPinned();

    return pinState === 'left' || pinState === 'right' ? pinState : null;
  }

  private getPinContext(side: NatTablePinSide): NatTableAccessibilityHeaderActionPinContext {
    const pinnedSide = this.pinnedSide();

    return {
      label: this.label(),
      pinState: pinnedSide ? 'pinned' : 'unpinned',
      toggleAction: pinnedSide === side ? 'unpin' : 'pin',
      pinSide: side,
      pinnedSide
    };
  }

  private getMoveContext(direction: NatTableColumnMoveDirection): NatTableAccessibilityHeaderActionMoveContext {
    return {
      label: this.label(),
      direction
    };
  }

  private getMenuContext(): NatTableAccessibilityHeaderActionMenuContext {
    return {
      label: this.label()
    };
  }

  private resolveAccessibilityLabels(): NatTableAccessibilityHeaderActionLabels {
    return mergeHeaderActionLabels(this.tableUiIntl().headerActions?.accessibilityLabels, this.accessibilityLabels());
  }
}
