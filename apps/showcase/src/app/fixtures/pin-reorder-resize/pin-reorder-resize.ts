import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

type FixtureItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
  readonly region: string;
  readonly owner: string;
  readonly updated: string;
};

const FIXTURE_DATA: FixtureItem[] = [
  {
    id: 'item-1',
    name: 'Alpha Searcher',
    category: 'Analytics',
    status: 'Active',
    value: 4500,
    region: 'EMEA',
    owner: 'Rae',
    updated: '2026-01-04'
  },
  {
    id: 'item-2',
    name: 'Beta Runner',
    category: 'Infrastructure',
    status: 'Active',
    value: 1200,
    region: 'APAC',
    owner: 'Ivo',
    updated: '2026-01-05'
  },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800,
    region: 'AMER',
    owner: 'Sena',
    updated: '2026-01-06'
  },
  {
    id: 'item-4',
    name: 'Delta Watcher',
    category: 'Security',
    status: 'Alert',
    value: 3100,
    region: 'EMEA',
    owner: 'Tom',
    updated: '2026-01-07'
  },
  {
    id: 'item-5',
    name: 'Epsilon Shield',
    category: 'Security',
    status: 'Active',
    value: 9200,
    region: 'APAC',
    owner: 'Uma',
    updated: '2026-01-08'
  },
  {
    id: 'item-6',
    name: 'Zeta Pipeline',
    category: 'Data Science',
    status: 'Halted',
    value: 500,
    region: 'AMER',
    owner: 'Wei',
    updated: '2026-01-09'
  }
];

/**
 * Isolated e2e fixture for the pin + reorder + resize interaction (issue #273).
 *
 * Uses `fixed` sizing so column widths are authoritative and the region scrolls
 * horizontally, letting the specs assert pixel-exact resize targeting and sticky
 * pinned offsets after reordering. Intentionally not a docs example: it combines
 * three surface enablers plus a narrow viewport that would muddy the pinning demo.
 */
@Component({
  selector: 'app-pin-reorder-resize',
  imports: [NatTable, NatTableSurface],
  styles: '.fixture-frame { max-width: 640px; }',
  template: `
    <div class="fixture-frame">
      <nat-table-surface
        [enableColumnResizing]="true"
        [enablePinning]="true"
        [enableReordering]="true"
        [enableSorting]="true"
        [(state)]="tableState"
        columnSizingMode="fixed">
        <nat-table [columns]="columns" [data]="data" accessibleName="Pin reorder resize fixture table" />
      </nat-table-surface>
    </div>
  `
})
export class PinReorderResizeFixture {
  protected readonly data = FIXTURE_DATA;

  protected readonly columns: ColumnDef<FixtureItem, unknown>[] = [
    { accessorKey: 'name', header: 'Name', size: 150, meta: { label: 'Name', rowHeader: true } },
    { accessorKey: 'category', header: 'Category', size: 150, meta: { label: 'Category' } },
    { accessorKey: 'status', header: 'Status', size: 130, meta: { label: 'Status' } },
    {
      accessorKey: 'value',
      header: 'Value',
      size: 140,
      meta: { label: 'Value', align: 'end' },
      cell: (context) => `$${context.getValue<number>().toLocaleString()}`
    },
    { accessorKey: 'region', header: 'Region', size: 130, meta: { label: 'Region' } },
    { accessorKey: 'owner', header: 'Owner', size: 130, meta: { label: 'Owner' } },
    { accessorKey: 'updated', header: 'Updated', size: 150, meta: { label: 'Updated' } }
  ];

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    columnPinning: {
      left: ['name', 'category'],
      right: []
    }
  });
}
