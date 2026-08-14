import { Component, computed, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { CellContext, ColumnDef } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';
import { NatTableVirtualize } from 'ng-advanced-table/virtualization';
import type { NatTableVirtualRangeChange } from 'ng-advanced-table/virtualization';

import type { MockOrderRow } from '../../../mock-order/mock-order.type';
import { currencyFormatter, generateMockOrderRows, integerFormatter } from '../../../mock-order/mock-order.util';
import { DemoFacts } from '../../../ui';
import type { DemoFact } from '../../../ui';

const PAGE_SIZE = 100;
/** Rows still below the mounted window when the next page starts loading. */
const LOOKAHEAD = 25;
const TOTAL_AVAILABLE = 1_000;
const FETCH_LATENCY_MS = 250;

const getRowId = (row: MockOrderRow): string => row.id;

/** Stands in for a paged endpoint: deterministic, and every page extends the last. */
const fetchPage = async (loaded: number): Promise<MockOrderRow[]> => {
  await new Promise((resolve) => setTimeout(resolve, FETCH_LATENCY_MS));

  return generateMockOrderRows(Math.min(loaded + PAGE_SIZE, TOTAL_AVAILABLE));
};

const resolveStatus = (isFetching: boolean, hasEverything: boolean): string => {
  if (isFetching) {
    return 'Loading next page';
  }

  return hasEverything ? 'All rows loaded' : 'Idle';
};

@Component({
  selector: 'app-virtualization-incremental-fetch',
  imports: [DemoFacts, NatTable, NatTableSurface, NatTableVirtualize],
  styles: `
    nat-table-surface {
      --nat-table-height: 24rem;
    }

    .fetch-summary {
      margin: 0 0 0.75rem;
    }
  `,
  template: `
    <div class="card" data-testid="virtualization-fetch-demo">
      <h2 class="card-title">Fetch on approach</h2>
      <p class="description fetch-summary">
        The container watches <code>(virtualRangeChange)</code> and loads the next page once the mounted window comes within
        {{ lookahead }} rows of the data it already has. Each page is appended, so the scroll position and the mounted window survive
        the load.
      </p>

      <app-demo-facts [facts]="facts()" live />

      <nat-table-surface [stickyHeader]="true" columnSizingMode="fixed">
        <nat-table
          [columns]="columns"
          [data]="rows()"
          [getRowId]="rowId"
          [natTableVirtualize]="{ rowHeight: 44 }"
          accessibleName="Incrementally fetched orders"
          data-testid="virtualization-fetch-table"
          (virtualRangeChange)="onRangeChange($event)" />
      </nat-table-surface>
    </div>
  `
})
export class VirtualizationIncrementalFetch {
  protected readonly lookahead = LOOKAHEAD;
  protected readonly rowId = getRowId;
  protected readonly rows = signal<MockOrderRow[]>(generateMockOrderRows(PAGE_SIZE));
  protected readonly pagesLoaded = signal(1);

  protected readonly columns: ColumnDef<MockOrderRow, unknown>[] = [
    {
      accessorKey: 'customer',
      header: 'Customer',
      size: 200,
      meta: { label: 'Customer', rowHeader: true, cellMaxLines: 1 }
    },
    {
      accessorKey: 'region',
      header: 'Region',
      size: 140,
      meta: { label: 'Region', cellMaxLines: 1 }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 130,
      meta: { label: 'Status', cellMaxLines: 1 }
    },
    {
      accessorKey: 'items',
      header: 'Items',
      size: 110,
      meta: { label: 'Items', align: 'end', cellMaxLines: 1 },
      cell: (context: CellContext<MockOrderRow, number>) => integerFormatter.format(context.getValue())
    },
    {
      accessorKey: 'total',
      header: 'Total',
      size: 150,
      meta: { label: 'Total', align: 'end', cellMaxLines: 1 },
      cell: (context: CellContext<MockOrderRow, number>) => currencyFormatter.format(context.getValue())
    }
  ];

  private readonly isFetching = signal(false);
  private readonly hasEverything = computed(() => this.rows().length >= TOTAL_AVAILABLE);

  protected readonly facts = computed<DemoFact[]>(() => [
    { label: 'Rows loaded', value: integerFormatter.format(this.rows().length), testId: 'fetch-loaded' },
    { label: 'Pages fetched', value: String(this.pagesLoaded()), testId: 'fetch-pages' },
    { label: 'Status', value: resolveStatus(this.isFetching(), this.hasEverything()), testId: 'fetch-status' }
  ]);

  protected onRangeChange(range: NatTableVirtualRangeChange): void {
    const loaded = this.rows().length;

    // `endIndex` is an inclusive position in the current row model, so compare
    // it against what is loaded rather than against the source array.
    if (this.isFetching() || this.hasEverything() || range.endIndex < loaded - LOOKAHEAD) {
      return;
    }

    this.isFetching.set(true);

    void fetchPage(loaded).then((page) => {
      this.rows.set(page);
      this.pagesLoaded.update((count) => count + 1);
      this.isFetching.set(false);
    });
  }
}
