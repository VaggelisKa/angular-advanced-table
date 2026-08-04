import { Component, computed, signal } from '@angular/core';

import type { NatTableDataStatus } from 'ng-advanced-table';
import { NAT_TABLE_DATA_STATUS, NatList } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import type { MockOrderRow } from '../../mock-order/mock-order.type';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { DemoCode } from '../../ui';

const mockOrderRows = generateMockOrderRows(6);

// The row-actions column renders an `ngGridCellWidget` cell, which requires
// the table's Aria grid context and cannot render inside the list view.
const demoColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

const EXAMPLE_MARKUP = `<!-- dataStatus drives the built-in loading, empty, and error list items. -->
<nat-table-surface>
  <nat-list [columns]="columns" [data]="rows()" [dataStatus]="dataStatus()" accessibleName="Orders" />
</nat-table-surface>`;

const EXAMPLE_TS = `// component.ts — the consumer owns fetching, retries, and error handling;
// the list only renders the state you hand it.
protected readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.loading);
protected readonly rows = signal<Order[]>([]);

private async load(): Promise<void> {
  this.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);

  try {
    this.rows.set(await this.api.fetchOrders());
    this.dataStatus.set(NAT_TABLE_DATA_STATUS.success);
  } catch {
    this.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
  }
}`;
const EXAMPLE_CSS = `/* All three states share one base shape, so shared tokens restyle them
   together and each state keeps its own accent. */
nat-list {
  --nat-table-list-state-justify: center;
  --nat-table-list-state-min-height: 8rem;
  --nat-table-list-state-radius: 12px;
  --nat-table-list-state-background: rgb(0 0 0 / 2%);
  --nat-table-list-error-accent: #d14343;
}`;

type DemoDataScenario = 'success' | 'loading' | 'empty' | 'error';

const DEMO_SCENARIOS: readonly { readonly id: DemoDataScenario; readonly label: string }[] = [
  { id: 'success', label: 'Success' },
  { id: 'loading', label: 'Loading' },
  { id: 'empty', label: 'Empty' },
  { id: 'error', label: 'Error' }
];

/**
 * SPIKE demo: `dataStatus` drives the list's built-in loading, empty, and
 * error items exactly as it drives the table's state rows. Data fetching,
 * retry handling, and error classification stay consumer-owned.
 */
@Component({
  selector: 'app-table-to-list-data-states',
  imports: [DemoCode, NatList, NatTableSurface],
  templateUrl: './table-to-list-data-states.html',
  styleUrl: './table-to-list-data-states.css'
})
export class TableToListDataStates {
  protected readonly columns = demoColumns;
  protected readonly getRowId = getMockOrderRowId;
  protected readonly scenarios = DEMO_SCENARIOS;
  protected readonly exampleMarkup = EXAMPLE_MARKUP;
  protected readonly exampleTs = EXAMPLE_TS;
  protected readonly exampleCss = EXAMPLE_CSS;

  protected readonly scenario = signal<DemoDataScenario>('success');

  protected readonly rows = computed<MockOrderRow[]>(() => (this.scenario() === 'success' ? mockOrderRows : []));

  protected readonly dataStatus = computed<NatTableDataStatus>(() => {
    const scenario = this.scenario();

    if (scenario === 'loading') {
      return NAT_TABLE_DATA_STATUS.loading;
    }

    return scenario === 'error' ? NAT_TABLE_DATA_STATUS.error : NAT_TABLE_DATA_STATUS.success;
  });
}
