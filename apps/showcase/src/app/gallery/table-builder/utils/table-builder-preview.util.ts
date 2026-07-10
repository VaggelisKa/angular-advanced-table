import type { CellContext, ColumnDef } from 'ng-advanced-table';
import { withNatTableHeaderActions, withNatTableSelectionColumn } from 'ng-advanced-table/components';

import { DEMO_COLUMN_INTL } from '../common/table-builder-locale.const';
import type { DemoItem, LocalePreview, TableBuilderFlags } from '../common/table-builder.type';

type BuilderColumnFlags = {
  enableColumnPinActions: boolean;
  enableColumnReorderActions: boolean;
  enableColumnResizing: boolean;
  enableRowSelection: boolean;
};

// Per-column size props, composed in that order — the single source both
// the live preview and the generated `buildColumns` string mirror. Pinning,
// resizing, and sorting are surface-level opt-out defaults now, so no
// per-column `true` flag is emitted for them here.
const buildColumnFeatureProps = (size: number, flags: BuilderColumnFlags): Partial<ColumnDef<DemoItem, unknown>> => ({
  // Resizing needs an explicit start width to drag from, so seed `size` for
  // resizing too — not just pinning (otherwise there is nothing to resize).
  ...(flags.enableColumnPinActions || flags.enableColumnResizing ? { size } : {})
});

export const buildBuilderColumns = (flags: BuilderColumnFlags, locale: LocalePreview): ColumnDef<DemoItem, unknown>[] => {
  const intl = DEMO_COLUMN_INTL[locale];
  // Reordering is surface-level opt-out now: columns are reorderable by default when
  // the surface enables reordering, so no per-column `meta.reorderable` is needed.
  const baseColumns: ColumnDef<DemoItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: intl.headers.name,
      ...buildColumnFeatureProps(150, flags),
      meta: { label: intl.headers.name, rowHeader: true }
    },
    {
      accessorKey: 'category',
      header: intl.headers.category,
      ...buildColumnFeatureProps(150, flags),
      meta: { label: intl.headers.category }
    },
    {
      accessorKey: 'status',
      header: intl.headers.status,
      ...buildColumnFeatureProps(120, flags),
      meta: { label: intl.headers.status }
    },
    {
      accessorKey: 'value',
      header: intl.headers.value,
      ...buildColumnFeatureProps(150, flags),
      // Resizing is enabled globally and on by default, so the last column must opt
      // OUT explicitly. Non-resizable = the fill sink that absorbs surplus width
      // instead of letting the table overflow the region.
      ...(flags.enableColumnResizing ? { enableResizing: false } : {}),
      meta: { label: intl.headers.value, align: 'end' },
      cell: (context: CellContext<DemoItem, number>): string => `$${context.getValue().toLocaleString()}`
    }
  ];

  const columns = flags.enableRowSelection
    ? withNatTableSelectionColumn(baseColumns, {
        // No explicit `label`: the selection header inherits `selection.columnLabel`
        // from the active surface locale (Markering in Danish).
        selectAllAriaLabel: intl.selectAllAriaLabel,
        selectRowAriaLabel: (row) => intl.selectRowAriaLabel(row.original.name)
      })
    : baseColumns;

  return withNatTableHeaderActions(columns, {
    enableColumnPinActions: flags.enableColumnPinActions,
    enableColumnReorderActions: flags.enableColumnReorderActions
  });
};

/** Maps the builder feature flags to the column-builder flag shape. */
export const toBuilderColumnFlags = (flags: TableBuilderFlags): BuilderColumnFlags => ({
  enableColumnPinActions: flags.withColumnPinning,
  enableColumnReorderActions: flags.withColumnReorder,
  enableColumnResizing: flags.withColumnResizing,
  enableRowSelection: flags.withRowSelection
});

const buildToolbarLines = (flags: TableBuilderFlags): string[] => {
  if (!(flags.withGlobalFilter || flags.showColumnVisibility || flags.withExport)) {
    return [];
  }

  const lines = ['  <nat-table-toolbar accessibleName="Table controls">'];

  if (flags.withGlobalFilter) {
    lines.push(
      flags.withLocalization
        ? '    <app-table-search showLabel toolbar />'
        : '    <app-table-search label="Search rows" placeholder="Type here..." showLabel toolbar />'
    );
  }

  if (flags.withExport) {
    lines.push('    <button natTableExport exportFileName="table-export" natToolbarItem type="button">Export</button>');
  }

  if (flags.showColumnVisibility) {
    lines.push('    <nat-table-column-visibility natToolbarItemPosition="end" />');
  }

  lines.push('  </nat-table-toolbar>', '');

  return lines;
};

const buildTableLines = (flags: TableBuilderFlags): string[] => {
  const lines = ['  <nat-table'];

  lines.push('    [columns]="columns"', '    [data]="data"');

  if (flags.withDataStates) {
    lines.push('    [dataStatus]="dataStatus()"');
  }

  if (flags.withRowSelection) {
    lines.push('    [enableRowSelection]="true"');
  }

  lines.push('    accessibleName="Custom configured table preview"');

  if (!flags.withDataStates) {
    lines.push('  />');

    return lines;
  }

  lines.push(
    '  >',
    '    <ng-template natTableLoading><div class="state-template">Loading rows...</div></ng-template>',
    '    <ng-template natTableEmpty><div class="state-template">No rows to display.</div></ng-template>',
    '    <ng-template let-error natTableError><div class="state-template">Failed to load rows.</div></ng-template>',
    '  </nat-table>'
  );

  return lines;
};

export const buildTemplateSource = (flags: TableBuilderFlags): string => {
  const lines: string[] = [];

  let surfaceAttributes = '';

  if (flags.withStickyHeader) {
    surfaceAttributes += ' [stickyHeader]="true"';
  }

  // Sorting, pinning, reordering, and resizing are surface-level enablers that default
  // OFF now, so emit the positive `="true"` binding only when the feature is on and
  // nothing when it is off — the default already covers the off case.
  if (flags.withSorting) {
    surfaceAttributes += ' [enableSorting]="true"';
  }

  if (flags.withColumnPinning) {
    surfaceAttributes += ' [enablePinning]="true"';
  }

  if (flags.withColumnReorder) {
    surfaceAttributes += ' [enableReordering]="true"';
  }

  if (flags.withColumnResizing) {
    surfaceAttributes += ' [enableColumnResizing]="true"';
    surfaceAttributes += ` [columnSizingMode]="'fill'"`;
  }

  if (flags.withLocalization) {
    surfaceAttributes += ` [locale]="'da'"`;
  }

  lines.push(`<nat-table-surface [(state)]="tableState"${surfaceAttributes}>`);
  lines.push(...buildToolbarLines(flags));

  if (flags.withPagination) {
    lines.push('  <nat-table-pagination [pageSizeOptions]="[3, 5, 10]" />');
    lines.push('');
  }

  lines.push(...buildTableLines(flags));

  if (flags.showScrollControl) {
    lines.push('  <nat-table-scroll-control />');
  }

  lines.push('</nat-table-surface>');

  return lines.join('\n');
};
