import type { NatTableUserState } from 'ng-advanced-table';

export type TableBuilderFlags = {
  readonly withPagination: boolean;
  readonly withGlobalFilter: boolean;
  readonly showColumnVisibility: boolean;
  readonly withColumnPinning: boolean;
  readonly withColumnReorder: boolean;
  readonly showScrollControl: boolean;
  readonly withStickyHeader: boolean;
};

const DEFAULT_COLUMN_VISIBILITY = {
  name: true,
  category: true,
  status: true,
  value: true
} as const;

const buildUiImports = (flags: TableBuilderFlags): string[] => {
  const uiImports = ['NatTableSurface', 'withNatTableHeaderActions'];

  if (flags.withGlobalFilter || flags.showColumnVisibility) {
    uiImports.push('NatTableToolbar');
  }

  // app-table-search is a user-defined component, not a library import.
  if (flags.showColumnVisibility) {
    uiImports.push('NatTableColumnVisibility');
  }

  if (flags.withPagination) {
    uiImports.push('NatTablePagination');
  }

  if (flags.showScrollControl) {
    uiImports.push('NatTableScrollControl');
  }

  return uiImports;
};

export const buildStateObject = (flags: TableBuilderFlags, currentState: Partial<NatTableUserState>): Partial<NatTableUserState> => ({
  columnVisibility: currentState.columnVisibility ?? { ...DEFAULT_COLUMN_VISIBILITY },
  ...(flags.withPagination ? { pagination: currentState.pagination ?? { pageIndex: 0, pageSize: 3 } } : {}),
  ...(flags.withColumnPinning && currentState.columnPinning ? { columnPinning: currentState.columnPinning } : {}),
  ...(flags.withColumnReorder && currentState.columnOrder ? { columnOrder: currentState.columnOrder } : {})
});

export const formatStateLiteral = (stateObj: Partial<NatTableUserState>): string =>
  JSON.stringify(stateObj, null, 4)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'")
    .split('\n')
    .map((line, index) => (index === 0 ? line : `    ${line}`))
    .join('\n');

export const omitColumnOrder = (state: Partial<NatTableUserState>): Partial<NatTableUserState> => {
  const next = { ...state };

  delete next.columnOrder;

  return next;
};

const buildSourceHeader = (uiImports: string[], extraImports: string): string =>
  `import { Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';
import { NatTable, NatTableUserState } from 'ng-advanced-table';
import {
  ${uiImports.join(',\n  ')}
} from 'ng-advanced-table/components';

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
    NatTableSurface,${extraImports}
  ],
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.css',
})`;

const buildSourceBody = (headerOptions: string, formattedState: string): string =>
  `export class CustomTableComponent {
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
      cell: (ctx) => \`$\${ctx.getValue<number>().toLocaleString()}\`,
    },
  ]${headerOptions});

  readonly tableState = signal<Partial<NatTableUserState>>(${formattedState});

  onTableStateChange(state: NatTableUserState): void {
    this.tableState.set(state);
  }
}`;

export const buildComponentSource = (flags: TableBuilderFlags, formattedState: string): string => {
  const uiImports = buildUiImports(flags);
  const extraImports = uiImports
    .filter((imp) => imp !== 'NatTableSurface' && imp !== 'withNatTableHeaderActions')
    .map((imp) => `\n    ${imp},`)
    .join('');
  const headerOptions =
    flags.withColumnReorder || !flags.withColumnPinning
      ? `, {
    enableColumnPinActions: ${flags.withColumnPinning ? 'true' : 'false'},
    enableColumnReorderActions: ${flags.withColumnReorder ? 'true' : 'false'},
  }`
      : '';

  return `${buildSourceHeader(uiImports, extraImports)}
${buildSourceBody(headerOptions, formattedState)}`;
};
