import { GridCellWidget } from '@angular/aria/grid';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Row, RowData } from '@tanstack/angular-table';

export type NatTableRowExpansionState = 'collapsed' | 'expanded' | 'unavailable';

export interface NatTableRowExpansionToggleContext<TData extends RowData = RowData> {
  /** Alias for `row`, useful for simple formatter callbacks. */
  $implicit: Row<TData>;
  /** TanStack row instance for advanced label decisions. */
  row: Row<TData>;
  /** Original row object supplied in `NatTable.data`. */
  rowData: TData;
  /** Resolved row id, including any consumer-provided `getRowId` value. */
  rowId: string;
  /** Current expansion availability and state for this row. */
  expansionState: NatTableRowExpansionState;
}

export interface NatTableRowExpansionLabels<TData extends RowData = RowData> {
  /** Accessible name for the button when the row can be expanded. */
  expandButton?: (context: NatTableRowExpansionToggleContext<TData>) => string;
  /** Accessible name for the button when the row can be collapsed. */
  collapseButton?: (context: NatTableRowExpansionToggleContext<TData>) => string;
  /** Accessible name for the disabled button when the row cannot expand. */
  unavailableButton?: (context: NatTableRowExpansionToggleContext<TData>) => string;
  /** Visible text when the row can be expanded. Return an empty string for icon-only UI. */
  expandText?: (context: NatTableRowExpansionToggleContext<TData>) => string;
  /** Visible text when the row can be collapsed. Return an empty string for icon-only UI. */
  collapseText?: (context: NatTableRowExpansionToggleContext<TData>) => string;
  /** Visible text when the row cannot expand. Defaults to icon-only disabled UI. */
  unavailableText?: (context: NatTableRowExpansionToggleContext<TData>) => string;
}

@Component({
  selector: 'nat-table-row-expand-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GridCellWidget],
  templateUrl: './table-row-expand-toggle.html',
  styleUrl: './table-row-expand-toggle.css',
})
export class NatTableRowExpandToggle<TData extends RowData = RowData> {
  readonly row = input.required<Row<TData>>();
  readonly labels = input<NatTableRowExpansionLabels<TData>>({});
  readonly ariaControls = input<string | null>(null);

  protected canExpand(): boolean {
    return this.row().getCanExpand();
  }

  protected isExpanded(): boolean {
    return this.canExpand() && this.row().getIsExpanded();
  }

  protected expansionState(): NatTableRowExpansionState {
    if (!this.canExpand()) {
      return 'unavailable';
    }

    return this.isExpanded() ? 'expanded' : 'collapsed';
  }

  protected buttonLabel(): string {
    const context = this.toggleContext();
    const labels = this.labels();

    if (context.expansionState === 'unavailable') {
      return (
        labels.unavailableButton?.(context) ?? `No expandable details for row ${context.rowId}`
      );
    }

    if (context.expansionState === 'expanded') {
      return labels.collapseButton?.(context) ?? `Collapse details for row ${context.rowId}`;
    }

    return labels.expandButton?.(context) ?? `Expand details for row ${context.rowId}`;
  }

  protected buttonText(): string {
    const context = this.toggleContext();
    const labels = this.labels();

    if (context.expansionState === 'unavailable') {
      return labels.unavailableText?.(context) ?? '';
    }

    if (context.expansionState === 'expanded') {
      return labels.collapseText?.(context) ?? 'Collapse';
    }

    return labels.expandText?.(context) ?? 'Expand';
  }

  protected toggleRow(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.canExpand()) {
      return;
    }

    this.row().toggleExpanded();
  }

  protected stopCellInteraction(event: Event): void {
    event.stopPropagation();
  }

  private toggleContext(): NatTableRowExpansionToggleContext<TData> {
    const row = this.row();

    return {
      $implicit: row,
      row,
      rowData: row.original,
      rowId: row.id,
      expansionState: this.expansionState(),
    };
  }
}
