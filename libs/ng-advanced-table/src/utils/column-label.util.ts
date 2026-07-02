import type { Column, ColumnDef, Header, HeaderGroup, RowData } from '@tanstack/angular-table';

export const normalizeColumnLabel = (label: string | undefined): string | null => {
  const normalized = label?.trim() ?? '';

  return normalized || null;
};

export const resolveColumnLabel = <TData extends RowData>(column: Column<TData, unknown>): string => {
  const hiddenHeaderLabel = normalizeColumnLabel(column.columnDef.meta?.hiddenHeaderLabel);

  if (hiddenHeaderLabel) {
    return hiddenHeaderLabel;
  }

  const metaLabel = normalizeColumnLabel(column.columnDef.meta?.label);

  if (metaLabel) {
    return metaLabel;
  }

  if (typeof column.columnDef.header === 'string') {
    const headerLabel = normalizeColumnLabel(column.columnDef.header);

    if (headerLabel) {
      return headerLabel;
    }
  }

  const accessorKey = (column.columnDef as { readonly accessorKey?: unknown }).accessorKey;

  return typeof accessorKey === 'string' ? accessorKey : column.id || 'Column';
};

export const isPrimitiveHeaderContent = <TData extends RowData>(header: ColumnDef<TData, unknown>['header']): boolean => {
  return typeof header === 'string' || typeof header === 'number';
};

/** Leaf column ids of a header row, skipping placeholder headers. */
export const getHeaderRowColumnIds = <TData extends RowData>(headerGroup: HeaderGroup<TData>): string[] =>
  headerGroup.headers.filter((header) => !header.isPlaceholder).map((header) => header.column.id);

/** Whether the primitive header label should be hidden in favour of the screen-reader-only label. */
export const shouldHidePrimitiveHeaderLabel = <TData extends RowData>(
  header: Header<TData, unknown>,
  columnState: { readonly hiddenHeaderLabel: string | null } | undefined
): boolean => !!columnState?.hiddenHeaderLabel && isPrimitiveHeaderContent(header.column.columnDef.header);
