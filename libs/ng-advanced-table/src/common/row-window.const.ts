import { InjectionToken } from '@angular/core';

import type { NatTableRowWindow } from './row-window.type';

/**
 * Optional element-scoped contract a row-virtualization directive provides on
 * the same `<nat-table>` element. `NatTable` resolves it with
 * `{ optional: true, self: true }`, so the token never leaks across nested
 * tables and its absence keeps the fully rendered body path untouched.
 */
export const NAT_TABLE_ROW_WINDOW = new InjectionToken<NatTableRowWindow>('NAT_TABLE_ROW_WINDOW');
