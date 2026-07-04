import { Component, computed, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePagination,
  NatTableScrollControl,
  NatTableSurface,
  NatTableToolbar
} from 'ng-advanced-table/components';

import { DEMO_DATA } from './common';
import type { DemoItem, TableBuilderFlags } from './common';
import {
  buildBuilderColumns,
  buildComponentSource,
  buildStateObject,
  buildTemplateSource,
  formatStateLiteral,
  omitColumnOrder
} from './utils';
import { TableSearch } from '../../ui/table-search/table-search';

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
  protected readonly data: DemoItem[] = DEMO_DATA;

  // Columns definition
  protected readonly columns = computed<ColumnDef<DemoItem, unknown>[]>(() =>
    buildBuilderColumns({
      enableColumnPinActions: this.withColumnPinning(),
      enableColumnReorderActions: this.withColumnReorder()
    })
  );

  // Table State
  protected readonly tableState = signal<Partial<NatTableUserState>>({
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
  protected readonly generatedHtml = computed(() => buildTemplateSource(this.flags()));

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
