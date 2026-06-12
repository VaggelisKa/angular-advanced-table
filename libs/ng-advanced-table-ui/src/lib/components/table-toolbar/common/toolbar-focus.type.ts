import type { NatToolbarItemPosition } from './toolbar-tokens.type';

/** Position metadata the focus-stop builder needs from each registered item. */
export type NatToolbarFocusStopItem = {
  readonly id: string;
  readonly position: NatToolbarItemPosition;
};

/** Everything the navigation resolver needs to pick the next roving-focus stop. */
export type NatToolbarNavigationContext = {
  readonly stops: string[];
  readonly activeId: string | null;
  readonly key: string;
  /** Text direction of the toolbar; defaults to LTR. */
  readonly isRtl?: boolean;
};
