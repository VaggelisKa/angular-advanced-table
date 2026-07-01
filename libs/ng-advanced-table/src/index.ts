export { NatTable } from './feature/table';

export { NatTableA11yService } from './domain-logic/table-a11y.service';

export { NatTableHeaderMeasurementService } from './domain-logic/table-header-measurement.service';

export { NatTableReorderService } from './domain-logic/table-reorder.service';

export { NatTableResizeService } from './domain-logic/table-resize.service';

export { NatTableService } from './domain-logic/table.service';

export { NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from './ui/table-state-templates';

export { NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS } from './common/table.type';

export * from '@tanstack/angular-table';

export type { NatTableRowRenderedEvent } from './common/events.type';

export type {
  NatTableAccessibilityText,
  NatTableBodyState,
  NatTableCellTone,
  NatTableColumnMoveDirection,
  NatTableColumnMeta,
  NatTableDataStatus,
  NatTableEmptyTemplateContext,
  NatTableErrorTemplateContext,
  NatTableLoadingTemplateContext,
  NatTableRowActivateEvent,
  NatTableRowIdGetter,
  NatTableSortIndicatorContext,
  NatTableMode,
  NatTableModeConfiguration,
  NatTableUserState,
  NatTableUiController,
  NatTableUiState
} from './common/table.type';

export { NatTableHotkeyA11y } from './feature/hotkey-a11y.directive';

export { NAT_TABLE_KEYBINDINGS, provideNatTableKeybindings } from './common/keybindings.provider';

export { createNatTableKeyboard, serializeShortcutValue } from './utils/keybindings';

export type { NatTableKeybindings, NatTableKeyboard, NatTableShortcut } from './common/keybindings.type';
