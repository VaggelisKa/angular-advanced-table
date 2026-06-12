import { InjectionToken } from '@angular/core';

import type { NatToolbarItemRef } from './toolbar-tokens.type';

/** Token under which `NatToolbarItem` provides itself on its host element. */
export const NAT_TOOLBAR_ITEM = new InjectionToken<NatToolbarItemRef>('NAT_TOOLBAR_ITEM');
