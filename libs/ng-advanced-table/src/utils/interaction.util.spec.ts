import type { CdkDragDrop } from '@angular/cdk/drag-drop';

import type { CellContext, Column, Header } from '@tanstack/angular-table';

import {
  canResizeColumn,
  getCellTone,
  isColumnResizable,
  isResizeKey,
  originatesFromInteractiveDescendant,
  resolveDraggedColumnId,
  scrollElementHorizontallyIntoView
} from './interaction.util';
import { NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from '../cell-interaction/cell-interaction.const';
import type { NatTableCellTone } from '../common/column-meta.type';

/** Minimal row shape shared by the column/header stubs below. */
type Row = { readonly id: string; readonly amount: number };

const createColumn = (enableResizing?: boolean): Column<Row, unknown> =>
  ({ columnDef: { enableResizing } }) as unknown as Column<Row, unknown>;

const createHeader = (options: { readonly isPlaceholder?: boolean; readonly enableResizing?: boolean }): Header<Row, unknown> =>
  ({
    isPlaceholder: options.isPlaceholder ?? false,
    column: createColumn(options.enableResizing)
  }) as unknown as Header<Row, unknown>;

const createToneColumn = (cellTone?: (context: CellContext<Row, unknown>) => NatTableCellTone | null): Column<Row, unknown> =>
  ({ columnDef: { meta: cellTone ? { cellTone } : undefined } }) as unknown as Column<Row, unknown>;

const createCellContext = (amount: number): CellContext<Row, unknown> =>
  ({ row: { original: { id: 'row-1', amount } } }) as unknown as CellContext<Row, unknown>;

const createDropEvent = (data: unknown, previousIndex: number): CdkDragDrop<string[]> =>
  ({ item: { data }, previousIndex }) as unknown as CdkDragDrop<string[]>;

/**
 * Attaches a real listener to `cell`, dispatches a bubbling click from `origin`, and runs
 * `originatesFromInteractiveDescendant` synchronously inside the handler — `currentTarget` is
 * only valid for the duration of dispatch, so the guard cannot be evaluated after the fact.
 */
const dispatchFromWithin = (cell: HTMLElement, origin: HTMLElement): boolean => {
  let result = false;
  const handler = (event: Event): void => {
    result = originatesFromInteractiveDescendant(event);
  };

  cell.addEventListener('click', handler);
  origin.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  cell.removeEventListener('click', handler);

  return result;
};

const mockRect = (element: HTMLElement, left: number, right: number): void => {
  element.getBoundingClientRect = (): DOMRect => ({ left, right }) as DOMRect;
};

describe('FEATURE: interaction utilities', () => {
  describe('GIVEN: isResizeKey', () => {
    describe('WHEN: the key is a horizontal arrow-step key', () => {
      it('THEN: it reports the key as a resize key', () => {
        expect(isResizeKey(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))).toBe(true);
        expect(isResizeKey(new KeyboardEvent('keydown', { key: 'ArrowRight' }))).toBe(true);
      });
    });

    describe('WHEN: the key is a bounds-jump key', () => {
      it('THEN: it reports the key as a resize key', () => {
        expect(isResizeKey(new KeyboardEvent('keydown', { key: 'Home' }))).toBe(true);
        expect(isResizeKey(new KeyboardEvent('keydown', { key: 'End' }))).toBe(true);
      });
    });

    describe('WHEN: the key has nothing to do with resizing', () => {
      it('THEN: it reports the key as not a resize key', () => {
        expect(isResizeKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false);
      });
    });
  });

  describe('GIVEN: isColumnResizable', () => {
    describe('WHEN: the column def leaves resizing unset and the surface enables resizing', () => {
      it('THEN: it falls back to the surface enabler (resizable)', () => {
        expect(isColumnResizable(createColumn(undefined), true)).toBe(true);
      });
    });

    describe('WHEN: the column def leaves resizing unset and the surface disables resizing', () => {
      it('THEN: it falls back to the surface enabler (not resizable)', () => {
        expect(isColumnResizable(createColumn(undefined), false)).toBe(false);
      });
    });

    describe('WHEN: the column opts out with enableResizing false while the surface is on', () => {
      it('THEN: the column flag overrides the surface (not resizable)', () => {
        expect(isColumnResizable(createColumn(false), true)).toBe(false);
      });
    });

    describe('WHEN: the column opts in with enableResizing true while the surface is off', () => {
      it('THEN: the column flag overrides the surface (resizable)', () => {
        expect(isColumnResizable(createColumn(true), false)).toBe(true);
      });
    });
  });

  describe('GIVEN: canResizeColumn', () => {
    describe('WHEN: the header is not a placeholder and its column opts in while the surface is off', () => {
      it('THEN: it reports the header as resizable', () => {
        expect(canResizeColumn(createHeader({ enableResizing: true }), false)).toBe(true);
      });
    });

    describe('WHEN: the header is a placeholder', () => {
      it('THEN: it reports the header as not resizable even if the column opts in', () => {
        expect(canResizeColumn(createHeader({ isPlaceholder: true, enableResizing: true }), true)).toBe(false);
      });
    });

    describe('WHEN: the header column opts out of resizing while the surface is on', () => {
      it('THEN: it reports the header as not resizable', () => {
        expect(canResizeColumn(createHeader({ enableResizing: false }), true)).toBe(false);
      });
    });

    describe('WHEN: the header column leaves resizing unset and the surface is off', () => {
      it('THEN: it falls back to the surface enabler (not resizable)', () => {
        expect(canResizeColumn(createHeader({}), false)).toBe(false);
      });
    });
  });

  describe('GIVEN: getCellTone', () => {
    describe('WHEN: the column meta defines a cellTone callback', () => {
      it('THEN: it returns the tone resolved from the cell context', () => {
        const column = createToneColumn((context) => (context.row.original.amount < 0 ? 'negative' : 'positive'));

        expect(getCellTone(column, createCellContext(-5))).toBe('negative');
      });
    });

    describe('WHEN: the cellTone callback explicitly returns null', () => {
      it('THEN: it returns null', () => {
        const column = createToneColumn(() => null);

        expect(getCellTone(column, createCellContext(5))).toBeNull();
      });
    });

    describe('WHEN: the column meta declares no cellTone callback', () => {
      it('THEN: it returns null', () => {
        const column = createToneColumn(undefined);

        expect(getCellTone(column, createCellContext(5))).toBeNull();
      });
    });
  });

  describe('GIVEN: resolveDraggedColumnId', () => {
    describe('WHEN: the drag data is a column id present in the row', () => {
      it('THEN: it returns the dragged column id', () => {
        expect(resolveDraggedColumnId(createDropEvent('amount', 0), ['id', 'amount', 'actions'])).toBe('amount');
      });
    });

    describe('WHEN: the drag data is not a string', () => {
      it('THEN: it falls back to the row column slot at the previous index', () => {
        expect(resolveDraggedColumnId(createDropEvent(42, 1), ['id', 'amount', 'actions'])).toBe('amount');
      });
    });

    describe('WHEN: the drag data is a string absent from the row', () => {
      it('THEN: it falls back to the row column slot at the previous index', () => {
        expect(resolveDraggedColumnId(createDropEvent('missing', 2), ['id', 'amount', 'actions'])).toBe('actions');
      });
    });

    describe('WHEN: the drag data is invalid and the previous index is out of bounds', () => {
      it('THEN: it returns null', () => {
        expect(resolveDraggedColumnId(createDropEvent('missing', 9), ['id', 'amount'])).toBeNull();
      });
    });
  });

  describe('GIVEN: originatesFromInteractiveDescendant', () => {
    describe('WHEN: the click target is a button descendant', () => {
      it('THEN: it reports the event as originating from an interactive descendant', () => {
        const cell = document.createElement('div');
        const button = document.createElement('button');

        cell.appendChild(button);

        expect(dispatchFromWithin(cell, button)).toBe(true);
      });
    });

    describe('WHEN: the click target is a link descendant', () => {
      it('THEN: it reports the event as originating from an interactive descendant', () => {
        const cell = document.createElement('div');
        const link = document.createElement('a');

        link.href = '#';
        cell.appendChild(link);

        expect(dispatchFromWithin(cell, link)).toBe(true);
      });
    });

    describe('WHEN: the click target is an input descendant', () => {
      it('THEN: it reports the event as originating from an interactive descendant', () => {
        const cell = document.createElement('div');
        const input = document.createElement('input');

        cell.appendChild(input);

        expect(dispatchFromWithin(cell, input)).toBe(true);
      });
    });

    describe('WHEN: the click target is a contenteditable descendant', () => {
      it('THEN: it reports the event as originating from an interactive descendant', () => {
        const cell = document.createElement('div');
        const editable = document.createElement('div');

        editable.setAttribute('contenteditable', 'true');
        cell.appendChild(editable);

        expect(dispatchFromWithin(cell, editable)).toBe(true);
      });
    });

    describe('WHEN: the click target only carries the managed-cell-widget attribute', () => {
      it('THEN: it reports the event as not interactive (that attribute is a separate focus-delegation mechanism)', () => {
        const cell = document.createElement('div');
        const widget = document.createElement('div');

        widget.setAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE, '');
        cell.appendChild(widget);

        expect(dispatchFromWithin(cell, widget)).toBe(false);
      });
    });

    describe('WHEN: the click target has no interactive ancestor at all', () => {
      it('THEN: it reports the event as not interactive', () => {
        const cell = document.createElement('div');
        const span = document.createElement('span');

        cell.appendChild(span);

        expect(dispatchFromWithin(cell, span)).toBe(false);
      });
    });

    describe('WHEN: the nearest interactive match is an ancestor outside the current target', () => {
      it('THEN: it reports the event as not interactive', () => {
        const outerButton = document.createElement('button');
        const cell = document.createElement('div');
        const span = document.createElement('span');

        outerButton.appendChild(cell);
        cell.appendChild(span);

        expect(dispatchFromWithin(cell, span)).toBe(false);
      });
    });

    describe('WHEN: the interactive element found is the current target itself', () => {
      it('THEN: it reports the event as not interactive', () => {
        const button = document.createElement('button');

        expect(dispatchFromWithin(button, button)).toBe(false);
      });
    });

    describe('WHEN: the event target or current target is not a DOM Element', () => {
      it('THEN: it reports the event as not interactive', () => {
        const fakeEvent = { target: null, currentTarget: document.createElement('div') } as unknown as Event;

        expect(originatesFromInteractiveDescendant(fakeEvent)).toBe(false);
      });
    });
  });

  describe('GIVEN: scrollElementHorizontallyIntoView', () => {
    describe('WHEN: the element sits left of the visible container', () => {
      it('THEN: it scrolls left by the difference between the edges', () => {
        const container = document.createElement('div');
        const element = document.createElement('div');

        mockRect(container, 100, 500);
        container.scrollLeft = 50;
        mockRect(element, 60, 140);

        scrollElementHorizontallyIntoView(container, element);

        expect(container.scrollLeft).toBe(10);
      });
    });

    describe('WHEN: the element sits right of the visible container', () => {
      it('THEN: it scrolls right by the difference between the edges', () => {
        const container = document.createElement('div');
        const element = document.createElement('div');

        mockRect(container, 100, 500);
        container.scrollLeft = 50;
        mockRect(element, 520, 600);

        scrollElementHorizontallyIntoView(container, element);

        expect(container.scrollLeft).toBe(150);
      });
    });

    describe('WHEN: the element is already fully within the container', () => {
      it('THEN: it leaves the scroll position unchanged', () => {
        const container = document.createElement('div');
        const element = document.createElement('div');

        mockRect(container, 100, 500);
        container.scrollLeft = 50;
        mockRect(element, 150, 450);

        scrollElementHorizontallyIntoView(container, element);

        expect(container.scrollLeft).toBe(50);
      });
    });
  });
});
