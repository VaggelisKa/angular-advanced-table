/* eslint-disable import-x/export -- TypeScript keeps the type-only TanStack surface separate from the supported runtime helper export. */
export type * from '@tanstack/angular-table';

// TanStack v9 types with the library's feature set applied. Explicit exports
// shadow the same names from the star export above, so consumers keep writing
// `ColumnDef<Order>` instead of `ColumnDef<typeof features, Order>`.
export type {
  Cell,
  CellContext,
  Column,
  ColumnDef,
  ColumnDefBase,
  FilterFn,
  Header,
  HeaderContext,
  HeaderGroup,
  NatTableFeatures,
  Row,
  RowModel,
  SortFn,
  SortingFn,
  Table,
  VisibilityState
} from './common/table-features.type';

export { flexRenderComponent } from '@tanstack/angular-table';

export * from './ui';

export * from './common';

export * from './domain-logic';

export { NatTable } from './table/table';

// SPIKE: list renderer on the shared table engine (subject to change/removal).
export { NatList } from './list/list';

export { NAT_LIST_ITEM_LAYOUT } from './list/common/list-layout.const';

export type { NatListItemLayout } from './list/common/list-layout.type';

export { NatTableStatic } from './static-table/static-table';

export { NatTableHotkeyA11y } from './hotkey-a11y/hotkey-a11y.directive';

export { NAT_TABLE_KEYBINDINGS } from './hotkey-a11y/common/keybindings.const';

export { provideNatTableKeybindings } from './hotkey-a11y/keybindings.provider';

export { createNatTableKeyboard, serializeShortcutValue } from './hotkey-a11y/utils/keybindings.util';

export type { NatTableKeybindings, NatTableKeyboard, NatTableShortcut } from './hotkey-a11y/common/keybindings.type';

export { NatTableReorderService } from './reorder/table-reorder.service';

export { NatTableResizeService } from './resize/table-resize.service';

export { hasNatTableStateValueChanged } from './utils/table-state-value-equality.util';

export { stripNatTableSubHeaderSorting } from './utils/sub-header.util';
