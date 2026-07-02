import type { Provider } from '@angular/core';

import { NAT_TABLE_KEYBINDINGS } from './common/keybindings.const';
import type { NatTableKeybindings } from './common/keybindings.type';

/** Provides global keyboard shortcut overrides for every nat-table in the injector scope. */
export const provideNatTableKeybindings = (keybindings: NatTableKeybindings): Provider => ({
  provide: NAT_TABLE_KEYBINDINGS,
  useValue: keybindings
});
