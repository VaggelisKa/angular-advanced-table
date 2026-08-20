import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatList, NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';
import { map } from 'rxjs';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { DemoCode } from '../../ui';

const mockOrderRows = generateMockOrderRows(12);

// Same reason as the toggle-view demo: the row-actions column renders an
// `ngGridCellWidget` cell, which requires the table's Aria grid context and
// cannot render inside the list view.
const demoColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

/** Portrait tablet and up (768px+) renders the table; below that the list takes over. */
const TABLE_VIEWPORT_QUERY = '(min-width: 768px)';

const EXAMPLE_MARKUP = `<!-- Same surface, same state — the breakpoint picks the renderer. -->
<nat-table-surface [enableSorting]="true" [(state)]="state">
  @if (isTableViewport()) {
    <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
  } @else {
    <nat-list [columns]="columns" [data]="rows" accessibleName="Orders" />
  }
</nat-table-surface>`;
const EXAMPLE_TS = `// component.ts — consumer-owned breakpoint: table from 768px up, list below.
protected readonly isTableViewport = toSignal(
  inject(BreakpointObserver).observe('(min-width: 768px)').pipe(map((result) => result.matches)),
  { initialValue: true }
);`;
const EXAMPLE_CSS = `/* Lay out the list items: each field is a grid area named by its column id. */
nat-list {
  --nat-list-item-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  --nat-list-item-areas: 'id id status' 'customer owner total';
}`;

/**
 * SPIKE demo: breakpoint-driven renderer swap. The consumer owns the viewport
 * condition (CDK `BreakpointObserver`) and swaps `nat-table` for `nat-list`
 * inside one `nat-table-surface`, so sorting and column state survive the
 * swap. The list items are laid out through the `--nat-list-item-*`
 * grid tokens — each field is a named grid area (its column id).
 */
@Component({
  selector: 'app-table-to-list-breakpoint',
  imports: [DemoCode, NatList, NatTable, NatTableSurface],
  templateUrl: './table-to-list-breakpoint.html',
  styleUrl: './table-to-list-breakpoint.css'
})
export class TableToListBreakpoint {
  protected readonly rows = mockOrderRows;
  protected readonly columns = demoColumns;
  protected readonly getRowId = getMockOrderRowId;
  protected readonly state = signal<Partial<NatTableUserState>>({});
  protected readonly exampleMarkup = EXAMPLE_MARKUP;
  protected readonly exampleTs = EXAMPLE_TS;
  protected readonly exampleCss = EXAMPLE_CSS;

  protected readonly isTableViewport = toSignal(
    inject(BreakpointObserver)
      .observe(TABLE_VIEWPORT_QUERY)
      .pipe(map((result) => result.matches)),
    { initialValue: true }
  );
}
