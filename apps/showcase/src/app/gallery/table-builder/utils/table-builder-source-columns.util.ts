import { DEMO_COLUMN_INTL } from '../common/table-builder-locale.const';
import type { TableBuilderFlags } from '../common/table-builder.type';

const collectColumnProps = (size: number, flags: TableBuilderFlags, resizingValue: 'true' | 'false' = 'true'): string[] => {
  const props: string[] = [];

  if (flags.withColumnPinning || flags.withColumnResizing) {
    props.push(`size: ${size}`);
  }

  if (flags.withColumnPinning) {
    props.push('enablePinning: true');
  }

  if (flags.withColumnResizing) {
    // Emit the flag explicitly: the table enables resizing globally, so an omitted
    // value inherits resizable. The trailing column passes 'false' to opt out.
    props.push(`enableResizing: ${resizingValue}`);
  }

  if (!flags.withSorting) {
    props.push('enableSorting: false');
  }

  return props;
};

const buildColumnProps = (size: number, flags: TableBuilderFlags): string => {
  const props = collectColumnProps(size, flags);

  return props.length ? `${props.join(', ')}, ` : '';
};

// Used only for the trailing column, which opts out of resizing so it stays the fill sink.
const buildColumnPropsBlock = (size: number, flags: TableBuilderFlags): string => {
  const props = collectColumnProps(size, flags, 'false');

  return props.length ? `${props.map((prop) => `${prop},`).join('\n      ')}\n      ` : '';
};

// The selection wrapper options for the generated snippet. When localization is
// on, the column label is omitted so it inherits `selection.columnLabel` from the
// provider (Markering), and the aria copy ships in Danish.
const buildSelectionOptions = (flags: TableBuilderFlags): string =>
  flags.withLocalization
    ? `, {
    selectAllAriaLabel: 'Vælg alle rækker',
    selectRowAriaLabel: (row) => \`Vælg \${row.original.name}\`,
  })`
    : `, {
    label: 'Selection',
    selectAllAriaLabel: 'Select all rows',
    selectRowAriaLabel: (row) => \`Select \${row.original.name}\`,
  })`;

// Generates the `readonly columns = withNatTableHeaderActions(...)` block for the
// generated component, composing the selection wrapper. Column headers are the
// app's own data, so they ship in the demo language (Danish when localization is on).
export const buildColumns = (flags: TableBuilderFlags, headerOptions: string): string => {
  const selectionOpen = flags.withRowSelection ? 'withNatTableSelectionColumn(' : '';
  const selectionClose = flags.withRowSelection ? buildSelectionOptions(flags) : '';
  const headers = DEMO_COLUMN_INTL[flags.withLocalization ? 'da' : 'en'].headers;
  // Reordering is per-column opt-in: append `reorderable: true` to every meta so the
  // reorder-enabled surface actually has movable columns.
  const reorderMeta = flags.withColumnReorder ? ', reorderable: true' : '';

  return `  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions(${selectionOpen}[
    { accessorKey: 'name', header: '${headers.name}', ${buildColumnProps(150, flags)}meta: { label: '${headers.name}', rowHeader: true${reorderMeta} } },
    { accessorKey: 'category', header: '${headers.category}', ${buildColumnProps(150, flags)}meta: { label: '${headers.category}'${reorderMeta} } },
    { accessorKey: 'status', header: '${headers.status}', ${buildColumnProps(120, flags)}meta: { label: '${headers.status}'${reorderMeta} } },
    {
      accessorKey: 'value',
      header: '${headers.value}',
      ${buildColumnPropsBlock(150, flags)}meta: { label: '${headers.value}', align: 'end'${reorderMeta} },
      cell: (context: CellContext<DemoItem, number>) => \`$\${context.getValue().toLocaleString()}\`,
    },
  ]${selectionClose}${headerOptions});`;
};
