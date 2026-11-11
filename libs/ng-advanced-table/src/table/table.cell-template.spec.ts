import { GridCellWidget } from '@angular/aria/grid';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatTable } from './table';
import { NatList } from '../list/list';
import { NatTableStatic } from '../static-table/static-table';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatTableCellTemplate } from '../ui/table-cell-template.directive';

@Component({
  selector: 'test-table-cell-template-host',
  imports: [NatTable, NatTableCellTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations">
        @if (showStatusTemplate()) {
          <ng-template
            [natTableCellOf]="columns"
            let-index="rowIndex"
            let-renderer="renderer"
            let-row="row"
            let-status
            natTableCell="status">
            <span [attr.data-renderer]="renderer" [attr.data-row-index]="index" data-testid="status-template">
              {{ row.original.name }}: {{ status }}
            </span>
          </ng-template>
        }
        @if (showUnknownTemplate()) {
          <ng-template natTableCell="missing">never rendered</ng-template>
        }
      </nat-table>
    </nat-table-surface>
  `
})
class TableCellTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
  public readonly showStatusTemplate = signal(true);
  public readonly showUnknownTemplate = signal(false);
}

@Component({
  selector: 'test-table-cell-widget-template-host',
  imports: [GridCellWidget, NatTable, NatTableCellTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations">
        <ng-template let-status natTableCell="status">
          <button data-testid="status-widget" ngGridCellWidget type="button">{{ status }}</button>
        </ng-template>
      </nat-table>
    </nat-table-surface>
  `
})
class TableCellWidgetTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(2));
  public readonly columns = columns;
}

@Component({
  selector: 'test-static-cell-template-host',
  imports: [NatTableStatic, NatTableCellTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table-static [columns]="columns" [data]="rows()" accessibleName="Operations">
        <ng-template let-index="rowIndex" let-status natTableCell="status">
          <span [attr.data-row-index]="index" data-testid="status-template">static {{ status }}</span>
        </ng-template>
      </nat-table-static>
    </nat-table-surface>
  `
})
class StaticCellTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
}

@Component({
  selector: 'test-list-cell-template-host',
  imports: [NatList, NatTableCellTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list [columns]="columns" [data]="rows()" accessibleName="Operations">
        <ng-template let-renderer="renderer" let-status natTableCell="status">
          <span [attr.data-renderer]="renderer" data-testid="status-template">list {{ status }}</span>
        </ng-template>
      </nat-list>
    </nat-table-surface>
  `
})
class ListCellTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
}

const templated = (fixture: ComponentFixture<unknown>): HTMLElement[] => queryAll(fixture, '[data-testid="status-template"]');

const text = (elements: HTMLElement[]): string[] => elements.map((element) => element.textContent.replace(/\s+/g, ' ').trim());

describe('FEATURE: projected cell templates', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  describe('GIVEN: a table with a natTableCell template for one column', () => {
    let fixture: ComponentFixture<TableCellTemplateHost>;

    beforeEach(async () => {
      fixture = TestBed.createComponent(TableCellTemplateHost);
      await fixture.whenStable();
    });

    describe('WHEN: the rows render', () => {
      it('THEN: it renders the template inside every cell of that column with value and row', () => {
        const rows = fixture.componentInstance.rows();
        const cells = templated(fixture);

        expect(text(cells)).toEqual(rows.map((row) => `${row.name}: ${row.status}`));
        expect(cells.every((cell) => cell.closest('[data-testid="nat-table-cell-status"]') !== null)).toBe(true);
      });

      it('THEN: it passes the row index and the table renderer', () => {
        const cells = templated(fixture);

        expect(cells.map((cell) => cell.dataset['rowIndex'])).toEqual(['0', '1', '2']);
        expect(cells.every((cell) => cell.dataset['renderer'] === 'table')).toBe(true);
      });

      it('THEN: it keeps rendering other columns from their column definition', () => {
        const regions = queryAll(fixture, '[data-testid="nat-table-cell-region"]');

        expect(text(regions)).toEqual(fixture.componentInstance.rows().map((row) => row.region));
      });
    });

    describe('WHEN: the data changes', () => {
      it('THEN: it updates the template with the new value', async () => {
        const [first, ...rest] = fixture.componentInstance.rows();

        fixture.componentInstance.rows.set([{ ...first, status: 'Alert', name: 'Renamed' }, ...rest]);
        await fixture.whenStable();

        expect(text(templated(fixture))[0]).toBe('Renamed: Alert');
      });
    });

    describe('WHEN: the template is removed', () => {
      it('THEN: it falls back to the column definition', async () => {
        fixture.componentInstance.showStatusTemplate.set(false);
        await fixture.whenStable();

        const statuses = queryAll(fixture, '[data-testid="nat-table-cell-status"]');

        expect(templated(fixture)).toHaveLength(0);
        expect(text(statuses)).toEqual(fixture.componentInstance.rows().map((row) => row.status));
      });
    });
  });

  describe('GIVEN: a table with a natTableCell template for an unknown column id', () => {
    describe('WHEN: the table renders', () => {
      it('THEN: it warns once and renders nothing for that template', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(TableCellTemplateHost);

        fixture.componentInstance.showUnknownTemplate.set(true);
        await fixture.whenStable();
        fixture.componentInstance.rows.set(buildRows(2));
        await fixture.whenStable();

        const warnings = warn.mock.calls.filter(([message]) => String(message).includes('natTableCell="missing"'));

        expect(warnings).toHaveLength(1);
        expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('never rendered');

        warn.mockRestore();
      });
    });
  });

  describe('GIVEN: a table with a natTableCell template that holds a grid cell widget', () => {
    describe('WHEN: the rows render', () => {
      it('THEN: it resolves the grid cell for the widget and joins the roving tab order', async () => {
        const fixture = TestBed.createComponent(TableCellWidgetTemplateHost);

        await fixture.whenStable();

        const widgets = queryAll(fixture, '[data-testid="status-widget"]');

        expect(widgets).toHaveLength(2);
        expect(widgets.every((widget) => widget.closest('[role="gridcell"]') !== null)).toBe(true);
        expect(widgets.every((widget) => widget.hasAttribute('tabindex'))).toBe(true);
      });
    });
  });

  describe('GIVEN: a static table and a list with a natTableCell template', () => {
    describe('WHEN: the static table renders', () => {
      it('THEN: it renders the template in every cell of that column', async () => {
        const fixture = TestBed.createComponent(StaticCellTemplateHost);

        await fixture.whenStable();

        const cells = templated(fixture);

        expect(text(cells)).toEqual(fixture.componentInstance.rows().map((row) => `static ${row.status}`));
        expect(cells.map((cell) => cell.dataset['rowIndex'])).toEqual(['0', '1', '2']);
      });
    });

    describe('WHEN: the list renders', () => {
      it('THEN: it renders the template as the field value with the list renderer', async () => {
        const fixture = TestBed.createComponent(ListCellTemplateHost);

        await fixture.whenStable();

        const cells = templated(fixture);

        expect(text(cells)).toEqual(fixture.componentInstance.rows().map((row) => `list ${row.status}`));
        expect(cells.every((cell) => cell.closest('[data-testid="nat-list-field-value"]') !== null)).toBe(true);
        expect(cells.every((cell) => cell.dataset['renderer'] === 'list')).toBe(true);
      });
    });
  });
});
