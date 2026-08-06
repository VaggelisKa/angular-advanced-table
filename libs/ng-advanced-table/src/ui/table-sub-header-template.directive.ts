import { Directive, TemplateRef, inject } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import type { NatTableSubHeaderTemplateContext } from '../common/sub-header.type';

/**
 * Captures the custom sub-header content template rendered at the start of
 * each sub-header group when `subHeaderColumn` is set on `<nat-table>` or
 * `<nat-list>`. Without it, the group value renders as plain text.
 */
@Directive({
  selector: 'ng-template[natTableSubHeader]'
})
export class NatTableSubHeaderTemplate<TData extends RowData = RowData> {
  public readonly templateRef = inject(TemplateRef<NatTableSubHeaderTemplateContext<TData>>);

  public static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableSubHeaderTemplate<TData>,
    context: unknown
  ): context is NatTableSubHeaderTemplateContext<TData> {
    // `context` is the subject of this type predicate; the runtime guard always
    // narrows. `void` marks it intentionally unused without an eslint-disable.
    void context;

    return true;
  }
}
