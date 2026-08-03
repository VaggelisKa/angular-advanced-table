import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NAT_EN_LOCALE_ID, NAT_TABLE_BUILT_IN_LOCALES } from 'ng-advanced-table/locale';

import { NatList } from './list';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { describeColumnVisibilityChange } from '../utils/table-announcement.util';

@Component({
  selector: 'test-unnamed-list-host',
  imports: [NatList, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list [columns]="columns" [data]="rows()" />
    </nat-table-surface>
  `
})
class UnnamedListHost {
  public readonly rows = signal<Row[]>(buildRows(2));
  public readonly columns = columns;
}

describe('FEATURE: NatList accessibility copy', () => {
  const columnStates = [
    { id: 'name', label: 'Service', visible: true },
    { id: 'region', label: 'Region', visible: true }
  ];
  const formatNumber = (value: number): string => String(value);

  describe('GIVEN: the built-in English accessibility text', () => {
    describe('WHEN: a column-visibility change is described for a list', () => {
      it('THEN: it announces fields where the table announces columns', () => {
        const text = NAT_TABLE_BUILT_IN_LOCALES[NAT_EN_LOCALE_ID].accessibilityText ?? {};
        const next = [columnStates[0], { ...columnStates[1], visible: false }];

        const listMessage = describeColumnVisibilityChange(columnStates, next, text, formatNumber, 'list');
        const tableMessage = describeColumnVisibilityChange(columnStates, next, text, formatNumber);

        expect(listMessage).toBe('Region field hidden. 1 visible field.');
        expect(tableMessage).toBe('Region column hidden. 1 visible column.');
      });
    });

    describe('WHEN: only the table formatter is overridden', () => {
      it('THEN: the list falls back to it instead of dropping the announcement', () => {
        const next = [columnStates[0], { ...columnStates[1], visible: false }];

        const message = describeColumnVisibilityChange(
          columnStates,
          next,
          { columnVisibilityChange: () => 'custom table copy' },
          formatNumber,
          'list'
        );

        expect(message).toBe('custom table copy');
      });
    });
  });
});

describe('FEATURE: NatList accessibility wiring', () => {
  let fixture: ComponentFixture<UnnamedListHost>;
  let warnings: string[];

  beforeEach(async () => {
    warnings = [];
    vi.spyOn(console, 'warn').mockImplementation((message: unknown) => {
      warnings.push(String(message));
    });

    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnnamedListHost);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GIVEN: a list rendered without an accessible name', () => {
    describe('WHEN: the dev-mode accessible-name check runs', () => {
      it('THEN: it names the list element and omits the caption advice it cannot honor', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        await fixture.whenStable();

        const accessibleNameWarnings = warnings.filter((warning) => warning.includes('accessible name'));

        expect(accessibleNameWarnings).toHaveLength(1);
        expect(accessibleNameWarnings[0]).toContain('<nat-list>');
        expect(accessibleNameWarnings[0]).not.toContain('<nat-table>');
        expect(accessibleNameWarnings[0]).not.toContain('caption');
      });
    });
  });
});
