import type { CdkDragDrop } from '@angular/cdk/drag-drop';

import type { CellContext, Column, Header, RowData } from '@tanstack/angular-table';

import type { NatTableCellTone } from '../common/column-meta.type';
import { ROW_ACTIVATE_INTERACTIVE_SELECTOR } from '../common/interaction.const';

/** Keyboard keys that drive a column resize (Alt+Arrow steps; Alt+Home/End jump to bounds). */
const RESIZE_KEYS: ReadonlySet<string> = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End']);

/** Whether a keyboard event's key is one of the column-resize keys. */
export const isResizeKey = (event: KeyboardEvent): boolean => RESIZE_KEYS.has(event.key);

/**
 * Whether a column resolves to resizable: its own `enableResizing` flag when set,
 * otherwise the surface enabler. Surface on → resizable unless the column opts out
 * with `enableResizing: false`; surface off → not resizable unless the column opts
 * in with `enableResizing: true`.
 */
export const isColumnResizable = <TData extends RowData>(column: Column<TData, unknown>, surfaceEnabled: boolean): boolean =>
  column.columnDef.enableResizing ?? surfaceEnabled;

/**
 * Whether a column resolves to reorderable: its own `meta.reorderable` flag when set,
 * otherwise the surface enabler. Surface on → reorderable unless the column opts out
 * with `meta.reorderable: false`; surface off → keyboard/menu movement is disabled
 * unless the column opts in with `meta.reorderable: true`. Drag/drop still requires
 * the surface enabler; see #291.
 */
export const isColumnReorderable = <TData extends RowData>(column: Column<TData, unknown>, surfaceEnabled: boolean): boolean =>
  column.columnDef.meta?.reorderable ?? surfaceEnabled;

/** A non-placeholder header whose column resolves to resizable under the surface enabler. */
export const canResizeColumn = <TData extends RowData>(header: Header<TData, unknown>, surfaceEnabled: boolean): boolean =>
  !header.isPlaceholder && isColumnResizable(header.column, surfaceEnabled);

/** Resolves the per-cell tone from the column's `meta.cellTone` callback. */
export const getCellTone = <TData extends RowData>(
  column: Column<TData, unknown>,
  context: CellContext<TData, unknown>
): NatTableCellTone | null => column.columnDef.meta?.cellTone?.(context) ?? null;

/** Resolves which column id a header drag moved, falling back to the source row slot. */
export const resolveDraggedColumnId = (event: CdkDragDrop<string[]>, rowColumnIds: readonly string[]): string | null => {
  const draggedColumnId: unknown = event.item.data;

  if (typeof draggedColumnId === 'string' && rowColumnIds.includes(draggedColumnId)) {
    return draggedColumnId;
  }

  return rowColumnIds[event.previousIndex] ?? null;
};

/** Whether the event originated from an interactive descendant of the current target. */
export const originatesFromInteractiveDescendant = (event: Event): boolean => {
  const target = event.target;
  const currentTarget = event.currentTarget;

  if (!(target instanceof Element) || !(currentTarget instanceof Element)) {
    return false;
  }

  const interactive = target.closest(ROW_ACTIVATE_INTERACTIVE_SELECTOR);

  if (!interactive) {
    return false;
  }

  return interactive !== currentTarget && currentTarget.contains(interactive);
};

/** Scrolls `element` just into view horizontally within `scrollContainer`. */
export const scrollElementHorizontallyIntoView = (scrollContainer: HTMLElement, element: HTMLElement): void => {
  const containerRect = scrollContainer.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  if (elementRect.left < containerRect.left) {
    scrollContainer.scrollLeft -= containerRect.left - elementRect.left;

    return;
  }

  if (elementRect.right > containerRect.right) {
    scrollContainer.scrollLeft += elementRect.right - containerRect.right;
  }
};
