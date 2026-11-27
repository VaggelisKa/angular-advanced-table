import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import { DemoAside, DemoLayout, DemoSection, DemoToggleGroup } from '../../../ui';
import type { DemoToggleOption } from '../../../ui';
import { DEMO_ITEMS, demoItemBaseColumns } from '../demo-data';
import type { DemoItem } from '../demo-data';

type PinSide = 'start' | 'none' | 'end';
type TableDirection = 'ltr' | 'rtl';

const PIN_OPTIONS: readonly DemoToggleOption<PinSide>[] = [
  { value: 'start', label: 'Start' },
  { value: 'none', label: 'None' },
  { value: 'end', label: 'End' }
];

const DIRECTION_OPTIONS: readonly DemoToggleOption<TableDirection>[] = [
  { value: 'ltr', label: 'LTR' },
  { value: 'rtl', label: 'RTL' }
];

@Component({
  selector: 'app-pinning',
  imports: [NatTable, NatTableSurface, DemoAside, DemoLayout, DemoSection, DemoToggleGroup],
  templateUrl: './pinning.html',
  styleUrl: './pinning.css'
})
export class Pinning {
  protected readonly data = DEMO_ITEMS;
  protected readonly direction = signal<TableDirection>('ltr');
  protected readonly directionOptions = DIRECTION_OPTIONS;
  protected readonly pinOptions = PIN_OPTIONS;

  protected readonly targetColumns = [
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' },
    { id: 'value', label: 'Value' }
  ];

  // Sized so the region scrolls and the pinned zones have something to pin over.
  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions(
    demoItemBaseColumns.map((column) => ({
      ...column,
      size: column.id === 'status' ? 120 : 150
    }))
  );

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    columnPinning: {
      start: ['name'],
      end: ['value']
    }
  });

  protected getPinnedSide(id: string): PinSide {
    const pinning = this.tableState().columnPinning;

    if (pinning?.start.includes(id)) {
      return 'start';
    }

    if (pinning?.end.includes(id)) {
      return 'end';
    }

    return 'none';
  }

  protected pinColumn(id: string, side: PinSide): void {
    this.tableState.update((current) => {
      const pinning = current.columnPinning ?? { start: [], end: [] };
      const start = pinning.start.filter((entry) => entry !== id);
      const end = pinning.end.filter((entry) => entry !== id);

      if (side === 'start') {
        start.push(id);
      } else if (side === 'end') {
        end.push(id);
      }

      return {
        ...current,
        columnPinning: { start, end }
      };
    });
  }
}
