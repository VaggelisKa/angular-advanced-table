import { Component, signal } from '@angular/core';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatList, NatTable, NatTableSubHeaderTemplate } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import type { DemoToggleOption } from '../../../ui';
import { DemoToggleGroup } from '../../../ui';
import type { ListDemoOrder } from '../list/list-demo-data';
import { LIST_DEMO_COLUMNS, LIST_DEMO_ROWS } from '../list/list-demo-data';

const STATUS_ORDER: readonly ListDemoOrder['status'][] = ['Ready', 'Review', 'Queued'];

type DemoView = 'table' | 'list';

const RENDERER_OPTIONS: readonly DemoToggleOption<DemoView>[] = [
  { value: 'table', label: 'Table' },
  { value: 'list', label: 'List' }
];

const SUB_HEADER_LAYOUT_OPTIONS: readonly DemoToggleOption<'colspan' | 'cells'>[] = [
  { value: 'colspan', label: 'Colspan' },
  { value: 'cells', label: 'Cells' }
];

/**
 * Docs demo: rows grouped under sub-header rows by status. The forced group
 * sort is hidden, so the user's "Sort by total" stays the visible sort and
 * applies within each group. Both renderers share the same inputs.
 */
@Component({
  selector: 'app-sub-header-rows',
  imports: [NatList, NatTable, NatTableSubHeaderTemplate, NatTableSurface, DemoToggleGroup],
  templateUrl: './sub-header-rows.html',
  styleUrl: './sub-header-rows.css'
})
export class SubHeaderRows {
  // Shared with the list-renderer docs: same rows, same columns, same status
  // badge, so the two topics never drift on formatting.
  protected readonly rows = LIST_DEMO_ROWS;
  protected readonly columns = LIST_DEMO_COLUMNS;
  protected readonly statusOrder = STATUS_ORDER;
  protected readonly rendererOptions = RENDERER_OPTIONS;
  protected readonly subHeaderLayoutOptions = SUB_HEADER_LAYOUT_OPTIONS;

  protected readonly view = signal<DemoView>('table');
  protected readonly subHeaderLayout = signal<'colspan' | 'cells'>('colspan');
  protected readonly useStatusOrder = signal(false);
  protected readonly state = signal<Partial<NatTableUserState>>({
    columnPinning: { left: ['id'], right: ['total'] }
  });

  protected sortDirection(): 'asc' | 'desc' | null {
    const entry = (this.state().sorting ?? []).find((sort) => sort.id === 'total');

    if (!entry) {
      return null;
    }

    return entry.desc ? 'desc' : 'asc';
  }

  protected sortArrow(): string {
    const direction = this.sortDirection();

    if (direction === null) {
      return '↕';
    }

    return direction === 'asc' ? '↑' : '↓';
  }

  protected sortByTotalLabel(): string {
    const direction = this.sortDirection();

    if (direction === null) {
      return 'Sort by total, not sorted';
    }

    return direction === 'asc' ? 'Sort by total, sorted ascending' : 'Sort by total, sorted descending';
  }

  /** Cycle: not sorted → descending → ascending → not sorted. */
  protected cycleSortByTotal(): void {
    const direction = this.sortDirection();
    let sorting: NatTableUserState['sorting'] = [];

    if (direction === null) {
      sorting = [{ id: 'total', desc: true }];
    } else if (direction === 'desc') {
      sorting = [{ id: 'total', desc: false }];
    }

    this.state.update((current) => ({ ...current, sorting }));
  }
}
