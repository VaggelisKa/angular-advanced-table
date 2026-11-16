import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { ColumnDef, RowData } from '@tanstack/angular-table';

import type { NatListItemTemplateContext } from '../common/list-item-template.type';

/**
 * Captures the content template for a whole list item:
 * `<ng-template natListItem let-order let-row="row">`. Projected into
 * `<nat-list>`, it replaces the built-in fields, labels, and field layout. The
 * item element, selection state, keyboard navigation, and row activation stay
 * owned by the list.
 */
@Directive({
  selector: 'ng-template[natListItem]'
})
export class NatListItemTemplate<TData extends RowData = RowData> {
  /**
   * Typing hint only: bind the column definitions (`[natListItemOf]="columns"`)
   * so the row is typed with the row type instead of `unknown`. Never read at runtime.
   */
  public readonly natListItemOf = input<readonly ColumnDef<TData, unknown>[]>();

  public readonly templateRef = inject(TemplateRef<NatListItemTemplateContext<TData>>);

  public static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatListItemTemplate<TData>,
    context: unknown
  ): context is NatListItemTemplateContext<TData> {
    // `context` is the subject of this type predicate; the runtime guard always
    // narrows. `void` marks it intentionally unused without an eslint-disable.
    void context;

    return true;
  }
}
