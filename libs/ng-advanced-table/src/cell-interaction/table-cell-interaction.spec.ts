import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable } from '../table/table';
import { buildDynamicColumns, buildRows } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll, queryRequired } from '../test-helpers/table-dom.helper';
import { TableHost, TestTableSurface, createTableHostFixture } from '../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    ({ fixture, host } = await createTableHostFixture());
  });

  describe('GIVEN: a table navigated by keyboard', () => {
    describe('WHEN: the table is rendered', () => {
      it('THEN: it uses the explicit pin order when computing sticky left offsets', () => {
        host.state.set({
          columnPinning: {
            left: ['region', 'name'],
            right: []
          }
        });
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"]');
        const nameHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="name"]');
        const regionCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');
        const nameCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child th[data-column-id="name"]');

        expect(regionHeader.style.left).toBe('0px');
        expect(nameHeader.style.left).toBe('140px');
        expect(regionCell.style.left).toBe('0px');
        expect(nameCell.style.left).toBe('140px');
      });
    });

    describe('WHEN: arrow keys move focus across cells', () => {
      it('THEN: it moves focus with arrow keys and stops at the grid edge', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const firstRowCells = queryAll<HTMLElement>(fixture, 'tbody tr:first-child th, tbody tr:first-child td');
        const [firstCell, secondCell] = firstRowCells;
        const lastCell = firstRowCells.at(-1) as HTMLElement;

        // when:
        firstCell.focus();
        firstCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(secondCell);

        // when:
        lastCell.focus();
        lastCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(lastCell);
      });
    });

    describe('WHEN: only column labels are swapped', () => {
      it('THEN: it does not announce a visibility change when only column labels are swapped', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const dynamicColumns = signal<ColumnDef<Row, unknown>[]>(buildDynamicColumns('Service'));

        @Component({
          selector: 'test-dynamic-columns-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface>
              <nat-table [columns]="columns()" [data]="rows()" accessibleName="Operations table" />
            </nat-table-surface>
          `
        })
        class DynamicColumnsHost {
          protected readonly rows = signal<Row[]>(buildRows(3));
          protected readonly columns = dynamicColumns;
        }

        // when:
        const dynamicFixture = TestBed.createComponent(DynamicColumnsHost);

        await dynamicFixture.whenStable();
        dynamicFixture.detectChanges();

        const liveRegion = queryRequired<HTMLElement>(dynamicFixture, 'p[aria-live="polite"]');

        // then:
        expect(liveRegion.textContent.trim()).toBe('');

        // when:
        dynamicColumns.set(buildDynamicColumns('Servicio'));
        dynamicFixture.detectChanges();
        await dynamicFixture.whenStable();
        dynamicFixture.detectChanges();

        // then:
        expect(liveRegion.textContent.trim()).toBe('');
      });
    });
  });
});
