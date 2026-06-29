import { InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

import type { NatTableKeybindings } from './keybindings.type';

/** Injection token for custom keyboard shortcuts configuration. */
export const NAT_TABLE_KEYBINDINGS = new InjectionToken<NatTableKeybindings>('NAT_TABLE_KEYBINDINGS', {
  providedIn: 'root',
  factory: (): NatTableKeybindings => ({})
});

/** Provides global keyboard shortcut overrides for every nat-table in the injector scope. */
export const provideNatTableKeybindings = (keybindings: NatTableKeybindings): Provider => ({
  provide: NAT_TABLE_KEYBINDINGS,
  useValue: keybindings
});
