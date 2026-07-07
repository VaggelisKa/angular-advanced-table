import type { CellContext, ColumnDef } from 'ng-advanced-table';
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

import type { DemoItem, TableBuilderFlags } from '../common/table-builder.type';

export const buildBuilderColumns = (flags: {
  enableColumnPinActions: boolean;
  enableColumnReorderActions: boolean;
}): ColumnDef<DemoItem, unknown>[] =>
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
      enableColumnPinActions: flags.enableColumnPinActions,
      enableColumnReorderActions: flags.enableColumnReorderActions
    }
  );

export const buildTemplateSource = (flags: TableBuilderFlags): string => {
  let topControls = '';

  if (flags.withGlobalFilter || flags.showColumnVisibility) {
    topControls = '\n  <nat-table-toolbar accessibleName="Table controls">';

    if (flags.withGlobalFilter) {
      topControls += '\n    <app-table-search label="Search rows" placeholder="Type here..." />';
    }

    if (flags.showColumnVisibility) {
      topControls += '\n    <nat-table-column-visibility />';
    }
    topControls += '\n  </nat-table-toolbar>';
  }

  let paginationControls = '';

  if (flags.withPagination) {
    paginationControls = '\n\n  <nat-table-pagination [pageSizeOptions]="[3, 5, 10]" />';
  }

  let scrollControls = '';

  if (flags.showScrollControl) {
    scrollControls = '\n\n  <nat-table-scroll-control />';
  }

  let surfaceAttributes = '';

  if (flags.withStickyHeader) {
    surfaceAttributes = ' [stickyHeader]="true"';
  }

  if (flags.withColumnReorder) {
    surfaceAttributes += ' [enableReordering]="true"';
  }

  let tableAttributes = '';

  tableAttributes += '\n    [data]="data"';
  tableAttributes += '\n    [columns]="columns"';

  return `<nat-table-surface [(state)]="tableState"${surfaceAttributes}>${topControls}${paginationControls}
 
   <nat-table${tableAttributes}
     accessibleName="Custom configured table preview"
   />${scrollControls}
 </nat-table-surface>`;
};
