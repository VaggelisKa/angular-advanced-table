/* eslint-disable max-lines */
import { Component, computed, signal } from '@angular/core';

import type { CellContext, ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePagination,
  NatTableScrollControl,
  NatTableSurface,
  NatTableToolbar,
  withNatTableHeaderActions
} from 'ng-advanced-table/components';

import { buildComponentSource, buildStateObject, formatStateLiteral, omitColumnOrder } from './table-builder.util';
import type { TableBuilderFlags } from './table-builder.util';
import { TableSearch } from '../../components/table-search/table-search';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 }
];

@Component({
  selector: 'app-table-builder',
  imports: [
    NatTable,
    NatTableSurface,
    TableSearch,
    NatTableColumnVisibility,
    NatTablePagination,
    NatTableScrollControl,
    NatTableToolbar
  ],
  templateUrl: './table-builder.html',
  styleUrl: './table-builder.css'
})
export class TableBuilderPage {
  // Feature Toggles
  protected readonly withPagination = signal(true);
  protected readonly withGlobalFilter = signal(true);
  protected readonly showColumnVisibility = signal(true);
  protected readonly withColumnPinning = signal(true);
  protected readonly withColumnReorder = signal(true);
  protected readonly showScrollControl = signal(true);
  protected readonly withStickyHeader = signal(false);

  private readonly flags = computed<TableBuilderFlags>(() => ({
    withPagination: this.withPagination(),
    withGlobalFilter: this.withGlobalFilter(),
    showColumnVisibility: this.showColumnVisibility(),
    withColumnPinning: this.withColumnPinning(),
    withColumnReorder: this.withColumnReorder(),
    showScrollControl: this.showScrollControl(),
    withStickyHeader: this.withStickyHeader()
  }));

  // Active Code Tab ('html' | 'ts')
  protected readonly activeTab = signal<'html' | 'ts'>('html');

  // Copy Status Tracker
  protected readonly copied = signal(false);

  // Table Data
  protected readonly data = DEMO_DATA;

  // Columns definition
  protected readonly columns = computed<ColumnDef<DemoItem, unknown>[]>(() =>
    withNatTableHeaderActions(
      [
        {
          accessorKey: 'name',
          header: 'Name',
          meta: { label: 'Name', rowHeader: true }
        },
        {
          accessorKey: 'category',
          header: 'Category',
          meta: { label: 'Category' }
        },
        {
          accessorKey: 'status',
          header: 'Status',
          meta: { label: 'Status' }
        },
        {
          accessorKey: 'value',
          header: 'Value',
          meta: { label: 'Value', align: 'end' },
          cell: (context: CellContext<DemoItem, number>): string => `$${context.getValue().toLocaleString()}`
        }
      ],
      {
        enableColumnPinActions: this.withColumnPinning(),
        enableColumnReorderActions: this.withColumnReorder()
      }
    )
  );

  // Table State
  protected readonly tableState = signal<Partial<NatTableState>>({
    columnVisibility: {
      name: true,
      category: true,
      status: true,
      value: true
    },
    pagination: {
      pageIndex: 0,
      pageSize: 3
    },
    columnPinning: {
      left: ['name'],
      right: []
    },
    columnOrder: ['name', 'category', 'status', 'value']
  });

  // Generated HTML code
  protected readonly generatedHtml = computed(() => {
    let topControls = '';

    if (this.withGlobalFilter() || this.showColumnVisibility()) {
      topControls = '\n  <nat-table-toolbar accessibleName="Table controls">';

      if (this.withGlobalFilter()) {
        topControls += '\n    <app-table-search label="Search rows" placeholder="Type here..." />';
      }

      if (this.showColumnVisibility()) {
        topControls += '\n    <nat-table-column-visibility />';
      }
      topControls += '\n  </nat-table-toolbar>';
    }

    let paginationControls = '';

    if (this.withPagination()) {
      paginationControls = '\n\n  <nat-table-pagination [pageSizeOptions]="[3, 5, 10]" />';
    }

    let scrollControls = '';

    if (this.showScrollControl()) {
      scrollControls = '\n\n  <nat-table-scroll-control />';
    }

    let surfaceAttributes = '';

    if (this.withStickyHeader()) {
      surfaceAttributes = ' [stickyHeader]="true"';
    }

    let tableAttributes = '';

    tableAttributes += '\n    [data]="data"';
    tableAttributes += '\n    [columns]="columns"';

    return `<nat-table-surface [(state)]="tableState"${surfaceAttributes}>${topControls}${paginationControls}
 
   <nat-table${tableAttributes}
     accessibleName="Custom configured table preview"
   />${scrollControls}
 </nat-table-surface>`;
  });

  // Generated TS code
  protected readonly generatedTs = computed(() =>
    buildComponentSource(this.flags(), formatStateLiteral(buildStateObject(this.flags(), this.tableState())))
  );

  protected toggleColumnPinning(): void {
    const nextValue = !this.withColumnPinning();

    this.withColumnPinning.set(nextValue);

    if (nextValue) {
      this.tableState.update((current) => ({
        ...current,
        columnPinning: { left: ['name'], right: [] }
      }));
    } else {
      this.tableState.update((current) => ({
        ...current,
        columnPinning: { left: [], right: [] }
      }));
    }
  }

  protected toggleColumnReorder(): void {
    const nextValue = !this.withColumnReorder();

    this.withColumnReorder.set(nextValue);

    if (nextValue) {
      this.tableState.update((current) => ({
        ...current,
        columnOrder: ['name', 'category', 'status', 'value']
      }));
    } else {
      this.tableState.update((current) => omitColumnOrder(current));
    }
  }

  protected setTab(tab: 'html' | 'ts'): void {
    this.activeTab.set(tab);
  }

  protected copyCode(): void {
    const code = this.activeTab() === 'html' ? this.generatedHtml() : this.generatedTs();

    navigator.clipboard
      .writeText(code)
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      })
      .catch(() => {
        this.copied.set(false);
      });
  }
}
