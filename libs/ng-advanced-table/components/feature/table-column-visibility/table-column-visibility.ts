import { Component, computed, inject, input } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableService } from 'ng-advanced-table';
import {
  NAT_EN_LOCALE_ID,
  NAT_TABLE_CONTROLS_INTL,
  mergeColumnVisibilityLabels,
  resolveNatTableControlsIntl
} from 'ng-advanced-table/locale';
import type {
  NatTableAccessibilityColumnVisibilityActionContext,
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityColumnVisibilityStateContext
} from 'ng-advanced-table/locale';

import { formatNatTableAccessibilityNumber } from '../../utils/accessibility-number.util';

type ColumnVisibilityItem = {
  readonly id: string;
  readonly label: string;
  readonly visible: boolean;
  readonly canToggle: boolean;
  readonly actionLabel: string;
  readonly stateLabel: string;
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

  private readonly visibilityItems = computed(() => this.controller()?.columnVisibility() ?? []);

  protected readonly visibleColumnCount = computed(() => this.visibilityItems().filter((item) => item.visible).length);

  protected readonly totalColumnCount = computed(() => this.visibilityItems().length);
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

  protected readonly columns = computed<ColumnVisibilityItem[]>(() => {
    const visibleColumnCount = this.visibleColumnCount();
    const labels = this.resolvedAccessibilityLabels();

    return this.visibilityItems()
      .filter((item) => item.canHide)
      .map((item) => {
        const visible = item.visible;
        const label = item.label;
        const actionContext: NatTableAccessibilityColumnVisibilityActionContext = {
          columnLabel: label,
          visibilityState: visible ? 'visible' : 'hidden',
          toggleAction: visible ? 'hide' : 'show'
        };
        const stateContext: NatTableAccessibilityColumnVisibilityStateContext = {
          visibilityState: visible ? 'visible' : 'hidden'
        };

        return {
          id: item.id,
          label,
          visible,
          canToggle: !visible || visibleColumnCount > 1,
          actionLabel: labels.toggleColumnAriaLabel?.(actionContext) ?? '',
          stateLabel: labels.columnState?.(stateContext) ?? ''
        };
      });
  });

  protected toggleColumnVisibility(item: ColumnVisibilityItem): void {
    if (!item.canToggle) return;

    this.controller()?.setColumnVisible(item.id, !item.visible);
  }
}
