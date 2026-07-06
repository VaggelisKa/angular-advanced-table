import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTablePageSize, NatTablePager, NatTableSurface, NatTableToolbar } from 'ng-advanced-table/components';

import { TableSearch } from './table-search';

type Row = {
  readonly id: string;
  readonly name: string;
  readonly region: string;
};

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name', meta: { label: 'Name', rowHeader: true } },
  { accessorKey: 'region', header: 'Region', meta: { label: 'Region' } }
];

@Component({
  selector: 'app-table-search-host',
  imports: [NatTable, NatTableSurface, NatTablePageSize, NatTablePager, TableSearch],
  template: `
    <nat-table-surface [initialState]="initialState" [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <app-table-search label="Search rows" placeholder="Search rows" />
      <nat-table-page-size [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />

      <nat-table [columns]="columns" [data]="rows()" accessibleName="Demo table" />
    </nat-table-surface>
  `
})
class Host {
  protected readonly rows = signal<Row[]>([
    { id: 'r1', name: 'Alpha', region: 'us-east-1' },
    { id: 'r2', name: 'Beta', region: 'eu-west-3' },
    { id: 'r3', name: 'Gamma', region: 'us-east-1' },
    { id: 'r4', name: 'Delta', region: 'eu-west-3' },
    { id: 'r5', name: 'Epsilon', region: 'us-east-1' },
    { id: 'r6', name: 'Zeta', region: 'eu-west-3' }
  ]);

  protected readonly columns = columns;
  protected readonly pageSizeOptions = [2, 3, 5] as const;
  public readonly tableState = signal<Partial<NatTableUserState>>({});
  protected readonly initialState: Partial<NatTableUserState> = {
    pagination: { pageIndex: 1, pageSize: 2 }
  };

  protected onTableStateChange(state: Partial<NatTableUserState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'app-table-search-toolbar-host',
  imports: [NatTable, NatTableSurface, NatTableToolbar, TableSearch],
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Table controls">
        <app-table-search label="Search rows" placeholder="Search rows" showLabel toolbar />
      </nat-table-toolbar>

      <nat-table [columns]="columns" [data]="rows" accessibleName="Demo table" />
    </nat-table-surface>
  `
})
class ToolbarHost {
  protected readonly rows: Row[] = [{ id: 'r1', name: 'Alpha', region: 'us-east-1' }];
  protected readonly columns = columns;
}

describe('FEATURE: TableSearch (user-defined)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const searchInput = (): HTMLInputElement => {
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('app-table-search input[type="search"]');

    if (!input) {
      throw new Error('Expected the search input to render.');
    }

    return input;
  };

  const toolbarSearchElements = (toolbarFixture: ComponentFixture<ToolbarHost>): { label: HTMLLabelElement; input: HTMLInputElement } => {
    const element = toolbarFixture.nativeElement as HTMLElement;
    const label = element.querySelector<HTMLLabelElement>('.table-search-label');
    const input = element.querySelector<HTMLInputElement>('app-table-search input[type="search"]');

    if (!label || !input) {
      throw new Error('Expected the labeled search input to render inside the toolbar.');
    }

    return { label, input };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host, ToolbarHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('GIVEN: a table search host is rendered', () => {
    describe('WHEN: registers with the table so global filtering is enabled', () => {
      it('THEN: it renders the search input after table registration', () => {
        expect(searchInput()).toBeTruthy();
      });
    });
  });

  describe('GIVEN: a table search host is rendered with a rendered table target', () => {
    describe('WHEN: associates the input with the table element via aria-controls', () => {
      it('THEN: it points aria-controls at the rendered table', () => {
        const element = fixture.nativeElement as HTMLElement;
        const table = element.querySelector<HTMLTableElement>('nat-table table');

        if (!table) {
          throw new Error('Expected the table element to render.');
        }

        expect(searchInput().getAttribute('aria-controls')).toBe(table.id);
      });
    });
  });

  describe('GIVEN: a table search host is rendered with paginated searchable rows', () => {
    describe('WHEN: filters rows and resets pagination to the first page on input', () => {
      it('THEN: it updates filtering and pagination state', async () => {
        const input = searchInput();

        input.value = 'gamma';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const element = fixture.nativeElement as HTMLElement;

        expect(host.tableState().globalFilter).toBe('gamma');
        expect(host.tableState().pagination?.pageIndex).toBe(0);
        expect(element.querySelectorAll('tbody tr')).toHaveLength(1);
      });
    });
  });

  describe('GIVEN: a table search host is rendered inside a toolbar with the visible label opted in', () => {
    describe('WHEN: toolbar and showLabel are both set', () => {
      it('THEN: it renders a visible label naming the input and omits aria-label', async () => {
        const toolbarFixture = TestBed.createComponent(ToolbarHost);

        toolbarFixture.detectChanges();
        await toolbarFixture.whenStable();

        const { label, input } = toolbarSearchElements(toolbarFixture);

        expect(label.textContent.trim()).toBe('Search rows');
        expect(input.hasAttribute('aria-label')).toBe(false);
      });
    });
  });
});
