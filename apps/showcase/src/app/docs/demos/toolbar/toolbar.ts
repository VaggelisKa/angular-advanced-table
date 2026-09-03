import type { ElementRef } from '@angular/core';
import { Component, computed, signal, viewChild } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState, SortingState, VisibilityState } from 'ng-advanced-table';
import { NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarGroup, NatToolbarItem } from 'ng-advanced-table/components';

import { StencilToolbarExample } from './stencil-controls';
import { WrappedToolbarExample } from './wrapped-controls';
import { DemoAside, DemoFacts, DemoLayout, DemoSection, TableSearch } from '../../../ui';
import type { DemoFact } from '../../../ui';
import { DEMO_ITEMS, demoItemColumns } from '../demo-data';
import type { DemoItem } from '../demo-data';

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
  selector: 'app-toolbar',
  imports: [
    NatTable,
    NatTableExport,
    NatTableSurface,
    NatTableToolbar,
    NatToolbarGroup,
    NatToolbarItem,
    TableSearch,
    DemoAside,
    DemoFacts,
    DemoLayout,
    DemoSection,
    StencilToolbarExample,
    WrappedToolbarExample
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class Toolbar {
  protected readonly lastAction = signal('none');

  protected readonly data = DEMO_ITEMS;
  protected readonly columns = demoItemColumns;

  protected readonly activationFacts = computed<DemoFact[]>(() => [
    { label: 'Last action', value: this.lastAction(), testId: 'last-action' }
  ]);

  protected readonly tableState = signal<Partial<NatTableUserState>>({
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

  protected readonly filteredData = computed(() => {
    const predicate = this.activePreset().predicate;

    return predicate ? DEMO_ITEMS.filter(predicate) : DEMO_ITEMS;
  });

  protected readonly filterFacts = computed<DemoFact[]>(() => [
    { label: 'Preset', value: this.activePreset().label, testId: 'active-filter' },
    { label: 'Rows', value: `${this.filteredData().length} of ${DEMO_ITEMS.length}`, testId: 'filter-row-count' }
  ]);

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
