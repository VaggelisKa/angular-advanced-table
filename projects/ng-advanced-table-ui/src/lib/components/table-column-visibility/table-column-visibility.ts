import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Column, RowData } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';

import { getNatTableColumnLabel } from '../../shared/table-ui.helpers';

@Component({
  selector: 'nat-table-column-visibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-column-visibility.html',
  styleUrl: './table-column-visibility.css',
})
export class NatTableColumnVisibility<TData extends RowData = RowData> {
  readonly for = input.required<NatTable<TData>>();
  readonly label = input('Columns');
  readonly ariaLabel = input('Column visibility');

  protected readonly columns = computed(() =>
    this.for()
      .table.getAllLeafColumns()
      .filter((column) => column.getCanHide()),
  );
  protected readonly visibleColumnCount = computed(
    () => this.for().table.getVisibleLeafColumns().length,
  );
  protected readonly totalColumnCount = computed(() => this.for().table.getAllLeafColumns().length);

  protected getColumnLabel(column: Column<TData, unknown>): string {
    return getNatTableColumnLabel(column);
  }

  protected canToggleColumnVisibility(column: Column<TData, unknown>): boolean {
    return !column.getIsVisible() || this.visibleColumnCount() > 1;
  }

  protected toggleColumnVisibility(column: Column<TData, unknown>): void {
    if (!this.canToggleColumnVisibility(column)) {
      return;
    }

    column.toggleVisibility(!column.getIsVisible());
  }

  protected getColumnVisibilityAction(column: Column<TData, unknown>): string {
    return `${column.getIsVisible() ? 'Hide' : 'Show'} ${this.getColumnLabel(column)} column`;
  }
}
