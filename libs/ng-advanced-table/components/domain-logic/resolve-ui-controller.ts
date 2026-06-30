import { assertInInjectionContext, computed, inject, isDevMode } from '@angular/core';
import type { Signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableService } from 'ng-advanced-table';

import type { NatTableUiController } from '../common/table-ui.type';

type InjectNatTableUiControllerOptions = {
  /**
   * When true, suppresses the dev-mode "no controller resolved" warning.
   * Use only for components that render client-supplied content and work
   * correctly without a controller (e.g. nat-toolbar-actions).
   */
  readonly optionalUsage?: boolean;
};

/**
 * THE single controller-resolution path for the toolbar and its built-ins.
 * Must be called from an injection context (constructor / field initializer).
 *
 * Resolution order: explicit `for` input ?? `NatTableService` controller
 * (provided by `nat-table-surface`) ?? null (+ one dev-mode warning).
 * Do NOT add fallback logic at call sites.
 */
export const injectNatTableUiController = <TData extends RowData = RowData>(
  forInput: Signal<NatTableUiController<TData> | undefined>,
  debugName: string,
  options?: InjectNatTableUiControllerOptions
): Signal<NatTableUiController<TData> | null> => {
  assertInInjectionContext(injectNatTableUiController);

  const natTableService = inject<NatTableService<TData>>(NatTableService, { optional: true });

  let hasWarned = false;

  return computed(() => {
    const controller = forInput() ?? natTableService?.controller() ?? null;
    const shouldWarn = controller === null && isDevMode() && !hasWarned && !options?.optionalUsage;

    if (shouldWarn) {
      hasWarned = true;
      console.warn(
        `[ng-advanced-table/components] ${debugName}: no controller resolved. ` +
          `Pass [for]="grid" explicitly or wrap the table in <nat-table-surface>.`
      );
    }

    return controller;
  });
};
