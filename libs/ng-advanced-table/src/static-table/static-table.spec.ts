import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import { NatTableStatic } from './static-table';
import type { NatTableRowActivateEvent } from '../common/row.type';
import type { NatTableUserState } from '../common/table-state.type';
import type { NatTableDataStatus } from '../common/table-status.type';
import { buildRows, getRowIdValue } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from '../ui/table-status-templates.directive';
import { NatTableSubHeaderTemplate } from '../ui/table-sub-header-template.directive';

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name', rowHeader: true },
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status' },
    cell: (info) => info.getValue<string>()
  }
];

@Component({
  selector: 'test-static-table-host',
  imports: [
    NatTableEmptyTemplate,
    NatTableErrorTemplate,
    NatTableLoadingTemplate,
    NatTableStatic,
    NatTableSubHeaderTemplate,
    TestTableSurface
  ],
  template: `
    <nat-table-surface [enableSorting]="true" [state]="state()" (stateChange)="state.set($event)">
      <nat-table-static
        [caption]="caption()"
        [columns]="useGroupedColumns() ? groupedColumns : columns"
        [data]="rows()"
        [dataStatus]="dataStatus()"
        [enableRowSelection]="enableRowSelection()"
        [getRowId]="getRowId"
        [subHeaderColumn]="subHeaderColumn()"
        [subHeaderLayout]="subHeaderLayout()"
        accessibleName="Static table"
        (rowActivate)="activations.push($event)">
        <ng-template natTableLoading>Custom loading copy</ng-template>
        <ng-template natTableEmpty>Custom empty copy</ng-template>
        <ng-template let-error natTableError>Custom error copy</ng-template>
        <ng-template let-value="value" natTableSubHeader>Group {{ value }}</ng-template>
      </nat-table-static>
    </nat-table-surface>
  `
})
class StaticTableHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
  public readonly groupedColumns: ColumnDef<Row, unknown>[] = [{ id: 'details', header: 'Details', columns }];
  public readonly useGroupedColumns = signal(false);
  public readonly getRowId = getRowIdValue;
  public readonly caption = signal<string | undefined>(undefined);
  public readonly dataStatus = signal<NatTableDataStatus>('success');
  public readonly enableRowSelection = signal(false);
  public readonly subHeaderColumn = signal<string | undefined>(undefined);
  public readonly subHeaderLayout = signal<'colspan' | 'cells'>('colspan');
  public readonly state = signal<Partial<NatTableUserState>>({});
  public readonly activations: NatTableRowActivateEvent<Row>[] = [];
}

const queryTable = (fixture: ComponentFixture<StaticTableHost>): HTMLTableElement => {
  const table = (fixture.nativeElement as HTMLElement).querySelector('table');

  if (!table) {
    throw new Error('Expected a rendered <table>.');
  }

  return table;
};

describe('FEATURE: NatTableStatic', () => {
  let fixture: ComponentFixture<StaticTableHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaticTableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(StaticTableHost);
    await fixture.whenStable();
  });

  describe('GIVEN: a static table inside a surface', () => {
    describe('WHEN: the table renders', () => {
      it('THEN: it renders a semantic table without any ARIA grid semantics', () => {
        const table = queryTable(fixture);

        expect(table.getAttribute('role')).toBeNull();
        expect(table.hasAttribute('aria-rowcount')).toBe(false);
        expect(table.hasAttribute('tabindex')).toBe(false);
        expect(table.getAttribute('aria-label')).toBe('Static table');
        expect(table.querySelectorAll('[role="gridcell"], [role="grid"], [ngGridCell]')).toHaveLength(0);
        expect(table.querySelectorAll('td[tabindex], th[tabindex]')).toHaveLength(0);
      });

      it('THEN: it renders native header and row-header semantics', () => {
        const table = queryTable(fixture);
        const columnHeaders = table.querySelectorAll('thead th[scope="col"]');
        const rowHeaders = table.querySelectorAll('tbody th[scope="row"]');

        expect(columnHeaders).toHaveLength(2);
        expect(rowHeaders).toHaveLength(3);
        expect(table.querySelectorAll('[data-testid="nat-table-row"]')).toHaveLength(3);
      });

      it('THEN: it spans grouped headers across their leaf columns', async () => {
        fixture.componentInstance.useGroupedColumns.set(true);
        await fixture.whenStable();

        const table = queryTable(fixture);
        const groupHeader = table.querySelector('[data-testid="nat-table-header-details"]');

        expect(groupHeader?.getAttribute('colspan')).toBe('2');
        expect(groupHeader?.getAttribute('scope')).toBe('colgroup');

        const leafHeader = table.querySelector('[data-testid="nat-table-header-name"]');

        expect(leafHeader?.hasAttribute('colspan')).toBe(false);
        expect(leafHeader?.getAttribute('scope')).toBe('col');
      });

      it('THEN: it leaves no cell-interaction anchors for the control manager', () => {
        const table = queryTable(fixture);

        expect(table.querySelectorAll('[natTableCell]')).toHaveLength(0);
        expect(table.querySelectorAll('[data-nat-table-managed-cell-widget]')).toHaveLength(0);
      });
    });

    describe('WHEN: sorting state is applied through the surface', () => {
      it('THEN: it reorders rows and exposes aria-sort on the header', async () => {
        fixture.componentInstance.state.set({ sorting: [{ id: 'name', desc: true }] });
        await fixture.whenStable();

        const table = queryTable(fixture);
        const nameHeader = table.querySelector('[data-testid="nat-table-header-name"]');
        const firstRowHeader = table.querySelector('tbody th[scope="row"]');

        expect(nameHeader?.getAttribute('aria-sort')).toBe('descending');

        const names = fixture.componentInstance
          .rows()
          .map((row) => row.name)
          .sort((a, b) => b.localeCompare(a));

        expect(firstRowHeader?.textContent.trim()).toBe(names[0]);
      });
    });

    describe('WHEN: a data row is clicked', () => {
      it('THEN: it emits rowActivate with the row data', async () => {
        const table = queryTable(fixture);
        const row = table.querySelector<HTMLElement>('[data-testid="nat-table-row"]');

        row?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await fixture.whenStable();

        expect(fixture.componentInstance.activations).toHaveLength(1);
        expect(fixture.componentInstance.activations[0].rowData).toBe(fixture.componentInstance.rows()[0]);
      });

      it('THEN: it ignores non-primary and already-handled clicks', async () => {
        const row = queryTable(fixture).querySelector<HTMLElement>('[data-testid="nat-table-row"]');

        row?.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 1 }));

        const handled = new MouseEvent('click', { bubbles: true, cancelable: true });

        handled.preventDefault();
        row?.dispatchEvent(handled);
        await fixture.whenStable();

        expect(fixture.componentInstance.activations).toHaveLength(0);
      });
    });

    describe('WHEN: row selection state is enabled and applied', () => {
      it('THEN: it marks selected rows with data-selected', async () => {
        fixture.componentInstance.enableRowSelection.set(true);
        const firstRowId = getRowIdValue(fixture.componentInstance.rows()[0]);

        fixture.componentInstance.state.set({ rowSelection: { [firstRowId]: true } });
        await fixture.whenStable();

        const rows = queryTable(fixture).querySelectorAll('[data-testid="nat-table-row"]');

        expect(rows[0].getAttribute('data-selected')).toBe('true');
        expect(rows[1].getAttribute('data-selected')).toBe('false');
      });
    });

    describe('WHEN: a caption is provided', () => {
      it('THEN: it renders the caption and drops aria-label', async () => {
        fixture.componentInstance.caption.set('Quarterly orders');
        await fixture.whenStable();

        const table = queryTable(fixture);

        expect(table.querySelector('caption')?.textContent.trim()).toBe('Quarterly orders');
        expect(table.getAttribute('aria-label')).toBeNull();
      });
    });

    describe('WHEN: the controller patches state programmatically', () => {
      it('THEN: it applies the patch through the shared engine', async () => {
        const staticTable = fixture.debugElement.children[0].children[0].componentInstance as NatTableStatic<Row>;

        staticTable.patchState({ sorting: [{ id: 'name', desc: false }] });
        await fixture.whenStable();

        expect(fixture.componentInstance.state().sorting).toStrictEqual([{ id: 'name', desc: false }]);
        expect(staticTable.tableScrollContainer()).not.toBeNull();
      });
    });

    describe('WHEN: the data status is not success', () => {
      it('THEN: it marks the table busy while loading with rows present', async () => {
        fixture.componentInstance.dataStatus.set('loading');
        await fixture.whenStable();

        // With rows already present the body keeps showing them; the loading
        // state row only renders for an empty dataset.
        expect(queryTable(fixture).getAttribute('aria-busy')).toBe('true');
      });

      it('THEN: it renders the consumer loading template for an empty loading dataset', async () => {
        fixture.componentInstance.rows.set([]);
        fixture.componentInstance.dataStatus.set('loading');
        await fixture.whenStable();

        expect(queryTable(fixture).querySelector('.loading-state')?.textContent).toContain('Custom loading copy');
      });

      it('THEN: it renders the consumer error template in the error state row', async () => {
        fixture.componentInstance.dataStatus.set('error');
        await fixture.whenStable();

        const errorCell = queryTable(fixture).querySelector('.error-state');

        expect(errorCell?.textContent).toContain('Custom error copy');
      });

      it('THEN: it renders the consumer empty template when no rows remain', async () => {
        fixture.componentInstance.rows.set([]);
        await fixture.whenStable();

        const emptyCell = queryTable(fixture).querySelector('.empty-state');

        expect(emptyCell?.textContent).toContain('Custom empty copy');
      });
    });

    describe('WHEN: a sub-header column groups the rows', () => {
      it('THEN: it renders colspan sub-header rows between groups', async () => {
        fixture.componentInstance.subHeaderColumn.set('status');
        await fixture.whenStable();

        const table = queryTable(fixture);
        const subHeaderRows = table.querySelectorAll('[data-testid="nat-table-sub-header-row"]');

        expect(subHeaderRows.length).toBeGreaterThan(0);
        expect(subHeaderRows[0].querySelector('td')?.colSpan).toBe(2);
        expect(subHeaderRows[0].textContent).toContain('Group');
      });

      it('THEN: it renders per-column cells in the cells layout', async () => {
        fixture.componentInstance.subHeaderColumn.set('status');
        fixture.componentInstance.subHeaderLayout.set('cells');
        await fixture.whenStable();

        const subHeaderRow = queryTable(fixture).querySelector('[data-testid="nat-table-sub-header-row"]');

        expect(subHeaderRow?.querySelectorAll('td')).toHaveLength(2);
      });
    });
  });
});
