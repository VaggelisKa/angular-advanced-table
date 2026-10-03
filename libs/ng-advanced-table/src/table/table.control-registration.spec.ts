import { Component, DestroyRef, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable } from './table';
import type { NatTableUserState } from '../common/table-state.type';
import { NatTableService } from '../domain-logic/table.service';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

@Component({
  selector: 'test-registering-pager',
  template: ''
})
class RegisteringPager {
  public constructor() {
    const service = inject(NatTableService);

    service.registerPagination();
    inject(DestroyRef).onDestroy(() => service.unregisterPagination());
  }
}

@Component({
  selector: 'test-registering-search',
  template: ''
})
class RegisteringSearch {
  public constructor() {
    const service = inject(NatTableService);

    service.registerSearch();
    inject(DestroyRef).onDestroy(() => service.unregisterSearch());
  }
}

@Component({
  selector: 'test-control-registration-host',
  imports: [NatTable, RegisteringPager, RegisteringSearch, TestTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState()" [state]="state()" (stateChange)="state.set($event)">
      @if (withPager()) {
        <test-registering-pager />
      }
      @if (withSearch()) {
        <test-registering-search />
      }
      <nat-table [columns]="columns" [data]="rows" accessibleName="Registration table" />
    </nat-table-surface>
  `
})
class ControlRegistrationHost {
  public readonly initialState = signal<Partial<NatTableUserState>>({});
  public readonly state = signal<Partial<NatTableUserState>>({});
  public readonly withPager = signal(false);
  public readonly withSearch = signal(false);
  protected readonly rows = buildRows(6);
  protected readonly columns: ColumnDef<Row, unknown>[] = columns;
}

type HostSetup = (host: ControlRegistrationHost) => void;

describe('FEATURE: NatTable pagination and search control registration', () => {
  let fixture: ComponentFixture<ControlRegistrationHost>;
  let host: ControlRegistrationHost;

  const render = async (setup: HostSetup): Promise<void> => {
    fixture = TestBed.createComponent(ControlRegistrationHost);
    host = fixture.componentInstance;
    setup(host);
    await fixture.whenStable();
  };

  const renderedRowCount = (): number =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="nat-table-row"]').length;

  const getTable = (): NatTable<Row> => fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  describe('GIVEN: a non-default initial pagination and no pagination control', () => {
    describe('WHEN: the table renders', () => {
      it('THEN: it renders every row unpaginated', async () => {
        await render((h) => h.initialState.set({ pagination: { pageIndex: 0, pageSize: 2 } }));

        expect(renderedRowCount()).toBe(6);
      });
    });
  });

  describe('GIVEN: a non-default controlled pagination and a registered pagination control', () => {
    describe('WHEN: the table renders', () => {
      it('THEN: it paginates the rows', async () => {
        await render((h) => {
          h.withPager.set(true);
          h.state.set({ pagination: { pageIndex: 0, pageSize: 2 } });
        });

        expect(renderedRowCount()).toBe(2);
      });
    });
  });

  describe('GIVEN: a controlled globalFilter and no search control', () => {
    describe('WHEN: the table renders and another slice changes', () => {
      it('THEN: it does not filter rows and keeps the controlled globalFilter in reported state', async () => {
        await render((h) => h.state.set({ globalFilter: 'alpha' }));

        expect(host.state().globalFilter).toBe('alpha');

        getTable().table.setSorting([{ id: 'name', desc: true }]);
        await fixture.whenStable();

        expect(renderedRowCount()).toBe(6);
        expect(host.state().sorting).toStrictEqual([{ id: 'name', desc: true }]);
        expect(host.state().globalFilter).toBe('alpha');
      });
    });
  });

  describe('GIVEN: an initial globalFilter and no search control', () => {
    describe('WHEN: a search control registers later', () => {
      it('THEN: it reports the seeded filter and applies it once search registers', async () => {
        await render((h) => h.initialState.set({ globalFilter: 'alpha' }));

        expect(host.state().globalFilter).toBe('alpha');
        expect(renderedRowCount()).toBe(6);

        host.withSearch.set(true);
        await fixture.whenStable();

        expect(renderedRowCount()).toBe(1);
      });
    });
  });

  describe('GIVEN: a controlled globalFilter and a registered search control', () => {
    describe('WHEN: the table renders', () => {
      it('THEN: it filters the rows', async () => {
        await render((h) => {
          h.withSearch.set(true);
          h.state.set({ globalFilter: 'alpha' });
        });

        expect(renderedRowCount()).toBe(1);
      });
    });
  });
});
