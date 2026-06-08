import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { Column, RowData } from '@tanstack/angular-table';

import {
  formatNatTableAccessibilityNumber,
  getNatTableColumnLabel,
} from '../../shared/table-ui.helpers';
import {
  mergeColumnVisibilityLabels,
  NAT_TABLE_UI_INTL,
  NAT_TABLE_UI_ENGLISH_LOCALE,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';
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
  readonly locale = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly groupAriaLabel = input<string | undefined>(undefined);
  readonly accessibilityLabels = input<NatTableAccessibilityColumnVisibilityLabels | undefined>(
    undefined,
  );

  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  private readonly localeId = computed(
    () => this.locale() ?? this.for().localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );
  protected readonly tableElementId = computed(() => this.for().tableElementId());

  private readonly allLeafColumns = computed(() => this.for().table.getAllLeafColumns());
  protected readonly visibleColumnCount = computed(
    () => this.for().table.getVisibleLeafColumns().length,
  );
  protected readonly totalColumnCount = computed(() => this.allLeafColumns().length);
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergeColumnVisibilityLabels(
      this.tableUiIntl().columnVisibility?.accessibilityLabels,
      this.accessibilityLabels(),
    ),
  );
  protected readonly resolvedHeading = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return this.label() ?? labels.heading ?? this.tableUiIntl().columnVisibility?.label ?? '';
  });
  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return (
      this.groupAriaLabel() ??
      labels.groupAriaLabel ??
      this.tableUiIntl().columnVisibility?.groupAriaLabel ??
      ''
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
        this.tableUiIntl().formatNumber,
        undefined,
        this.localeId(),
      ),
      totalColumnCountValue: totalColumnCount,
      totalColumnCountText: formatNatTableAccessibilityNumber(
        totalColumnCount,
        this.tableUiIntl().formatNumber,
        undefined,
        this.localeId(),
      ),
    };

    return labels.visibilitySummary?.(context) ?? '';
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
          actionLabel: labels.toggleColumnAriaLabel?.(actionContext) ?? '',
          stateLabel: labels.columnState?.(stateContext) ?? '',
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
