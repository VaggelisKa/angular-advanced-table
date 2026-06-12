import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { type ColumnDef, type FilterFn } from '@tanstack/angular-table';

import { NatTable, provideNatTableIntl, type NatTableState } from 'ng-advanced-table';

import { NatTableColumnVisibility } from './components/table-column-visibility/table-column-visibility';
import { withNatTableHeaderActions } from './components/table-header-actions/with-table-header-actions';
import { NatTablePageSize } from './components/table-page-size/table-page-size';
import { NatTablePager } from './components/table-pager/table-pager';
import { NatTableScrollControl } from './components/table-scroll-control/table-scroll-control';
import { NatTableSearch } from './components/table-search/table-search';
import { NatTableSurface } from './components/table-surface/table-surface';
import { provideNatTableUiIntl } from './shared/table-ui-intl';
import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityScrollControlLabels,
} from './shared/table-ui.types';

interface Row {
  id: string;
  name: string;
  region: string;
  status: 'Healthy' | 'Pending' | 'Alert';
  throughput: number;
}

const statusFilter: FilterFn<Row> = (row, columnId, filterValue) => {
  const selectedStatuses = (filterValue ?? []) as Row['status'][];

  if (!selectedStatuses.length) {
    return true;
  }

  return selectedStatuses.includes(row.getValue(columnId) as Row['status']);
};

const baseColumns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    size: 180,
    meta: {
      label: 'Service',
      rowHeader: true,
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'region',
    header: 'Region',
    size: 140,
    meta: {
      label: 'Region',
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    meta: {
      label: 'Status',
    },
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'throughput',
    header: 'Throughput',
    size: 160,
    meta: {
      label: 'Throughput',
      align: 'end',
    },
    cell: (info) => String(info.getValue<number>()),
  },
];

@Component({
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableSearch,
    NatTableScrollControl,
    NatTableSurface,
  ],
  template: `
    <nat-table-surface
      [state]="tableState()"
      [initialState]="initialState"
      (stateChange)="onTableStateChange($event)"
    >
      <nat-table-search />
      <nat-table-column-visibility />
      <nat-table-page-size [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />

      <nat-table
        [data]="rows()"
        [columns]="columns"
        [getRowId]="getRowId"
        accessibleName="Operations table"
      />

      <nat-table-scroll-control />
    </nat-table-surface>
  `,
})
class TableUiHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly columns = withNatTableHeaderActions(baseColumns);
  readonly getRowId = (row: Row) => row.id;
  readonly pageSizeOptions = [2, 3, 5] as const;
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: {
      pageIndex: 1,
      pageSize: 2,
    },
  };

  onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table
        [data]="rows()"
        [columns]="columns"
        accessibleName="Operations table"
      />
    </nat-table-surface>
  `,
})
class CustomSortIndicatorHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly columns = withNatTableHeaderActions(baseColumns, {
    sortIndicator: ({ sortState }) =>
      sortState === 'asc' ? 'A' : sortState === 'desc' ? 'D' : '-',
  });
  readonly tableState = signal<Partial<NatTableState>>({});

  onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table
        [data]="rows()"
        [columns]="columns"
        accessibleName="Operations table"
      />
    </nat-table-surface>
  `,
})
class HiddenHeaderActionLabelHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly columns = withNatTableHeaderActions(
    baseColumns.map((column) => {
      const accessorKey = (column as { accessorKey?: unknown }).accessorKey;

      if (accessorKey !== 'name') {
        return column;
      }

      return {
        ...column,
        meta: {
          rowHeader: column.meta?.rowHeader,
          hiddenHeaderLabel: 'Row actions',
        },
      };
    }),
  );
  readonly tableState = signal<Partial<NatTableState>>({});

  onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableScrollControl,
    NatTableSurface,
  ],
  template: `
    <nat-table-surface
      [state]="tableState()"
      [initialState]="initialState"
      (stateChange)="onTableStateChange($event)"
    >
      <nat-table
        #grid="natTable"
        [data]="rows()"
        [columns]="columns"
        [getRowId]="getRowId"
        accessibleName="Operations table"
      />
      <nat-table-column-visibility [accessibilityLabels]="columnVisibilityLabels" />
      <nat-table-page-size
        [pageSizeOptions]="pageSizeOptions"
        [accessibilityLabels]="pageSizeLabels"
      />
      <nat-table-pager [accessibilityLabels]="pagerLabels" />
      <nat-table-scroll-control [accessibilityLabels]="scrollControlLabels" />
    </nat-table-surface>
  `,
})
class CustomAccessibilityLabelsHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly pageSizeLabels: NatTableAccessibilityPageSizeLabels = {
    groupAriaLabel: 'Rækker pr. side',
    pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rækker`,
    pageSizeOptionAriaLabel: ({ pageSizeText }) => `Vis ${pageSizeText} rækker`,
  };
  readonly pagerLabels: NatTableAccessibilityPagerLabels = {
    groupAriaLabel: 'Sideskift',
    previousPageAriaLabel: 'Forrige side',
    nextPageAriaLabel: 'Næste side',
    pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`,
  };
  readonly scrollControlLabels: NatTableAccessibilityScrollControlLabels = {
    groupAriaLabel: 'Vandret tabelrulning',
    scrollLeftAriaLabel: 'Rul tabel til venstre',
    scrollRightAriaLabel: 'Rul tabel til højre',
    scrollPositionAriaLabel: 'Vandret rulleposition',
    scrollPositionText: ({ percentageText }) => `${percentageText} procent`,
  };
  readonly columnVisibilityLabels: NatTableAccessibilityColumnVisibilityLabels = {
    heading: 'Kolonner',
    groupAriaLabel: 'Kolonnesynlighed',
    visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
      `${visibleColumnCountText} af ${totalColumnCountText} synlige`,
    toggleColumnAriaLabel: ({ columnLabel, toggleAction }) =>
      `${toggleAction === 'hide' ? 'Skjul' : 'Vis'} kolonne ${columnLabel}`,
    columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Synlig' : 'Skjult'),
  };
  readonly headerActionLabels: NatTableAccessibilityHeaderActionLabels = {
    sortButton: ({ label }) => `Sorter ${label}`,
    menuButton: ({ label }) => `Kolonnehandlinger for ${label}`,
    menuLabel: ({ label }) => `Fastgørelsesmuligheder for ${label}`,
    pinButton: ({ label, toggleAction, pinSide }) =>
      `${toggleAction === 'unpin' ? 'Frigør' : 'Fastgør'} kolonne ${label} ${
        toggleAction === 'unpin' ? 'fra' : 'til'
      } ${pinSide === 'left' ? 'venstre' : 'højre'}`,
    pinButtonText: ({ pinSide }) => (pinSide === 'left' ? 'Venstre' : 'Højre'),
  };
  readonly columns = withNatTableHeaderActions(baseColumns, {
    accessibilityLabels: this.headerActionLabels,
  });
  readonly getRowId = (row: Row) => row.id;
  readonly pageSizeOptions = [2, 3, 5] as const;
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: {
      pageIndex: 1,
      pageSize: 2,
    },
  };

  onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableSearch,
    NatTableScrollControl,
    NatTableSurface,
  ],
  providers: [
    provideNatTableUiIntl({
      formatNumber: (value) => `n${value}`,
      search: {
        label: 'Provider search',
        placeholder: 'Provider placeholder',
      },
      columnVisibility: {
        label: 'Provider columns',
        groupAriaLabel: 'Provider column visibility',
        accessibilityLabels: {
          visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
            `Provider ${visibleColumnCountText}/${totalColumnCountText}`,
        },
      },
      pageSize: {
        groupAriaLabel: 'Provider page size',
        accessibilityLabels: {
          groupAriaLabel: 'Provider page size group',
          pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} provider rows`,
          pageSizeOptionAriaLabel: ({ pageSizeText }) => `Provider show ${pageSizeText} rows`,
        },
      },
      pager: {
        groupAriaLabel: 'Provider pager',
        accessibilityLabels: {
          previousPageAriaLabel: 'Provider previous',
          nextPageAriaLabel: 'Provider next',
          pageIndicator: ({ pageText, pageCountText }) =>
            `Provider page ${pageText}/${pageCountText}`,
        },
      },
      scrollControl: {
        groupAriaLabel: 'Provider horizontal scroll',
        accessibilityLabels: {
          scrollLeftAriaLabel: 'Provider scroll left',
          scrollRightAriaLabel: 'Provider scroll right',
          scrollPositionAriaLabel: 'Provider scroll position',
          scrollPositionText: ({ percentageText }) => `Provider ${percentageText} percent`,
        },
      },
      headerActions: {
        accessibilityLabels: {
          sortButton: ({ label }) => `Provider sort ${label}`,
          menuButton: ({ label }) => `Provider actions for ${label}`,
          menuLabel: ({ label }) => `Provider menu for ${label}`,
          pinButton: ({ label, pinSide }) => `Provider pin ${label} ${pinSide}`,
          pinButtonText: ({ pinSide }) => `Provider ${pinSide}`,
        },
      },
    }),
  ],
  template: `
    <nat-table-surface
      [state]="tableState()"
      [initialState]="initialState"
      (stateChange)="onTableStateChange($event)"
    >
      <nat-table
        #grid="natTable"
        [data]="rows()"
        [columns]="columns"
        [getRowId]="getRowId"
        accessibleName="Operations table"
      />
      <nat-table-search [label]="searchLabel()" />
      <nat-table-column-visibility />
      <nat-table-page-size
        [groupAriaLabel]="pageSizeGroupAriaLabel()"
        [pageSizeOptions]="pageSizeOptions"
      />
      <nat-table-pager />
      <nat-table-scroll-control />
    </nat-table-surface>
  `,
})
class ProviderAccessibilityLabelsHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly columns = withNatTableHeaderActions(baseColumns);
  readonly getRowId = (row: Row) => row.id;
  readonly pageSizeOptions = [2, 3, 5] as const;
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: {
      pageIndex: 1,
      pageSize: 2,
    },
  };
  readonly searchLabel = signal<string | undefined>(undefined);
  readonly pageSizeGroupAriaLabel = signal<string | undefined>(undefined);

  onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [NatTable, NatTablePageSize, NatTablePager, NatTableSearch, NatTableSurface],
  providers: [
    provideNatTableIntl({
      locales: {
        da: {
          accessibilityText: {
            emptyState: 'Ingen rækker matcher visningen.',
            tableSummary: ({ visibleRowsText, visibleColumnsText }) =>
              `${visibleRowsText} rækker og ${visibleColumnsText} kolonner.`,
          },
        },
      },
    }),
    provideNatTableUiIntl({
      locales: {
        da: {
          search: {
            label: 'Søg i rækker',
            placeholder: 'Søg i rækker',
          },
          pageSize: {
            groupAriaLabel: 'Rækker pr. side',
            accessibilityLabels: {
              pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} / side`,
              pageSizeOptionAriaLabel: ({ pageSizeText }) => `Vis ${pageSizeText} rækker pr. side`,
            },
          },
          pager: {
            groupAriaLabel: 'Tabelsider',
            accessibilityLabels: {
              previousPageAriaLabel: 'Forrige side',
              nextPageAriaLabel: 'Næste side',
              pageIndicator: ({ pageText, pageCountText }) =>
                `Side ${pageText} af ${pageCountText}`,
            },
          },
        },
      },
    }),
  ],
  template: `
    <nat-table-surface [locale]="locale()">
      <nat-table
        [data]="rows()"
        [columns]="columns"
        accessibleName="Operations table"
      />

      <nat-table-search />
      <nat-table-page-size [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />
    </nat-table-surface>
  `,
})
class LocaleSwitchingHost {
  readonly locale = signal('en');
  readonly rows = signal<Row[]>([]);
  readonly columns = baseColumns;
  readonly pageSizeOptions = [2, 3] as const;
}

@Component({
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table
        [data]="rows()"
        [columns]="columns"
        accessibleName="Operations table"
      />
    </nat-table-surface>
  `,
})
class HeaderActionCompositionHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly columns = withNatTableHeaderActions(
    withNatTableHeaderActions(buildHeaderActionCompositionColumns(), {
      sortIndicator: 'F',
      accessibilityLabels: {
        sortButton: ({ label }) => `First sort ${label}`,
        menuButton: ({ label }) => `First menu ${label}`,
        menuLabel: ({ label }) => `First pin menu ${label}`,
      },
    }),
    {
      sortIndicator: 'S',
      accessibilityLabels: {
        sortButton: ({ label }) => `Second sort ${label}`,
        menuButton: ({ label }) => `Second menu ${label}`,
        menuLabel: ({ label }) => `Second pin menu ${label}`,
      },
    },
  );
  readonly tableState = signal<Partial<NatTableState>>({});

  onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

describe('ng-advanced-table-ui', () => {
  let fixture: ComponentFixture<TableUiHost>;
  let host: TableUiHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableUiHost,
        CustomSortIndicatorHost,
        HiddenHeaderActionLabelHost,
        CustomAccessibilityLabelsHost,
        ProviderAccessibilityLabelsHost,
        LocaleSwitchingHost,
        HeaderActionCompositionHost,
      ],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TableUiHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  async function recreateHost(): Promise<void> {
    fixture.destroy();
    fixture = TestBed.createComponent(TableUiHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  }

  it('renders projected controls inside the themed surface', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nat-table-surface .surface')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.search-input')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.column-chip').length).toBe(4);
  });

  it('updates the global filter and resets pagination through NatTableSearch', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;

    searchInput.value = 'gamma';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.tableState().globalFilter).toBe('gamma');
    expect(host.tableState().pagination?.pageIndex).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('associates companion controls with the table element', () => {
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('nat-table table') as HTMLTableElement;
    const searchInput = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    const columnChip = fixture.nativeElement.querySelector('.column-chip') as HTMLButtonElement;
    const pageSizeButton = fixture.nativeElement.querySelector(
      'nat-table-page-size .chip',
    ) as HTMLButtonElement;
    const pagerButton = fixture.nativeElement.querySelector(
      'nat-table-pager .pager-button',
    ) as HTMLButtonElement;
    const scrollButton = fixture.nativeElement.querySelector(
      'nat-table-scroll-control .scroll-button',
    ) as HTMLButtonElement;
    const scrollRange = fixture.nativeElement.querySelector(
      'nat-table-scroll-control .scroll-range',
    ) as HTMLInputElement;

    expect(searchInput.getAttribute('aria-controls')).toBe(table.id);
    expect(columnChip.getAttribute('aria-controls')).toBe(table.id);
    expect(pageSizeButton.getAttribute('aria-controls')).toBe(table.id);
    expect(pagerButton.getAttribute('aria-controls')).toBe(table.id);
    expect(scrollButton.getAttribute('aria-controls')).toBe(table.id);
    expect(scrollRange.getAttribute('aria-controls')).toBe(table.id);
  });

  it('controls the horizontal table scroll position with buttons and the range bar', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const tableRegion = fixture.nativeElement.querySelector(
      'nat-table .table-region',
    ) as HTMLElement;
    const leftButton = fixture.nativeElement.querySelector(
      'nat-table-scroll-control .scroll-button-left',
    ) as HTMLButtonElement;
    const rightButton = fixture.nativeElement.querySelector(
      'nat-table-scroll-control .scroll-button-right',
    ) as HTMLButtonElement;
    const range = fixture.nativeElement.querySelector(
      'nat-table-scroll-control .scroll-range',
    ) as HTMLInputElement;
    const position = fixture.nativeElement.querySelector(
      'nat-table-scroll-control .scroll-range-copy',
    ) as HTMLElement;

    setScrollMetrics(tableRegion, {
      clientWidth: 300,
      scrollWidth: 900,
    });
    tableRegion.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(leftButton.disabled).toBe(true);
    expect(rightButton.disabled).toBe(false);
    expect(range.max).toBe('600');
    expect(range.value).toBe('0');
    expect(position.textContent?.trim()).toBe('0% scrolled');

    rightButton.click();
    fixture.detectChanges();

    expect(tableRegion.scrollLeft).toBe(240);
    expect(leftButton.disabled).toBe(false);
    expect(range.value).toBe('240');
    expect(range.getAttribute('aria-valuetext')).toBe('40% scrolled');

    range.value = '600';
    range.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(tableRegion.scrollLeft).toBe(600);
    expect(rightButton.disabled).toBe(true);
    expect(position.textContent?.trim()).toBe('100% scrolled');
  });

  it('toggles column visibility and keeps the last visible column enabled', () => {
    fixture.detectChanges();

    for (const columnId of ['region', 'status', 'throughput']) {
      const chip = fixture.nativeElement.querySelector(
        `.column-chip[data-column-id="${columnId}"]`,
      ) as HTMLButtonElement;

      chip.click();
      fixture.detectChanges();
    }

    const lastVisibleChip = fixture.nativeElement.querySelector(
      '.column-chip[data-column-id="name"]',
    ) as HTMLButtonElement;

    expect(lastVisibleChip.disabled).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('thead th').length).toBe(1);
  });

  it('updates page size and pager state through the UI controls', () => {
    fixture.detectChanges();

    const pageSizeButton = Array.from(
      fixture.nativeElement.querySelectorAll('nat-table-page-size .chip'),
    )
      .map((button) => button as HTMLButtonElement)
      .find((button) => button.textContent?.includes('3 / page')) as HTMLButtonElement;
    const nextButton = fixture.nativeElement.querySelector(
      'nat-table-pager .pager-button:last-child',
    ) as HTMLButtonElement;

    pageSizeButton.click();
    fixture.detectChanges();

    expect(host.tableState().pagination).toEqual({
      pageIndex: 0,
      pageSize: 3,
    });

    nextButton.click();
    fixture.detectChanges();

    expect(host.tableState().pagination).toEqual({
      pageIndex: 1,
      pageSize: 3,
    });
  });

  it('wraps headers with sort and pin actions without losing the original label', async () => {
    await recreateHost();
    fixture.detectChanges();

    const headerLabel = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .header-label',
    ) as HTMLElement;
    const sortButton = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-button',
    ) as HTMLButtonElement;
    const menuButton = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .menu-button',
    ) as HTMLButtonElement;
    const sortIcon = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-icon',
    ) as HTMLElement;
    const reorderableHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLTableCellElement;

    expect(headerLabel.textContent?.trim()).toBe('Service');
    expect(reorderableHeader.classList.contains('is-reorderable')).toBe(true);
    expect(reorderableHeader.classList.contains('cdk-drag')).toBe(true);
    expect(reorderableHeader.querySelector('.column-reorder-handle')).toBeNull();
    expect(sortButton.classList.contains('cdk-drag-handle')).toBe(false);
    expect(menuButton.classList.contains('cdk-drag-handle')).toBe(false);
    expect(
      fixture.nativeElement
        .querySelector('thead th[data-column-id="name"]')
        ?.getAttribute('aria-sort'),
    ).toBeNull();
    expect(sortIcon.querySelector('.nat-default-sort')?.getAttribute('data-sort-state')).toBe(
      'none',
    );
    expect(sortIcon.querySelector('.nat-default-sort__svg')).toBeTruthy();
    expect(menuButton.getAttribute('aria-label')).toBe('Open column actions for Service');
    expect(menuButton.querySelector('.menu-button__icon')).toBeTruthy();

    sortButton.click();
    fixture.detectChanges();

    expect(host.tableState().sorting).toEqual([{ id: 'name', desc: false }]);
    expect(sortButton.classList.contains('is-sorted')).toBe(true);
    expect(
      fixture.nativeElement
        .querySelector('thead th[data-column-id="name"]')
        ?.getAttribute('aria-sort'),
    ).toBe('ascending');
    expect(
      fixture.nativeElement
        .querySelector('thead th[data-column-id="name"] .nat-default-sort')
        ?.getAttribute('data-sort-state'),
    ).toBe('asc');

    menuButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const openMenu = getOpenPinMenu();
    const leftPinMenuItem = getOpenMenuItem('left');
    const rightPinMenuItem = getOpenMenuItem('right');

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(openMenu?.getAttribute('role')).toBe('menu');
    expect(openMenu?.getAttribute('aria-label')).toBe('Column pinning options for Service');
    expect(leftPinMenuItem.getAttribute('role')).toBe('menuitem');
    expect(rightPinMenuItem.getAttribute('role')).toBe('menuitem');
    expect(leftPinMenuItem.querySelector('.column-menu-item__label')?.textContent?.trim()).toBe(
      'Pin left',
    );
    expect(rightPinMenuItem.querySelector('.column-menu-item__label')?.textContent?.trim()).toBe(
      'Pin right',
    );
    expect(
      leftPinMenuItem.querySelector('.column-menu-item__dock[data-pin-side="left"]'),
    ).toBeTruthy();
    expect(
      rightPinMenuItem.querySelector('.column-menu-item__dock[data-pin-side="right"]'),
    ).toBeTruthy();

    leftPinMenuItem.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.tableState().columnPinning).toEqual({
      left: ['name'],
      right: [],
    });

    menuButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const updatedLeftPinMenuItem = getOpenMenuItem('left');
    const updatedRightPinMenuItem = getOpenMenuItem('right');

    expect(updatedLeftPinMenuItem.classList.contains('is-active')).toBe(true);
    expect(updatedRightPinMenuItem.classList.contains('is-active')).toBe(false);

    updatedRightPinMenuItem.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.tableState().columnPinning).toEqual({
      left: [],
      right: ['name'],
    });
    expect(getHeaderColumnIds(fixture)).toEqual(['region', 'status', 'throughput', 'name']);
    const rightPinnedHeaderActions = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .header-actions-row',
    ) as HTMLElement;

    expect(rightPinnedHeaderActions.lastElementChild?.classList.contains('header-controls')).toBe(
      true,
    );
    expect(headerLabel.textContent?.trim()).toBe('Service');
  });

  it('keeps header action controls visible when the header label is hidden', () => {
    const hiddenFixture = TestBed.createComponent(HiddenHeaderActionLabelHost);

    hiddenFixture.detectChanges();

    const nameHeader = hiddenFixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLElement;
    const headerLabel = nameHeader.querySelector('.header-label') as HTMLElement;
    const sortButton = nameHeader.querySelector('.sort-button') as HTMLButtonElement;
    const menuButton = nameHeader.querySelector('.menu-button') as HTMLButtonElement;

    expect(headerLabel.classList.contains('sr-only')).toBe(true);
    expect(headerLabel.textContent?.trim()).toBe('Row actions');
    expect(sortButton).toBeTruthy();
    expect(menuButton).toBeTruthy();
    expect(sortButton.getAttribute('aria-label')).toBe('Change sorting for Row actions');
    expect(menuButton.getAttribute('aria-label')).toBe('Open column actions for Row actions');

    hiddenFixture.destroy();
  });

  it('keeps the column actions menu on the right for end-aligned headers', () => {
    fixture.detectChanges();

    const endAlignedHeaderContent = fixture.nativeElement.querySelector(
      'thead th[data-column-id="throughput"] .header-content',
    ) as HTMLElement;
    const endAlignedHeaderActions = fixture.nativeElement.querySelector(
      'thead th[data-column-id="throughput"] .header-actions-row',
    ) as HTMLElement;

    expect(endAlignedHeaderContent.classList.contains('is-align-end')).toBe(true);
    expect(endAlignedHeaderActions.lastElementChild?.classList.contains('header-controls')).toBe(
      true,
    );
  });

  it('keeps the column actions menu on the right for right-pinned end-aligned headers', async () => {
    fixture.detectChanges();

    const throughputMenuButton = fixture.nativeElement.querySelector(
      'thead th[data-column-id="throughput"] .menu-button',
    ) as HTMLButtonElement;

    throughputMenuButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    getOpenMenuItem('right').click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.tableState().columnPinning).toEqual({
      left: [],
      right: ['throughput'],
    });

    const rightPinnedEndAlignedHeaderActions = fixture.nativeElement.querySelector(
      'thead th[data-column-id="throughput"] .header-actions-row',
    ) as HTMLElement;

    expect(
      rightPinnedEndAlignedHeaderActions.lastElementChild?.classList.contains('header-controls'),
    ).toBe(true);
  });

  it('announces sort and filter updates through the table live region', async () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    const sortButton = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-button',
    ) as HTMLButtonElement;
    const liveRegion = fixture.nativeElement.querySelector(
      'nat-table p[aria-live="polite"]',
    ) as HTMLElement;

    searchInput.value = 'gamma';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(liveRegion.textContent?.trim()).toBe('Showing 1 matching row for "gamma".');

    sortButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(liveRegion.textContent?.trim()).toBe('Sorted by Service ascending.');
  });

  it('renders caller-provided sort indicator content through header actions', () => {
    const customFixture = TestBed.createComponent(CustomSortIndicatorHost);

    customFixture.detectChanges();

    let sortIcon = customFixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-icon',
    ) as HTMLElement;
    const sortButton = customFixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-button',
    ) as HTMLButtonElement;

    expect(sortIcon.textContent?.trim()).toBe('-');

    sortButton.click();
    customFixture.detectChanges();

    sortIcon = customFixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-icon',
    ) as HTMLElement;

    expect(sortIcon.textContent?.trim()).toBe('A');
    expect(sortIcon.textContent).not.toContain('↕');
  });

  it('renders caller-provided accessibility labels across the UI controls', async () => {
    const customFixture = TestBed.createComponent(CustomAccessibilityLabelsHost);

    customFixture.detectChanges();

    const nativeElement = customFixture.nativeElement as HTMLElement;
    const visibilityHeading = nativeElement.querySelector(
      'nat-table-column-visibility .control-label',
    ) as HTMLElement;
    const visibilityCaption = nativeElement.querySelector(
      'nat-table-column-visibility .control-caption',
    ) as HTMLElement;
    const visibilityGroup = nativeElement.querySelector(
      'nat-table-column-visibility .chip-row',
    ) as HTMLElement;
    const firstColumnChip = nativeElement.querySelector(
      'nat-table-column-visibility .column-chip',
    ) as HTMLButtonElement;
    const firstColumnState = firstColumnChip.querySelector('.chip-count') as HTMLElement;
    const pageSizeGroup = nativeElement.querySelector(
      'nat-table-page-size .chip-row',
    ) as HTMLElement;
    const pageSizeButton = nativeElement.querySelector(
      'nat-table-page-size .chip',
    ) as HTMLButtonElement;
    const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
    const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
    const scrollControl = nativeElement.querySelector(
      'nat-table-scroll-control .scroll-control',
    ) as HTMLElement;
    const scrollLeftButton = nativeElement.querySelector(
      'nat-table-scroll-control .scroll-button-left',
    ) as HTMLButtonElement;
    const scrollRightButton = nativeElement.querySelector(
      'nat-table-scroll-control .scroll-button-right',
    ) as HTMLButtonElement;
    const scrollRange = nativeElement.querySelector(
      'nat-table-scroll-control .scroll-range',
    ) as HTMLInputElement;
    const scrollPosition = nativeElement.querySelector(
      'nat-table-scroll-control .scroll-range-copy',
    ) as HTMLElement;
    const previousButton = nativeElement.querySelector(
      'nat-table-pager .pager-button:first-child',
    ) as HTMLButtonElement;
    const nextButton = nativeElement.querySelector(
      'nat-table-pager .pager-button:last-child',
    ) as HTMLButtonElement;
    const sortButton = nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-button',
    ) as HTMLButtonElement;
    const menuButton = nativeElement.querySelector(
      'thead th[data-column-id="name"] .menu-button',
    ) as HTMLButtonElement;

    expect(visibilityHeading.textContent?.trim()).toBe('Kolonner');
    expect(visibilityCaption.textContent?.trim()).toBe('4 af 4 synlige');
    expect(visibilityGroup.getAttribute('aria-label')).toBe('Kolonnesynlighed');
    expect(firstColumnChip.getAttribute('aria-label')).toBe('Skjul kolonne Service');
    expect(firstColumnState.textContent?.trim()).toBe('Synlig');

    expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rækker pr. side');
    expect(pageSizeButton.textContent?.trim()).toBe('2 rækker');
    expect(pageSizeButton.getAttribute('aria-label')).toBe('Vis 2 rækker');

    expect(pager.getAttribute('aria-label')).toBe('Sideskift');
    expect(pagerLabel.textContent?.trim()).toBe('Side 2 af 3');
    expect(previousButton.getAttribute('aria-label')).toBe('Forrige side');
    expect(nextButton.getAttribute('aria-label')).toBe('Næste side');

    expect(scrollControl.getAttribute('aria-label')).toBe('Vandret tabelrulning');
    expect(scrollLeftButton.getAttribute('aria-label')).toBe('Rul tabel til venstre');
    expect(scrollRightButton.getAttribute('aria-label')).toBe('Rul tabel til højre');
    expect(scrollRange.getAttribute('aria-label')).toBe('Vandret rulleposition');
    expect(scrollPosition.textContent?.trim()).toBe('0 procent');

    expect(sortButton.getAttribute('aria-label')).toBe('Sorter Service');
    expect(menuButton.getAttribute('aria-label')).toBe('Kolonnehandlinger for Service');

    menuButton.click();
    customFixture.detectChanges();
    await customFixture.whenStable();
    customFixture.detectChanges();

    expect(getOpenPinMenu()?.getAttribute('aria-label')).toBe('Fastgørelsesmuligheder for Service');

    const leftPinMenuItem = getOpenMenuItem('left');
    const rightPinMenuItem = getOpenMenuItem('right');

    expect(leftPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til venstre');
    expect(leftPinMenuItem.querySelector('.column-menu-item__label')?.textContent?.trim()).toBe(
      'Venstre',
    );
    expect(rightPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til højre');
    expect(rightPinMenuItem.querySelector('.column-menu-item__label')?.textContent?.trim()).toBe(
      'Højre',
    );

    leftPinMenuItem.click();
    customFixture.detectChanges();
    await customFixture.whenStable();
    customFixture.detectChanges();

    menuButton.click();
    customFixture.detectChanges();
    await customFixture.whenStable();
    customFixture.detectChanges();

    const updatedLeftPinMenuItem = getOpenMenuItem('left');
    const updatedRightPinMenuItem = getOpenMenuItem('right');

    expect(updatedLeftPinMenuItem.getAttribute('aria-label')).toBe(
      'Frigør kolonne Service fra venstre',
    );
    expect(
      updatedLeftPinMenuItem.querySelector('.column-menu-item__label')?.textContent?.trim(),
    ).toBe('Venstre');
    expect(updatedRightPinMenuItem.getAttribute('aria-label')).toBe(
      'Fastgør kolonne Service til højre',
    );
    expect(
      updatedRightPinMenuItem.querySelector('.column-menu-item__label')?.textContent?.trim(),
    ).toBe('Højre');

    firstColumnChip.click();
    customFixture.detectChanges();

    expect(firstColumnChip.getAttribute('aria-label')).toBe('Vis kolonne Service');
    expect(firstColumnState.textContent?.trim()).toBe('Skjult');

    customFixture.destroy();
  });

  it('uses provider accessibility labels and lets component inputs override them', async () => {
    const providerFixture = TestBed.createComponent(ProviderAccessibilityLabelsHost);
    const providerHost = providerFixture.componentInstance;

    providerFixture.detectChanges();

    const nativeElement = providerFixture.nativeElement as HTMLElement;
    const searchLabel = nativeElement.querySelector(
      'nat-table-search .control-label',
    ) as HTMLElement;
    const searchInput = nativeElement.querySelector(
      'nat-table-search .search-input',
    ) as HTMLInputElement;
    const visibilityHeading = nativeElement.querySelector(
      'nat-table-column-visibility .control-label',
    ) as HTMLElement;
    const visibilityCaption = nativeElement.querySelector(
      'nat-table-column-visibility .control-caption',
    ) as HTMLElement;
    const visibilityGroup = nativeElement.querySelector(
      'nat-table-column-visibility .chip-row',
    ) as HTMLElement;
    const pageSizeGroup = nativeElement.querySelector(
      'nat-table-page-size .chip-row',
    ) as HTMLElement;
    const pageSizeButton = nativeElement.querySelector(
      'nat-table-page-size .chip',
    ) as HTMLButtonElement;
    const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
    const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
    const previousButton = nativeElement.querySelector(
      'nat-table-pager .pager-button:first-child',
    ) as HTMLButtonElement;
    const nextButton = nativeElement.querySelector(
      'nat-table-pager .pager-button:last-child',
    ) as HTMLButtonElement;
    const scrollControl = nativeElement.querySelector(
      'nat-table-scroll-control .scroll-control',
    ) as HTMLElement;
    const scrollPosition = nativeElement.querySelector(
      'nat-table-scroll-control .scroll-range-copy',
    ) as HTMLElement;
    const sortButton = nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-button',
    ) as HTMLButtonElement;
    const menuButton = nativeElement.querySelector(
      'thead th[data-column-id="name"] .menu-button',
    ) as HTMLButtonElement;

    expect(searchLabel.textContent?.trim()).toBe('Provider search');
    expect(searchInput.placeholder).toBe('Provider placeholder');
    expect(visibilityHeading.textContent?.trim()).toBe('Provider columns');
    expect(visibilityCaption.textContent?.trim()).toBe('Provider n4/n4');
    expect(visibilityGroup.getAttribute('aria-label')).toBe('Provider column visibility');
    expect(pageSizeGroup.getAttribute('aria-label')).toBe('Provider page size group');
    expect(pageSizeButton.textContent?.trim()).toBe('n2 provider rows');
    expect(pageSizeButton.getAttribute('aria-label')).toBe('Provider show n2 rows');
    expect(pager.getAttribute('aria-label')).toBe('Provider pager');
    expect(pagerLabel.textContent?.trim()).toBe('Provider page n2/n3');
    expect(previousButton.getAttribute('aria-label')).toBe('Provider previous');
    expect(nextButton.getAttribute('aria-label')).toBe('Provider next');
    expect(scrollControl.getAttribute('aria-label')).toBe('Provider horizontal scroll');
    expect(scrollPosition.textContent?.trim()).toBe('Provider n0 percent');
    expect(sortButton.getAttribute('aria-label')).toBe('Provider sort Service');
    expect(menuButton.getAttribute('aria-label')).toBe('Provider actions for Service');

    menuButton.click();
    providerFixture.detectChanges();
    await providerFixture.whenStable();
    providerFixture.detectChanges();

    expect(getOpenPinMenu()?.getAttribute('aria-label')).toBe('Provider menu for Service');
    expect(getOpenMenuItem('left').textContent).toContain('Provider left');

    providerHost.searchLabel.set('Input search');
    providerHost.pageSizeGroupAriaLabel.set('Input page size');
    providerFixture.detectChanges();

    expect(searchLabel.textContent?.trim()).toBe('Input search');
    expect(searchInput.placeholder).toBe('Provider placeholder');
    expect(pageSizeGroup.getAttribute('aria-label')).toBe('Input page size');

    providerFixture.destroy();
  });

  it('switches table and companion-control locale labels dynamically', () => {
    const localeFixture = TestBed.createComponent(LocaleSwitchingHost);
    const localeHost = localeFixture.componentInstance;

    localeFixture.detectChanges();

    const nativeElement = localeFixture.nativeElement as HTMLElement;
    const emptyState = nativeElement.querySelector('.empty-state') as HTMLElement;
    const tableSummary = nativeElement.querySelector('p.sr-only') as HTMLElement;
    const searchLabel = nativeElement.querySelector(
      'nat-table-search .control-label',
    ) as HTMLElement;
    const searchInput = nativeElement.querySelector(
      'nat-table-search .search-input',
    ) as HTMLInputElement;
    const pageSizeGroup = nativeElement.querySelector(
      'nat-table-page-size .chip-row',
    ) as HTMLElement;
    const pageSizeButton = nativeElement.querySelector(
      'nat-table-page-size .chip',
    ) as HTMLButtonElement;
    const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
    const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
    const nextButton = nativeElement.querySelector(
      'nat-table-pager .pager-button:last-child',
    ) as HTMLButtonElement;

    expect(emptyState.textContent?.trim()).toBe('No rows match the current view.');
    expect(tableSummary.textContent?.trim()).toBe(
      'No rows are currently shown. 4 visible columns. Page 1 of 1.',
    );
    expect(searchLabel.textContent?.trim()).toBe('Search rows');
    expect(searchInput.placeholder).toBe('Search rows');
    expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rows per page');
    expect(pageSizeButton.textContent?.trim()).toBe('2 / page');
    expect(pageSizeButton.getAttribute('aria-label')).toBe('Show 2 rows per page');
    expect(pager.getAttribute('aria-label')).toBe('Table pagination');
    expect(pagerLabel.textContent?.trim()).toBe('Page 1 / 1');
    expect(nextButton.getAttribute('aria-label')).toBe('Next page');

    localeHost.locale.set('da');
    localeFixture.detectChanges();

    expect(emptyState.textContent?.trim()).toBe('Ingen rækker matcher visningen.');
    expect(tableSummary.textContent?.trim()).toBe('0 rækker og 4 kolonner.');
    expect(searchLabel.textContent?.trim()).toBe('Søg i rækker');
    expect(searchInput.placeholder).toBe('Søg i rækker');
    expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rækker pr. side');
    expect(pageSizeButton.textContent?.trim()).toBe('2 / side');
    expect(pageSizeButton.getAttribute('aria-label')).toBe('Vis 2 rækker pr. side');
    expect(pager.getAttribute('aria-label')).toBe('Tabelsider');
    expect(pagerLabel.textContent?.trim()).toBe('Side 1 af 1');
    expect(nextButton.getAttribute('aria-label')).toBe('Næste side');

    localeFixture.destroy();
  });

  it('applies header actions idempotently and honors per-column metadata', async () => {
    const compositionFixture = TestBed.createComponent(HeaderActionCompositionHost);

    compositionFixture.detectChanges();

    const nativeElement = compositionFixture.nativeElement as HTMLElement;
    const nameHeader = nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLElement;
    const regionHeader = nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLElement;
    const statusHeader = nativeElement.querySelector(
      'thead th[data-column-id="status"]',
    ) as HTMLElement;
    const nameSortButton = nameHeader.querySelector('.sort-button') as HTMLButtonElement;
    const statusSortButton = statusHeader.querySelector('.sort-button') as HTMLButtonElement;
    const nameMenuButton = nameHeader.querySelector('.menu-button') as HTMLButtonElement;

    expect(nameHeader.querySelectorAll('.header-actions-row').length).toBe(1);
    expect(nameHeader.querySelectorAll('.sort-button').length).toBe(1);
    expect(nameHeader.querySelector('.header-label')?.textContent?.trim()).toBe('Service');
    expect(nameHeader.querySelector('.sort-icon')?.textContent?.trim()).toBe('S');
    expect(nameSortButton.getAttribute('aria-label')).toBe('Second sort Service');
    expect(nameMenuButton.getAttribute('aria-label')).toBe('Second menu Service');

    expect(regionHeader.querySelector('.sort-button')).toBeNull();
    expect(regionHeader.querySelector('.menu-button')).toBeNull();
    expect(regionHeader.textContent?.trim()).toBe('Region');

    expect(statusHeader.querySelectorAll('.header-actions-row').length).toBe(1);
    expect(statusHeader.querySelector('.sort-icon')?.textContent?.trim()).toBe('Column');
    expect(statusSortButton.getAttribute('aria-label')).toBe('Column override for Status');

    nameMenuButton.click();
    compositionFixture.detectChanges();
    await compositionFixture.whenStable();
    compositionFixture.detectChanges();

    expect(getOpenPinMenu()?.getAttribute('aria-label')).toBe('Second pin menu Service');

    compositionFixture.destroy();
  });
});

function buildRows(size: number): Row[] {
  const statuses: Row['status'][] = ['Healthy', 'Pending', 'Alert'];

  return Array.from({ length: size }, (_, index) => ({
    id: `svc-${String(index + 1).padStart(5, '0')}`,
    name: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'][index] ?? `Service ${index + 1}`,
    region: ['us-east-1', 'eu-west-3'][index % 2],
    status: statuses[index % statuses.length],
    throughput: 1000 + index * 1000,
  }));
}

function buildHeaderActionCompositionColumns(): ColumnDef<Row, unknown>[] {
  return baseColumns.map((column) => {
    const accessorKey = (column as { accessorKey?: unknown }).accessorKey;

    if (accessorKey === 'region') {
      return {
        ...column,
        meta: {
          ...column.meta,
          headerActions: false,
        },
      };
    }

    if (accessorKey === 'status') {
      return {
        ...column,
        meta: {
          ...column.meta,
          headerActions: {
            sortIndicator: 'Column',
            accessibilityLabels: {
              sortButton: ({ label }) => `Column override for ${label}`,
            },
          },
        },
      };
    }

    return column;
  });
}

function getHeaderColumnIds(fixture: ComponentFixture<TableUiHost>): string[] {
  return Array.from(fixture.nativeElement.querySelectorAll('thead th[data-column-id]')).map(
    (header) => (header as HTMLElement).dataset['columnId'] ?? '',
  );
}

function getOpenPinMenu(): HTMLElement | null {
  const menus = Array.from(document.querySelectorAll('.column-menu')) as HTMLElement[];

  return menus.at(-1) ?? null;
}

function getOpenMenuItem(side: 'left' | 'right'): HTMLButtonElement {
  const menu = getOpenPinMenu();

  if (!menu) {
    throw new Error('Expected the pin menu to be open.');
  }

  const item = menu.querySelector(
    `.column-menu-item[data-pin-side="${side}"]`,
  ) as HTMLButtonElement | null;

  if (!item) {
    throw new Error(`Expected a menu item for pin side "${side}".`);
  }

  return item;
}

function setScrollMetrics(
  element: HTMLElement,
  metrics: {
    clientWidth: number;
    scrollWidth: number;
  },
): void {
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    value: metrics.clientWidth,
  });
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    value: metrics.scrollWidth,
  });
}
