import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Column, RowData } from '@tanstack/angular-table';

import { getNatTableColumnLabel } from '../../shared/table-ui.helpers';
import type { NatTableUiController } from '../../shared/table-ui.types';

interface ColumnVisibilityItem<TData extends RowData = RowData> {
  column: Column<TData, unknown>;
  label: string;
  visible: boolean;
  canToggle: boolean;
  actionLabel: string;
}

@Component({
  selector: 'nat-table-column-visibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-column-visibility.html',
  styleUrl: './table-column-visibility.css',
})
export class NatTableColumnVisibility<TData extends RowData = RowData> {
  readonly for = input.required<NatTableUiController<TData>>();
  readonly label = input('Columns');
  readonly ariaLabel = input('Column visibility');
  protected readonly tableElementId = computed(() => this.for().tableElementId());

  private readonly allLeafColumns = computed(() => this.for().table.getAllLeafColumns());
  protected readonly visibleColumnCount = computed(
    () => this.for().table.getVisibleLeafColumns().length,
  );
  protected readonly totalColumnCount = computed(() => this.allLeafColumns().length);
  protected readonly columns = computed<ColumnVisibilityItem<TData>[]>(() => {
    const visibleColumnCount = this.visibleColumnCount();

    return this.allLeafColumns()
      .filter((column) => column.getCanHide())
      .map((column) => {
        const visible = column.getIsVisible();
        const label = getNatTableColumnLabel(column);

        return {
          column,
          label,
          visible,
          canToggle: !visible || visibleColumnCount > 1,
          actionLabel: `${visible ? 'Hide' : 'Show'} ${label} column`,
        };
      });
  });

  protected toggleColumnVisibility(column: ColumnVisibilityItem<TData>): void {
    if (!column.canToggle) {
      return;
    }

    column.column.toggleVisibility(!column.visible);
  }
}
