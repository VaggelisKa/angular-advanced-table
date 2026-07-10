/* eslint-disable max-lines, max-lines-per-function -- one cohesive provider snapshot and host keep the reactive controls integration flow auditable */
import { Component, InjectionToken, inject, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { provideNatTableControlsIntl } from 'ng-advanced-table/locale';
import type { NatTableControlsIntlStaticProviderConfig } from 'ng-advanced-table/locale';

import type { Row } from './table-data.helper';
import { buildRows, getRowId, reorderableColumns } from './table-data.helper';
import { NatTableColumnVisibility } from '../feature/table-column-visibility/table-column-visibility';
import { NatTablePageSize } from '../feature/table-page-size/table-page-size';
import { NatTablePager } from '../feature/table-pager/table-pager';
import { NatTableScrollControl } from '../feature/table-scroll-control/table-scroll-control';
import { NatTableSurface } from '../feature/table-surface/table-surface';
import { NatTableToolbar } from '../feature/table-toolbar/table-toolbar';
import { withNatTableHeaderActions } from '../ui/table-header-actions/with-table-header-actions';
import { withNatTableSelectionColumn } from '../ui/table-selection/with-table-selection-column';
import { NatToolbarItem } from '../ui/toolbar-item/toolbar-item.directive';

type ProviderIntlVariant = {
  readonly prefix: 'Provider' | 'Reactive';
  readonly numberPrefix: 'n' | 'r';
  readonly rowAdjective: 'provider' | 'reactive';
};

const buildProviderControlsIntl = (variant: ProviderIntlVariant): NatTableControlsIntlStaticProviderConfig => ({
  formatNumber: (value) => `${variant.numberPrefix}${value}`,
  columnVisibility: {
    label: `${variant.prefix} columns`,
    groupAriaLabel: `${variant.prefix} column visibility`,
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${variant.prefix} ${visibleColumnCountText}/${totalColumnCountText}`
    }
  },
  pageSize: {
    groupAriaLabel: `${variant.prefix} page size`,
    accessibilityLabels: {
      groupAriaLabel: `${variant.prefix} page size group`,
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} ${variant.rowAdjective} rows`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `${variant.prefix} show ${pageSizeText} rows`
    }
  },
  pager: {
    groupAriaLabel: `${variant.prefix} pager`,
    accessibilityLabels: {
      previousPageAriaLabel: `${variant.prefix} previous`,
      nextPageAriaLabel: `${variant.prefix} next`,
      pageIndicator: ({ pageText, pageCountText }) => `${variant.prefix} page ${pageText}/${pageCountText}`
    }
  },
  scrollControl: {
    groupAriaLabel: `${variant.prefix} horizontal scroll`,
    accessibilityLabels: {
      scrollLeftAriaLabel: `${variant.prefix} scroll left`,
      scrollRightAriaLabel: `${variant.prefix} scroll right`,
      scrollPositionAriaLabel: `${variant.prefix} scroll position`,
      scrollPositionText: ({ percentageText }) => `${variant.prefix} ${percentageText} percent`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label }) => `${variant.prefix} sort ${label}`,
      menuButton: ({ label }) => `${variant.prefix} actions for ${label}`,
      menuLabel: ({ label }) => `${variant.prefix} menu for ${label}`,
      pinButton: ({ label, pinSide }) => `${variant.prefix} pin ${label} ${pinSide}`,
      pinButtonText: ({ pinSide }) => `${variant.prefix} ${pinSide}`,
      moveButton: ({ label, direction }) => `${variant.prefix} move ${label} ${direction}`,
      moveButtonText: ({ direction }) => `${variant.prefix} move ${direction}`
    }
  },
  toolbar: {
    toolbarLabel: `${variant.prefix} table toolbar`
  },
  selection: {
    columnLabel: `${variant.prefix} selection`,
    accessibilityLabels: {
      selectAllAriaLabel: `${variant.prefix} select all rows`,
      selectRowAriaLabel: ({ rowId }) => `${variant.prefix} select row ${rowId}`
    }
  }
});

const createProviderControlsIntl = (): WritableSignal<NatTableControlsIntlStaticProviderConfig> =>
  signal<NatTableControlsIntlStaticProviderConfig>(
    buildProviderControlsIntl({ prefix: 'Provider', numberPrefix: 'n', rowAdjective: 'provider' })
  );

const PROVIDER_CONTROLS_INTL = new InjectionToken<ReturnType<typeof createProviderControlsIntl>>('PROVIDER_CONTROLS_INTL');

const reactiveControlsIntl = buildProviderControlsIntl({ prefix: 'Reactive', numberPrefix: 'r', rowAdjective: 'reactive' });

@Component({
  selector: 'nat-provider-accessibility-labels-host',
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableScrollControl,
    NatTableSurface,
    NatTableToolbar,
    NatToolbarItem
  ],
  providers: [
    { provide: PROVIDER_CONTROLS_INTL, useFactory: createProviderControlsIntl },
    provideNatTableControlsIntl(() => inject(PROVIDER_CONTROLS_INTL))
  ],
  template: `
    <nat-table-surface
      [enablePinning]="true"
      [enableReordering]="true"
      [enableSorting]="true"
      [initialState]="initialState"
      [state]="tableState()"
      (stateChange)="onTableStateChange($event)">
      <nat-table-toolbar>
        <button natToolbarItem="provider-action" type="button">Provider action</button>
      </nat-table-toolbar>
      <nat-table
        #grid="natTable"
        [columns]="columns"
        [data]="rows()"
        [enableRowSelection]="true"
        [getRowId]="getRowId"
        accessibleName="Operations table" />
      <nat-table-column-visibility />
      <nat-table-page-size [groupAriaLabel]="pageSizeGroupAriaLabel()" [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />
      <nat-table-scroll-control />
    </nat-table-surface>
  `
})
export class ProviderAccessibilityLabelsHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableSelectionColumn(
    withNatTableHeaderActions(reorderableColumns, {
      enableColumnReorderActions: true
    })
  );

  protected readonly getRowId = getRowId;
  protected readonly pageSizeOptions = [2, 3, 5] as const;
  public readonly tableState = signal<Partial<NatTableUserState>>({});
  protected readonly initialState: Partial<NatTableUserState> = {
    pagination: {
      pageIndex: 1,
      pageSize: 2
    }
  };

  public readonly pageSizeGroupAriaLabel = signal<string | undefined>(undefined);
  private readonly providerIntl = inject(PROVIDER_CONTROLS_INTL);

  public useReactiveProviderIntl(): void {
    this.providerIntl.set(reactiveControlsIntl);
  }

  protected onTableStateChange(state: Partial<NatTableUserState>): void {
    this.tableState.set(state);
  }
}
