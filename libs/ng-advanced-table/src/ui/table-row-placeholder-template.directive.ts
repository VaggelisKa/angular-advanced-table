import { Directive, TemplateRef, inject } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import type { NatTableRowPlaceholderTemplateContext } from '../common/row-placeholder.type';

/**
 * Captures the custom placeholder cell content rendered for logical row slots
 * the table does not hold under remote windowing (`remoteRowCount` on
 * `natTableVirtualize`). The template renders once per visible column cell of
 * each placeholder row. Without it, placeholder cells render empty but keep
 * the fixed-height row structure.
 */
@Directive({
  selector: 'ng-template[natTableRowPlaceholder]'
})
export class NatTableRowPlaceholderTemplate<TData extends RowData = RowData> {
  public readonly templateRef = inject(TemplateRef<NatTableRowPlaceholderTemplateContext<TData>>);

  public static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableRowPlaceholderTemplate<TData>,
    context: unknown
  ): context is NatTableRowPlaceholderTemplateContext<TData> {
    // `context` is the subject of this type predicate; the runtime guard always
    // narrows. `void` marks it intentionally unused without an eslint-disable.
    void context;

    return true;
  }
}
