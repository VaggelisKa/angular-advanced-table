import type { ConnectedPosition } from '@angular/cdk/overlay';

/**
 * Shared overlay placement for every toolbar dropdown (actions, columns,
 * sort, More menu): below-end first, then below-start, then above-end.
 */
export const NAT_TOOLBAR_MENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
];
