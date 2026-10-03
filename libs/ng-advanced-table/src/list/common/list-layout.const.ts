import type { NatListItemLayout } from './list-layout.type';

/** Item layouts understood by `<nat-list>`; see `NatListItemLayout`. */
export const NAT_LIST_ITEM_LAYOUT = {
  grid: 'grid',
  flow: 'flow'
} as const satisfies Record<NatListItemLayout, NatListItemLayout>;
