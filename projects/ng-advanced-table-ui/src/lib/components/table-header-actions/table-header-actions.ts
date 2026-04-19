import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GridCellWidget } from '@angular/aria/grid';
import {
  FlexRender,
  type FlexRenderContent,
  type HeaderContext,
  type RowData,
} from '@tanstack/angular-table';
import type { NatTableSortDirection, NatTableSortIndicatorContext } from 'ng-advanced-table';

export type NatTableHeaderRenderContent =
  | string
  | number
  | ((props: HeaderContext<RowData, unknown>) => FlexRenderContent<HeaderContext<RowData, unknown>>)
  | null
  | undefined;

/**
 * Custom content accepted by `withNatTableHeaderActions(..., { sortIndicator })`.
 *
 * Return a string/number for simple glyph swaps, or a FlexRender-compatible
 * renderer for richer Angular content.
 */
export type NatTableSortIndicatorContent =
  | string
  | number
  | ((
      props: NatTableSortIndicatorContext<RowData>,
    ) => FlexRenderContent<NatTableSortIndicatorContext<RowData>>)
  | null
  | undefined;

/**
 * Options for {@link withNatTableHeaderActions}.
 *
 * Use `sortIndicator` to replace the built-in unsorted/ascending/descending
 * glyphs while keeping the same sort and pin button behavior.
 */
export interface NatTableHeaderActionsOptions {
  /** Custom content rendered inside the sort button for each sortable column. */
  sortIndicator?: NatTableSortIndicatorContent;
}

@Component({
  selector: 'nat-table-header-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlexRender, GridCellWidget],
  templateUrl: './table-header-actions.html',
  styleUrl: './table-header-actions.css',
})
export class NatTableHeaderActions {
  readonly context = input.required<HeaderContext<RowData, unknown>>();
  readonly content = input.required<NatTableHeaderRenderContent>();
  readonly label = input.required<string>();
  readonly sortIndicator = input<NatTableSortIndicatorContent>(undefined);

  protected canSort(): boolean {
    return this.column().getCanSort();
  }

  protected canPin(): boolean {
    return this.column().getCanPin();
  }

  protected isPinned(): boolean {
    return !!this.column().getIsPinned();
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

  protected toggleSort(): void {
    this.column().toggleSorting();
  }

  protected togglePin(): void {
    const column = this.column();
    column.pin(column.getIsPinned() ? false : 'left');
  }

  protected getSortLabel(): string {
    return `Change sorting for ${this.label()}`;
  }

  protected getPinLabel(): string {
    return `${this.isPinned() ? 'Unpin' : 'Pin'} ${this.label()} column`;
  }

  protected column() {
    return this.context().column;
  }
}
