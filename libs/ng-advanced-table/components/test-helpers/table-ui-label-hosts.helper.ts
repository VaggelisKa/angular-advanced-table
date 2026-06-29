import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { provideNatTableControlsIntl, provideNatTableIntl } from 'ng-advanced-table/locale';
import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityScrollControlLabels
} from 'ng-advanced-table/locale';

import type { Row } from './table-ui-data.helper';
import { baseColumns, buildRows, danishPinLabel, getRowId } from './table-ui-data.helper';
import { NatTableColumnVisibility } from '../feature/table-column-visibility/table-column-visibility';
import { NatTablePageSize } from '../feature/table-page-size/table-page-size';
import { NatTablePager } from '../feature/table-pager/table-pager';
import { NatTableScrollControl } from '../feature/table-scroll-control/table-scroll-control';
import { NatTableSurface } from '../feature/table-surface/table-surface';
import { withNatTableHeaderActions } from '../ui/table-header-actions/with-table-header-actions';

@Component({
  selector: 'nat-custom-accessibility-labels-host',
  imports: [NatTable, NatTableColumnVisibility, NatTablePageSize, NatTablePager, NatTableScrollControl, NatTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState" [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table #grid="natTable" [columns]="columns" [data]="rows()" [getRowId]="getRowId" accessibleName="Operations table" />
      <nat-table-column-visibility [accessibilityLabels]="columnVisibilityLabels" />
      <nat-table-page-size [accessibilityLabels]="pageSizeLabels" [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager [accessibilityLabels]="pagerLabels" />
      <nat-table-scroll-control [accessibilityLabels]="scrollControlLabels" />
    </nat-table-surface>
  `
})
export class CustomAccessibilityLabelsHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly pageSizeLabels: NatTableAccessibilityPageSizeLabels = {
    groupAriaLabel: 'Rækker pr. side',
    pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rækker`,
    pageSizeOptionAriaLabel: ({ pageSizeText }) => `Vis ${pageSizeText} rækker`
  };

  protected readonly pagerLabels: NatTableAccessibilityPagerLabels = {
    groupAriaLabel: 'Sideskift',
    previousPageAriaLabel: 'Forrige side',
    nextPageAriaLabel: 'Næste side',
    pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`
  };

  protected readonly scrollControlLabels: NatTableAccessibilityScrollControlLabels = {
    groupAriaLabel: 'Vandret tabelrulning',
    scrollLeftAriaLabel: 'Rul tabel til venstre',
    scrollRightAriaLabel: 'Rul tabel til højre',
    scrollPositionAriaLabel: 'Vandret rulleposition',
    scrollPositionText: ({ percentageText }) => `${percentageText} procent`
  };

  protected readonly columnVisibilityLabels: NatTableAccessibilityColumnVisibilityLabels = {
    heading: 'Kolonner',
    groupAriaLabel: 'Kolonnesynlighed',
    visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
      `${visibleColumnCountText} af ${totalColumnCountText} synlige`,
    toggleColumnAriaLabel: ({ columnLabel, toggleAction }) => `${toggleAction === 'hide' ? 'Skjul' : 'Vis'} kolonne ${columnLabel}`,
    columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Synlig' : 'Skjult')
  };

  protected readonly headerActionLabels: NatTableAccessibilityHeaderActionLabels = {
    sortButton: ({ label }) => `Sorter ${label}`,
    menuButton: ({ label }) => `Kolonnehandlinger for ${label}`,
    menuLabel: ({ label }) => `Kolonnehandlinger for ${label}`,
    pinButton: ({ label, toggleAction, pinSide }) => danishPinLabel({ label, toggleAction, pinSide }),
    pinButtonText: ({ pinSide }) => (pinSide === 'left' ? 'Venstre' : 'Højre'),
    moveButton: ({ label, direction }) => `Flyt kolonne ${label} ${direction === 'left' ? 'til venstre' : 'til højre'}`,
    moveButtonText: ({ direction }) => (direction === 'left' ? 'Flyt til venstre' : 'Flyt til højre')
  };

  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    enableColumnReorderActions: true,
    accessibilityLabels: this.headerActionLabels
  });

  protected readonly getRowId = getRowId;
  protected readonly pageSizeOptions = [2, 3, 5] as const;
  public readonly tableState = signal<Partial<NatTableState>>({});
  protected readonly initialState: Partial<NatTableState> = {
    pagination: {
      pageIndex: 1,
      pageSize: 2
    }
  };

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-locale-switching-host',
  imports: [NatTable, NatTablePageSize, NatTablePager, NatTableSurface],
  providers: [
    provideNatTableIntl({
      locales: {
        da: {
          accessibilityText: {
            emptyState: 'Ingen rækker matcher visningen.',
            tableSummary: ({ visibleRowsText, visibleColumnsText }) => `${visibleRowsText} rækker og ${visibleColumnsText} kolonner.`
          }
        }
      }
    }),
    provideNatTableControlsIntl({
      locales: {
        da: {
          search: {
            label: 'Søg i rækker',
            placeholder: 'Søg i rækker'
          },
          pageSize: {
            groupAriaLabel: 'Rækker pr. side',
            accessibilityLabels: {
              pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} / side`,
              pageSizeOptionAriaLabel: ({ pageSizeText }) => `Vis ${pageSizeText} rækker pr. side`
            }
          },
          pager: {
            groupAriaLabel: 'Tabelsider',
            accessibilityLabels: {
              previousPageAriaLabel: 'Forrige side',
              nextPageAriaLabel: 'Næste side',
              pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`
            }
          }
        }
      }
    })
  ],
  template: `
    <nat-table-surface [locale]="locale()">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />

      <nat-table-page-size [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />
    </nat-table-surface>
  `
})
export class LocaleSwitchingHost {
  public readonly locale = signal('en');
  protected readonly rows = signal<Row[]>([]);
  protected readonly columns = baseColumns;
  protected readonly pageSizeOptions = [2, 3] as const;
}
