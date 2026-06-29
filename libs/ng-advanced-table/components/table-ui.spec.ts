/* eslint-disable max-lines */
import { MenuHarness } from '@angular/aria/menu/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef, FilterFn } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { provideNatTableControlsIntl, provideNatTableIntl } from 'ng-advanced-table/locale';

import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityScrollControlLabels
} from './common/table-ui.type';
import { NatTableColumnVisibility } from './feature/table-column-visibility/table-column-visibility';
import { NatTablePageSize } from './feature/table-page-size/table-page-size';
import { NatTablePager } from './feature/table-pager/table-pager';
import { NatTablePagination } from './feature/table-pagination/table-pagination';
import { NatTableScrollControl } from './feature/table-scroll-control/table-scroll-control';
import { NatTableSurface } from './feature/table-surface/table-surface';
import { withNatTableHeaderActions } from './ui/table-header-actions/with-table-header-actions';

type Row = {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly status: 'Healthy' | 'Pending' | 'Alert';
  readonly throughput: number;
};

const getRowId = (row: Row): string => row.id;

const sortIndicatorGlyph = (sortState: 'asc' | 'desc' | false): string => {
  if (sortState === 'asc') {
    return 'A';
  }

  if (sortState === 'desc') {
    return 'D';
  }

  return '-';
};

const danishPinLabel = (params: {
  readonly label: string;
  readonly toggleAction: 'pin' | 'unpin';
  readonly pinSide: 'left' | 'right';
}): string => {
  const verb = { pin: 'Fastgør', unpin: 'Frigør' }[params.toggleAction];
  const preposition = { pin: 'til', unpin: 'fra' }[params.toggleAction];
  const side = { left: 'venstre', right: 'højre' }[params.pinSide];

  return `${verb} kolonne ${params.label} ${preposition} ${side}`;
};

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
      rowHeader: true
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'region',
    header: 'Region',
    size: 140,
    meta: {
      label: 'Region'
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    meta: {
      label: 'Status'
    },
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'throughput',
    header: 'Throughput',
    size: 160,
    meta: {
      label: 'Throughput',
      align: 'end'
    },
    cell: (info) => String(info.getValue<number>())
  }
];

const root = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement as HTMLElement;

const buildRows = (size: number): Row[] => {
  const statuses: Row['status'][] = ['Healthy', 'Pending', 'Alert'];

  return Array.from({ length: size }, (_, index) => ({
    id: `svc-${String(index + 1).padStart(5, '0')}`,
    name: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'][index] ?? `Service ${index + 1}`,
    region: ['us-east-1', 'eu-west-3'][index % 2],
    status: statuses[index % statuses.length],
    throughput: 1000 + index * 1000
  }));
};

const buildHeaderActionCompositionColumns = (): ColumnDef<Row, unknown>[] =>
  baseColumns.map((column) => {
    const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

    if (accessorKey === 'region') {
      return {
        ...column,
        meta: {
          ...column.meta,
          headerActions: false
        }
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
              sortButton: ({ label }): string => `Column override for ${label}`
            }
          }
        }
      };
    }

    return column;
  });

const queryByTestId = <TElement extends HTMLElement = HTMLElement>(testId: string, parent: ParentNode = document): TElement | null =>
  parent.querySelector<TElement>(`[data-testid="${testId}"]`);

const getByTestId = <TElement extends HTMLElement = HTMLElement>(testId: string, parent: ParentNode = document): TElement => {
  const element = queryByTestId<TElement>(testId, parent);

  if (!element) {
    throw new Error(`Expected an element with data-testid="${testId}".`);
  }

  return element;
};

const requireElement = <TElement extends Element = Element>(element: TElement | null, description: string): TElement => {
  if (!element) {
    throw new Error(`Expected an element: ${description}.`);
  }

  return element;
};

const findIn = (parent: ParentNode, selector: string): Element => requireElement(parent.querySelector(selector), selector);

const attrOf = (parent: ParentNode, selector: string, name: string): string | null => findIn(parent, selector).getAttribute(name);

const textOf = (parent: ParentNode, selector: string): string => findIn(parent, selector).textContent.trim();

const lastChildHasClass = (parent: Element, className: string): boolean =>
  requireElement(parent.lastElementChild, `last child of ${parent.tagName}`).classList.contains(className);

const getHeaderActionsMenuButton = (fixture: ComponentFixture<unknown>, columnId: string): HTMLButtonElement =>
  getByTestId(`nat-table-header-actions-menu-${columnId}`, fixture.nativeElement as ParentNode);

const getHeaderColumnIds = (fixture: ComponentFixture<TableUiHost>): string[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('thead th[data-column-id]')).map(
    (header) => header.dataset['columnId'] ?? ''
  );

// The open .column-menu panel renders in a cdkConnectedOverlay outside the
// fixture root, so harness lookups must go through the document-root loader.
const getOpenMenuHarness = async (fixture: ComponentFixture<unknown>): Promise<MenuHarness> =>
  TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(MenuHarness);

const getOpenPinMenu = (): HTMLElement | null => {
  const menus = Array.from(document.querySelectorAll<HTMLElement>('.column-menu'));

  return menus.at(-1) ?? null;
};

const requireOpenMenu = (): HTMLElement => {
  const menu = getOpenPinMenu();

  if (!menu) {
    throw new Error('Expected the column actions menu to be open.');
  }

  return menu;
};

const requireMenuItem = (item: HTMLButtonElement | null, missingDescription: string): HTMLButtonElement => {
  if (!item) {
    throw new Error(`Expected a menu item for ${missingDescription}.`);
  }

  return item;
};

const getOpenMenuItem = (side: 'left' | 'right', columnId = 'name'): HTMLButtonElement => {
  const menu = requireOpenMenu();
  const item =
    queryByTestId<HTMLButtonElement>(`nat-table-header-pin-${side}-${columnId}`) ??
    menu.querySelector<HTMLButtonElement>(`.column-menu-item[data-pin-side="${side}"]`);

  return requireMenuItem(item, `pin side "${side}"`);
};

const getOpenMoveMenuItem = (direction: 'left' | 'right', columnId = 'name'): HTMLButtonElement => {
  const menu = requireOpenMenu();
  const item =
    queryByTestId<HTMLButtonElement>(`nat-table-header-move-${direction}-${columnId}`) ??
    menu.querySelector<HTMLButtonElement>(`.column-menu-item[data-move-direction="${direction}"]`);

  return requireMenuItem(item, `move direction "${direction}"`);
};

const setScrollMetrics = (
  element: HTMLElement,
  metrics: {
    readonly clientWidth: number;
    readonly scrollWidth: number;
  }
): void => {
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    value: metrics.clientWidth
  });
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    value: metrics.scrollWidth
  });
};

@Component({
  selector: 'nat-table-ui-host',
  imports: [NatTable, NatTableColumnVisibility, NatTablePageSize, NatTablePager, NatTableScrollControl, NatTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState" [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table-column-visibility />
      <nat-table-page-size [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />

      <nat-table [columns]="columns" [data]="rows()" [getRowId]="getRowId" accessibleName="Operations table" />

      <nat-table-scroll-control />
    </nat-table-surface>
  `
})
class TableUiHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    enableColumnReorderActions: true
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

  public stateChangeCalls = 0;
  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.stateChangeCalls++;
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-custom-sort-indicator-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
class CustomSortIndicatorHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    sortIndicator: ({ sortState }) => sortIndicatorGlyph(sortState)
  });

  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-move-only-header-actions-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
class MoveOnlyHeaderActionsHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    enableColumnPinActions: false,
    enableColumnReorderActions: true
  });

  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-hidden-header-action-label-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
class HiddenHeaderActionLabelHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(
    baseColumns.map((column) => {
      const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

      if (accessorKey !== 'name') {
        return column;
      }

      return {
        ...column,
        meta: {
          rowHeader: column.meta?.rowHeader,
          hiddenHeaderLabel: 'Row actions'
        }
      };
    })
  );

  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

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
class CustomAccessibilityLabelsHost {
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
    <nat-table-surface [initialState]="initialState" [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table #grid="natTable" [columns]="columns" [data]="rows()" [getRowId]="getRowId" accessibleName="Operations table" />
      <nat-table-column-visibility />
      <nat-table-page-size [groupAriaLabel]="pageSizeGroupAriaLabel()" [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />
      <nat-table-scroll-control />
    </nat-table-surface>
  `
})
class ProviderAccessibilityLabelsHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    enableColumnReorderActions: true
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

  public readonly pageSizeGroupAriaLabel = signal<string | undefined>(undefined);

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
class LocaleSwitchingHost {
  public readonly locale = signal('en');
  protected readonly rows = signal<Row[]>([]);
  protected readonly columns = baseColumns;
  protected readonly pageSizeOptions = [2, 3] as const;
}

@Component({
  selector: 'nat-header-action-composition-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
class HeaderActionCompositionHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(
    withNatTableHeaderActions(buildHeaderActionCompositionColumns(), {
      sortIndicator: 'F',
      accessibilityLabels: {
        sortButton: ({ label }) => `First sort ${label}`,
        menuButton: ({ label }) => `First menu ${label}`,
        menuLabel: ({ label }) => `First column menu ${label}`
      }
    }),
    {
      sortIndicator: 'S',
      accessibilityLabels: {
        sortButton: ({ label }) => `Second sort ${label}`,
        menuButton: ({ label }) => `Second menu ${label}`,
        menuLabel: ({ label }) => `Second column menu ${label}`
      }
    }
  );

  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-multi-sort-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [enableMultiSort]="true" [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
class MultiSortHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns);
  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-pagination-toolbar-host',
  imports: [NatTable, NatTablePagination, NatTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
      <nat-table-pagination [pageSizeOptions]="pageSizeOptions" />
    </nat-table-surface>
  `
})
class PaginationToolbarHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = baseColumns;
  protected readonly pageSizeOptions = [2, 3, 5] as const;
  protected readonly initialState: Partial<NatTableState> = {
    pagination: {
      pageIndex: 0,
      pageSize: 2
    }
  };
}

describe('FEATURE: NatTable UI', () => {
  let fixture: ComponentFixture<TableUiHost>;
  let host: TableUiHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableUiHost,
        CustomSortIndicatorHost,
        MoveOnlyHeaderActionsHost,
        HiddenHeaderActionLabelHost,
        CustomAccessibilityLabelsHost,
        ProviderAccessibilityLabelsHost,
        LocaleSwitchingHost,
        HeaderActionCompositionHost,
        MultiSortHost,
        PaginationToolbarHost
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableUiHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  const recreateHost = async (): Promise<void> => {
    fixture.destroy();
    fixture = TestBed.createComponent(TableUiHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  };

  describe('GIVEN: a table surface with projected controls and pagination', () => {
    describe('WHEN: the surface renders', () => {
      it('THEN: it renders projected controls inside the themed surface', () => {
        fixture.detectChanges();

        expect(root(fixture).querySelector('nat-table-surface .surface')).toBeTruthy();
        expect(root(fixture).querySelectorAll('.column-chip')).toHaveLength(4);
      });

      it('THEN: it associates companion controls with the table element', () => {
        fixture.detectChanges();

        const table = root(fixture).querySelector('nat-table table') as HTMLTableElement;
        const columnChip = root(fixture).querySelector('.column-chip') as HTMLButtonElement;
        const pageSizeButton = root(fixture).querySelector('nat-table-page-size .chip') as HTMLButtonElement;
        const pagerButton = root(fixture).querySelector('nat-table-pager .pager-button') as HTMLButtonElement;
        const scrollButton = root(fixture).querySelector('nat-table-scroll-control .scroll-button') as HTMLButtonElement;
        const scrollRange = root(fixture).querySelector('nat-table-scroll-control .scroll-range') as HTMLInputElement;

        expect(columnChip.getAttribute('aria-controls')).toBe(table.id);
        expect(columnChip.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('Service Shown');
        expect(columnChip.getAttribute('aria-label')).toBe('Service shown. Hide column');
        expect(pageSizeButton.getAttribute('aria-controls')).toBe(table.id);
        expect(pageSizeButton.textContent.trim()).toBe('2 rows');
        expect(pageSizeButton.getAttribute('aria-label')).toBe('2 rows per page');
        expect(pagerButton.getAttribute('aria-controls')).toBe(table.id);
        expect(scrollButton.getAttribute('aria-controls')).toBe(table.id);
        expect(scrollRange.getAttribute('aria-controls')).toBe(table.id);
      });
    });

    describe('WHEN: the component initializes', () => {
      it('THEN: it does not emit stateChange on initialization', async () => {
        fixture.destroy();
        const newFixture = TestBed.createComponent(TableUiHost);
        const newHost = newFixture.componentInstance;

        newFixture.detectChanges();
        await newFixture.whenStable();

        expect(newHost.stateChangeCalls).toBe(0);
      });
    });

    describe('WHEN: scroll control interactions occur', () => {
      it('THEN: it controls the horizontal table scroll position with buttons and the range bar', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();
        await fixture.whenStable();

        const tableRegion = root(fixture).querySelector('nat-table .table-region') as HTMLElement;
        const leftButton = root(fixture).querySelector('nat-table-scroll-control .scroll-button-left') as HTMLButtonElement;
        const rightButton = root(fixture).querySelector('nat-table-scroll-control .scroll-button-right') as HTMLButtonElement;
        const range = root(fixture).querySelector('nat-table-scroll-control .scroll-range') as HTMLInputElement;
        const position = root(fixture).querySelector('nat-table-scroll-control .scroll-range-copy') as HTMLElement;

        setScrollMetrics(tableRegion, {
          clientWidth: 300,
          scrollWidth: 900
        });

        // when: a scroll event fires with overflow metrics
        tableRegion.dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        // then: initial scroll state is at position zero
        expect(leftButton.disabled).toBe(true);
        expect(rightButton.disabled).toBe(false);
        expect(range.max).toBe('600');
        expect(range.value).toBe('0');
        expect(position.textContent.trim()).toBe('0% scrolled');

        // when: the right scroll button is clicked
        rightButton.click();
        fixture.detectChanges();

        // then: table scrolls right by the step amount
        expect(tableRegion.scrollLeft).toBe(240);
        expect(leftButton.disabled).toBe(false);
        expect(range.value).toBe('240');
        expect(range.getAttribute('aria-valuetext')).toBe('40% scrolled');

        // when: the range bar is set to max
        range.value = '600';
        range.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        // then: table scrolls to the end
        expect(tableRegion.scrollLeft).toBe(600);
        expect(rightButton.disabled).toBe(true);
        expect(position.textContent.trim()).toBe('100% scrolled');
      });
    });

    describe('WHEN: column chips are clicked to hide columns', () => {
      it('THEN: it toggles column visibility and keeps the last visible column enabled', () => {
        fixture.detectChanges();

        for (const columnId of ['region', 'status', 'throughput']) {
          const chip = root(fixture).querySelector(`.column-chip[data-column-id="${columnId}"]`) as HTMLButtonElement;

          chip.click();
          fixture.detectChanges();
        }

        const lastVisibleChip = root(fixture).querySelector('.column-chip[data-column-id="name"]') as HTMLButtonElement;

        expect(lastVisibleChip.disabled).toBe(true);
        expect(root(fixture).querySelectorAll('thead th')).toHaveLength(1);
      });
    });

    describe('WHEN: page size and pager controls are interacted with', () => {
      it('THEN: it updates page size and pager state through the UI controls', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();

        const pageSizeButton = Array.from(root(fixture).querySelectorAll('nat-table-page-size .chip'))
          .map((button) => button as HTMLButtonElement)
          .find((button) => button.textContent.includes('3 rows')) as HTMLButtonElement;
        const nextButton = root(fixture).querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;

        // when: page size is changed to 3
        pageSizeButton.click();
        fixture.detectChanges();

        // then: pagination state reflects new page size
        expect(host.tableState().pagination).toStrictEqual({
          pageIndex: 0,
          pageSize: 3
        });

        // when: next page button is clicked
        nextButton.click();
        fixture.detectChanges();

        // then: pagination state advances the page index
        expect(host.tableState().pagination).toStrictEqual({
          pageIndex: 1,
          pageSize: 3
        });
      });
    });

    describe('WHEN: a NatTablePagination component renders', () => {
      it('THEN: it renders NatTablePagination as a toolbar with grouped controls', () => {
        fixture.destroy();
        const paginationFixture = TestBed.createComponent(PaginationToolbarHost);

        paginationFixture.detectChanges();

        const toolbar = root(paginationFixture).querySelector('nat-table-pagination nat-table-toolbar') as HTMLElement;
        const groups = root(paginationFixture).querySelectorAll('nat-table-pagination [natToolbarGroup]');

        expect(toolbar).toBeTruthy();
        expect(toolbar.getAttribute('role')).toBe('toolbar');
        expect(toolbar.getAttribute('aria-label')).toBe('Table pagination');
        expect(groups).toHaveLength(2);
        expect(root(paginationFixture).querySelectorAll('nat-table-pagination .chip')).toHaveLength(3);
        expect(root(paginationFixture).querySelectorAll('nat-table-pagination .pager-button')).toHaveLength(2);
      });
    });
  });

  describe('GIVEN: a table with header sort and column actions', () => {
    describe('WHEN: header sort and pin actions are interacted with', () => {
      it('THEN: it wraps headers with sort and column actions without losing the original label', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost();

        fixture.detectChanges();

        const headerLabel = root(fixture).querySelector('thead th[data-column-id="name"] .header-label') as HTMLElement;
        const sortButton = root(fixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const menuButton = root(fixture).querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;
        const sortIcon = root(fixture).querySelector('thead th[data-column-id="name"] .sort-icon') as HTMLElement;
        const reorderableHeader = root(fixture).querySelector('thead th[data-column-id="name"]') as HTMLTableCellElement;

        // then: header label and controls are rendered correctly
        expect(headerLabel.textContent.trim()).toBe('Service');
        expect(reorderableHeader.classList.contains('is-reorderable')).toBe(true);
        expect(reorderableHeader.classList.contains('cdk-drag')).toBe(true);
        expect(reorderableHeader.querySelector('.column-reorder-handle')).toBeNull();
        expect(sortButton.classList.contains('cdk-drag-handle')).toBe(false);
        expect(menuButton.classList.contains('cdk-drag-handle')).toBe(false);
        expect(attrOf(root(fixture), 'thead th[data-column-id="name"]', 'aria-sort')).toBeNull();
        expect(attrOf(sortIcon, '.nat-default-sort', 'data-sort-state')).toBe('none');
        expect(sortIcon.querySelector('.nat-default-sort__svg')).toBeTruthy();
        expect(sortButton.getAttribute('aria-label')).toBe('Sort by Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Open column actions for Service column');
        expect(menuButton.querySelector('.menu-button__icon')).toBeTruthy();

        // when: the sort button is clicked
        sortButton.click();
        fixture.detectChanges();

        // then: column sorts ascending
        expect(host.tableState().sorting).toStrictEqual([{ id: 'name', desc: false }]);
        expect(sortButton.classList.contains('is-sorted')).toBe(true);
        expect(attrOf(root(fixture), 'thead th[data-column-id="name"]', 'aria-sort')).toBe('ascending');
        expect(attrOf(root(fixture), 'thead th[data-column-id="name"] .nat-default-sort', 'data-sort-state')).toBe('asc');
        expect(sortButton.getAttribute('aria-label')).toBe('Service sorted in ascending order. Change sorting');

        // when: the menu button is clicked to open column actions
        menuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const menu = await getOpenMenuHarness(fixture);
        const openMenu = requireOpenMenu();
        const leftPinMenuItem = getOpenMenuItem('left');
        const rightPinMenuItem = getOpenMenuItem('right');

        // then: pin menu items are rendered with correct roles and labels
        expect(menuButton.getAttribute('aria-expanded')).toBe('true');
        expect(await menu.isOpen()).toBe(true);
        expect(openMenu.getAttribute('aria-label')).toBe('Column actions for Service column');
        expect(leftPinMenuItem.getAttribute('role')).toBe('menuitem');
        expect(rightPinMenuItem.getAttribute('role')).toBe('menuitem');
        expect(await menu.getItems({ text: /Pin left/ })).toHaveLength(1);
        expect(await menu.getItems({ text: /Pin right/ })).toHaveLength(1);
        expect(textOf(leftPinMenuItem, '.column-menu-item__label')).toBe('Pin left');
        expect(textOf(rightPinMenuItem, '.column-menu-item__label')).toBe('Pin right');
        expect(leftPinMenuItem.querySelector('.column-menu-item__dock[data-pin-side="left"]')).toBeTruthy();
        expect(rightPinMenuItem.querySelector('.column-menu-item__dock[data-pin-side="right"]')).toBeTruthy();

        const leftMoveMenuItem = getOpenMoveMenuItem('left');
        const rightMoveMenuItem = getOpenMoveMenuItem('right');

        expect(await (await menu.getItems({ text: /Move right/ }))[0].isDisabled()).toBe(false);
        expect(leftMoveMenuItem.getAttribute('aria-label')).toBe('Move Service column left');
        expect(rightMoveMenuItem.getAttribute('aria-label')).toBe('Move Service column right');
        expect(textOf(rightMoveMenuItem, '.column-menu-item__label')).toBe('Move right');

        // when: the left pin menu item is clicked
        leftPinMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: column is pinned left
        expect(host.tableState().columnPinning).toStrictEqual({
          left: ['name'],
          right: []
        });

        // when: the menu is opened again after pinning
        menuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const updatedLeftPinMenuItem = getOpenMenuItem('left');
        const updatedRightPinMenuItem = getOpenMenuItem('right');

        // then: pin state is reflected in the menu items
        expect(updatedLeftPinMenuItem.classList.contains('is-active')).toBe(true);
        expect(updatedRightPinMenuItem.classList.contains('is-active')).toBe(false);
        expect(textOf(updatedLeftPinMenuItem, '.column-menu-item__label')).toBe('Unpin left');

        // when: the right pin menu item is clicked
        updatedRightPinMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: column is re-pinned to the right and appears at the end
        expect(host.tableState().columnPinning).toStrictEqual({
          left: [],
          right: ['name']
        });
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['region', 'status', 'throughput', 'name']);
        const rightPinnedHeaderActions = root(fixture).querySelector(
          'thead th[data-column-id="name"] .header-actions-row'
        ) as HTMLElement;

        expect(lastChildHasClass(rightPinnedHeaderActions, 'header-controls')).toBe(true);
        expect(headerLabel.textContent.trim()).toBe('Service');
      });
    });

    describe('WHEN: keyboard navigation is used in a header cell', () => {
      it('THEN: it wraps the header controls in one grid-cell widget and keeps them keyboard-reachable', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();

        const header = root(fixture).querySelector('thead th[data-column-id="name"]') as HTMLTableCellElement;
        const widgets = header.querySelectorAll('[ngGridCellWidget]');
        const sortButton = header.querySelector('.sort-button') as HTMLButtonElement;
        const menuButton = header.querySelector('.menu-button') as HTMLButtonElement;

        // One complex widget per cell wraps both controls, per the aria grid pattern.
        // then: one grid-cell widget wraps both controls
        expect(widgets).toHaveLength(1);
        expect(widgets[0].classList.contains('header-content')).toBe(true);
        expect(sortButton.tabIndex).toBe(0);
        expect(menuButton.tabIndex).toBe(0);

        // Enter steps into the cell's first control.
        // when: Enter is pressed on the header cell
        header.focus();
        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

        // then: focus moves to the sort button
        expect(document.activeElement).toBe(sortButton);

        // Tab and Shift+Tab walk between the cell's controls.
        // when: Tab is pressed on the sort button
        sortButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));

        // then: focus moves to the menu button
        expect(document.activeElement).toBe(menuButton);

        // when: Shift+Tab is pressed on the menu button
        menuButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));

        // then: focus returns to the sort button
        expect(document.activeElement).toBe(sortButton);

        // Escape returns focus to the cell.
        // when: Escape is pressed on the sort button
        sortButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

        // then: focus returns to the header cell
        expect(document.activeElement).toBe(header);
      });
    });

    describe('WHEN: the table with a hidden header label renders', () => {
      it('THEN: it keeps header action controls visible when the header label is hidden', () => {
        const hiddenFixture = TestBed.createComponent(HiddenHeaderActionLabelHost);

        hiddenFixture.detectChanges();

        const nameHeader = root(hiddenFixture).querySelector('thead th[data-column-id="name"]') as HTMLElement;
        const headerLabel = nameHeader.querySelector('.header-label') as HTMLElement;
        const sortButton = nameHeader.querySelector('.sort-button') as HTMLButtonElement;
        const menuButton = nameHeader.querySelector('.menu-button') as HTMLButtonElement;

        expect(headerLabel.classList.contains('sr-only')).toBe(true);
        expect(headerLabel.textContent.trim()).toBe('Row actions');
        expect(sortButton).toBeTruthy();
        expect(menuButton).toBeTruthy();
        expect(sortButton.getAttribute('aria-label')).toBe('Sort by Row actions');
        expect(menuButton.getAttribute('aria-label')).toBe('Open column actions for Row actions column');

        hiddenFixture.destroy();
      });
    });

    describe('WHEN: the table renders with an end-aligned column', () => {
      it('THEN: it keeps the column actions menu on the right for end-aligned headers', () => {
        fixture.detectChanges();

        const endAlignedHeaderContent = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .header-content'
        ) as HTMLElement;
        const endAlignedHeaderActions = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .header-actions-row'
        ) as HTMLElement;

        expect(endAlignedHeaderContent.classList.contains('is-align-end')).toBe(true);
        expect(endAlignedHeaderActions.lastElementChild?.classList.contains('header-controls')).toBe(true);
      });
    });

    describe('WHEN: the throughput column is pinned right', () => {
      it('THEN: it keeps the column actions menu on the right for right-pinned end-aligned headers', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();

        const throughputMenuButton = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .menu-button'
        ) as HTMLButtonElement;

        // when: the throughput column menu is opened and pinned right
        throughputMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        getOpenMenuItem('right').click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: column is pinned right
        expect(host.tableState().columnPinning).toStrictEqual({
          left: [],
          right: ['throughput']
        });

        const rightPinnedEndAlignedHeaderActions = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .header-actions-row'
        ) as HTMLElement;

        // then: controls remain last in the right-pinned end-aligned header
        expect(rightPinnedEndAlignedHeaderActions.lastElementChild?.classList.contains('header-controls')).toBe(true);
      });
    });

    describe('WHEN: the sort button is clicked', () => {
      it('THEN: it announces sort updates through the table live region', async () => {
        fixture.detectChanges();

        const sortButton = root(fixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const liveRegion = root(fixture).querySelector('nat-table p[aria-live="polite"]') as HTMLElement;

        sortButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(liveRegion.textContent.trim()).toBe('Sorted by Service ascending.');
      });
    });

    describe('WHEN: a column is moved via the header actions menu', () => {
      it('THEN: it moves columns through the header actions menu and announces the move', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();

        const regionMenuButton = getHeaderActionsMenuButton(fixture, 'region');
        const liveRegion = root(fixture).querySelector('nat-table p[aria-live="polite"]') as HTMLElement;

        // when: the region column menu is opened
        regionMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const moveRightMenuItem = getOpenMoveMenuItem('right', 'region');

        // then: move right item is enabled
        expect(moveRightMenuItem.disabled).toBe(false);

        // when: move right is clicked
        moveRightMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: column order updates and live region announces the move
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(host.tableState().columnOrder).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(liveRegion.textContent.trim()).toBe('Moved Region column to position 3 of 4 in the unpinned region.');
      });
    });

    describe('WHEN: a pinned column is moved via the header actions menu', () => {
      it('THEN: it moves pinned columns through the header actions menu inside the pinned region', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when: two columns are pinned left
        host.tableState.set({
          columnPinning: {
            left: ['name', 'region'],
            right: []
          }
        });
        fixture.detectChanges();

        const regionMenuButton = getHeaderActionsMenuButton(fixture, 'region');

        // when: the region column menu is opened and move left is clicked
        regionMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        getOpenMoveMenuItem('left', 'region').click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: pinned region order updates
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['region', 'name', 'status', 'throughput']);
        expect(host.tableState().columnPinning).toStrictEqual({
          left: ['region', 'name'],
          right: []
        });
      });
    });

    describe('WHEN: the table with move-only actions renders', () => {
      it('THEN: it renders move-only header action menus without pin actions', async () => {
        const moveOnlyFixture = TestBed.createComponent(MoveOnlyHeaderActionsHost);

        moveOnlyFixture.detectChanges();

        const menuButton = getHeaderActionsMenuButton(moveOnlyFixture, 'region');

        // when: the menu is opened
        menuButton.click();
        moveOnlyFixture.detectChanges();
        await moveOnlyFixture.whenStable();
        moveOnlyFixture.detectChanges();

        const menu = await getOpenMenuHarness(moveOnlyFixture);

        expect(queryByTestId('nat-table-header-pin-left-region')).toBeNull();
        expect(queryByTestId('nat-table-header-pin-right-region')).toBeNull();
        expect(await menu.getItems({ text: /Pin/ })).toHaveLength(0);
        expect(await menu.getItems({ text: /Move left/ })).toHaveLength(1);
        expect(await menu.getItems({ text: /Move right/ })).toHaveLength(1);

        moveOnlyFixture.destroy();
      });
    });

    describe('WHEN: the table with a custom sort indicator renders', () => {
      it('THEN: it renders caller-provided sort indicator content through header actions', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const customFixture = TestBed.createComponent(CustomSortIndicatorHost);

        customFixture.detectChanges();

        let sortIcon = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-icon') as HTMLElement;
        const sortButton = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;

        // then: unsorted indicator shows the custom glyph
        expect(sortIcon.textContent.trim()).toBe('-');

        // when: the sort button is clicked
        sortButton.click();
        customFixture.detectChanges();

        sortIcon = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-icon') as HTMLElement;

        // then: ascending indicator shows the custom glyph
        expect(sortIcon.textContent.trim()).toBe('A');
        expect(sortIcon.textContent).not.toContain('↕');
      });
    });
  });

  describe('GIVEN: custom and provider accessibility labels', () => {
    describe('WHEN: the table with custom accessibility labels renders', () => {
      it('THEN: it renders caller-provided accessibility labels across the UI controls', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const customFixture = TestBed.createComponent(CustomAccessibilityLabelsHost);

        customFixture.detectChanges();

        const nativeElement = customFixture.nativeElement as HTMLElement;
        const visibilityHeading = nativeElement.querySelector('nat-table-column-visibility .control-label') as HTMLElement;
        const visibilityCaption = nativeElement.querySelector('nat-table-column-visibility .control-caption') as HTMLElement;
        const visibilityGroup = nativeElement.querySelector('nat-table-column-visibility .chip-row') as HTMLElement;
        const firstColumnChip = nativeElement.querySelector('nat-table-column-visibility .column-chip') as HTMLButtonElement;
        const firstColumnState = firstColumnChip.querySelector('.chip-count') as HTMLElement;
        const pageSizeGroup = nativeElement.querySelector('nat-table-page-size .chip-row') as HTMLElement;
        const pageSizeButton = nativeElement.querySelector('nat-table-page-size .chip') as HTMLButtonElement;
        const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
        const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
        const scrollControl = nativeElement.querySelector('nat-table-scroll-control .scroll-control') as HTMLElement;
        const scrollLeftButton = nativeElement.querySelector('nat-table-scroll-control .scroll-button-left') as HTMLButtonElement;
        const scrollRightButton = nativeElement.querySelector('nat-table-scroll-control .scroll-button-right') as HTMLButtonElement;
        const scrollRange = nativeElement.querySelector('nat-table-scroll-control .scroll-range') as HTMLInputElement;
        const scrollPosition = nativeElement.querySelector('nat-table-scroll-control .scroll-range-copy') as HTMLElement;
        const previousButton = nativeElement.querySelector('nat-table-pager .pager-button:first-child') as HTMLButtonElement;
        const nextButton = nativeElement.querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;
        const sortButton = nativeElement.querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const menuButton = nativeElement.querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;

        // then: all custom labels are rendered in the UI controls
        expect(visibilityHeading.textContent.trim()).toBe('Kolonner');
        expect(visibilityCaption.textContent.trim()).toBe('4 af 4 synlige');
        expect(visibilityGroup.getAttribute('aria-label')).toBe('Kolonnesynlighed');
        expect(firstColumnChip.getAttribute('aria-label')).toBe('Skjul kolonne Service');
        expect(firstColumnState.textContent.trim()).toBe('Synlig');

        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rækker pr. side');
        expect(pageSizeButton.textContent.trim()).toBe('2 rækker');
        expect(pageSizeButton.getAttribute('aria-label')).toBe('Vis 2 rækker');

        expect(pager.getAttribute('aria-label')).toBe('Sideskift');
        expect(pagerLabel.textContent.trim()).toBe('Side 2 af 3');
        expect(previousButton.getAttribute('aria-label')).toBe('Forrige side');
        expect(nextButton.getAttribute('aria-label')).toBe('Næste side');

        expect(scrollControl.getAttribute('aria-label')).toBe('Vandret tabelrulning');
        expect(scrollLeftButton.getAttribute('aria-label')).toBe('Rul tabel til venstre');
        expect(scrollRightButton.getAttribute('aria-label')).toBe('Rul tabel til højre');
        expect(scrollRange.getAttribute('aria-label')).toBe('Vandret rulleposition');
        expect(scrollPosition.textContent.trim()).toBe('0 procent');

        expect(sortButton.getAttribute('aria-label')).toBe('Sorter Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Kolonnehandlinger for Service');

        // when: the column actions menu is opened
        menuButton.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

        // then: menu and pin items use custom labels
        expect(requireOpenMenu().getAttribute('aria-label')).toBe('Kolonnehandlinger for Service');

        const leftPinMenuItem = getOpenMenuItem('left');
        const rightPinMenuItem = getOpenMenuItem('right');
        const leftMoveMenuItem = getOpenMoveMenuItem('left');
        const rightMoveMenuItem = getOpenMoveMenuItem('right');

        expect(leftPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til venstre');
        expect(textOf(leftPinMenuItem, '.column-menu-item__label')).toBe('Venstre');
        expect(rightPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til højre');
        expect(textOf(rightPinMenuItem, '.column-menu-item__label')).toBe('Højre');
        expect(leftMoveMenuItem.getAttribute('aria-label')).toBe('Flyt kolonne Service til venstre');
        expect(rightMoveMenuItem.getAttribute('aria-label')).toBe('Flyt kolonne Service til højre');
        expect(textOf(rightMoveMenuItem, '.column-menu-item__label')).toBe('Flyt til højre');

        // when: the left pin item is clicked then the menu is reopened
        leftPinMenuItem.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

        // when: menu is reopened after pinning
        menuButton.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

        const updatedLeftPinMenuItem = getOpenMenuItem('left');
        const updatedRightPinMenuItem = getOpenMenuItem('right');

        // then: unpin label is shown with custom text
        expect(updatedLeftPinMenuItem.getAttribute('aria-label')).toBe('Frigør kolonne Service fra venstre');
        expect(textOf(updatedLeftPinMenuItem, '.column-menu-item__label')).toBe('Venstre');
        expect(updatedRightPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til højre');
        expect(textOf(updatedRightPinMenuItem, '.column-menu-item__label')).toBe('Højre');

        // when: the column chip is clicked to hide the column
        firstColumnChip.click();
        customFixture.detectChanges();

        // then: chip label and state update
        expect(firstColumnChip.getAttribute('aria-label')).toBe('Vis kolonne Service');
        expect(firstColumnState.textContent.trim()).toBe('Skjult');

        customFixture.destroy();
      });
    });

    describe('WHEN: the table with provider accessibility labels renders', () => {
      it('THEN: it uses provider accessibility labels and lets component inputs override them', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const providerFixture = TestBed.createComponent(ProviderAccessibilityLabelsHost);
        const providerHost = providerFixture.componentInstance;

        providerFixture.detectChanges();

        const nativeElement = providerFixture.nativeElement as HTMLElement;
        const visibilityHeading = nativeElement.querySelector('nat-table-column-visibility .control-label') as HTMLElement;
        const visibilityCaption = nativeElement.querySelector('nat-table-column-visibility .control-caption') as HTMLElement;
        const visibilityGroup = nativeElement.querySelector('nat-table-column-visibility .chip-row') as HTMLElement;
        const pageSizeGroup = nativeElement.querySelector('nat-table-page-size .chip-row') as HTMLElement;
        const pageSizeButton = nativeElement.querySelector('nat-table-page-size .chip') as HTMLButtonElement;
        const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
        const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
        const previousButton = nativeElement.querySelector('nat-table-pager .pager-button:first-child') as HTMLButtonElement;
        const nextButton = nativeElement.querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;
        const scrollControl = nativeElement.querySelector('nat-table-scroll-control .scroll-control') as HTMLElement;
        const scrollPosition = nativeElement.querySelector('nat-table-scroll-control .scroll-range-copy') as HTMLElement;
        const sortButton = nativeElement.querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const menuButton = nativeElement.querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;

        // then: provider labels are rendered
        expect(visibilityHeading.textContent.trim()).toBe('Provider columns');
        expect(visibilityCaption.textContent.trim()).toBe('Provider n4/n4');
        expect(visibilityGroup.getAttribute('aria-label')).toBe('Provider column visibility');
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Provider page size group');
        expect(pageSizeButton.textContent.trim()).toBe('n2 provider rows');
        expect(pageSizeButton.getAttribute('aria-label')).toBe('Provider show n2 rows');
        expect(pager.getAttribute('aria-label')).toBe('Provider pager');
        expect(pagerLabel.textContent.trim()).toBe('Provider page n2/n3');
        expect(previousButton.getAttribute('aria-label')).toBe('Provider previous');
        expect(nextButton.getAttribute('aria-label')).toBe('Provider next');
        expect(scrollControl.getAttribute('aria-label')).toBe('Provider horizontal scroll');
        expect(scrollPosition.textContent.trim()).toBe('Provider n0 percent');
        expect(sortButton.getAttribute('aria-label')).toBe('Provider sort Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Provider actions for Service');

        // when: the menu is opened
        menuButton.click();
        providerFixture.detectChanges();
        await providerFixture.whenStable();
        providerFixture.detectChanges();

        const providerMenu = await getOpenMenuHarness(providerFixture);

        // then: provider menu labels are used
        expect(getOpenPinMenu()?.getAttribute('aria-label')).toBe('Provider menu for Service');
        expect(await (await providerMenu.getItems({ text: /Provider left/ }))[0].getText()).toContain('Provider left');
        expect(await (await providerMenu.getItems({ text: /Provider move right/ }))[0].getText()).toContain('Provider move right');

        // when: a component-input label overrides the provider label
        providerHost.pageSizeGroupAriaLabel.set('Input page size');
        providerFixture.detectChanges();

        // then: component input takes precedence
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Input page size');

        providerFixture.destroy();
      });
    });
  });

  describe('GIVEN: locale switching configured', () => {
    describe('WHEN: the locale is switched', () => {
      it('THEN: it switches table and companion-control locale labels dynamically', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const localeFixture = TestBed.createComponent(LocaleSwitchingHost);
        const localeHost = localeFixture.componentInstance;

        localeFixture.detectChanges();

        const nativeElement = localeFixture.nativeElement as HTMLElement;
        const emptyState = nativeElement.querySelector('.empty-state') as HTMLElement;
        const tableSummary = nativeElement.querySelector('p.sr-only') as HTMLElement;
        const pageSizeGroup = nativeElement.querySelector('nat-table-page-size .chip-row') as HTMLElement;
        const pageSizeButton = nativeElement.querySelector('nat-table-page-size .chip') as HTMLButtonElement;
        const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
        const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
        const nextButton = nativeElement.querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;

        // then: default English labels are rendered
        expect(emptyState.textContent.trim()).toBe('No rows match the current view.');
        expect(tableSummary.textContent.trim()).toBe('No rows are currently shown. 4 visible columns. Page 1 of 1.');
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rows per page');
        expect(pageSizeButton.textContent.trim()).toBe('2 rows');
        expect(pageSizeButton.getAttribute('aria-label')).toBe('2 rows per page');
        expect(pager.getAttribute('aria-label')).toBe('Table pagination');
        expect(pagerLabel.textContent.trim()).toBe('Page 1 of 1');
        expect(nextButton.getAttribute('aria-label')).toBe('Next page');

        // when: locale is switched to Danish
        localeHost.locale.set('da');
        localeFixture.detectChanges();

        // then: Danish labels are rendered
        expect(emptyState.textContent.trim()).toBe('Ingen rækker matcher visningen.');
        expect(tableSummary.textContent.trim()).toBe('0 rækker og 4 kolonner.');
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rækker pr. side');
        expect(pageSizeButton.textContent.trim()).toBe('2 / side');
        expect(pageSizeButton.getAttribute('aria-label')).toBe('Vis 2 rækker pr. side');
        expect(pager.getAttribute('aria-label')).toBe('Tabelsider');
        expect(pagerLabel.textContent.trim()).toBe('Side 1 af 1');
        expect(nextButton.getAttribute('aria-label')).toBe('Næste side');

        localeFixture.destroy();
      });
    });
  });

  describe('GIVEN: composed and multi-sort header actions', () => {
    describe('WHEN: composed header actions render', () => {
      it('THEN: it applies header actions idempotently and honors per-column metadata', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const compositionFixture = TestBed.createComponent(HeaderActionCompositionHost);

        compositionFixture.detectChanges();

        const nativeElement = compositionFixture.nativeElement as HTMLElement;
        const nameHeader = nativeElement.querySelector('thead th[data-column-id="name"]') as HTMLElement;
        const regionHeader = nativeElement.querySelector('thead th[data-column-id="region"]') as HTMLElement;
        const statusHeader = nativeElement.querySelector('thead th[data-column-id="status"]') as HTMLElement;
        const nameSortButton = nameHeader.querySelector('.sort-button') as HTMLButtonElement;
        const statusSortButton = statusHeader.querySelector('.sort-button') as HTMLButtonElement;
        const nameMenuButton = nameHeader.querySelector('.menu-button') as HTMLButtonElement;

        // then: outermost composition wins; per-column overrides are honored
        expect(nameHeader.querySelectorAll('.header-actions-row')).toHaveLength(1);
        expect(nameHeader.querySelectorAll('.sort-button')).toHaveLength(1);
        expect(textOf(nameHeader, '.header-label')).toBe('Service');
        expect(textOf(nameHeader, '.sort-icon')).toBe('S');
        expect(nameSortButton.getAttribute('aria-label')).toBe('Second sort Service');
        expect(nameMenuButton.getAttribute('aria-label')).toBe('Second menu Service');

        expect(regionHeader.querySelector('.sort-button')).toBeNull();
        expect(regionHeader.querySelector('.menu-button')).toBeNull();
        expect(regionHeader.textContent.trim()).toBe('Region');

        expect(statusHeader.querySelectorAll('.header-actions-row')).toHaveLength(1);
        expect(textOf(statusHeader, '.sort-icon')).toBe('Column');
        expect(statusSortButton.getAttribute('aria-label')).toBe('Column override for Status');

        // when: the name column menu is opened
        nameMenuButton.click();
        compositionFixture.detectChanges();
        await compositionFixture.whenStable();
        compositionFixture.detectChanges();

        // then: menu label uses outermost composition label
        expect(requireOpenMenu().getAttribute('aria-label')).toBe('Second column menu Service');

        compositionFixture.destroy();
      });
    });

    describe('WHEN: a second sort column is shift-clicked', () => {
      it('THEN: it adds a second sort column on shift-click when multi-sort is enabled', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const multiSortFixture = TestBed.createComponent(MultiSortHost);

        multiSortFixture.detectChanges();

        const nameSort = root(multiSortFixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const regionSort = root(multiSortFixture).querySelector('thead th[data-column-id="region"] .sort-button') as HTMLButtonElement;

        // when: name column is sorted first
        nameSort.click();
        multiSortFixture.detectChanges();

        // when: region column is shift-clicked to add a second sort
        regionSort.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
        multiSortFixture.detectChanges();

        // then: both columns are sorted and priority badges appear
        expect(multiSortFixture.componentInstance.tableState().sorting).toStrictEqual([
          { id: 'name', desc: false },
          { id: 'region', desc: false }
        ]);
        expect(root(multiSortFixture).querySelectorAll('.sort-priority')).toHaveLength(2);

        // The visible priority badge is aria-hidden, so the ordinal must also reach AT
        // through the sort button's accessible name.
        expect(nameSort.getAttribute('aria-label')).toContain('1 of 2');
        expect(regionSort.getAttribute('aria-label')).toContain('2 of 2');

        multiSortFixture.destroy();
      });
    });
  });
});
