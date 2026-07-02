/* eslint-disable max-lines -- dense ARIA cell-interaction keyboard matrix */
import { handleCellInteractionFocusIn, handleCellInteractionKeydown } from './cell-interaction.util';
import type { NatTableKeyboard } from '../../hotkey-a11y/common/keybindings.type';
import { NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from '../cell-interaction.const';

/** Mirrors the default keybindings' cell-interaction shortcuts (Enter / Escape / Tab / Shift+Tab). */
const cellInteraction: NatTableKeyboard['cellInteraction'] = {
  enter: (event) => event.key === 'Enter',
  exit: (event) => event.key === 'Escape',
  next: (event) => event.key === 'Tab' && !event.shiftKey,
  previous: (event) => event.key === 'Tab' && event.shiftKey
};

/**
 * Builds a grid cell attached to `document.body` so `.focus()` and `.closest()`
 * behave like production, where `@angular/aria` maintains a roving tabindex on
 * every cell (mirrored here with `tabIndex = -1`).
 */
const buildCell = (innerHtml: string, role: 'gridcell' | 'columnheader' = 'gridcell'): HTMLElement => {
  const cell = document.createElement(role === 'columnheader' ? 'th' : 'td');

  cell.setAttribute('role', role);
  cell.tabIndex = -1;
  cell.innerHTML = innerHtml;
  document.body.appendChild(cell);

  return cell;
};

/**
 * Dispatches a real keydown on `dispatchTarget` and routes it through
 * `handleCellInteractionKeydown` via a listener bound to `listenElement`
 * (mirrors the directive binding the handler on the cell root).
 */
const pressKeydown = (
  listenElement: HTMLElement,
  dispatchTarget: HTMLElement,
  key: string,
  modifiers: Partial<KeyboardEventInit> = {}
): { readonly handled: boolean; readonly event: KeyboardEvent } => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers });
  let handled = false;

  const listener = (nativeEvent: Event): void => {
    handled = handleCellInteractionKeydown(nativeEvent as KeyboardEvent, cellInteraction);
  };

  listenElement.addEventListener('keydown', listener);
  dispatchTarget.dispatchEvent(event);
  listenElement.removeEventListener('keydown', listener);

  return { handled, event };
};

/** Dispatches a real focusin on `dispatchTarget`, routed through `handleCellInteractionFocusIn`. */
const fireFocusIn = (listenElement: HTMLElement, dispatchTarget: HTMLElement): boolean => {
  const event = new FocusEvent('focusin', { bubbles: true });
  let handled = false;

  const listener = (nativeEvent: Event): void => {
    handled = handleCellInteractionFocusIn(nativeEvent as FocusEvent);
  };

  listenElement.addEventListener('focusin', listener);
  dispatchTarget.dispatchEvent(event);
  listenElement.removeEventListener('focusin', listener);

  return handled;
};

describe('FEATURE: NatTable cell-interaction keyboard model', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('GIVEN: Enter steps into a cell first control', () => {
    describe('WHEN: the cell has no interactive controls', () => {
      it('THEN: it does not handle the event, leaving row activation to run', () => {
        const cell = buildCell('Plain text');
        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: the cell has a single control and Enter is pressed on the cell', () => {
      it('THEN: it focuses the control and prevents the native Enter behavior', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const control = cell.querySelector('#only') as HTMLElement;
        const { handled, event } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(control);
        expect(event.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN: the cell has multiple controls and Enter is pressed on the cell', () => {
      it('THEN: it focuses the first control in document order', () => {
        const cell = buildCell('<button id="first" type="button">Edit</button><button id="second" type="button">Delete</button>');
        const first = cell.querySelector('#first') as HTMLElement;
        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(first);
      });
    });

    describe('WHEN: Enter is pressed while focus is already on a control inside the cell', () => {
      it('THEN: it leaves Enter with its native behavior on the control', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const control = cell.querySelector('#only') as HTMLElement;

        control.focus();
        const { handled } = pressKeydown(cell, control, 'Enter');

        expect(handled).toBe(false);
      });
    });
  });

  describe('GIVEN: Escape returns focus from a control to its cell', () => {
    describe('WHEN: Escape is pressed while focus is already on the cell', () => {
      it('THEN: it does not handle the event', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const { handled } = pressKeydown(cell, cell, 'Escape');

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: Escape is pressed on a control inside a multi-control cell', () => {
      it('THEN: it moves focus back to the cell and prevents the native Escape behavior', () => {
        const cell = buildCell('<button id="first" type="button">Edit</button><button id="second" type="button">Delete</button>');
        const first = cell.querySelector('#first') as HTMLElement;

        first.focus();
        const { handled, event } = pressKeydown(cell, first, 'Escape');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(cell);
        expect(event.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN: Escape is pressed on a cell single delegated control', () => {
      it('THEN: it leaves focus on the control instead of bouncing back to the cell', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const control = cell.querySelector('#only') as HTMLElement;

        control.focus();
        const { handled } = pressKeydown(cell, control, 'Escape');

        expect(handled).toBe(false);
        expect(document.activeElement).toBe(control);
      });
    });
  });

  describe('GIVEN: Tab and Shift+Tab walk a cell controls', () => {
    describe('WHEN: Tab is pressed while focus is on the cell itself', () => {
      it('THEN: it does not intercept Tab, letting focus leave the grid', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const { handled } = pressKeydown(cell, cell, 'Tab');

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: Tab is pressed on the first of two controls', () => {
      it('THEN: it moves focus to the next control and prevents native Tab', () => {
        const cell = buildCell('<button id="first" type="button">Edit</button><button id="second" type="button">Delete</button>');
        const first = cell.querySelector('#first') as HTMLElement;
        const second = cell.querySelector('#second') as HTMLElement;

        first.focus();
        const { handled, event } = pressKeydown(cell, first, 'Tab');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(second);
        expect(event.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN: Tab is pressed on the last of two controls', () => {
      it('THEN: it does not intercept Tab, letting focus leave the grid instead of wrapping', () => {
        const cell = buildCell('<button id="first" type="button">Edit</button><button id="second" type="button">Delete</button>');
        const second = cell.querySelector('#second') as HTMLElement;

        second.focus();
        const { handled } = pressKeydown(cell, second, 'Tab');

        expect(handled).toBe(false);
        expect(document.activeElement).toBe(second);
      });
    });

    describe('WHEN: Shift+Tab is pressed on the first of two controls', () => {
      it('THEN: it does not intercept Shift+Tab, letting focus leave the grid instead of wrapping', () => {
        const cell = buildCell('<button id="first" type="button">Edit</button><button id="second" type="button">Delete</button>');
        const first = cell.querySelector('#first') as HTMLElement;

        first.focus();
        const { handled } = pressKeydown(cell, first, 'Tab', { shiftKey: true });

        expect(handled).toBe(false);
        expect(document.activeElement).toBe(first);
      });
    });

    describe('WHEN: Shift+Tab is pressed on the second of two controls', () => {
      it('THEN: it moves focus back to the previous control', () => {
        const cell = buildCell('<button id="first" type="button">Edit</button><button id="second" type="button">Delete</button>');
        const first = cell.querySelector('#first') as HTMLElement;
        const second = cell.querySelector('#second') as HTMLElement;

        second.focus();
        const { handled } = pressKeydown(cell, second, 'Tab', { shiftKey: true });

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(first);
      });
    });

    describe('WHEN: Tab is pressed on an element inside the cell that is not a recognized control', () => {
      it('THEN: it does not handle the event', () => {
        const cell = buildCell('<div id="stray" tabindex="0">Stray focusable</div><button id="only" type="button">Edit</button>');
        const stray = cell.querySelector('#stray') as HTMLElement;

        stray.focus();
        const { handled } = pressKeydown(cell, stray, 'Tab');

        expect(handled).toBe(false);
      });
    });
  });

  describe('GIVEN: keydown guard clauses short-circuit before routing', () => {
    describe('WHEN: the event already has its default prevented by an earlier handler', () => {
      it('THEN: it does not process the event', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const control = cell.querySelector('#only') as HTMLElement;
        let handled = true;

        const preventer = (nativeEvent: Event): void => nativeEvent.preventDefault();
        const listener = (nativeEvent: Event): void => {
          handled = handleCellInteractionKeydown(nativeEvent as KeyboardEvent, cellInteraction);
        };

        cell.addEventListener('keydown', preventer);
        cell.addEventListener('keydown', listener);
        control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        cell.removeEventListener('keydown', preventer);
        cell.removeEventListener('keydown', listener);

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: the event target is not an HTMLElement', () => {
      it('THEN: it does not handle the event', () => {
        let handled = true;
        const listener = (nativeEvent: Event): void => {
          handled = handleCellInteractionKeydown(nativeEvent as KeyboardEvent, cellInteraction);
        };

        document.addEventListener('keydown', listener);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        document.removeEventListener('keydown', listener);

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: the target has no enclosing grid cell', () => {
      it('THEN: it does not handle the event', () => {
        const outside = document.createElement('button');

        outside.type = 'button';
        document.body.appendChild(outside);
        const { handled } = pressKeydown(outside, outside, 'Enter');

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: a key outside the cell-interaction shortcuts is pressed', () => {
      it('THEN: it does not handle the event', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const control = cell.querySelector('#only') as HTMLElement;

        control.focus();
        const { handled } = pressKeydown(cell, control, 'ArrowDown');

        expect(handled).toBe(false);
      });
    });
  });

  describe('GIVEN: a handled keydown stops propagation, an unhandled one does not', () => {
    describe('WHEN: the event is handled by the cell-interaction model', () => {
      it('THEN: it stops the event from reaching an ancestor listener', () => {
        const container = document.createElement('div');

        document.body.appendChild(container);
        const cell = buildCell('<button id="only" type="button">Edit</button>');

        container.appendChild(cell);

        let ancestorCalled = false;

        container.addEventListener('keydown', () => {
          ancestorCalled = true;
        });

        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(true);
        expect(ancestorCalled).toBe(false);
      });
    });

    describe('WHEN: the event is not handled by the cell-interaction model', () => {
      it('THEN: it lets the event continue to an ancestor listener', () => {
        const container = document.createElement('div');

        document.body.appendChild(container);
        const cell = buildCell('');

        container.appendChild(cell);

        let ancestorCalled = false;

        container.addEventListener('keydown', () => {
          ancestorCalled = true;
        });

        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(false);
        expect(ancestorCalled).toBe(true);
      });
    });
  });

  describe('GIVEN: only reachable controls count toward the cell control list', () => {
    describe('WHEN: a disabled control precedes an enabled one', () => {
      it('THEN: Enter skips the disabled control and focuses the enabled one', () => {
        const cell = buildCell(
          '<button id="disabled-btn" type="button" disabled>Locked</button><button id="enabled-btn" type="button">Edit</button>'
        );
        const enabledBtn = cell.querySelector('#enabled-btn') as HTMLElement;
        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(enabledBtn);
      });
    });

    describe('WHEN: a control is removed from the tab order without a managed-widget opt-out', () => {
      it('THEN: Enter skips it and focuses the next reachable control', () => {
        const cell = buildCell(
          '<button id="untabbable" type="button" tabindex="-1">Hidden stop</button><button id="reachable" type="button">Edit</button>'
        );
        const reachable = cell.querySelector('#reachable') as HTMLElement;
        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(reachable);
      });
    });

    describe('WHEN: a tabindex=-1 control opts in with the ngGridCellWidget attribute', () => {
      it('THEN: Enter treats it as reachable and focuses it', () => {
        const cell = buildCell('<button id="widget" type="button" tabindex="-1" ngGridCellWidget>Edit</button>');
        const widget = cell.querySelector('#widget') as HTMLElement;
        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(widget);
      });
    });

    describe('WHEN: a tabindex=-1 control opts in with the managed-widget attribute', () => {
      it('THEN: Enter treats it as reachable and focuses it', () => {
        const cell = buildCell(
          `<button id="widget" type="button" tabindex="-1" ${NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE}>Edit</button>`
        );
        const widget = cell.querySelector('#widget') as HTMLElement;
        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(widget);
      });
    });

    describe('WHEN: a control sits inside an aria-hidden subtree', () => {
      it('THEN: Enter skips it and focuses the next reachable control', () => {
        const cell = buildCell(
          '<span aria-hidden="true"><button id="hidden-btn" type="button">Ghost</button></span><button id="reachable" type="button">Edit</button>'
        );
        const reachable = cell.querySelector('#reachable') as HTMLElement;
        const { handled } = pressKeydown(cell, cell, 'Enter');

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(reachable);
      });
    });
  });

  describe('GIVEN: focusin delegates to a cell single arrow-safe control', () => {
    describe('WHEN: the cell renders only a single arrow-safe control', () => {
      it('THEN: it redirects focus to that control', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const control = cell.querySelector('#only') as HTMLElement;
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(control);
      });
    });

    describe('WHEN: a columnheader cell renders only a single arrow-safe control', () => {
      it('THEN: it redirects focus to that control', () => {
        const cell = buildCell('<button id="sort" type="button">Sort</button>', 'columnheader');
        const control = cell.querySelector('#sort') as HTMLElement;
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(control);
      });
    });

    describe('WHEN: the cell sole control is a checkbox input', () => {
      it('THEN: it redirects focus to the checkbox', () => {
        const cell = buildCell('<input id="select-row" type="checkbox" />');
        const control = cell.querySelector('#select-row') as HTMLElement;
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(control);
      });
    });

    describe('WHEN: only whitespace text nodes surround the single control', () => {
      it('THEN: it still redirects focus to the control', () => {
        const cell = buildCell('  \n  <button id="only" type="button">Edit</button>  \n  ');
        const control = cell.querySelector('#only') as HTMLElement;
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(control);
      });
    });

    describe('WHEN: extra text next to the single control is hidden from assistive technology', () => {
      it('THEN: it still redirects focus to the control', () => {
        const cell = buildCell('<span aria-hidden="true">Status:</span><button id="only" type="button">Edit</button>');
        const control = cell.querySelector('#only') as HTMLElement;
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(true);
        expect(document.activeElement).toBe(control);
      });
    });
  });

  describe('GIVEN: focusin does not delegate outside the single-control rule', () => {
    describe('WHEN: focus lands directly on a control instead of the cell', () => {
      it('THEN: it does not redirect focus', () => {
        const cell = buildCell('<button id="only" type="button">Edit</button>');
        const control = cell.querySelector('#only') as HTMLElement;
        const handled = fireFocusIn(cell, control);

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: the cell has perceivable text outside its single control', () => {
      it('THEN: it does not redirect focus, keeping the Enter-to-interact model', () => {
        const cell = buildCell('Status: <button id="only" type="button">Active</button>');
        const control = cell.querySelector('#only') as HTMLElement;
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(false);
        expect(document.activeElement).not.toBe(control);
      });
    });

    describe('WHEN: the cell sole control is a text input outside the delegated allowlist', () => {
      it('THEN: it does not redirect focus, keeping arrow keys native to the input', () => {
        const cell = buildCell('<input id="search" type="text" />');
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: the cell renders two controls', () => {
      it('THEN: it does not redirect focus', () => {
        const cell = buildCell('<button id="first" type="button">Edit</button><button id="second" type="button">Delete</button>');
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: the cell renders no controls', () => {
      it('THEN: it does not redirect focus', () => {
        const cell = buildCell('Plain text');
        const handled = fireFocusIn(cell, cell);

        expect(handled).toBe(false);
      });
    });

    describe('WHEN: the focusin target is not an HTMLElement', () => {
      it('THEN: it does not redirect focus', () => {
        let handled = true;
        const listener = (nativeEvent: Event): void => {
          handled = handleCellInteractionFocusIn(nativeEvent as FocusEvent);
        };

        document.addEventListener('focusin', listener);
        document.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        document.removeEventListener('focusin', listener);

        expect(handled).toBe(false);
      });
    });
  });
});
