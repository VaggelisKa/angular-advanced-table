import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { nonHideableColumns } from '../test-helpers/table-data.helper';
import { TableHost, createTableHostFixture, getInternalTable } from '../test-helpers/table-hosts.helper';
import type { RecreateHostOptions } from '../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable commands controller', () => {
  let fixture: ComponentFixture<TableHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    ({ fixture } = await createTableHostFixture());
  });

  const recreateHost = async (options: RecreateHostOptions = {}): Promise<void> => {
    fixture.destroy();
    ({ fixture } = await createTableHostFixture(options));
  };

  describe('GIVEN: sorting is enabled on the surface', () => {
    describe('WHEN: setColumnSort is called with a direction', () => {
      it('should replace the whole sorting state with the single ascending column', async () => {
        // when:
        await recreateHost({ initialState: { sorting: [{ id: 'throughput', desc: true }] } });
        const table = getInternalTable(fixture);

        table.setColumnSort('region', 'asc');
        fixture.detectChanges();

        // then:
        expect(table.sorting()).toStrictEqual([{ id: 'region', desc: false }]);
      });

      it('should replace the whole sorting state with the single descending column', async () => {
        // when:
        await recreateHost({ initialState: { sorting: [{ id: 'throughput', desc: true }] } });
        const table = getInternalTable(fixture);

        table.setColumnSort('region', 'desc');
        fixture.detectChanges();

        // then:
        expect(table.sorting()).toStrictEqual([{ id: 'region', desc: true }]);
      });
    });

    describe('WHEN: setColumnSort is called with false to remove a column', () => {
      it('should drop only that column entry and leave other columns sorted', async () => {
        // when:
        await recreateHost({
          enableMultiSort: true,
          initialState: {
            sorting: [
              { id: 'region', desc: false },
              { id: 'status', desc: true }
            ]
          }
        });
        const table = getInternalTable(fixture);

        table.setColumnSort('region', false);
        fixture.detectChanges();

        // then:
        expect(table.sorting()).toStrictEqual([{ id: 'status', desc: true }]);
      });
    });

    describe('WHEN: setColumnSort is called with an unknown column id', () => {
      it('should no-op and leave the sorting state untouched', async () => {
        // when:
        await recreateHost({ initialState: { sorting: [{ id: 'region', desc: false }] } });
        const table = getInternalTable(fixture);

        table.setColumnSort('does-not-exist', 'asc');
        fixture.detectChanges();

        // then:
        expect(table.sorting()).toStrictEqual([{ id: 'region', desc: false }]);
      });
    });
  });

  describe('GIVEN: a table exposing its leaf columns', () => {
    describe('WHEN: reading the columnVisibility selector', () => {
      it('should list every leaf column in order with id, label, visibility and canHide', async () => {
        // when:
        await recreateHost({ initialState: { columnVisibility: { region: false } } });
        const table = getInternalTable(fixture);

        // then:
        expect(table.columnVisibility()).toStrictEqual([
          { id: 'name', label: 'Service', visible: true, canHide: true },
          { id: 'region', label: 'Region', visible: false, canHide: true },
          { id: 'status', label: 'Status', visible: true, canHide: true },
          { id: 'throughput', label: 'Throughput', visible: true, canHide: true }
        ]);
      });
    });

    describe('WHEN: setColumnVisible hides then shows a column', () => {
      it('should reflect the toggled visibility in the selector', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost();
        const table = getInternalTable(fixture);

        table.setColumnVisible('region', false);
        fixture.detectChanges();

        // then:
        expect(table.columnVisibility().find((item) => item.id === 'region')?.visible).toBe(false);

        // when:
        table.setColumnVisible('region', true);
        fixture.detectChanges();

        // then:
        expect(table.columnVisibility().find((item) => item.id === 'region')?.visible).toBe(true);
      });
    });

    describe('WHEN: setColumnVisible tries to hide a non-hideable column', () => {
      it('should no-op and keep the column visible', async () => {
        // when:
        await recreateHost({ columns: nonHideableColumns });
        const table = getInternalTable(fixture);

        table.setColumnVisible('name', false);
        fixture.detectChanges();

        // then:
        const nameItem = table.columnVisibility().find((item) => item.id === 'name');

        expect(nameItem?.canHide).toBe(false);
        expect(nameItem?.visible).toBe(true);
      });
    });

    describe('WHEN: setColumnVisible is called with an unknown column id', () => {
      it('should no-op without changing any column visibility', async () => {
        // when:
        await recreateHost();
        const table = getInternalTable(fixture);

        table.setColumnVisible('does-not-exist', false);
        fixture.detectChanges();

        // then:
        expect(table.columnVisibility().every((item) => item.visible)).toBe(true);
      });
    });
  });

  describe('GIVEN: row selection is enabled', () => {
    describe('WHEN: setRowSelected selects and clearRowSelection clears', () => {
      it('should track the selection and then reset it', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enableRowSelection: true });
        const table = getInternalTable(fixture);

        table.setRowSelected('svc-00001', true);
        fixture.detectChanges();

        // then:
        expect(table.rowSelection()).toStrictEqual({ 'svc-00001': true });

        // when:
        table.clearRowSelection();
        fixture.detectChanges();

        // then:
        expect(table.rowSelection()).toStrictEqual({});
      });
    });

    describe('WHEN: setRowSelected is called with an unknown row id', () => {
      it('should not throw and leave the selection unchanged', async () => {
        // when:
        await recreateHost({ enableRowSelection: true, initialState: { rowSelection: { 'svc-00002': true } } });
        const table = getInternalTable(fixture);

        table.setRowSelected('does-not-exist', true);
        fixture.detectChanges();

        // then:
        expect(table.rowSelection()).toStrictEqual({ 'svc-00002': true });
      });
    });
  });

  describe('GIVEN: row selection is disabled', () => {
    describe('WHEN: setRowSelected is called', () => {
      it('should no-op and leave the selection empty', async () => {
        // when:
        await recreateHost({ enableRowSelection: false });
        const table = getInternalTable(fixture);

        table.setRowSelected('svc-00001', true);
        fixture.detectChanges();

        // then:
        expect(table.rowSelection()).toStrictEqual({});
      });
    });
  });
});
