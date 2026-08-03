import type { TemplateRef } from '@angular/core';
import { Component, computed, viewChild } from '@angular/core';

import type { ColumnDef, FlexRenderComponent } from 'ng-advanced-table';
import { NatList, flexRenderComponent } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { CustomCellsFieldLabel } from './custom-cells-field-label';
import type { MockOrderRow } from '../../mock-order/mock-order.type';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { OrderStatusBadge } from '../../ui/order-status-badge/order-status-badge';

const mockOrderRows = generateMockOrderRows(6);

const EXAMPLE_CODE = `<!-- The list renders cells through the same *flexRender pipeline as the table. -->
<ng-template #totalTemplate let-context>
  <strong class="total">{{ context.getValue() | currency }}</strong>
</ng-template>

<nat-table-surface>
  <nat-list [columns]="columns()" [data]="rows" accessibleName="Orders" />
</nat-table-surface>

// component.ts — three cell flavors plus a component field label.
private readonly totalTemplate = viewChild<TemplateRef<unknown>>('totalTemplate');

protected readonly columns = computed<ColumnDef<Order, unknown>[]>(() => [
  // 1. Text: return a string (or number) from the cell def.
  { accessorKey: 'customer', header: 'Customer', meta: { label: 'Customer' }, cell: (info) => info.getValue<string>() },

  // 2. Component: flexRenderComponent with typed inputs.
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status' },
    cell: (info) => flexRenderComponent(OrderStatusBadge, { inputs: { status: info.getValue() } })
  },

  // 3. Template: return a TemplateRef; the cell context is the template's $implicit.
  { accessorKey: 'total', header: 'Total', meta: { label: 'Total' }, cell: () => this.totalTemplate() },

  // 4. Component field label: with no meta.label / string header, the list
  //    renders the column's header def as the field label.
  {
    accessorKey: 'channel',
    header: () => flexRenderComponent(FieldLabel, { inputs: { text: 'Channel' } }),
    cell: (info) => info.getValue<string>()
  }
]);`;

/**
 * SPIKE demo: the list renders cells through the same `*flexRender` pipeline as
 * the table — plain text, components, and `ng-template` refs — and renders a
 * column's `header` def as the field label when no static label exists.
 */
@Component({
  selector: 'app-table-to-list-custom-cells',
  imports: [NatList, NatTableSurface],
  templateUrl: './table-to-list-custom-cells.html',
  styleUrl: './table-to-list-custom-cells.css'
})
export class TableToListCustomCells {
  protected readonly rows = mockOrderRows;
  protected readonly getRowId = getMockOrderRowId;
  protected readonly exampleCode = EXAMPLE_CODE;

  private readonly totalTemplate = viewChild<TemplateRef<unknown>>('totalTemplate');

  protected readonly columns = computed<ColumnDef<MockOrderRow, unknown>[]>(() => [
    {
      accessorKey: 'customer',
      header: 'Customer',
      meta: { label: 'Customer' },
      cell: (info): string => info.getValue<string>()
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' },
      cell: (info): FlexRenderComponent<OrderStatusBadge> =>
        flexRenderComponent(OrderStatusBadge, { inputs: { status: info.getValue<MockOrderRow['status']>() } })
    },
    {
      accessorKey: 'total',
      header: 'Total',
      meta: { label: 'Total' },
      cell: (): TemplateRef<unknown> | string => this.totalTemplate() ?? ''
    },
    {
      accessorKey: 'channel',
      header: (): FlexRenderComponent<CustomCellsFieldLabel> =>
        flexRenderComponent(CustomCellsFieldLabel, { inputs: { text: 'Channel' } }),
      cell: (info): string => info.getValue<string>()
    }
  ]);
}
