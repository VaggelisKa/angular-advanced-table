import { Component, DestroyRef, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type { SortingState } from '@tanstack/angular-table';

import { NatTable } from './table';
import type { NatTableUserState } from '../common/table-state.type';
import { NatTableService } from '../domain-logic/table.service';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll, queryRequired } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatTableSubHeaderTemplate } from '../ui/table-sub-header-template.directive';

@Component({
  selector: 'test-sub-header-pager',
  template: ''
})
class SubHeaderPager {
  public constructor() {
    const service = inject(NatTableService);
    const destroyRef = inject(DestroyRef);

    service.registerPagination();
    destroyRef.onDestroy(() => {
      service.unregisterPagination();
    });
  }
}

@Component({
  selector: 'test-sub-header-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface (sortingChange)="sortingEvents.push($event)" (stateChange)="stateEvents.push($event)">
      <nat-table
        [columns]="columns"
        [data]="rows()"
        [enableSubHeaders]="enableSubHeaders()"
        [subHeaderColumn]="subHeaderColumn()"
        [subHeaderOrder]="subHeaderOrder()"
        accessibleName="Grouped operations" />
    </nat-table-surface>
  `
})
class SubHeaderHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly columns = columns;
  public readonly subHeaderColumn = signal<string | undefined>('status');
  public readonly subHeaderOrder = signal<readonly unknown[] | undefined>(undefined);
  public readonly enableSubHeaders = signal(true);
  public readonly sortingEvents: SortingState[] = [];
  public readonly stateEvents: NatTableUserState[] = [];
}

@Component({
  selector: 'test-sub-header-template-host',
  imports: [NatTable, TestTableSurface, NatTableSubHeaderTemplate, SubHeaderPager],
  template: `
    <nat-table-surface [initialState]="initialState">
      <test-sub-header-pager />
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Grouped operations" subHeaderColumn="status">
        <ng-template let-count="rowCountValue" let-row="row" let-value natTableSubHeader>
          <span class="custom-sub-header">{{ value }} ({{ count }}) first={{ row.id }}</span>
        </ng-template>
      </nat-table>
    </nat-table-surface>
  `
})
class SubHeaderTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly columns = columns;
  public readonly initialState: Partial<NatTableUserState> = { pagination: { pageIndex: 1, pageSize: 3 } };
}

const subHeaderRows = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
  queryAll(fixture, '[data-testid="nat-table-sub-header-row"]');

const subHeaderSrTexts = (fixture: ComponentFixture<unknown>): string[] =>
  subHeaderRows(fixture).map((row) => row.querySelector('.sr-only')?.textContent.trim() ?? '');

const dataRowNames = (fixture: ComponentFixture<unknown>): string[] =>
  queryAll(fixture, 'tbody tr.data-row th[data-column-id="name"]').map((cell) => cell.textContent.trim());

const subHeaderVisibleText = (row: HTMLElement): string =>
  row.querySelector('.custom-sub-header, [aria-hidden="true"]')?.textContent.replace(/\s+/g, ' ').trim() ?? '';

const bodyRowIndexes = (fixture: ComponentFixture<unknown>): (string | null)[] =>
  queryAll(fixture, 'tbody tr').map((row) => row.getAttribute('aria-rowindex'));

const bodyRowKinds = (fixture: ComponentFixture<unknown>): string[] =>
  queryAll(fixture, 'tbody tr').map((row) =>
    row.classList.contains('sub-header-row') ? `group:${subHeaderVisibleText(row)}` : 'row'
  );

describe('FEATURE: NatTable sub-headers', () => {
  let fixture: ComponentFixture<SubHeaderHost>;
  let host: SubHeaderHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubHeaderHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  const patchTableState = (updaters: Partial<{ [K in keyof NatTableUserState]: NatTableUserState[K] }>): void => {
    const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

    table.patchState(updaters);
  };

  describe('GIVEN: a table with subHeaderColumn set', () => {
    describe('WHEN: rows render without user sorting', () => {
      it('THEN: it renders one sub-header row per group in ascending group order', () => {
        const rows = subHeaderRows(fixture);

        expect(subHeaderSrTexts(fixture)).toStrictEqual(['Alert group, 2 rows.', 'Healthy group, 2 rows.', 'Pending group, 2 rows.']);
        expect(rows.map((row) => row.querySelector('[aria-hidden="true"]')?.textContent.trim())).toStrictEqual([
          'Alert',
          'Healthy',
          'Pending'
        ]);
        expect(dataRowNames(fixture)).toStrictEqual(['Gamma', 'Zeta', 'Alpha', 'Delta', 'Beta', 'Epsilon']);
      });

      it('THEN: sub-header rows carry no selection state or data-row semantics', () => {
        for (const row of subHeaderRows(fixture)) {
          expect(row.classList.contains('data-row')).toBe(false);
          expect(row.hasAttribute('aria-selected')).toBe(false);
        }
      });

      it('THEN: the sub-header column header exposes no aria-sort for the forced sort', () => {
        expect(queryRequired(fixture, '[data-testid="nat-table-header-status"]').hasAttribute('aria-sort')).toBe(false);
      });

      it('THEN: aria row indexes run unbroken across sub-header and data rows', () => {
        // One header row, then 3 groups of 2 rows: group, row, row, group, …
        expect(bodyRowIndexes(fixture)).toStrictEqual(['2', '3', '4', '5', '6', '7', '8', '9', '10']);
      });

      it('THEN: aria-rowcount counts the header, sub-header, and data rows', () => {
        expect(queryRequired(fixture, 'table').getAttribute('aria-rowcount')).toBe('10');
      });

      it('THEN: sub-header cells carry the shared row separator and the transparent background token', () => {
        const tableStyles = Array.from(document.styleSheets).flatMap((styleSheet) =>
          Array.from(styleSheet.cssRules).filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        );
        const subHeaderCellRule = tableStyles.find(
          (rule) => rule.selectorText.includes('.sub-header-cell') && !rule.selectorText.includes('.is-virtualized')
        );
        const cssText = subHeaderCellRule?.cssText ?? '';

        // The separator reuses the data-cell border tokens so a themed border
        // applies to sub-header rows without a second token pair.
        expect(cssText).toContain('border-bottom');
        expect(cssText).toContain('--nat-table-cell-border-width');
        expect(cssText).toContain('--nat-table-cell-border-color');
        expect(cssText).toContain('--nat-table-sub-header-background');
        expect(cssText).toContain('transparent');
      });
    });

    describe('WHEN: the user sorts another column', () => {
      it('THEN: the user sort applies within groups and stays the visible primary sort', async () => {
        patchTableState({ sorting: [{ id: 'throughput', desc: true }] });
        await fixture.whenStable();
        fixture.detectChanges();

        expect(dataRowNames(fixture)).toStrictEqual(['Zeta', 'Gamma', 'Delta', 'Alpha', 'Epsilon', 'Beta']);
        expect(queryRequired(fixture, '[data-testid="nat-table-header-throughput"]').getAttribute('aria-sort')).toBe('descending');
        expect(queryRequired(fixture, '[data-testid="nat-table-header-status"]').hasAttribute('aria-sort')).toBe(false);
      });

      it('THEN: emitted sorting state never contains the forced sub-header entry', async () => {
        patchTableState({ sorting: [{ id: 'throughput', desc: true }] });
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.sortingEvents.at(-1)).toStrictEqual([{ id: 'throughput', desc: true }]);

        for (const state of host.stateEvents) {
          expect(state.sorting.some((entry) => entry.id === 'status')).toBe(false);
        }
      });
    });

    describe('WHEN: a subHeaderOrder array is set', () => {
      it('THEN: groups follow the configured order with unlisted values last', async () => {
        host.subHeaderOrder.set(['Pending', 'Healthy']);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(subHeaderSrTexts(fixture)).toStrictEqual(['Pending group, 2 rows.', 'Healthy group, 2 rows.', 'Alert group, 2 rows.']);
        expect(dataRowNames(fixture)).toStrictEqual(['Beta', 'Epsilon', 'Alpha', 'Delta', 'Gamma', 'Zeta']);
      });
    });

    describe('WHEN: subHeaderColumn does not match a leaf column', () => {
      it('THEN: sub-headers are disabled and a dev warning is logged', async () => {
        const warnings: string[] = [];
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation((message: unknown) => {
          warnings.push(String(message));
        });

        host.subHeaderColumn.set('nope');
        await fixture.whenStable();
        fixture.detectChanges();

        expect(subHeaderRows(fixture)).toHaveLength(0);
        expect(dataRowNames(fixture)).toStrictEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
        expect(warnings.some((warning) => warning.includes('subHeaderColumn "nope"'))).toBe(true);

        warnSpy.mockRestore();
      });
    });

    describe('WHEN: enableSubHeaders is set to false', () => {
      it('THEN: the configured sub-headers are ignored on this renderer without warnings', async () => {
        const warnings: string[] = [];
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation((message: unknown) => {
          warnings.push(String(message));
        });

        host.subHeaderOrder.set(['Pending', 'Healthy']);
        host.enableSubHeaders.set(false);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(subHeaderRows(fixture)).toHaveLength(0);
        expect(dataRowNames(fixture)).toStrictEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
        expect(warnings).toHaveLength(0);

        warnSpy.mockRestore();
      });
    });

    describe('WHEN: subHeaderColumn is cleared', () => {
      it('THEN: the table renders unsorted rows with no sub-header rows', async () => {
        host.subHeaderColumn.set(undefined);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(subHeaderRows(fixture)).toHaveLength(0);
        expect(dataRowNames(fixture)).toStrictEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
      });
    });
  });
});

describe('FEATURE: NatTable sub-header templates and pagination', () => {
  let fixture: ComponentFixture<SubHeaderTemplateHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubHeaderTemplateHost);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  describe('GIVEN: a paginated table with a custom sub-header template', () => {
    describe('WHEN: the second page starts inside a group', () => {
      it('THEN: the page-start row repeats the sub-header with the whole-group count', () => {
        // Sorted groups: Alert (Gamma, Zeta), Healthy (Alpha, Delta), Pending (Beta, Epsilon).
        // Page size 3 → page 2 renders Delta (Healthy, continued), Beta, Epsilon.
        expect(bodyRowKinds(fixture)).toStrictEqual([
          'group:Healthy (2) first=svc-00004',
          'row',
          'group:Pending (2) first=svc-00002',
          'row',
          'row'
        ]);
      });

      it('THEN: the custom template replaces the default value rendering', () => {
        const custom = queryAll(fixture, '.custom-sub-header');

        expect(custom.map((element) => element.textContent.trim())).toStrictEqual([
          'Healthy (2) first=svc-00004',
          'Pending (2) first=svc-00002'
        ]);
      });
    });
  });
});
