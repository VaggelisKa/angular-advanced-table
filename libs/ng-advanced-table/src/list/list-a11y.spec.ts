import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatList } from './list';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

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
