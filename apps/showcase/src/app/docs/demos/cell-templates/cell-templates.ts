import { Component, signal } from '@angular/core';

import { NatList, NatTable, NatTableCellTemplate } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import type { DemoToggleOption } from '../../../ui';
import { DemoToggleGroup } from '../../../ui';
import type { DemoItem } from '../demo-data';
import { DEMO_ITEMS, demoItemBaseColumns } from '../demo-data';

type DemoView = 'table' | 'list';

const RENDERER_OPTIONS: readonly DemoToggleOption<DemoView>[] = [
  { value: 'table', label: 'Table' },
  { value: 'list', label: 'List' }
];

/**
 * Docs demo: the status column's cells come from a projected `natTableCell`
 * template, so the markup and its click handler live in the host template.
 * The same template shape renders in both renderers.
 */
@Component({
  selector: 'app-cell-templates',
  imports: [DemoToggleGroup, NatList, NatTable, NatTableCellTemplate, NatTableSurface],
  templateUrl: './cell-templates.html',
  styleUrl: './cell-templates.css'
})
export class CellTemplates {
  protected readonly columns = demoItemBaseColumns;
  protected readonly rendererOptions = RENDERER_OPTIONS;

  protected readonly rows = signal<readonly DemoItem[]>(DEMO_ITEMS);
  protected readonly view = signal<DemoView>('table');

  protected toggle(item: DemoItem): void {
    const status = item.status === 'Active' ? 'Paused' : 'Active';

    this.rows.update((rows) => rows.map((row) => (row.id === item.id ? { ...row, status } : row)));
  }
}
