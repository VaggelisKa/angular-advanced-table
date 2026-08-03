import type { TemplateRef } from '@angular/core';
import { Component, computed, input, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef, FlexRenderComponent } from '@tanstack/angular-table';
import { flexRenderComponent } from '@tanstack/angular-table';

import { NatList } from './list';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatTableEmptyTemplate, NatTableErrorTemplate } from '../ui/table-status-templates.directive';

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

const readErrorCode = (value: unknown): string => (value as { readonly code?: string } | null)?.code ?? '';

@Component({
  selector: 'test-state-templates-list-host',
  imports: [NatList, NatTableEmptyTemplate, NatTableErrorTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list [columns]="columns" [data]="rows()" [dataStatus]="dataStatus()" [error]="error()" accessibleName="Templated list">
        <ng-template natTableEmpty>
          <p data-testid="custom-empty">Nothing here</p>
        </ng-template>
        <ng-template let-templateError natTableError>
          <p data-testid="custom-error">Failed: {{ errorCode(templateError) }}</p>
        </ng-template>
      </nat-list>
    </nat-table-surface>
  `
})
class StateTemplatesListHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
  public readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  public readonly error = signal<unknown>(null);

  public readonly errorCode = readErrorCode;
}

const itemFieldValue = (item: HTMLElement, columnId: string): string =>
  item.querySelector(`[data-column-id="${columnId}"] .list-field-value`)?.textContent.trim() ?? '';

describe('FEATURE: NatList content rendering', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a list whose columns use text, component, and template render defs', () => {
    let richFixture: ComponentFixture<RichCellsListHost>;

    const richRender = async (): Promise<void> => {
      richFixture.detectChanges();
      await richFixture.whenStable();
      richFixture.detectChanges();
      await richFixture.whenStable();
    };

    const firstItem = (): HTMLElement =>
      (richFixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="nat-list-item"]') as HTMLElement;

    beforeEach(() => {
      richFixture = TestBed.createComponent(RichCellsListHost);
    });

    describe('WHEN: the list is rendered', () => {
      it('THEN: it renders text, component, and template cells through flexRender', async () => {
        await richRender();

        const item = firstItem();

        expect(itemFieldValue(item, 'name')).toBe('Alpha');
        expect(item.querySelector('[data-column-id="status"] .test-badge')?.textContent.trim()).toBe('Healthy');
        expect(item.querySelector('[data-column-id="throughput"] .test-template-cell')?.textContent.trim()).toBe('Throughput: 1000');
      });

      it('THEN: it renders a non-string header def as the field label', async () => {
        await richRender();

        const labelBadge = firstItem().querySelector('[data-column-id="region"] .list-field-label .test-badge');

        expect(labelBadge?.textContent.trim()).toBe('Region badge');
      });

      it('THEN: it renders a hiddenHeaderLabel field label as screen-reader-only text', async () => {
        await richRender();

        const item = firstItem();
        const label = item.querySelector('[data-column-id="id"] .list-field-label');

        expect(label?.classList.contains('sr-only')).toBe(true);
        expect(label?.textContent.trim()).toBe('Row id');
        expect(itemFieldValue(item, 'id')).toBe('svc-00001');
      });
    });
  });

  describe('GIVEN: a list with consumer state templates', () => {
    let templateFixture: ComponentFixture<StateTemplatesListHost>;

    const templateRender = async (): Promise<void> => {
      templateFixture.detectChanges();
      await templateFixture.whenStable();
      templateFixture.detectChanges();
      await templateFixture.whenStable();
    };

    beforeEach(() => {
      templateFixture = TestBed.createComponent(StateTemplatesListHost);
    });

    describe('WHEN: an empty template is projected', () => {
      it('THEN: it renders the template inside the shared state shell', async () => {
        templateFixture.componentInstance.rows.set([]);
        await templateRender();

        const stateItem = (templateFixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
          '[data-testid="nat-list-empty-state"]'
        );

        expect(stateItem?.classList.contains('list-state')).toBe(true);
        expect(stateItem?.querySelector('[data-testid="custom-empty"]')?.textContent.trim()).toBe('Nothing here');
        expect(stateItem?.querySelector('.list-state-message')).toBeNull();
      });
    });

    describe('WHEN: an error template is projected with an error payload', () => {
      it('THEN: it passes the consumer error payload to the template', async () => {
        templateFixture.componentInstance.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        templateFixture.componentInstance.error.set({ code: 'E_NET' });
        await templateRender();

        const host = templateFixture.nativeElement as HTMLElement;

        expect(host.querySelector('[data-testid="custom-error"]')?.textContent.trim()).toBe('Failed: E_NET');
      });
    });
  });
});
