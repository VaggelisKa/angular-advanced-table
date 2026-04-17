import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  FlexRender,
  type FlexRenderContent,
  type HeaderContext,
  type RowData,
} from '@tanstack/angular-table';

export type NatTableHeaderRenderContent =
  | string
  | number
  | ((props: HeaderContext<RowData, unknown>) => FlexRenderContent<HeaderContext<RowData, unknown>>)
  | null
  | undefined;

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

  protected readonly column = computed(() => this.context().column);
  protected readonly canSort = computed(() => this.column().getCanSort());
  protected readonly canPin = computed(() => this.column().getCanPin());
  protected readonly isPinned = computed(() => !!this.column().getIsPinned());
  protected readonly isAlignedEnd = computed(() => this.column().columnDef.meta?.align === 'end');
  protected readonly sortIcon = computed(() => {
    const sortState = this.column().getIsSorted();

    if (sortState === 'asc') {
      return '↑';
    }

    if (sortState === 'desc') {
      return '↓';
    }

    return '↕';
  });

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
}
