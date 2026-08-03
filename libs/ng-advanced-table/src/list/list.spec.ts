import type { TemplateRef } from '@angular/core';
import { Component, computed, input, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type { ColumnDef, FlexRenderComponent } from '@tanstack/angular-table';
import { flexRenderComponent } from '@tanstack/angular-table';

import { NatList } from './list';
import type { NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';
import { NatTableService } from '../domain-logic/table.service';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

@Component({
  selector: 'test-list-host',
  imports: [NatList, TestTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState()" enableReordering>
      <nat-list
        [columns]="columns"
        [data]="rows()"
        [dataStatus]="dataStatus()"
        [enableRowSelection]="enableRowSelection()"
        [selectionMode]="selectionMode()"
        accessibleName="Operations list" />
    </nat-table-surface>
  `
})
class ListHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly columns = columns;
  public readonly initialState = signal<Partial<NatTableUserState>>({});
  public readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  public readonly enableRowSelection = signal(false);
  public readonly selectionMode = signal<'single' | 'multiple'>('multiple');
}

@Component({
  selector: 'test-list-badge',
  template: `<span class="test-badge">{{ value() }}</span>`
})
class TestListBadge {
  public readonly value = input.required<string>();
}

@Component({
  selector: 'test-rich-cells-list-host',
  imports: [NatList, TestTableSurface],
  template: `
    <ng-template #throughputTemplate let-context>
      <em class="test-template-cell">Throughput: {{ context.getValue() }}</em>
    </ng-template>

    <nat-table-surface>
      <nat-list [columns]="richColumns()" [data]="rows()" accessibleName="Rich cells list" />
    </nat-table-surface>
  `
})
class RichCellsListHost {
  public readonly rows = signal<Row[]>(buildRows(1));

  private readonly throughputTemplate = viewChild<TemplateRef<unknown>>('throughputTemplate');

  public readonly richColumns = computed<ColumnDef<Row, unknown>[]>(() => [
    { accessorKey: 'name', header: 'Service', meta: { label: 'Service' }, cell: (info): string => info.getValue<string>() },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' },
      cell: (info): FlexRenderComponent<TestListBadge> =>
        flexRenderComponent(TestListBadge, { inputs: { value: info.getValue<string>() } })
    },
    {
      accessorKey: 'throughput',
      header: 'Throughput',
      meta: { label: 'Throughput' },
      cell: (): TemplateRef<unknown> | string => this.throughputTemplate() ?? ''
    },
    {
      // No meta.label and a non-string header def: the list renders the
      // header component as the field label.
      accessorKey: 'region',
      header: (): FlexRenderComponent<TestListBadge> => flexRenderComponent(TestListBadge, { inputs: { value: 'Region badge' } }),
      cell: (info): string => info.getValue<string>()
    },
    {
      // hiddenHeaderLabel keeps the field label screen-reader-only, removing
      // the visible label from the list item.
      accessorKey: 'id',
      header: 'Id',
      meta: { hiddenHeaderLabel: 'Row id' },
      cell: (info): string => info.getValue<string>()
    }
  ]);
}

const queryAll = <T extends HTMLElement>(fixture: ComponentFixture<ListHost>, selector: string): T[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(selector));

const itemFieldLabels = (item: HTMLElement): string[] =>
  Array.from(item.querySelectorAll('.list-field-label')).map((label) => label.textContent.trim());

const itemFieldValue = (item: HTMLElement, columnId: string): string =>
  item.querySelector(`[data-column-id="${columnId}"] .list-field-value`)?.textContent.trim() ?? '';

describe('FEATURE: NatList (spike: list renderer on the shared table engine)', () => {
  let fixture: ComponentFixture<ListHost>;
  let host: ListHost;

  const getList = (): NatList<Row> => fixture.debugElement.query(By.directive(NatList)).componentInstance as NatList<Row>;

  const render = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListHost);
    host = fixture.componentInstance;
  });

  describe('GIVEN: a list rendered inside a table surface', () => {
    describe('WHEN: the list is rendered with default state', () => {
      it('THEN: it renders one list item per row with fields in visible column order', async () => {
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(items).toHaveLength(6);
        expect(itemFieldLabels(items[0])).toStrictEqual(['Service', 'Region', 'Status', 'Throughput']);
        expect(itemFieldValue(items[0], 'name')).toBe('Alpha');
      });

      it('THEN: it exposes named grid areas so consumers can lay out item fields', async () => {
        await render();

        const listHost = queryAll(fixture, 'nat-list')[0];
        const firstItem = queryAll(fixture, '[data-testid="nat-list-item"]')[0];
        const firstField = firstItem.querySelector<HTMLElement>('.list-field');

        expect(listHost.style.getPropertyValue('--sys-nat-table-list-item-areas')).toBe("'name' 'region' 'status' 'throughput'");
        expect(firstField?.style.getPropertyValue('grid-area')).toBe('name');
      });

      it('THEN: it registers itself as the surface controller for companion controls', async () => {
        await render();

        const service = fixture.debugElement.query(By.directive(TestTableSurface)).injector.get(NatTableService);

        expect(service.controller()).toBe(getList());
      });
    });

    describe('WHEN: sorting state is applied through the controller', () => {
      it('THEN: it re-renders the items in sorted order', async () => {
        await render();

        getList().patchState({ sorting: [{ id: 'name', desc: true }] });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(itemFieldValue(items[0], 'name')).toBe('Zeta');
        expect(itemFieldValue(items.at(-1) as HTMLElement, 'name')).toBe('Alpha');
      });
    });

    describe('WHEN: column order state changes', () => {
      it('THEN: it reorders the fields inside every list item', async () => {
        await render();

        getList().patchState({ columnOrder: ['status', 'name', 'throughput', 'region'] });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(itemFieldLabels(items[0])).toStrictEqual(['Status', 'Service', 'Throughput', 'Region']);
      });
    });

    describe('WHEN: a column is hidden via column visibility state', () => {
      it('THEN: it removes that field from every list item', async () => {
        await render();

        getList().patchState({ columnVisibility: { region: false } });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(itemFieldLabels(items[0])).toStrictEqual(['Service', 'Status', 'Throughput']);
      });
    });

    describe('WHEN: sorting is seeded from the surface initial state', () => {
      it('THEN: it renders the items pre-sorted', async () => {
        host.initialState.set({ sorting: [{ id: 'name', desc: true }] });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(itemFieldValue(items[0], 'name')).toBe('Zeta');
      });
    });
  });

  describe('GIVEN: a list with data lifecycle states', () => {
    describe('WHEN: the data status is loading with no rows', () => {
      it('THEN: it renders the loading state item and marks the list busy', async () => {
        host.rows.set([]);
        host.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
        await render();

        const loadingItem = queryAll(fixture, '[data-testid="nat-list-loading-state"]');
        const list = queryAll(fixture, '[data-testid="nat-list"]')[0];

        expect(loadingItem).toHaveLength(1);
        expect(list.getAttribute('aria-busy')).toBe('true');
      });
    });

    describe('WHEN: the data status is error', () => {
      it('THEN: it renders the error state item instead of rows', async () => {
        host.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        await render();

        expect(queryAll(fixture, '[data-testid="nat-list-error-state"]')).toHaveLength(1);
        expect(queryAll(fixture, '[data-testid="nat-list-item"]')).toHaveLength(0);
      });
    });

    describe('WHEN: the data is empty with success status', () => {
      it('THEN: it renders the empty state item', async () => {
        host.rows.set([]);
        await render();

        expect(queryAll(fixture, '[data-testid="nat-list-empty-state"]')).toHaveLength(1);
      });
    });

    describe('WHEN: each state is rendered', () => {
      it('THEN: it shares one base class and adds a per-state modifier and indicator', async () => {
        host.rows.set([]);
        await render();

        const emptyState = queryAll(fixture, '[data-testid="nat-list-empty-state"]')[0];

        expect(emptyState.classList.contains('list-state')).toBe(true);
        expect(emptyState.classList.contains('list-state-empty')).toBe(true);
        expect(emptyState.getAttribute('data-state')).toBe('empty');
        expect(emptyState.querySelector('.list-state-indicator')?.getAttribute('aria-hidden')).toBe('true');
        expect(emptyState.querySelector('.list-state-message')?.textContent.trim()).toBe(emptyState.textContent.trim());

        host.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        await render();

        const errorState = queryAll(fixture, '[data-testid="nat-list-error-state"]')[0];

        expect(errorState.classList.contains('list-state')).toBe(true);
        expect(errorState.classList.contains('list-state-error')).toBe(true);
        expect(errorState.getAttribute('data-state')).toBe('error');
      });
    });
  });

  describe('GIVEN: a list with row selection enabled', () => {
    describe('WHEN: a row is selected through the shared state', () => {
      it('THEN: it marks the item selected without putting aria-selected on the listitem', async () => {
        host.enableRowSelection.set(true);
        await render();

        const firstRowId = getList().table.getRowModel().rows[0].id;

        getList().patchState({ rowSelection: { [firstRowId]: true } });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(items[0].getAttribute('data-selected')).toBe('true');
        expect(items[1].getAttribute('data-selected')).toBe('false');
        expect(items[0].hasAttribute('aria-selected')).toBe(false);
      });
    });

    describe('WHEN: selection is disabled', () => {
      it('THEN: it omits the selected marker entirely', async () => {
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(items[0].hasAttribute('data-selected')).toBe(false);
      });
    });

    describe('WHEN: selection mode is single', () => {
      it('THEN: it keeps at most one row selected', async () => {
        host.enableRowSelection.set(true);
        host.selectionMode.set('single');
        await render();

        const rows = getList().table.getRowModel().rows;

        getList().patchState({ rowSelection: { [rows[0].id]: true, [rows[1].id]: true } });
        await render();

        const selectedItems = queryAll(fixture, '[data-testid="nat-list-item"][data-selected="true"]');

        expect(selectedItems).toHaveLength(1);
      });
    });
  });

  describe('GIVEN: a list whose columns use text, component, and template render defs', () => {
    describe('WHEN: the list is rendered', () => {
      let richFixture: ComponentFixture<RichCellsListHost>;

      const richRender = async (): Promise<void> => {
        richFixture.detectChanges();
        await richFixture.whenStable();
        richFixture.detectChanges();
        await richFixture.whenStable();
      };

      beforeEach(() => {
        richFixture = TestBed.createComponent(RichCellsListHost);
      });

      it('THEN: it renders text, component, and template cells through flexRender', async () => {
        await richRender();

        const item = (richFixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="nat-list-item"]');
        const badge = item?.querySelector('[data-column-id="status"] .test-badge');
        const templateCell = item?.querySelector('[data-column-id="throughput"] .test-template-cell');

        expect(itemFieldValue(item as HTMLElement, 'name')).toBe('Alpha');
        expect(badge?.textContent.trim()).toBe('Healthy');
        expect(templateCell?.textContent.trim()).toBe('Throughput: 1000');
      });

      it('THEN: it renders a non-string header def as the field label', async () => {
        await richRender();

        const item = (richFixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="nat-list-item"]');
        const labelBadge = item?.querySelector('[data-column-id="region"] .list-field-label .test-badge');

        expect(labelBadge?.textContent.trim()).toBe('Region badge');
      });

      it('THEN: it renders a hiddenHeaderLabel field label as screen-reader-only text', async () => {
        await richRender();

        const item = (richFixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="nat-list-item"]');
        const label = item?.querySelector('[data-column-id="id"] .list-field-label');

        expect(label?.classList.contains('sr-only')).toBe(true);
        expect(label?.textContent.trim()).toBe('Row id');
        expect(itemFieldValue(item as HTMLElement, 'id')).toBe('svc-00001');
      });
    });
  });
});
