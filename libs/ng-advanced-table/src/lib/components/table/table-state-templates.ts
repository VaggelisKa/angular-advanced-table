import { Directive, TemplateRef, inject } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import type {
  NatTableEmptyTemplateContext,
  NatTableErrorTemplateContext,
  NatTableLoadingTemplateContext,
} from './table.types';

// State slots must be templates because NatTable renders them inside its generated tbody row.
/**
 * Captures the custom loading body-row template rendered when
 * `<nat-table dataStatus="loading">` has no visible rows.
 */
@Directive({
  selector: 'ng-template[natTableLoading]',
})
export class NatTableLoadingTemplate<TData extends RowData = RowData> {
  readonly templateRef = inject(TemplateRef<NatTableLoadingTemplateContext<TData>>);

  static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableLoadingTemplate<TData>,
    context: unknown,
  ): context is NatTableLoadingTemplateContext<TData> {
    return true;
  }
}

/**
 * Captures the custom empty body-row template rendered when a successful table
 * view has no matching rows.
 */
@Directive({
  selector: 'ng-template[natTableEmpty]',
})
export class NatTableEmptyTemplate<TData extends RowData = RowData> {
  readonly templateRef = inject(TemplateRef<NatTableEmptyTemplateContext<TData>>);

  static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableEmptyTemplate<TData>,
    context: unknown,
  ): context is NatTableEmptyTemplateContext<TData> {
    return true;
  }
}

/**
 * Captures the custom error body-row template rendered when
 * `<nat-table dataStatus="error">` is active.
 */
@Directive({
  selector: 'ng-template[natTableError]',
})
export class NatTableErrorTemplate<TData extends RowData = RowData> {
  readonly templateRef = inject(TemplateRef<NatTableErrorTemplateContext<TData>>);

  static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableErrorTemplate<TData>,
    context: unknown,
  ): context is NatTableErrorTemplateContext<TData> {
    return true;
  }
}
