import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  type CellContext,
  type ColumnDef,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePageSize,
  NatTablePager,
  NatTableScrollControl,
  NatTableSearch,
  NatTableSurface,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
}

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800,
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-table-builder',
  imports: [
    NatTable,
    NatTableSurface,
    NatTableSearch,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableScrollControl,
  ],
  templateUrl: './table-builder.html',
  styleUrl: './table-builder.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBuilderPage {
  // Feature Toggles
  readonly withPagination = signal(true);
  readonly withGlobalFilter = signal(true);
  readonly showColumnVisibility = signal(true);
  readonly withColumnPinning = signal(true);
  readonly withColumnReorder = signal(true);
  readonly showScrollControl = signal(true);
  readonly withStickyHeader = signal(false);

  // Active Code Tab ('html' | 'ts')
  readonly activeTab = signal<'html' | 'ts'>('html');

  // Copy Status Tracker
  readonly copied = signal(false);

  // Table Data
  readonly data = DEMO_DATA;

  // Columns definition
  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`,
    },
  ]);

  // Table State
  readonly tableState = signal<Partial<NatTableState>>({
    columnVisibility: {
      name: true,
      category: true,
      status: true,
      value: true,
    },
    pagination: {
      pageIndex: 0,
      pageSize: 3,
    },
  });

  // Generated HTML code
  readonly generatedHtml = computed(() => {
    let topControls = '';
    if (this.withGlobalFilter() || this.showColumnVisibility()) {
      topControls = '\n  <div class="table-controls-grid">';
      if (this.withGlobalFilter()) {
        topControls +=
          '\n    <nat-table-search [for]="grid" label="Search rows" placeholder="Type here..." />';
      }
      if (this.showColumnVisibility()) {
        topControls += '\n    <nat-table-column-visibility [for]="grid" />';
      }
      topControls += '\n  </div>';
    }

    let paginationControls = '';
    if (this.withPagination()) {
      paginationControls = '\n\n  <div class="table-toolbar">';
      paginationControls += '\n    <div class="table-actions">';
      paginationControls +=
        '\n      <nat-table-page-size [for]="grid" [pageSizeOptions]="[3, 5, 10]" />';
      paginationControls += '\n      <nat-table-pager [for]="grid" />';
      paginationControls += '\n    </div>';
      paginationControls += '\n  </div>';
    }

    let scrollControls = '';
    if (this.showScrollControl()) {
      scrollControls = '\n\n  <nat-table-scroll-control [for]="grid" />';
    }

    let tableAttributes = '\n    #grid="natTable"';
    tableAttributes += '\n    [data]="data"';
    tableAttributes += '\n    [columns]="columns"';
    tableAttributes += '\n    [state]="tableState()"';
    if (this.withPagination()) {
      tableAttributes += '\n    [enablePagination]="true"';
    }
    if (this.withGlobalFilter()) {
      tableAttributes += '\n    [enableGlobalFilter]="true"';
    }
    if (this.withColumnPinning()) {
      tableAttributes += '\n    [enableColumnPinning]="true"';
    }
    if (this.withColumnReorder()) {
      tableAttributes += '\n    [enableColumnReorder]="true"';
    }
    if (this.withStickyHeader()) {
      tableAttributes += '\n    [stickyHeader]="true"';
    }

    return `<nat-table-surface class="table-shell">${topControls}${paginationControls}

  <nat-table${tableAttributes}
    accessibleName="Custom configured table preview"
    (stateChange)="onTableStateChange($event)"
  />${scrollControls}
</nat-table-surface>`;
  });

  // Generated TS code
  readonly generatedTs = computed(() => {
    const imports = ['ChangeDetectionStrategy', 'Component', 'signal'];
    const uiImports = ['NatTableSurface', 'withNatTableHeaderActions'];

    if (this.withGlobalFilter()) uiImports.push('NatTableSearch');
    if (this.showColumnVisibility()) uiImports.push('NatTableColumnVisibility');
    if (this.withPagination()) {
      uiImports.push('NatTablePageSize');
      uiImports.push('NatTablePager');
    }
    if (this.showScrollControl()) uiImports.push('NatTableScrollControl');

    const componentImports = ['NatTable', 'NatTableState'];

    return `import { ${imports.join(', ')} } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';
import { ${componentImports.join(', ')} } from 'ng-advanced-table';
import {
  ${uiImports.join(',\n  ')}
} from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
}

@Component({
  selector: 'app-custom-table',
  imports: [
    NatTable,
    NatTableSurface,${uiImports
      .filter((imp) => imp !== 'NatTableSurface' && imp !== 'withNatTableHeaderActions')
      .map((imp) => `\n    ${imp},`)
      .join('')}
  ],
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTableComponent {
  readonly data: DemoItem[] = [
    { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
    { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  ];

  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    { accessorKey: 'name', header: 'Name', meta: { label: 'Name', rowHeader: true } },
    { accessorKey: 'category', header: 'Category', meta: { label: 'Category' } },
    { accessorKey: 'status', header: 'Status', meta: { label: 'Status' } },
    {
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (ctx) => \`\$\${ctx.getValue<number>().toLocaleString()}\`,
    },
  ]);

  readonly tableState = signal<Partial<NatTableState>>({
    columnVisibility: { name: true, category: true, status: true, value: true },
    pagination: { pageIndex: 0, pageSize: 3 },
  });

  onTableStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }
}`;
  });

  onTableStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }

  onColumnVisibilityChange(columnVisibility: VisibilityState): void {
    this.tableState.update((current) => ({ ...current, columnVisibility }));
  }

  onPaginationChange(pagination: PaginationState): void {
    this.tableState.update((current) => ({ ...current, pagination }));
  }

  setTab(tab: 'html' | 'ts'): void {
    this.activeTab.set(tab);
  }

  copyCode(): void {
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
