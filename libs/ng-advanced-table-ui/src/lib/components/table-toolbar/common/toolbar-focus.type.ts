import type { NatToolbarItemPosition } from './toolbar-tokens.type';

/** Position metadata the focus-stop builder needs from each registered item. */
export type NatToolbarFocusStopItem = {
  readonly id: string;
  readonly position: NatToolbarItemPosition;
};
