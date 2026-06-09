import { Injectable, InjectionToken, signal } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';
import type { NatTableUiController } from './table-ui.types';

/** Injection token for the active table UI controller in the current DI scope. */
export const NAT_TABLE_UI_CONTROLLER = new InjectionToken<NatTableUiController<any>>('NAT_TABLE_UI_CONTROLLER');

/**
 * Scoped service to share the active table controller instance within a DI hierarchy.
 */
@Injectable()
export class NatTableUiService<TData extends RowData = RowData> {
  private readonly controllerSignal = signal<NatTableUiController<TData> | null>(null);
  readonly controller = this.controllerSignal.asReadonly();

  setController(controller: NatTableUiController<TData>): void {
    this.controllerSignal.set(controller);
  }
}
