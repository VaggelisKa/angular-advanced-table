import { InjectionToken } from '@angular/core';

import type { NatTableKeybindings } from './keybindings.type';

/** Injection token for custom keyboard shortcuts configuration. */
export const NAT_TABLE_KEYBINDINGS = new InjectionToken<NatTableKeybindings>('NAT_TABLE_KEYBINDINGS', {
  providedIn: 'root',
  factory: (): NatTableKeybindings => ({})
});

/** Default keyboard shortcuts adhering to standard WCAG cell-interaction and reordering behaviors. */
export const DEFAULT_NAT_TABLE_KEYBINDINGS: Required<NatTableKeybindings> = {
  rowActivate: ['Enter', ' ', 'Spacebar'],
  columnReorderLeft: 'Mod+Shift+ArrowLeft',
  columnReorderRight: 'Mod+Shift+ArrowRight',
  cellEnterControl: 'Enter',
  cellExitControl: 'Escape',
  cellTabNextControl: 'Tab',
  cellTabPrevControl: 'Shift+Tab'
};
