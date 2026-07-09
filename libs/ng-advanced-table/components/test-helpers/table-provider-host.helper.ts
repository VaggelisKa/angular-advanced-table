import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { provideNatTableControlsIntl } from 'ng-advanced-table/locale';

import type { Row } from './table-data.helper';
import { buildRows, getRowId, reorderableColumns } from './table-data.helper';
import { NatTableColumnVisibility } from '../feature/table-column-visibility/table-column-visibility';
import { NatTablePageSize } from '../feature/table-page-size/table-page-size';
import { NatTablePager } from '../feature/table-pager/table-pager';
import { NatTableScrollControl } from '../feature/table-scroll-control/table-scroll-control';
import { NatTableSurface } from '../feature/table-surface/table-surface';
import { withNatTableHeaderActions } from '../ui/table-header-actions/with-table-header-actions';

@Component({
  selector: 'nat-provider-accessibility-labels-host',
  imports: [NatTable, NatTableColumnVisibility, NatTablePageSize, NatTablePager, NatTableScrollControl, NatTableSurface],
  providers: [
    provideNatTableControlsIntl({
      formatNumber: (value) => `n${value}`,
      search: {
        label: 'Provider search',
        placeholder: 'Provider placeholder'
      },
      columnVisibility: {
        label: 'Provider columns',
        groupAriaLabel: 'Provider column visibility',
        accessibilityLabels: {
          visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
            `Provider ${visibleColumnCountText}/${totalColumnCountText}`
        }
      },
      pageSize: {
        groupAriaLabel: 'Provider page size',
        accessibilityLabels: {
          groupAriaLabel: 'Provider page size group',
          pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} provider rows`,
          pageSizeOptionAriaLabel: ({ pageSizeText }) => `Provider show ${pageSizeText} rows`
        }
      },
      pager: {
        groupAriaLabel: 'Provider pager',
        accessibilityLabels: {
          previousPageAriaLabel: 'Provider previous',
          nextPageAriaLabel: 'Provider next',
          pageIndicator: ({ pageText, pageCountText }) => `Provider page ${pageText}/${pageCountText}`
        }
      },
      scrollControl: {
        groupAriaLabel: 'Provider horizontal scroll',
        accessibilityLabels: {
          scrollLeftAriaLabel: 'Provider scroll left',
          scrollRightAriaLabel: 'Provider scroll right',
          scrollPositionAriaLabel: 'Provider scroll position',
          scrollPositionText: ({ percentageText }) => `Provider ${percentageText} percent`
        }
      },
      headerActions: {
        accessibilityLabels: {
          sortButton: ({ label }) => `Provider sort ${label}`,
          menuButton: ({ label }) => `Provider actions for ${label}`,
          menuLabel: ({ label }) => `Provider menu for ${label}`,
          pinButton: ({ label, pinSide }) => `Provider pin ${label} ${pinSide}`,
          pinButtonText: ({ pinSide }) => `Provider ${pinSide}`,
          moveButton: ({ label, direction }) => `Provider move ${label} ${direction}`,
          moveButtonText: ({ direction }) => `Provider move ${direction}`
        }
      }
    })
  ],
  template: `
    <nat-table-surface
      [enablePinning]="true"
      [enableReordering]="true"
      [enableSorting]="true"
      [initialState]="initialState"
      [state]="tableState()"
      (stateChange)="onTableStateChange($event)">
      <nat-table #grid="natTable" [columns]="columns" [data]="rows()" [getRowId]="getRowId" accessibleName="Operations table" />
      <nat-table-column-visibility />
      <nat-table-page-size [groupAriaLabel]="pageSizeGroupAriaLabel()" [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />
      <nat-table-scroll-control />
    </nat-table-surface>
  `
})
export class ProviderAccessibilityLabelsHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(reorderableColumns, {
    enableColumnReorderActions: true
  });

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

  protected onTableStateChange(state: Partial<NatTableUserState>): void {
    this.tableState.set(state);
  }
}
