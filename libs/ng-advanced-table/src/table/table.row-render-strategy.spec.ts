import { Component, DestroyRef, Directive, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable } from './table';
import type { NatTableRowRenderStrategy } from '../common/row-render-strategy.type';
import { NatTableRowRenderStrategyRegistry } from '../domain-logic/table-row-render-strategy.service';
import { NatTableService } from '../domain-logic/table.service';

type TestRow = { readonly id: string; readonly name: string };

@Directive({ selector: 'nat-table[testDuplicateRowWindow]' })
class TestDuplicateRowWindow {
  public constructor() {
    const registry = inject(NatTableRowRenderStrategyRegistry);
    const destroyRef = inject(DestroyRef);
    const strategy: NatTableRowRenderStrategy = {
      items: signal([
        { index: 1, start: 40, end: 80 },
        { index: 1, start: 40, end: 80 }
      ]),
      totalSize: signal(200),
      rowHeight: signal(40)
    };

    destroyRef.onDestroy(registry.register(strategy));
  }
}

@Component({
  selector: 'test-custom-row-window-host',
  imports: [NatTable, TestDuplicateRowWindow],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Custom row window" testDuplicateRowWindow />`
})
class CustomRowWindowHost {
  protected readonly rows: TestRow[] = Array.from({ length: 5 }, (_, index) => ({ id: String(index), name: `Row ${index}` }));
  protected readonly columns: ColumnDef<TestRow, unknown>[] = [{ accessorKey: 'name', header: 'Name' }];
}

describe('FEATURE: custom NatTable row-render strategies', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomRowWindowHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a custom range contains the same logical index twice', () => {
    describe('WHEN: the table renders the custom row window', () => {
      it('THEN: it mounts that logical row only once', async () => {
        const fixture = TestBed.createComponent(CustomRowWindowHost);

        await fixture.whenStable();

        const rows = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLTableRowElement>('tbody tr.data-row');
        const table = (fixture.nativeElement as HTMLElement).querySelector<HTMLTableElement>('table') as HTMLTableElement;
        const spacers = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLTableRowElement>('tbody tr.virtual-spacer-row');

        expect(rows).toHaveLength(1);
        expect(rows[0].dataset['rowIndex']).toBe('1');
        expect(rows[0].getAttribute('aria-rowindex')).toBe('3');
        expect(table.getAttribute('aria-rowcount')).toBe('6');
        expect([...spacers].every((spacer) => spacer.getAttribute('aria-hidden') === 'true')).toBe(true);

        fixture.destroy();
      });
    });
  });
});
