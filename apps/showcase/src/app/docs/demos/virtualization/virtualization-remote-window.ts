import { Component, computed, signal } from '@angular/core';

import { NatTable, NatTableRowPlaceholderTemplate } from 'ng-advanced-table';
import type { ColumnDef } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';
import { NatTableVirtualize } from 'ng-advanced-table/virtualization';
import type { NatTableVirtualRangeChange } from 'ng-advanced-table/virtualization';

import type { MockOrderRow } from '../../../mock-order/mock-order.type';
import { currencyFormatter, generateMockOrderRowWindow, integerFormatter } from '../../../mock-order/mock-order.util';
import { DemoFacts, DemoLayout, DemoSection } from '../../../ui';
import type { DemoFact } from '../../../ui';

/** Rows the "server" holds. The table never materializes them; it renders placeholders for the gap. */
const REMOTE_TOTAL = 250_000;
const WINDOW_SIZE = 200;
const FETCH_LATENCY_MS = 300;
/** Mounted rows this close to a loaded-window edge trigger the next window fetch. */
const EDGE_MARGIN = 25;

const getRowId = (row: MockOrderRow): string => row.id;

/** Stands in for a windowed endpoint: deterministic rows for `[offset, offset + WINDOW_SIZE)`. */
const fetchWindow = async (offset: number): Promise<MockOrderRow[]> => {
  await new Promise((resolve) => setTimeout(resolve, FETCH_LATENCY_MS));

  return generateMockOrderRowWindow(offset, Math.min(WINDOW_SIZE, REMOTE_TOTAL - offset));
};

@Component({
  selector: 'app-virtualization-remote-window',
  imports: [DemoFacts, DemoLayout, DemoSection, NatTable, NatTableRowPlaceholderTemplate, NatTableSurface, NatTableVirtualize],
  styles: `
    nat-table-surface {
      --nat-table-height: 24rem;
    }

    .remote-skeleton {
      display: block;
      inline-size: 70%;
      block-size: 0.75rem;
      border-radius: 0.375rem;
      background: rgb(128 128 128 / 20%);
    }
  `,
  template: `
    <app-demo-layout data-testid="virtualization-remote-demo">
      <nat-table-surface [stickyHeader]="true" mode="manual">
        <nat-table
          [columns]="columns"
          [data]="rows()"
          [getRowId]="rowId"
          [natTableVirtualize]="{ rowHeight: 44 }"
          [remoteRowCount]="remoteTotal"
          [rowWindowOffset]="offset()"
          accessibleName="Remotely windowed orders"
          class="sc-demo-table"
          data-testid="virtualization-remote-table"
          (virtualRangeChange)="onRangeChange($event)">
          <ng-template natTableRowPlaceholder>
            <span aria-hidden="true" class="remote-skeleton"></span>
          </ng-template>
        </nat-table>
      </nat-table-surface>

      <app-demo-section demoAside heading="Window state">
        <app-demo-facts [facts]="facts()" live />

        <p class="demo-note">
          The scrollbar spans all {{ remoteTotalText }} rows while the app holds only {{ windowSize }} of them. Drag anywhere — the
          container watches <code>(virtualRangeChange)</code> and fetches the window the reader lands on; unfetched slots render the
          <code>natTableRowPlaceholder</code> template until the window arrives, and the fill never moves the scroll position.
        </p>
      </app-demo-section>
    </app-demo-layout>
  `
})
export class VirtualizationRemoteWindow {
  protected readonly remoteTotal = REMOTE_TOTAL;
  protected readonly remoteTotalText = integerFormatter.format(REMOTE_TOTAL);
  protected readonly windowSize = WINDOW_SIZE;
  protected readonly rowId = getRowId;
  protected readonly rows = signal<MockOrderRow[]>(generateMockOrderRowWindow(0, WINDOW_SIZE));
  protected readonly offset = signal(0);

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
      cell: (info) => integerFormatter.format(info.getValue<number>())
    },
    {
      accessorKey: 'total',
      header: 'Total',
      size: 150,
      meta: { label: 'Total', align: 'end', cellMaxLines: 1 },
      cell: (info) => currencyFormatter.format(info.getValue<number>())
    }
  ];

  private readonly isFetching = signal(false);
  private readonly windowsFetched = signal(0);
  private pendingRange: NatTableVirtualRangeChange | null = null;

  protected readonly facts = computed<DemoFact[]>(() => [
    { label: 'Window offset', value: integerFormatter.format(this.offset()), testId: 'remote-offset' },
    { label: 'Rows loaded', value: integerFormatter.format(this.rows().length), testId: 'remote-loaded' },
    { label: 'Windows fetched', value: String(this.windowsFetched()), testId: 'remote-fetches' },
    { label: 'Status', value: this.isFetching() ? 'Loading window' : 'Idle', testId: 'remote-status' }
  ]);

  protected onRangeChange(range: NatTableVirtualRangeChange): void {
    if (range.count === 0 || this.isWindowCovering(range)) {
      return;
    }

    if (this.isFetching()) {
      // Remember only the latest landing spot; refetch once the in-flight
      // window resolves if the reader is still outside it.
      this.pendingRange = range;

      return;
    }

    this.loadWindowAround(range);
  }

  /** Whether the loaded window covers the mounted range with the edge margin to spare. */
  private isWindowCovering(range: NatTableVirtualRangeChange): boolean {
    const start = this.offset();
    const end = start + this.rows().length;
    const coversStart = range.startIndex >= start + (start > 0 ? EDGE_MARGIN : 0);
    const coversEnd = range.endIndex < end - (end < REMOTE_TOTAL ? EDGE_MARGIN : 0);

    return coversStart && coversEnd;
  }

  private loadWindowAround(range: NatTableVirtualRangeChange): void {
    const center = Math.floor((range.startIndex + range.endIndex) / 2);
    const offset = Math.max(0, Math.min(center - Math.floor(WINDOW_SIZE / 2), REMOTE_TOTAL - WINDOW_SIZE));

    this.isFetching.set(true);

    void fetchWindow(offset).then((window) => {
      // The old window stays in place until this point, so the reader keeps
      // real rows while the fetch runs; jumping replaces it in one step.
      this.rows.set(window);
      this.offset.set(offset);
      this.windowsFetched.update((count) => count + 1);
      this.isFetching.set(false);

      const pending = this.pendingRange;

      this.pendingRange = null;

      if (pending && !this.isWindowCovering(pending)) {
        this.loadWindowAround(pending);
      }
    });
  }
}
