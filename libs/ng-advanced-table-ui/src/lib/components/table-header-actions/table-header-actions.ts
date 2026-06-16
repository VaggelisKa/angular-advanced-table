import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { GridCellWidget } from '@angular/aria/grid';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import {
  FlexRender,
  type FlexRenderContent,
  type HeaderContext,
  type RowData,
} from '@tanstack/angular-table';
import type {
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityHeaderActionMenuContext,
  NatTableAccessibilityHeaderActionPinContext,
  NatTableSortDirection,
  NatTableSortIndicatorContext,
  NatTableSortIndicatorContent,
} from '../../shared/table-ui.types';
import {
  mergeHeaderActionLabels,
  NAT_TABLE_UI_INTL,
  NAT_TABLE_UI_ENGLISH_LOCALE,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';

type NatTablePinSide = 'left' | 'right';

export type NatTableHeaderRenderContent =
  | string
  | number
  | ((props: HeaderContext<RowData, unknown>) => FlexRenderContent<HeaderContext<RowData, unknown>>)
  | null
  | undefined;

export type { NatTableSortIndicatorContent } from '../../shared/table-ui.types';

/**
 * Options for {@link withNatTableHeaderActions}.
 *
 * Use `sortIndicator` to replace the built-in unsorted/ascending/descending
 * glyphs while keeping the same sort and pin button behavior.
 */
export interface NatTableHeaderActionsOptions {
  /** Custom content rendered inside the sort button for each sortable column. */
  sortIndicator?: NatTableSortIndicatorContent;
  /** Static locale override for generated action labels. Defaults to the hosting table locale. */
  locale?: string;
  /** Optional accessibility label overrides for the built-in sort and pin actions. */
  accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
}

@Component({
  selector: 'nat-table-header-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlexRender, GridCellWidget, Menu, MenuContent, MenuItem, MenuTrigger, OverlayModule],
  templateUrl: './table-header-actions.html',
  styleUrl: './table-header-actions.css',
})
export class NatTableHeaderActions {
  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  private readonly localeId = computed(() => this.locale() ?? NAT_TABLE_UI_ENGLISH_LOCALE);
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );
  protected readonly pinSides: readonly NatTablePinSide[] = ['left', 'right'];
  protected readonly pinMenu = viewChild<Menu<NatTablePinSide>>('pinMenu');
  protected readonly pinMenuPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 6,
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 6,
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -6,
    },
  ];
  readonly context = input.required<HeaderContext<RowData, unknown>>();
  readonly content = input.required<NatTableHeaderRenderContent>();
  readonly label = input.required<string>();
  readonly hideLabel = input(false);
  readonly locale = input<string | undefined>(undefined);
  readonly sortIndicator = input<NatTableSortIndicatorContent>(undefined);
  readonly accessibilityLabels = input<NatTableAccessibilityHeaderActionLabels | undefined>(
    undefined,
  );

  protected canSort(): boolean {
    return this.column().getCanSort();
  }

  protected canPin(): boolean {
    return this.column().getCanPin();
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
      label: this.label(),
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
        sortCount,
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

  protected getMenuButtonLabel(): string {
    const labels = this.resolveAccessibilityLabels();

    return labels.menuButton?.(this.getMenuContext()) ?? '';
  }

  protected getMenuLabel(): string {
    const labels = this.resolveAccessibilityLabels();

    return labels.menuLabel?.(this.getMenuContext()) ?? '';
  }

  protected column() {
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
      pinnedSide,
    };
  }

  private getMenuContext(): NatTableAccessibilityHeaderActionMenuContext {
    return {
      label: this.label(),
    };
  }

  private resolveAccessibilityLabels(): NatTableAccessibilityHeaderActionLabels {
    return mergeHeaderActionLabels(
      this.tableUiIntl().headerActions?.accessibilityLabels,
      this.accessibilityLabels(),
    );
  }
}
