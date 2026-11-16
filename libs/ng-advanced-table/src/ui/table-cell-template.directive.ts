import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { ColumnDef, RowData } from '@tanstack/angular-table';

import type { NatTableCellTemplateContext } from '../common/cell-template.type';

/**
 * Captures the content template for one column's body cells, keyed by column
 * id: `<ng-template natTableCell="status" let-status let-row="row">`. Projected
 * into `<nat-table>`, `<nat-table-static>`, or `<nat-list>`, it replaces what
 * the column definition's `cell` would render; the cell element and its layout,
 * tone, and interaction attributes stay owned by the renderer.
 */
@Directive({
  selector: 'ng-template[natTableCell]'
})
export class NatTableCellTemplate<TData extends RowData = RowData> {
  /** Id of the column whose body cells this template renders. */
  public readonly columnId = input.required<string>({ alias: 'natTableCell' });
  /**
   * Typing hint only: bind the column definitions (`[natTableCellOf]="columns"`)
   * so `row` is typed with the row type instead of `unknown`. Never read at runtime.
   */
  public readonly natTableCellOf = input<readonly ColumnDef<TData, unknown>[]>();

  public readonly templateRef = inject(TemplateRef<NatTableCellTemplateContext<TData>>);

  public static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableCellTemplate<TData>,
    context: unknown
  ): context is NatTableCellTemplateContext<TData> {
    // `context` is the subject of this type predicate; the runtime guard always
    // narrows. `void` marks it intentionally unused without an eslint-disable.
    void context;

    return true;
  }
}
