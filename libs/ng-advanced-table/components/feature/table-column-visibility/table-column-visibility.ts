import { Component, computed, inject, input } from '@angular/core';

import type { Column, RowData } from '@tanstack/angular-table';

import { NatTableService } from 'ng-advanced-table';
import { NAT_EN_LOCALE_ID, NAT_TABLE_CONTROLS_INTL, mergeColumnVisibilityLabels, resolveNatTableControlsIntl } from 'ng-advanced-table/locale';

import type {
  NatTableAccessibilityColumnVisibilityActionContext,
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityColumnVisibilityStateContext
} from '../../common/table-ui.type';
import { formatNatTableAccessibilityNumber, getNatTableColumnLabel } from '../../utils/table-ui.helpers';

type ColumnVisibilityItem<TData extends RowData = RowData> = {
  readonly column: Column<TData, unknown>;
  readonly label: string;
  readonly visible: boolean;
  readonly canToggle: boolean;
  readonly actionLabel: string;
  readonly stateLabel: string;
};

const applyColumnVisibilityToggle = <TData extends RowData = RowData>(column: ColumnVisibilityItem<TData>): void => {
  if (!column.canToggle) return;

  column.column.toggleVisibility(!column.visible);
};

@Component({
  selector: 'nat-table-column-visibility',
  templateUrl: './table-column-visibility.html',
  styleUrl: './table-column-visibility.css'
})
export class NatTableColumnVisibility<TData extends RowData = RowData> {
  public readonly locale = input<string | undefined>(undefined);
  public readonly label = input<string | undefined>(undefined);
  public readonly groupAriaLabel = input<string | undefined>(undefined);
  public readonly accessibilityLabels = input<NatTableAccessibilityColumnVisibilityLabels | undefined>(undefined);

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  protected readonly controller = computed(() => this.natTableService.controller());

  private readonly tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
  private readonly localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID);

  private readonly tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()));

  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? '');

  private readonly allLeafColumns = computed(() => this.controller()?.table.getAllLeafColumns() ?? []);

  protected readonly visibleColumnCount = computed(() => this.controller()?.table.getVisibleLeafColumns().length ?? 0);

  protected readonly totalColumnCount = computed(() => this.allLeafColumns().length);
  private readonly resolvedAccessibilityLabels = computed(() =>
    mergeColumnVisibilityLabels(this.tableUiIntl().columnVisibility?.accessibilityLabels, this.accessibilityLabels())
  );

  protected readonly resolvedHeading = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return this.label() ?? labels.heading ?? this.tableUiIntl().columnVisibility?.label ?? '';
  });

  protected readonly resolvedAriaLabel = computed(() => {
    const labels = this.resolvedAccessibilityLabels();

    return this.groupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().columnVisibility?.groupAriaLabel ?? '';
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
        this.localeId()
      ),
      totalColumnCountValue: totalColumnCount,
      totalColumnCountText: formatNatTableAccessibilityNumber(
        totalColumnCount,
        this.tableUiIntl().formatNumber,
        undefined,
        this.localeId()
      )
    };

    return labels.visibilitySummary?.(context) ?? '';
  });

  protected readonly columns = computed<ColumnVisibilityItem<TData>[]>(() => {
    const visibleColumnCount = this.visibleColumnCount();
    const labels = this.resolvedAccessibilityLabels();

    return this.allLeafColumns()
      .filter((column: Column<TData, unknown>) => column.getCanHide())
      .map((column: Column<TData, unknown>) => {
        const visible = column.getIsVisible();
        const label = getNatTableColumnLabel(column);
        const actionContext: NatTableAccessibilityColumnVisibilityActionContext = {
          columnLabel: label,
          visibilityState: visible ? 'visible' : 'hidden',
          toggleAction: visible ? 'hide' : 'show'
        };
        const stateContext: NatTableAccessibilityColumnVisibilityStateContext = {
          visibilityState: visible ? 'visible' : 'hidden'
        };

        return {
          column,
          label,
          visible,
          canToggle: !visible || visibleColumnCount > 1,
          actionLabel: labels.toggleColumnAriaLabel?.(actionContext) ?? '',
          stateLabel: labels.columnState?.(stateContext) ?? ''
        };
      });
  });

  protected readonly toggleColumnVisibility = applyColumnVisibilityToggle<TData>;
}
