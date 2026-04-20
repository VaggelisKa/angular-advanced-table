import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { type ColumnDef, type FilterFn } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

import { NatTableColumnVisibility } from './components/table-column-visibility/table-column-visibility';
import { withNatTableHeaderActions } from './components/table-header-actions/with-table-header-actions';
import { NatTablePageSize } from './components/table-page-size/table-page-size';
import { NatTablePager } from './components/table-pager/table-pager';
import { NatTableSearch } from './components/table-search/table-search';
import { NatTableSurface } from './components/table-surface/table-surface';
import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPagerLabels,
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
    NatTableSurface,
  ],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [initialState]="initialState"
      [allowColumnReorder]="allowColumnReorder"
      [enablePagination]="true"
      [getRowId]="getRowId"
      ariaLabel="Operations table"
      (stateChange)="onTableStateChange($event)"
    />

    <nat-table-surface>
      <nat-table-search [for]="grid" />
      <nat-table-column-visibility [for]="grid" />
      <nat-table-page-size [for]="grid" [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager [for]="grid" />
    </nat-table-surface>
  `,
})
class TableUiHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly columns = withNatTableHeaderActions(baseColumns);
  readonly getRowId = (row: Row) => row.id;
  readonly pageSizeOptions = [2, 3, 5] as const;
  allowColumnReorder = false;
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: {
      pageIndex: 1,
      pageSize: 2,
    },
  };

  onTableStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [NatTable],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      ariaLabel="Operations table"
      (stateChange)="onTableStateChange($event)"
    />
  `,
})
class CustomSortIndicatorHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly columns = withNatTableHeaderActions(baseColumns, {
    sortIndicator: ({ sortState }) =>
      sortState === 'asc' ? 'A' : sortState === 'desc' ? 'D' : '-',
  });
  readonly tableState = signal<Partial<NatTableState>>({});

  onTableStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableSurface,
  ],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [initialState]="initialState"
      [enablePagination]="true"
      [getRowId]="getRowId"
      ariaLabel="Operations table"
      (stateChange)="onTableStateChange($event)"
    />

    <nat-table-surface>
      <nat-table-column-visibility [for]="grid" [accessibilityLabels]="columnVisibilityLabels" />
      <nat-table-page-size
        [for]="grid"
        [pageSizeOptions]="pageSizeOptions"
        [accessibilityLabels]="pageSizeLabels"
      />
      <nat-table-pager [for]="grid" [accessibilityLabels]="pagerLabels" />
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
    pinButton: ({ label, toggleAction }) =>
      `${toggleAction === 'unpin' ? 'Frigør' : 'Fastgør'} kolonne ${label}`,
    pinButtonText: ({ toggleAction }) => (toggleAction === 'unpin' ? 'Frigør' : 'Fastgør'),
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

  onTableStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }
}

describe('ng-advanced-table-ui', () => {
  let fixture: ComponentFixture<TableUiHost>;
  let host: TableUiHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableUiHost, CustomSortIndicatorHost, CustomAccessibilityLabelsHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TableUiHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  async function recreateHost(
    options: {
      allowColumnReorder?: boolean;
    } = {},
  ): Promise<void> {
    fixture.destroy();
    fixture = TestBed.createComponent(TableUiHost);
    host = fixture.componentInstance;
    host.allowColumnReorder = options.allowColumnReorder ?? host.allowColumnReorder;
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

    expect(searchInput.getAttribute('aria-controls')).toBe(table.id);
    expect(columnChip.getAttribute('aria-controls')).toBe(table.id);
    expect(pageSizeButton.getAttribute('aria-controls')).toBe(table.id);
    expect(pagerButton.getAttribute('aria-controls')).toBe(table.id);
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
    await recreateHost({ allowColumnReorder: true });
    fixture.detectChanges();

    const headerLabel = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .header-label',
    ) as HTMLElement;
    const sortButton = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-button',
    ) as HTMLButtonElement;
    const sortIcon = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-icon',
    ) as HTMLElement;
    const pinButton = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"] .pin-button',
    ) as HTMLButtonElement;
    const reorderableHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLTableCellElement;

    expect(headerLabel.textContent?.trim()).toBe('Service');
    expect(reorderableHeader.classList.contains('is-reorderable')).toBe(true);
    expect(reorderableHeader.classList.contains('cdk-drag')).toBe(true);
    expect(reorderableHeader.querySelector('.column-reorder-handle')).toBeNull();
    expect(sortButton.classList.contains('cdk-drag-handle')).toBe(false);
    expect(pinButton.classList.contains('cdk-drag-handle')).toBe(false);
    expect(
      fixture.nativeElement
        .querySelector('thead th[data-column-id="name"]')
        ?.getAttribute('aria-sort'),
    ).toBeNull();
    expect(sortIcon.querySelector('.nat-default-sort')?.getAttribute('data-sort-state')).toBe(
      'none',
    );
    expect(sortIcon.querySelector('.nat-default-sort__svg')).toBeTruthy();
    expect(pinButton.textContent?.trim()).toBe('Pin');

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

    pinButton.click();
    fixture.detectChanges();

    expect(host.tableState().columnPinning).toEqual({
      left: ['name'],
      right: [],
    });
    expect(pinButton.classList.contains('is-pinned')).toBe(true);
    expect(pinButton.textContent?.trim()).toBe('Unpin');
    expect(pinButton.getAttribute('aria-pressed')).toBe('true');
    expect(headerLabel.textContent?.trim()).toBe('Service');
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

  it('renders caller-provided accessibility labels across the UI controls', () => {
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
    const previousButton = nativeElement.querySelector(
      'nat-table-pager .pager-button:first-child',
    ) as HTMLButtonElement;
    const nextButton = nativeElement.querySelector(
      'nat-table-pager .pager-button:last-child',
    ) as HTMLButtonElement;
    const sortButton = nativeElement.querySelector(
      'thead th[data-column-id="name"] .sort-button',
    ) as HTMLButtonElement;
    const pinButton = nativeElement.querySelector(
      'thead th[data-column-id="name"] .pin-button',
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

    expect(sortButton.getAttribute('aria-label')).toBe('Sorter Service');
    expect(pinButton.getAttribute('aria-label')).toBe('Fastgør kolonne Service');
    expect(pinButton.textContent?.trim()).toBe('Fastgør');

    pinButton.click();
    customFixture.detectChanges();

    const updatedPinButton = nativeElement.querySelector(
      'thead th[data-column-id="name"] .pin-button',
    ) as HTMLButtonElement;

    expect(updatedPinButton.getAttribute('aria-label')).toBe('Frigør kolonne Service');
    expect(updatedPinButton.textContent?.trim()).toBe('Frigør');

    firstColumnChip.click();
    customFixture.detectChanges();

    expect(firstColumnChip.getAttribute('aria-label')).toBe('Vis kolonne Service');
    expect(firstColumnState.textContent?.trim()).toBe('Skjult');
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
