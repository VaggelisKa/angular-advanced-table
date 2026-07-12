import { Component, inject, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { provideNatTableControlsIntl } from 'ng-advanced-table/locale';

import type { Row } from './table-data.helper';
import { buildRows, getRowId, reorderableColumns } from './table-data.helper';
import { PROVIDER_CONTROLS_INTL, REACTIVE_CONTROLS_INTL, createProviderControlsIntl } from './table-provider-intl.helper';
import { NatTableColumnVisibility } from '../feature/table-column-visibility/table-column-visibility';
import { NatTablePageSize } from '../feature/table-page-size/table-page-size';
import { NatTablePager } from '../feature/table-pager/table-pager';
import { NatTableScrollControl } from '../feature/table-scroll-control/table-scroll-control';
import { NatTableSurface } from '../feature/table-surface/table-surface';
import { NatTableToolbar } from '../feature/table-toolbar/table-toolbar';
import { withNatTableHeaderActions } from '../ui/table-header-actions/with-table-header-actions';
import { withNatTableSelectionColumn } from '../ui/table-selection/with-table-selection-column';
import { NatToolbarItem } from '../ui/toolbar-item/toolbar-item.directive';

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
    this.providerIntl.set(REACTIVE_CONTROLS_INTL);
  }

  protected onTableStateChange(state: Partial<NatTableUserState>): void {
    this.tableState.set(state);
  }
}
