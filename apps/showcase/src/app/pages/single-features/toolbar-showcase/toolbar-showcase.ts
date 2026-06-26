import type { ElementRef } from '@angular/core';
import { Component, computed, signal, viewChild } from '@angular/core';

import type { CellContext, ColumnDef, SortingState, VisibilityState } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import {
  NatTableExport,
  NatTableSurface,
  NatTableToolbar,
  NatToolbarGroup,
  NatToolbarItem,
  withNatTableHeaderActions
} from 'ng-advanced-table/ui';

import { TableSearch } from '../../../components/table-search/table-search';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 }
];

/** A user-defined quick filter exposed through the overflow menu. */
type FilterPreset = {
  readonly key: string;
  readonly label: string;
  /** `null` clears the filter and shows every row. */
  readonly predicate: ((item: DemoItem) => boolean) | null;
};

const FILTER_PRESETS: readonly FilterPreset[] = [
  { key: 'all', label: 'Show all items', predicate: null },
  { key: 'high-value', label: 'Value over $2,000', predicate: (item) => item.value > 2000 },
  { key: 'active', label: 'Active only', predicate: (item) => item.status === 'Active' },
  { key: 'security', label: 'Security team', predicate: (item) => item.category === 'Security' },
  { key: 'attention', label: 'Needs attention', predicate: (item) => item.status !== 'Active' }
];

@Component({
  selector: 'app-toolbar-showcase',
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarGroup, NatToolbarItem, TableSearch],
  templateUrl: './toolbar-showcase.html',
  styleUrl: './toolbar-showcase.css',
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class ToolbarShowcasePage {
  protected readonly lastAction = signal('none');

  protected readonly data = DEMO_DATA;

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' }
    },
    {
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`
    }
  ]);

  protected readonly tableState = signal<Partial<NatTableState>>({
    sorting: []
  });

  // --- search + filter menu (Example 2) ---
  // The overflow menu is a user-defined "quick filter": each item swaps the
  // data passed to the table. It composes with the free-text search, which
  // narrows whatever rows the active preset leaves.
  protected readonly filterPresets = FILTER_PRESETS;
  protected readonly activePresetKey = signal<string>('all');
  private readonly activePreset = computed(
    () => FILTER_PRESETS.find((preset) => preset.key === this.activePresetKey()) ?? FILTER_PRESETS[0]
  );

  protected readonly activeFilterLabel = computed(() => this.activePreset().label);
  protected readonly filteredData = computed(() => {
    const predicate = this.activePreset().predicate;

    return predicate ? DEMO_DATA.filter(predicate) : DEMO_DATA;
  });

  protected readonly visibleCount = computed(() => this.filteredData().length);

  // --- overflow disclosure menu ---
  protected readonly menuOpen = signal(false);
  private readonly menuTrigger = viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');
  private readonly menuRoot = viewChild<ElementRef<HTMLElement>>('menuRoot');

  protected recordAction(action: string): void {
    this.lastAction.set(action);
  }

  protected onSortingChange(sorting: SortingState): void {
    this.tableState.update((current) => ({ ...current, sorting }));
  }

  protected onColumnVisibilityChange(columnVisibility: VisibilityState): void {
    this.tableState.update((current) => ({ ...current, columnVisibility }));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(refocusTrigger = false): void {
    if (!this.menuOpen()) return;

    this.menuOpen.set(false);

    if (refocusTrigger) {
      this.menuTrigger()?.nativeElement.focus();
    }
  }

  protected applyPreset(key: string): void {
    this.activePresetKey.set(key);
    this.closeMenu(true);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const root = this.menuRoot()?.nativeElement;

    if (this.menuOpen() && root && !root.contains(event.target as Node)) {
      this.closeMenu();
    }
  }
}
