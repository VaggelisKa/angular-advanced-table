import { Component, computed, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import { DemoAside, DemoFacts, DemoLayout, DemoSection, DemoToggleGroup } from '../../../ui';
import type { DemoFact, DemoToggleOption } from '../../../ui';
import { DEMO_ITEMS, demoItemBaseColumns } from '../demo-data';
import type { DemoItem } from '../demo-data';

type Viewport = 'desktop' | 'mobile';

const VIEWPORT_OPTIONS: readonly DemoToggleOption<Viewport>[] = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' }
];

@Component({
  selector: 'app-responsive',
  imports: [NatTable, NatTableSurface, DemoAside, DemoFacts, DemoLayout, DemoSection, DemoToggleGroup],
  templateUrl: './responsive.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class Responsive {
  protected readonly data = DEMO_ITEMS;
  protected readonly viewportOptions = VIEWPORT_OPTIONS;

  // Simulated so the pattern is demonstrable on desktop. A real app wires this to a
  // reactive viewport source instead, e.g.:
  //   isMobile = toSignal(
  //     inject(BreakpointObserver).observe('(max-width: 767px)').pipe(map((r) => r.matches)),
  //     { initialValue: false }
  //   );
  protected readonly viewport = signal<Viewport>('desktop');
  protected readonly isMobile = computed(() => this.viewport() === 'mobile');

  // The opt-out is column composition: rebuild columns inside a computed() keyed on
  // the viewport signal. Sort and pin header UI drop out on mobile (resizing is
  // toggled at the surface via [enableColumnResizing]="!isMobile()") while TanStack
  // sorting itself — driven programmatically below — stays live.
  protected readonly columns = computed<ColumnDef<DemoItem, unknown>[]>(() => {
    const mobile = this.isMobile();

    return withNatTableHeaderActions(demoItemBaseColumns, {
      enableSortActions: !mobile,
      enableColumnPinActions: !mobile
    });
  });

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    sorting: [{ id: 'name', desc: false }]
  });

  protected readonly facts = computed<DemoFact[]>(() => {
    const sorting = this.tableState().sorting;
    const entry = sorting?.[0];

    return [
      {
        label: 'Mode',
        value: this.isMobile() ? 'Mobile (sort, pin, and resize UI hidden)' : 'Desktop'
      },
      {
        label: 'Current sort',
        value: entry ? `${entry.id} (${entry.desc ? 'desc' : 'asc'})` : 'None'
      }
    ];
  });

  // Proves the sort sheet path: this updates the same state slice the (now hidden)
  // header sort button would have written, so sorting keeps working on mobile.
  protected sortByValue(): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [{ id: 'value', desc: true }]
    }));
  }
}
