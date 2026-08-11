/* eslint-disable import-x/export -- TypeScript keeps the type-only TanStack surface separate from the supported runtime helper export. */
export type * from '@tanstack/angular-table';

export { flexRenderComponent } from '@tanstack/angular-table';

export * from './ui';

export * from './common';

export * from './domain-logic';

export { NatTable } from './table/table';

// SPIKE: list renderer on the shared table engine (subject to change/removal).
export { NatList } from './list/list';

export { NatTableHotkeyA11y } from './hotkey-a11y/hotkey-a11y.directive';

export { NAT_TABLE_KEYBINDINGS } from './hotkey-a11y/common/keybindings.const';

export { provideNatTableKeybindings } from './hotkey-a11y/keybindings.provider';

export { createNatTableKeyboard, serializeShortcutValue } from './hotkey-a11y/utils/keybindings.util';

export type { NatTableKeybindings, NatTableKeyboard, NatTableShortcut } from './hotkey-a11y/common/keybindings.type';

export { NatTableReorderService } from './reorder/table-reorder.service';

export { NatTableResizeService } from './resize/table-resize.service';

// Engine-neutral body-row rendering contract. The library's own windowing
// engine lives in `ng-advanced-table/virtualization`, so core never pulls
// that engine into a bundle that does not virtualize.
export { NatTableRowRenderStrategyRegistry } from './domain-logic/table-row-render-strategy.service';

export type {
  NatTableBodyRenderPlan,
  NatTableRenderedBodyRow,
  NatTableRowRenderStrategy,
  NatTableVirtualItem
} from './common/row-render-strategy.type';

export { NAT_TABLE_ROW_WINDOW_HOST } from './common/row-window-host.type';

export type { NatTableRowWindowHost } from './common/row-window-host.type';

export { hasNatTableStateValueChanged } from './utils/table-state-value-equality.util';

export { stripNatTableSubHeaderSorting } from './utils/sub-header.util';
