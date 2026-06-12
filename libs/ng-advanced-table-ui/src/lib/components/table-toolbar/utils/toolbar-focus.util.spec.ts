import {
  buildNatToolbarFocusStops,
  resolveNatToolbarNavigationTarget,
} from './toolbar-focus.util';
import type { NatToolbarFocusStopItem } from '../common/toolbar-focus.type';

describe('buildNatToolbarFocusStops', () => {
  const items: NatToolbarFocusStopItem[] = [
    { id: 'e1', position: 'end' },
    { id: 'c1', position: 'center' },
    { id: 's1', position: 'start' },
    { id: 'e2', position: 'end' },
    { id: 'c2', position: 'center' },
    { id: 's2', position: 'start' },
  ];

  it('orders stops visually: start, center, then end group — each in registry order', () => {
    expect(buildNatToolbarFocusStops(items)).toEqual(['s1', 's2', 'c1', 'c2', 'e1', 'e2']);
  });

  it('returns an empty list without items', () => {
    expect(buildNatToolbarFocusStops([])).toEqual([]);
  });
});

describe('resolveNatToolbarNavigationTarget', () => {
  const stops = ['a', 'b', 'c', 'd'];

  it('Home targets the first stop, End targets the last stop', () => {
    expect(resolveNatToolbarNavigationTarget({ stops, activeId: 'b', key: 'Home' })).toBe('a');
    expect(resolveNatToolbarNavigationTarget({ stops, activeId: 'b', key: 'End' })).toBe('d');
  });

  it('ArrowRight moves forward and wraps in LTR', () => {
    expect(resolveNatToolbarNavigationTarget({ stops, activeId: 'a', key: 'ArrowRight' })).toBe(
      'b',
    );
    expect(resolveNatToolbarNavigationTarget({ stops, activeId: 'd', key: 'ArrowRight' })).toBe(
      'a',
    );
  });

  it('ArrowLeft moves backward and wraps in LTR', () => {
    expect(resolveNatToolbarNavigationTarget({ stops, activeId: 'b', key: 'ArrowLeft' })).toBe('a');
    expect(resolveNatToolbarNavigationTarget({ stops, activeId: 'a', key: 'ArrowLeft' })).toBe('d');
  });

  it('flips arrow direction in RTL (visual right = previous stop)', () => {
    expect(
      resolveNatToolbarNavigationTarget({ stops, activeId: 'b', key: 'ArrowRight', isRtl: true }),
    ).toBe('a');
    expect(
      resolveNatToolbarNavigationTarget({ stops, activeId: 'b', key: 'ArrowLeft', isRtl: true }),
    ).toBe('c');
  });

  it('targets the first stop when the active id is unknown or null', () => {
    expect(resolveNatToolbarNavigationTarget({ stops, activeId: 'gone', key: 'ArrowRight' })).toBe(
      'a',
    );
    expect(resolveNatToolbarNavigationTarget({ stops, activeId: null, key: 'ArrowLeft' })).toBe(
      'a',
    );
  });

  it('returns null for unhandled keys and empty stop lists', () => {
    expect(
      resolveNatToolbarNavigationTarget({ stops, activeId: 'a', key: 'ArrowDown' }),
    ).toBeNull();
    expect(
      resolveNatToolbarNavigationTarget({ stops: [], activeId: 'a', key: 'ArrowRight' }),
    ).toBeNull();
  });
});
