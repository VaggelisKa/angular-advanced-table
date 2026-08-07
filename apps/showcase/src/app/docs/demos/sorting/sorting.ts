import { Component, computed, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { DemoAside, DemoFacts, DemoLayout, DemoSection } from '../../../ui';
import type { DemoFact } from '../../../ui';
import { DEMO_ITEMS, demoItemColumns } from '../demo-data';

@Component({
  selector: 'app-sorting',
  imports: [NatTable, NatTableSurface, DemoAside, DemoFacts, DemoLayout, DemoSection],
  templateUrl: './sorting.html',
  styles: `
    :host {
      display: grid;
      gap: 24px;
    }
  `
})
export class Sorting {
  protected readonly data = DEMO_ITEMS;
  protected readonly columns = demoItemColumns;

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    sorting: [{ id: 'name', desc: false }]
  });

  protected readonly sortFacts = computed<DemoFact[]>(() => {
    const sorting = this.tableState().sorting;
    const entry = sorting?.[0];

    return [
      {
        label: 'Current state',
        value: entry ? `${entry.id} (${entry.desc ? 'desc' : 'asc'})` : 'None'
      }
    ];
  });

  protected sortBy(id: string, dir: 'asc' | 'desc'): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [{ id, desc: dir === 'desc' }]
    }));
  }

  protected clearSort(): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: []
    }));
  }

  protected readonly multiSortState = signal<Partial<NatTableUserState>>({
    sorting: []
  });

  protected readonly multiSortFacts = computed<DemoFact[]>(() => {
    const sorting = this.multiSortState().sorting;

    return [
      {
        label: 'Priority order',
        value: sorting?.length
          ? sorting.map((entry, index) => `${index + 1}. ${entry.id} (${entry.desc ? 'desc' : 'asc'})`).join(', ')
          : 'None'
      }
    ];
  });

  protected applyMultiPreset(): void {
    this.multiSortState.update((current) => ({
      ...current,
      sorting: [
        { id: 'category', desc: false },
        { id: 'value', desc: true }
      ]
    }));
  }

  protected clearMultiSort(): void {
    this.multiSortState.update((current) => ({ ...current, sorting: [] }));
  }
}
