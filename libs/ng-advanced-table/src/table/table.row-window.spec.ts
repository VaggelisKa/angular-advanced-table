import { Component, Directive, forwardRef, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTable } from './table';
import type { NatTableRowRenderedEvent } from '../common/row-render.type';
import { NAT_TABLE_ROW_WINDOW } from '../common/row-window.const';
import type { NatTableRowWindow } from '../common/row-window.type';
import type { NatTableUserState } from '../common/table-state.type';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll, queryRequired } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

@Directive({
  selector: 'nat-table[testRowWindow]',
  providers: [{ provide: NAT_TABLE_ROW_WINDOW, useExisting: forwardRef(() => TestRowWindowDirective) }]
})
class TestRowWindowDirective implements NatTableRowWindow {
  public readonly indexes = signal<readonly number[]>([0, 1, 2]);
  public readonly height = signal(40);

  public readonly renderedRowIndexes = this.indexes.asReadonly();
  public readonly rowHeight = this.height.asReadonly();
}

@Component({
  selector: 'test-row-window-host',
  imports: [NatTable, TestTableSurface, TestRowWindowDirective],
  template: `
    <nat-table-surface [state]="state()">
      <nat-table
        [columns]="columns"
        [data]="rows()"
        [emitRowRenderEvents]="emitRowRenderEvents()"
        accessibleName="Windowed rows"
        testRowWindow
        (rowRendered)="renderedEvents.push($event)" />
    </nat-table-surface>
  `
})
class RowWindowHost {
  public readonly rows = signal<Row[]>(buildRows(30));
  public readonly columns = columns;
  public readonly emitRowRenderEvents = signal(false);
  public readonly state = signal<NatTableUserState>({
    sorting: [],
    globalFilter: '',
    columnFilters: [],
    pagination: { pageIndex: 0, pageSize: 0 },
    columnVisibility: {},
    columnOrder: [],
    columnPinning: { left: ['name'], right: ['throughput'] },
    columnSizing: {},
    rowSelection: {}
  });

  public readonly renderedEvents: NatTableRowRenderedEvent[] = [];
}

const dataRows = (fixture: ComponentFixture<unknown>): HTMLElement[] => queryAll(fixture, 'tbody tr.data-row');

const gapRows = (fixture: ComponentFixture<unknown>): HTMLElement[] => queryAll(fixture, '[data-testid="nat-table-virtual-row-gap"]');

describe('FEATURE: NatTable row window', () => {
  let fixture: ComponentFixture<RowWindowHost>;
  let host: RowWindowHost;
  let rowWindow: TestRowWindowDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(RowWindowHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    rowWindow = fixture.debugElement.query(By.directive(TestRowWindowDirective)).injector.get(TestRowWindowDirective);
  });

  const setWindow = async (indexes: readonly number[]): Promise<void> => {
    rowWindow.indexes.set(indexes);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  describe('GIVEN: a table whose row window mounts the first three of thirty rows', () => {
    describe('WHEN: the body renders', () => {
      it('THEN: it mounts only the windowed rows ahead of one trailing gap spacer', () => {
        expect(dataRows(fixture)).toHaveLength(3);
        expect(gapRows(fixture)).toHaveLength(1);
        expect(gapRows(fixture)[0].style.height).toBe('1080px');
        expect(gapRows(fixture)[0].getAttribute('aria-hidden')).toBe('true');
      });

      it('THEN: it pins mounted data rows to the contracted row height', () => {
        expect(dataRows(fixture).map((row) => row.style.height)).toStrictEqual(['40px', '40px', '40px']);
      });

      it('THEN: it binds absolute aria-rowindex values offset past the header row', () => {
        expect(dataRows(fixture).map((row) => row.getAttribute('aria-rowindex'))).toStrictEqual(['2', '3', '4']);
      });

      it('THEN: it reports the full row set through aria-rowcount on the table', () => {
        expect(queryRequired(fixture, 'table').getAttribute('aria-rowcount')).toBe('31');
      });

      it('THEN: it renders both pin zones around a focusable center cell through the custom provider', () => {
        const row = dataRows(fixture)[0];
        const leftPinned = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="name"]');
        const center = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="region"]');
        const rightPinned = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="throughput"]');

        center.focus();

        expect(document.activeElement).toBe(center);
        expect(leftPinned.classList).toContain('is-pinned-left');
        expect(rightPinned.classList).toContain('is-pinned-right');
        expect(leftPinned.style.left).toBe('0px');
        expect(rightPinned.style.right).toBe('0px');
        expect(getComputedStyle(leftPinned).position).toBe('sticky');
        expect(getComputedStyle(rightPinned).position).toBe('sticky');
        expect(row.getAttribute('aria-rowindex')).toBe('2');
      });
    });

    describe('WHEN: the window moves to the middle of the row model', () => {
      it('THEN: it renders leading and trailing gaps sized by the unmounted row counts', async () => {
        await setWindow([10, 11]);

        expect(dataRows(fixture).map((row) => row.getAttribute('aria-rowindex'))).toStrictEqual(['12', '13']);
        expect(gapRows(fixture).map((gap) => gap.style.height)).toStrictEqual(['400px', '720px']);
      });
    });

    describe('WHEN: the window is non-contiguous (a focused row pinned outside it)', () => {
      it('THEN: it renders an interior gap between the pinned row and the window', async () => {
        await setWindow([2, 10, 11]);

        expect(dataRows(fixture).map((row) => row.getAttribute('aria-rowindex'))).toStrictEqual(['4', '12', '13']);
        expect(gapRows(fixture).map((gap) => gap.style.height)).toStrictEqual(['80px', '280px', '720px']);
      });
    });

    describe('WHEN: a custom window moves away from the focused body row', () => {
      it('THEN: it keeps the active row mounted so browser focus remains valid', async () => {
        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row[aria-rowindex="4"] [role="rowheader"]');

        focusedCell.focus();
        host.rows.update((rows) => rows.map((row) => ({ ...row, name: `${row.name} refreshed` })));
        await setWindow([10, 11]);

        expect(document.activeElement).toBe(focusedCell);
        expect(focusedCell.textContent).toContain('refreshed');
        expect(dataRows(fixture).map((row) => row.getAttribute('aria-rowindex'))).toStrictEqual(['4', '12', '13']);
      });
    });

    describe('WHEN: consumer-side filtering removes the focused row from a custom window', () => {
      it('THEN: it restores focus to the matching column header', async () => {
        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row[aria-rowindex="4"] [data-column-id="region"]');

        focusedCell.focus();
        host.rows.set(host.rows().slice(-1));
        await setWindow([0]);

        expect(
          (document.activeElement as HTMLElement | null)?.closest('thead [role="columnheader"]')?.getAttribute('data-column-id')
        ).toBe('region');
      });
    });

    describe('WHEN: the contracted row height changes', () => {
      it('THEN: it resizes gap spacers and mounted rows together', async () => {
        rowWindow.height.set(50);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(gapRows(fixture)[0].style.height).toBe('1350px');
        expect(dataRows(fixture)[0].style.height).toBe('50px');
      });
    });

    describe('WHEN: per-row render events are requested while the window is attached', () => {
      it('THEN: it suppresses rowRendered emissions', async () => {
        host.emitRowRenderEvents.set(true);
        await setWindow([0, 1, 2, 3]);

        expect(host.renderedEvents).toHaveLength(0);
      });
    });

    describe('WHEN: the table transitions to its fully rendered empty-state row', () => {
      it('THEN: it removes the virtual logical row count instead of undercounting the DOM rows', async () => {
        host.rows.set([]);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(queryRequired(fixture, 'tbody .table-state')).not.toBeNull();
        expect(queryRequired(fixture, 'table').hasAttribute('aria-rowcount')).toBe(false);
      });
    });
  });
});
