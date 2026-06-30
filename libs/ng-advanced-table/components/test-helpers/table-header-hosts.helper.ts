import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';

import { baseColumns, buildHeaderActionCompositionColumns, buildRows, sortIndicatorGlyph } from './table-data.helper';
import type { Row } from './table-data.helper';
import { NatTableSurface } from '../feature/table-surface/table-surface';
import { withNatTableHeaderActions } from '../ui/table-header-actions/with-table-header-actions';

@Component({
  selector: 'nat-custom-sort-indicator-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
export class CustomSortIndicatorHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    sortIndicator: ({ sortState }) => sortIndicatorGlyph(sortState)
  });

  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-move-only-header-actions-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
export class MoveOnlyHeaderActionsHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns, {
    enableColumnPinActions: false,
    enableColumnReorderActions: true
  });

  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-hidden-header-action-label-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
export class HiddenHeaderActionLabelHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(
    baseColumns.map((column) => {
      const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

      if (accessorKey !== 'name') {
        return column;
      }

      return {
        ...column,
        meta: {
          rowHeader: column.meta?.rowHeader,
          hiddenHeaderLabel: 'Row actions'
        }
      };
    })
  );

  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-header-action-composition-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
export class HeaderActionCompositionHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(
    withNatTableHeaderActions(buildHeaderActionCompositionColumns(), {
      sortIndicator: 'F',
      accessibilityLabels: {
        sortButton: ({ label }) => `First sort ${label}`,
        menuButton: ({ label }) => `First menu ${label}`,
        menuLabel: ({ label }) => `First column menu ${label}`
      }
    }),
    {
      sortIndicator: 'S',
      accessibilityLabels: {
        sortButton: ({ label }) => `Second sort ${label}`,
        menuButton: ({ label }) => `Second menu ${label}`,
        menuLabel: ({ label }) => `Second column menu ${label}`
      }
    }
  );

  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

@Component({
  selector: 'nat-multi-sort-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [enableMultiSort]="true" [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
    </nat-table-surface>
  `
})
export class MultiSortHost {
  protected readonly rows = signal<Row[]>(buildRows(6));
  protected readonly columns = withNatTableHeaderActions(baseColumns);
  public readonly tableState = signal<Partial<NatTableState>>({});

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}
