import { InjectionToken } from '@angular/core';

import type { NatTableToolbarRef, NatToolbarItemRef } from './toolbar-tokens.type';

/** Token under which `NatToolbarItem` provides itself on its host element. */
export const NAT_TOOLBAR_ITEM = new InjectionToken<NatToolbarItemRef>('NAT_TOOLBAR_ITEM');

export const NAT_TABLE_TOOLBAR = new InjectionToken<NatTableToolbarRef>('NAT_TABLE_TOOLBAR');
