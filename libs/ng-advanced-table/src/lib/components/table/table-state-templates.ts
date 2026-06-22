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
  public readonly templateRef = inject(TemplateRef<NatTableLoadingTemplateContext<TData>>);

  public static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableLoadingTemplate<TData>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular template-type-check guard: `context` is the subject of the type predicate, required by the signature.
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
  public readonly templateRef = inject(TemplateRef<NatTableEmptyTemplateContext<TData>>);

  public static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableEmptyTemplate<TData>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular template-type-check guard: `context` is the subject of the type predicate, required by the signature.
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
  public readonly templateRef = inject(TemplateRef<NatTableErrorTemplateContext<TData>>);

  public static ngTemplateContextGuard<TData extends RowData>(
    _directive: NatTableErrorTemplate<TData>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular template-type-check guard: `context` is the subject of the type predicate, required by the signature.
    context: unknown,
  ): context is NatTableErrorTemplateContext<TData> {
    return true;
  }
}
