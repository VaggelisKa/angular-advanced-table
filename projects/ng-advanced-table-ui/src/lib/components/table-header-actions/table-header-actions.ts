import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  FlexRender,
  type FlexRenderContent,
  type HeaderContext,
  type RowData,
} from '@tanstack/angular-table';
import type {
  NatTableSortDirection,
  NatTableSortIndicatorContext,
} from 'ng-advanced-table';

export type NatTableHeaderRenderContent =
  | string
  | number
  | ((props: HeaderContext<RowData, unknown>) => FlexRenderContent<HeaderContext<RowData, unknown>>)
  | null
  | undefined;

export type NatTableSortIndicatorContent =
  | string
  | number
  | ((
      props: NatTableSortIndicatorContext<RowData>,
    ) => FlexRenderContent<NatTableSortIndicatorContext<RowData>>)
  | null
  | undefined;

export interface NatTableHeaderActionsOptions {
  sortIndicator?: NatTableSortIndicatorContent;
}

@Component({
  selector: 'nat-table-header-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlexRender],
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

  protected sortIcon(): string {
    const sortState = this.sortState();

    if (sortState === 'asc') {
      return '↑';
    }

    if (sortState === 'desc') {
      return '↓';
    }

    return '↕';
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
    return `Toggle sort for ${this.label()}`;
  }

  protected getPinLabel(): string {
    return `${this.isPinned() ? 'Unpin' : 'Pin'} ${this.label()} column`;
  }

  protected column() {
    return this.context().column;
  }
}
