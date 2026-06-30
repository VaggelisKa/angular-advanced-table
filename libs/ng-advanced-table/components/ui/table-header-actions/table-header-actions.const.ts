import type { ConnectedPosition } from '@angular/cdk/overlay';

import type { NatTableColumnMoveDirection } from 'ng-advanced-table';

import type { NatTablePinSide } from '../../utils/header-actions-labels.util';

/** Pin sides offered in the column actions menu for pinnable columns. */
export const NAT_HEADER_ACTIONS_PIN_SIDES: readonly NatTablePinSide[] = ['left', 'right'];

/** Move directions offered in the column actions menu for reorderable columns. */
export const NAT_HEADER_ACTIONS_MOVE_DIRECTIONS: readonly NatTableColumnMoveDirection[] = ['left', 'right'];

/** Connected-overlay fallback positions for the pin actions menu. */
export const NAT_HEADER_ACTIONS_PIN_MENU_POSITIONS: readonly ConnectedPosition[] = [
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 6
  },
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 6
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -6
  }
];
