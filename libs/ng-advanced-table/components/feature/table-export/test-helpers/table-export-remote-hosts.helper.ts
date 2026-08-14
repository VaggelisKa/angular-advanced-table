import { Component, DestroyRef, Directive, inject, signal } from '@angular/core';

import { vi } from 'vitest';

import { NatTable, NatTableRowRenderStrategyRegistry } from 'ng-advanced-table';
import type { NatTableRowRenderStrategy } from 'ng-advanced-table';

import { NatTableExport } from '../table-export.directive';
import { EXPORT_COLUMNS, EXPORT_ROWS } from './table-export-setup.helper';
import { NatToolbarItem } from '../../../ui/toolbar-item/toolbar-item.directive';
import { NatTableSurface } from '../../table-surface/table-surface';
import { NatTableToolbar } from '../../table-toolbar/table-toolbar';

@Directive({ selector: 'nat-table[remoteWindowStrategy]' })
export class RemoteWindowStrategy {
  public constructor() {
    const registry = inject(NatTableRowRenderStrategyRegistry);
    const destroyRef = inject(DestroyRef);
    const strategy: NatTableRowRenderStrategy = {
      items: signal([{ index: 0, start: 0, end: 40 }]),
      totalSize: signal(400_000),
      rowHeight: signal(40),
      logicalRowCount: signal<number | null>(10_000),
      rowWindowOffset: signal(0)
    };

    destroyRef.onDestroy(registry.register(strategy));
  }
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem, RemoteWindowStrategy],
  selector: 'nat-export-remote-window-host',
  host: { 'data-export-spec-host': 'remote-window' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button [exportHandler]="exportHandler" data-testid="export-button" natTableExport natToolbarItem type="button">Export</button>
      </nat-table-toolbar>

      <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" remoteWindowStrategy />
    </nat-table-surface>
  `
})
export class RemoteWindowExportHost {
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_COLUMNS;
  public readonly exportHandler = vi.fn(async (): Promise<void> => Promise.resolve());
}
