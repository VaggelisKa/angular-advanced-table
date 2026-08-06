import { Component, computed, signal } from '@angular/core';

import type { NatTableDataStatus } from 'ng-advanced-table';
import { NAT_TABLE_DATA_STATUS, NatList } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { LIST_DEMO_COLUMNS, LIST_DEMO_ROWS } from './list-demo-data';
import type { ListDemoOrder } from './list-demo-data';

type DemoDataScenario = 'success' | 'loading' | 'empty' | 'error';

const DEMO_SCENARIOS: readonly { readonly id: DemoDataScenario; readonly label: string }[] = [
  { id: 'success', label: 'Success' },
  { id: 'loading', label: 'Loading' },
  { id: 'empty', label: 'Empty' },
  { id: 'error', label: 'Error' }
];

/**
 * Docs demo: `dataStatus` drives the list's built-in loading, empty, and
 * error items exactly as it drives the table's state rows. Fetching, retry
 * handling, and error classification stay consumer-owned.
 */
@Component({
  selector: 'app-list-data-states',
  imports: [NatList, NatTableSurface],
  templateUrl: './list-data-states.html',
  styleUrl: './list-data-states.css'
})
export class ListDataStates {
  protected readonly columns = LIST_DEMO_COLUMNS;
  protected readonly scenarios = DEMO_SCENARIOS;

  protected readonly scenario = signal<DemoDataScenario>('success');

  protected readonly rows = computed<ListDemoOrder[]>(() => (this.scenario() === 'success' ? LIST_DEMO_ROWS : []));

  protected readonly dataStatus = computed<NatTableDataStatus>(() => {
    const scenario = this.scenario();

    if (scenario === 'loading') {
      return NAT_TABLE_DATA_STATUS.loading;
    }

    return scenario === 'error' ? NAT_TABLE_DATA_STATUS.error : NAT_TABLE_DATA_STATUS.success;
  });
}
