import { Component, signal } from '@angular/core';

import type { NatTableUserState, SortingState } from 'ng-advanced-table';
import { NatTable, NatTableStatic } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { DemoCode } from '../../ui';

const mockOrderRows = generateMockOrderRows(12);

// The row-actions column renders an `ngGridCellWidget` cell component, which
// requires the Aria grid-cell context and cannot render in the static table —
// this demo shares one column set, so it drops that column.
const demoColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

const EXAMPLE_MARKUP = `<!-- Same surface, same state — swap the interaction model. -->
<nat-table-surface [enableSorting]="true" [(state)]="state">
  @if (view() === 'grid') {
    <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
  } @else {
    <nat-table-static [columns]="columns" [data]="rows" accessibleName="Orders" />
  }
</nat-table-surface>`;

const EXAMPLE_TS = `// component.ts — both renderers consume the same engine state, so sorting and
// pinning survive the swap. The static table keeps native table semantics and
// natural tab order; it has no grid keyboard model.
protected readonly view = signal<'grid' | 'static'>('grid');
protected readonly state = signal<Partial<NatTableUserState>>({});

protected pinOrderColumn(): void {
  this.state.update((current) => ({ ...current, columnPinning: { left: ['id'], right: [] } }));
}`;

type DemoViewMode = 'grid' | 'static';

/**
 * Demo: one `nat-table-surface` driving either the ARIA grid table or the
 * static semantic-table renderer. Both consume the same engine state, so
 * sorting and column pinning survive toggling between the two interaction
 * models. The static table has no grid keyboard model — header sort buttons
 * and any in-cell controls sit in the natural tab order instead.
 */
@Component({
  selector: 'app-table-to-static',
  imports: [DemoCode, NatTable, NatTableStatic, NatTableSurface],
  templateUrl: './table-to-static.html',
  styleUrl: './table-to-static.css'
})
export class TableToStatic {
  protected readonly rows = mockOrderRows;
  protected readonly columns = demoColumns;
  protected readonly getRowId = getMockOrderRowId;

  protected readonly view = signal<DemoViewMode>('grid');
  protected readonly state = signal<Partial<NatTableUserState>>({});
  protected readonly exampleMarkup = EXAMPLE_MARKUP;
  protected readonly exampleTs = EXAMPLE_TS;

  protected isSorted(columnId: string, desc: boolean): boolean {
    const sorting = this.state().sorting ?? [];

    return sorting.some((sort) => sort.id === columnId && sort.desc === desc);
  }

  protected sortBy(columnId: string, desc: boolean): void {
    const sorting: SortingState = this.isSorted(columnId, desc) ? [] : [{ id: columnId, desc }];

    this.state.update((current) => ({ ...current, sorting }));
  }

  protected isOrderColumnPinned(): boolean {
    return (this.state().columnPinning?.left ?? []).includes('id');
  }

  protected togglePinOrderColumn(): void {
    const left = this.isOrderColumnPinned() ? [] : ['id'];

    this.state.update((current) => ({ ...current, columnPinning: { left, right: [] } }));
  }
}
