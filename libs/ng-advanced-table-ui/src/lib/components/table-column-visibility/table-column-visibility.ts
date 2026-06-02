import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { Column, RowData } from '@tanstack/angular-table';

import {
  formatNatTableAccessibilityNumber,
  getNatTableColumnLabel,
} from '../../shared/table-ui.helpers';
import { mergeColumnVisibilityLabels, NAT_TABLE_UI_INTL } from '../../shared/table-ui-intl';
import type {
  NatTableAccessibilityColumnVisibilityActionContext,
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityColumnVisibilityStateContext,
  NatTableUiController,
} from '../../shared/table-ui.types';

interface ColumnVisibilityItem<TData extends RowData = RowData> {
  column: Column<TData, unknown>;
  label: string;
  visible: boolean;
  canToggle: boolean;
  actionLabel: string;
  stateLabel: string;
}

@Component({
  selector: 'nat-table-column-visibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-column-visibility.html',
  styleUrl: './table-column-visibility.css',
})
export class NatTableColumnVisibility<TData extends RowData = RowData> {
  readonly for = input.required<NatTableUiController<TData>>();
  readonly label = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly accessibilityLabels = input<NatTableAccessibilityColumnVisibilityLabels | undefined>(
    undefined,
  );
  private readonly tableUiIntl = inject(NAT_TABLE_UI_INTL);
  protected readonly tableElementId = computed(() => this.for().tableElementId());

  private readonly allLeafColumns = computed(() => this.for().table.getAllLeafColumns());
  protected readonly visibleColumnCount = computed(
    () => this.for().table.getVisibleLeafColumns().length,
  );
  protected readonly totalColumnCount = computed(() => this.allLeafColumns().length);
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergeColumnVisibilityLabels(
      this.tableUiIntl.columnVisibility?.accessibilityLabels,
      this.accessibilityLabels(),
    ),
  );
  protected readonly resolvedHeading = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return labels.heading ?? this.label() ?? this.tableUiIntl.columnVisibility?.label ?? 'Columns';
  });
  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return (
      labels.groupAriaLabel ??
      this.ariaLabel() ??
      this.tableUiIntl.columnVisibility?.ariaLabel ??
      'Column visibility'
    );
  });
  protected readonly visibilitySummary = computed(() => {
    const labels = this.resolvedAccessibilityLabels();
    const visibleColumnCount = this.visibleColumnCount();
    const totalColumnCount = this.totalColumnCount();
    const context = {
      visibleColumnCountValue: visibleColumnCount,
      visibleColumnCountText: formatNatTableAccessibilityNumber(
        visibleColumnCount,
        this.tableUiIntl.formatNumber,
      ),
      totalColumnCountValue: totalColumnCount,
      totalColumnCountText: formatNatTableAccessibilityNumber(
        totalColumnCount,
        this.tableUiIntl.formatNumber,
      ),
    };

    return (
      labels.visibilitySummary?.(context) ??
      `${context.visibleColumnCountText} / ${context.totalColumnCountText} visible`
    );
  });
  protected readonly columns = computed<ColumnVisibilityItem<TData>[]>(() => {
    const visibleColumnCount = this.visibleColumnCount();
    const labels = this.resolvedAccessibilityLabels();

    return this.allLeafColumns()
      .filter((column) => column.getCanHide())
      .map((column) => {
        const visible = column.getIsVisible();
        const label = getNatTableColumnLabel(column);
        const actionContext: NatTableAccessibilityColumnVisibilityActionContext = {
          columnLabel: label,
          visibilityState: visible ? 'visible' : 'hidden',
          toggleAction: visible ? 'hide' : 'show',
        };
        const stateContext: NatTableAccessibilityColumnVisibilityStateContext = {
          visibilityState: visible ? 'visible' : 'hidden',
        };

        return {
          column,
          label,
          visible,
          canToggle: !visible || visibleColumnCount > 1,
          actionLabel:
            labels.toggleColumnAriaLabel?.(actionContext) ??
            `${visible ? 'Hide' : 'Show'} ${label} column`,
          stateLabel: labels.columnState?.(stateContext) ?? (visible ? 'Shown' : 'Hidden'),
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
