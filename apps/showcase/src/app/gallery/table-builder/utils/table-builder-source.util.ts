import { buildColumns } from './table-builder-source-columns.util';
import { buildLocaleSourceFragments } from './table-builder-source-locale.util';
import type { TableBuilderFlags } from '../common/table-builder.type';

const buildUiImports = (flags: TableBuilderFlags): string[] => {
  const uiImports = ['NatTableSurface', 'withNatTableHeaderActions'];

  if (flags.withGlobalFilter || flags.showColumnVisibility || flags.withExport) {
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

  if (flags.withExport) {
    uiImports.push('NatTableExport', 'NatToolbarItem');
  }

  if (flags.withRowSelection) {
    uiImports.push('withNatTableSelectionColumn');
  }

  return uiImports;
};

const buildSourceHeader = (uiImports: string[], extraImports: string, flags: TableBuilderFlags): string => {
  const coreValues = flags.withDataStates
    ? 'NatTable, NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate'
    : 'NatTable';
  const coreTypes = flags.withDataStates
    ? 'CellContext, ColumnDef, NatTableDataStatus, NatTableUserState'
    : 'CellContext, ColumnDef, NatTableUserState';
  const coreImport = `import { Component, signal } from '@angular/core';`;
  const stateImports = flags.withDataStates
    ? '\n    NatTableEmptyTemplate,\n    NatTableErrorTemplate,\n    NatTableLoadingTemplate,'
    : '';
  const { localeImport, localeConst, providersLine } = buildLocaleSourceFragments(flags);

  return `${coreImport}
import { ${coreValues} } from 'ng-advanced-table';
import type { ${coreTypes} } from 'ng-advanced-table';
import {
  ${uiImports.join(',\n  ')}
} from 'ng-advanced-table/components';${localeImport}

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

${localeConst}@Component({
  selector: 'app-custom-table',
  imports: [
    NatTable,
    NatTableSurface,${extraImports}${stateImports}
  ],${providersLine}
  templateUrl: './custom-table.html',
})`;
};

const buildExtraFields = (flags: TableBuilderFlags): string => {
  const fields: string[] = [];

  if (flags.withDataStates) {
    fields.push(`  readonly dataStatus = signal<NatTableDataStatus>('success');`);
  }

  return fields.length ? `${fields.join('\n')}\n` : '';
};

const buildSourceBody = (columnsBlock: string, formattedState: string, extraFields: string): string =>
  `export class CustomTableComponent {
  readonly data: DemoItem[] = [
    { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
    { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
    { id: 'item-3', name: 'Gamma Processor', category: 'Data Science', status: 'Paused', value: 7800 },
    { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
    { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
    { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
  ];
${extraFields}
${columnsBlock}

  readonly tableState = signal<Partial<NatTableUserState>>(${formattedState});
}`;

export const buildComponentSource = (flags: TableBuilderFlags, formattedState: string): string => {
  const uiImports = buildUiImports(flags);
  const extraImports = uiImports
    // Only Angular declarables belong in `@Component({ imports })`; exclude the
    // already-listed surface and every `with*` column helper (they are functions
    // used in the columns field, not directives).
    .filter((imp) => imp !== 'NatTableSurface' && !imp.startsWith('with'))
    .map((imp) => `\n    ${imp},`)
    .join('');
  // Sorting and pinning are surface-driven now, so the helper needs no options for them.
  // The reorder menu is the exception: `enableColumnReorderActions` defaults to false, so
  // opt it in explicitly when reordering is on to expose the move-left/move-right menu items.
  const headerOptions = flags.withColumnReorder
    ? `, {
    enableColumnReorderActions: true,
  }`
    : '';
  const columnsBlock = buildColumns(flags, headerOptions);

  return `${buildSourceHeader(uiImports, extraImports, flags)}
${buildSourceBody(columnsBlock, formattedState, buildExtraFields(flags))}`;
};
