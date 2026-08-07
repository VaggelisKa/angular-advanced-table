import { Component, signal } from '@angular/core';

import { NatList, NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { LIST_DEMO_COLUMNS, LIST_DEMO_ROWS } from './list-demo-data';
import { DemoToggleGroup } from '../../../ui';
import type { DemoToggleOption } from '../../../ui';

type DemoView = 'table' | 'list';

const RENDERER_OPTIONS: readonly DemoToggleOption<DemoView>[] = [
  { value: 'list', label: 'List' },
  { value: 'table', label: 'Table' }
];

/**
 * Docs demo: one shared state driving either renderer. Sorting is written
 * through the surface state (the list has no header UI), so it survives
 * swapping the renderer.
 */
@Component({
  selector: 'app-list-renderer',
  imports: [NatList, NatTable, NatTableSurface, DemoToggleGroup],
  templateUrl: './list-renderer.html',
  styleUrl: './list-renderer.css'
})
export class ListRenderer {
  protected readonly rows = LIST_DEMO_ROWS;
  protected readonly columns = LIST_DEMO_COLUMNS;
  protected readonly rendererOptions = RENDERER_OPTIONS;

  protected readonly view = signal<DemoView>('list');
  protected readonly state = signal<Partial<NatTableUserState>>({});

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
