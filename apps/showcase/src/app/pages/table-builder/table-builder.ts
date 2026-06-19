import { Component, computed, signal } from '@angular/core';
import {
  type CellContext,
  type ColumnDef,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePagination,
  NatTableScrollControl,
  NatTableSurface,
  NatTableService,
  NatTableToolbar,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';
import { TableSearch } from '../../components/table-search/table-search';

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
    TableSearch,
    NatTableColumnVisibility,
    NatTablePagination,
    NatTableScrollControl,
    NatTableToolbar,
  ],
  templateUrl: './table-builder.html',
  styleUrl: './table-builder.css',
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
  readonly columns = computed<ColumnDef<DemoItem, unknown>[]>(() =>
    withNatTableHeaderActions(
      [
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
          cell: (context: CellContext<DemoItem, number>) =>
            `$${context.getValue().toLocaleString()}`,
        },
      ],
      {
        enableColumnPinActions: this.withColumnPinning(),
        enableColumnReorderActions: this.withColumnReorder(),
      },
    ),
  );

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
    columnPinning: {
      left: ['name'],
      right: [],
    },
    columnOrder: ['name', 'category', 'status', 'value'],
  });

  // Generated HTML code
  readonly generatedHtml = computed(() => {
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
  readonly generatedTs = computed(() => {
    const imports = ['Component', 'signal'];
    const uiImports = ['NatTableSurface', 'withNatTableHeaderActions'];

    if (this.withGlobalFilter() || this.showColumnVisibility()) {
      uiImports.push('NatTableToolbar');
    }
    // app-table-search is a user-defined component, not a library import
    if (this.showColumnVisibility()) uiImports.push('NatTableColumnVisibility');
    if (this.withPagination()) {
      uiImports.push('NatTablePagination');
    }
    if (this.showScrollControl()) uiImports.push('NatTableScrollControl');

    const componentImports = ['NatTable', 'NatTableState'];

    const stateObj: Partial<NatTableState> = {
      columnVisibility: this.tableState().columnVisibility ?? {
        name: true,
        category: true,
        status: true,
        value: true,
      },
    };
    if (this.withPagination()) {
      stateObj.pagination = this.tableState().pagination ?? { pageIndex: 0, pageSize: 3 };
    }
    if (this.withColumnPinning() && this.tableState().columnPinning) {
      stateObj.columnPinning = this.tableState().columnPinning;
    }
    if (this.withColumnReorder() && this.tableState().columnOrder) {
      stateObj.columnOrder = this.tableState().columnOrder;
    }

    const formattedState = JSON.stringify(stateObj, null, 4)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, "'")
      .split('\n')
      .map((line, idx) => (idx === 0 ? line : '    ' + line))
      .join('\n');

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
  ]${
    this.withColumnReorder() || !this.withColumnPinning()
      ? `, {
    enableColumnPinActions: ${this.withColumnPinning() ? 'true' : 'false'},
    enableColumnReorderActions: ${this.withColumnReorder() ? 'true' : 'false'},
  }`
      : ''
  });

  readonly tableState = signal<Partial<NatTableState>>(${formattedState});

  onTableStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }
}`;
  });

  toggleColumnPinning(): void {
    const nextValue = !this.withColumnPinning();
    this.withColumnPinning.set(nextValue);
    if (nextValue) {
      this.tableState.update((current) => ({
        ...current,
        columnPinning: { left: ['name'], right: [] },
      }));
    } else {
      this.tableState.update((current) => ({
        ...current,
        columnPinning: { left: [], right: [] },
      }));
    }
  }

  toggleColumnReorder(): void {
    const nextValue = !this.withColumnReorder();
    this.withColumnReorder.set(nextValue);
    if (nextValue) {
      this.tableState.update((current) => ({
        ...current,
        columnOrder: ['name', 'category', 'status', 'value'],
      }));
    } else {
      this.tableState.update((current) => {
        const { columnOrder, ...rest } = current;
        return rest;
      });
    }
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
