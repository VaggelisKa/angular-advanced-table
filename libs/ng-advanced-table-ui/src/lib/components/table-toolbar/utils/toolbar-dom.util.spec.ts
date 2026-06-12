import { vi } from 'vitest';

import { moveNatToolbarNodeBefore } from './toolbar-dom.util';

type MoveBeforeCarrier = { moveBefore?: (node: Node, child: Node | null) => void };

describe('moveNatToolbarNodeBefore', () => {
  let parent: HTMLElement;
  let nodeA: HTMLElement;
  let nodeB: HTMLElement;

  beforeEach(() => {
    parent = document.createElement('div');
    nodeA = document.createElement('button');
    nodeB = document.createElement('button');
    parent.append(nodeA, nodeB);
    document.body.appendChild(parent);
  });

  afterEach(() => {
    parent.remove();
    delete (Element.prototype as MoveBeforeCarrier).moveBefore;
  });

  it('falls back to insertBefore when moveBefore is unavailable (jsdom)', () => {
    moveNatToolbarNodeBefore(parent, nodeB, nodeA);

    expect(Array.from(parent.children)).toEqual([nodeB, nodeA]);
  });

  it('appends to the end when ref is null', () => {
    moveNatToolbarNodeBefore(parent, nodeA, null);

    expect(Array.from(parent.children)).toEqual([nodeB, nodeA]);
  });

  it('restores focus when the moved node owned document.activeElement', () => {
    nodeB.focus();
    expect(document.activeElement).toBe(nodeB);

    moveNatToolbarNodeBefore(parent, nodeB, nodeA);

    expect(document.activeElement).toBe(nodeB);
  });

  it('restores focus when a descendant of the moved node owned focus', () => {
    const inner = document.createElement('input');
    nodeB.appendChild(inner);
    inner.focus();
    expect(document.activeElement).toBe(inner);

    moveNatToolbarNodeBefore(parent, nodeB, nodeA);

    expect(document.activeElement).toBe(inner);
  });

  it('does not touch focus when it was outside the moved subtree', () => {
    nodeA.focus();
    const focusSpy = vi.spyOn(nodeA, 'focus');

    moveNatToolbarNodeBefore(parent, nodeB, nodeA);

    expect(focusSpy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(nodeA);
  });

  it('prefers moveBefore when available on the parent', () => {
    const moveBefore = vi.fn(function (this: HTMLElement, node: Node, child: Node | null) {
      this.insertBefore(node, child);
    });
    (Element.prototype as MoveBeforeCarrier).moveBefore = moveBefore;

    moveNatToolbarNodeBefore(parent, nodeB, nodeA);

    expect(moveBefore).toHaveBeenCalledWith(nodeB, nodeA);
    expect(Array.from(parent.children)).toEqual([nodeB, nodeA]);
  });

  it('skips moveBefore for a parentless node (initial insert, not a move)', () => {
    const moveBefore = vi.fn();
    (Element.prototype as MoveBeforeCarrier).moveBefore = moveBefore;
    const detached = document.createElement('button');

    moveNatToolbarNodeBefore(parent, detached, null);

    expect(moveBefore).not.toHaveBeenCalled();
    expect(detached.parentElement).toBe(parent);
  });

  it('falls back to insertBefore when moveBefore throws', () => {
    (Element.prototype as MoveBeforeCarrier).moveBefore = vi.fn(() => {
      throw new DOMException('hierarchy', 'HierarchyRequestError');
    });

    moveNatToolbarNodeBefore(parent, nodeB, nodeA);

    expect(Array.from(parent.children)).toEqual([nodeB, nodeA]);
  });
});
