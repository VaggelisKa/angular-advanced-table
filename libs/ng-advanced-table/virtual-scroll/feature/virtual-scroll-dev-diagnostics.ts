import type { Signal } from '@angular/core';
import { effect } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import type { NatTable } from 'ng-advanced-table';

import type { NatTableVirtualScrollOptions } from '../common/virtual-scroll-options.type';
import { describeVirtualScrollOptionProblems } from '../utils/virtual-scroll-options.util';

/**
 * Dev-mode-only warning effects for `natTableVirtualScroll`: invalid options,
 * and the two feature combinations virtualization deliberately does not
 * support. Must be called in an injection context; production builds register
 * nothing because the caller gates on `isDevMode()`.
 *
 * `hostTable` is a lazy accessor because the host `NatTable` cannot be
 * injected while the directive is constructed (see the directive's DI note).
 */
export function registerVirtualScrollDevDiagnostics<TData extends RowData>(
  options: Signal<NatTableVirtualScrollOptions>,
  hostTable: () => NatTable<TData>
): void {
  effect(() => {
    for (const problem of describeVirtualScrollOptionProblems(options())) {
      console.warn(`[ng-advanced-table] natTableVirtualScroll: ${problem}`);
    }
  });

  effect(() => {
    if (hostTable().subHeaderColumn() !== undefined && hostTable().enableSubHeaders()) {
      console.warn(
        '[ng-advanced-table] natTableVirtualScroll: sub-header rows are not supported with row virtualization — ' +
          'interleaved group rows break the fixed-row-height geometry. Disable one of the two features.'
      );
    }
  });

  effect(() => {
    if (hostTable().emitRowRenderEvents()) {
      console.warn(
        '[ng-advanced-table] natTableVirtualScroll: per-row render events are suppressed while the body is ' +
          'virtualized, because scroll-mounted rows would report timings against the wrong render cycle.'
      );
    }
  });
}
