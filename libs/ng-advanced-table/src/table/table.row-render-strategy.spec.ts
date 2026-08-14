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
        { index: -1, start: 0, end: 40 },
        { index: 1, start: 40, end: 80 },
        { index: 1, start: 40, end: 80 },
        { index: 2, start: 120, end: 80 },
        { index: 3, start: Number.NaN, end: 160 },
        { index: 5, start: 200, end: 240 }
      ]),
      totalSize: signal(200),
      rowHeight: signal(40)
    };

    destroyRef.onDestroy(registry.register(strategy));
  }
}

@Directive({ selector: 'nat-table[testInvalidRowWindowMetrics]' })
class TestInvalidRowWindowMetrics {
  public constructor() {
    const registry = inject(NatTableRowRenderStrategyRegistry);
    const destroyRef = inject(DestroyRef);
    const strategy: NatTableRowRenderStrategy = {
      items: signal([{ index: 1, start: 40, end: 80 }]),
      totalSize: signal(160),
      rowHeight: signal(40)
    };

    destroyRef.onDestroy(registry.register(strategy));
  }
}

@Directive({ selector: 'nat-table[testNonMonotonicRowWindow]' })
class TestNonMonotonicRowWindow {
  public constructor() {
    const registry = inject(NatTableRowRenderStrategyRegistry);
    const destroyRef = inject(DestroyRef);
    const strategy: NatTableRowRenderStrategy = {
      items: signal([
        { index: 1, start: 120, end: 160 },
        { index: 2, start: 40, end: 80 }
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

@Component({
  selector: 'test-invalid-row-window-host',
  imports: [NatTable, TestInvalidRowWindowMetrics],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Invalid row window" testInvalidRowWindowMetrics />`
})
class InvalidRowWindowHost {
  protected readonly rows: TestRow[] = Array.from({ length: 5 }, (_, index) => ({ id: String(index), name: `Row ${index}` }));
  protected readonly columns: ColumnDef<TestRow, unknown>[] = [{ accessorKey: 'name', header: 'Name' }];
}

@Component({
  selector: 'test-non-monotonic-row-window-host',
  imports: [NatTable, TestNonMonotonicRowWindow],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Non-monotonic row window" testNonMonotonicRowWindow />`
})
class NonMonotonicRowWindowHost {
  protected readonly rows: TestRow[] = Array.from({ length: 5 }, (_, index) => ({ id: String(index), name: `Row ${index}` }));
  protected readonly columns: ColumnDef<TestRow, unknown>[] = [{ accessorKey: 'name', header: 'Name' }];
}

describe('FEATURE: custom NatTable row-render strategies', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomRowWindowHost, InvalidRowWindowHost, NonMonotonicRowWindowHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a custom range contains duplicate and invalid geometry', () => {
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

  describe('GIVEN: a custom strategy reports less total space than its logical rows require', () => {
    describe('WHEN: the table renders the custom row window', () => {
      it('THEN: it falls back to every logical row without virtual spacers', async () => {
        const fixture = TestBed.createComponent(InvalidRowWindowHost);

        await fixture.whenStable();

        const host = fixture.nativeElement as HTMLElement;

        expect(host.querySelectorAll('tbody tr.data-row')).toHaveLength(5);
        expect(host.querySelectorAll('tbody tr.virtual-spacer-row')).toHaveLength(0);
        expect(host.querySelector('table')?.getAttribute('aria-rowcount')).toBe('6');

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a custom range moves backward in vertical space', () => {
    describe('WHEN: the table renders the custom row window', () => {
      it('THEN: it discards the non-monotonic row and preserves the reported total size', async () => {
        const fixture = TestBed.createComponent(NonMonotonicRowWindowHost);

        await fixture.whenStable();

        const host = fixture.nativeElement as HTMLElement;
        const rows = [...host.querySelectorAll<HTMLTableRowElement>('tbody tr.data-row')];
        const spacerHeights = [...host.querySelectorAll<HTMLElement>('tbody .virtual-spacer-cell')].map((spacer) =>
          Number.parseFloat(spacer.style.height)
        );

        expect(rows.map((row) => row.dataset['rowIndex'])).toStrictEqual(['1']);
        expect(spacerHeights).toStrictEqual([120, 40]);
        expect(spacerHeights.reduce((total, height) => total + height, rows.length * 40)).toBe(200);

        fixture.destroy();
      });
    });
  });
});
