import { Component, computed, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { DemoAside, DemoLayout, DemoSection, DemoSwitch, DemoToggleGroup } from '../../../ui';
import type { DemoToggleOption } from '../../../ui';
import { DEMO_ITEMS, demoItemBaseColumns } from '../demo-data';
import type { DemoItem } from '../demo-data';

type ColumnSizingMode = 'fill' | 'fixed';

const SIZING_MODE_OPTIONS: readonly DemoToggleOption<ColumnSizingMode>[] = [
  { value: 'fill', label: 'Fill' },
  { value: 'fixed', label: 'Fixed' }
];

@Component({
  selector: 'app-resizing',
  imports: [NatTable, NatTableSurface, DemoAside, DemoLayout, DemoSection, DemoSwitch, DemoToggleGroup],
  templateUrl: './resizing.html',
  styleUrl: './resizing.css'
})
export class Resizing {
  protected readonly data = DEMO_ITEMS;
  protected readonly sizingModeOptions = SIZING_MODE_OPTIONS;

  protected readonly columnToggles = demoItemBaseColumns.map((column) => ({
    id: column.id as string,
    label: column.meta?.label ?? (column.id as string)
  }));

  // Which columns expose a resize handle. Starts as a subset so the "some columns
  // resize, some don't" per-column behaviour is visible immediately. Mutated at
  // runtime as the user toggles columns, so a Set (not a static Record) fits.
  protected readonly resizableColumnIds = signal<ReadonlySet<string>>(new Set(['name', 'category', 'status']));

  // Resizing is switched on at the surface; per column enableResizing is derived from
  // the toggle set, so unchecked columns emit enableResizing: false to opt out.
  protected readonly columns = computed<ColumnDef<DemoItem, unknown>[]>(() => {
    const resizable = this.resizableColumnIds();

    return demoItemBaseColumns.map((column) => ({
      ...column,
      enableResizing: resizable.has(column.id as string)
    }));
  });

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    columnSizing: {}
  });

  // Both modes resize pixel-exact. Fill reflows the other columns so the table stays
  // filled; fixed keeps widths authoritative and scrolls the region. Default to fill
  // (the library default) to demonstrate the reflow behaviour.
  protected readonly columnSizingMode = signal<ColumnSizingMode>('fill');

  // Reset only the width slice — spread the rest so any other controlled state
  // (sorting/filtering/etc.) survives. The button label promises widths only.
  protected resetWidths(): void {
    this.tableState.update((state) => ({ ...state, columnSizing: {} }));
  }

  protected toggleResizable(id: string, enabled: boolean): void {
    this.resizableColumnIds.update((current) => {
      const next = new Set(current);

      if (enabled) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }
}
