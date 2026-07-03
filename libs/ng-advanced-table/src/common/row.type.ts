import type { Row, RowData } from '@tanstack/angular-table';

/**
 * Stable row id resolver passed to `getRowId` when the built-in string/number
 * `row.id` default is not enough. Matches TanStack Table's
 * `getRowId(originalRow, index, parentRow?)` shape so consumers can key sub-rows
 * consistently when they enable nested features later.
 */
export type NatTableRowIdGetter<TData extends RowData = RowData> = (row: TData, index: number, parent?: Row<TData>) => string;

/**
 * Payload emitted by `(rowActivate)` when a body row is activated through a
 * primary click or an Enter / Space key press.
 *
 * The originating event is forwarded so consumers can call
 * `event.preventDefault()` or read modifier keys without re-deriving them.
 * The table only fires this event for activations that did not originate
 * from an interactive descendant (button, link, form control, menu item,
 * `contenteditable`), so cell-level controls keep their own behavior.
 */
export type NatTableRowActivateEvent<TData extends RowData = RowData> = {
  /** Original row object supplied in `data`. */
  readonly rowData: TData;
  /** TanStack row instance for advanced interactions. */
  readonly row: Row<TData>;
  /** Pointer or keyboard event that triggered the activation. */
  readonly originalEvent: MouseEvent | KeyboardEvent;
};
