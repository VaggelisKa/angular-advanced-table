import { computeNatTableRowWindow } from './row-window.util';
import type { NatTableVirtualRangeContext } from '../common/table-virtualization.type';

const context = (overrides: Partial<NatTableVirtualRangeContext>): NatTableVirtualRangeContext => ({
  scrollOffset: 0,
  viewportSize: 200,
  rowHeight: 40,
  rowCount: 1000,
  currentRange: { start: 0, end: 0 },
  overscan: 5,
  subHeaderOffsets: [],
  ...overrides
});

/** Offsets for groups of `groupSize` rows: every `groupSize`-th row opens a sub-header. */
const groupedOffsets = (rowCount: number, groupSize: number): readonly number[] =>
  Array.from({ length: rowCount }, (_, index) => Math.floor(index / groupSize) + 1);

describe('FEATURE: virtualization row window', () => {
  describe('GIVEN: an unmounted window at the top of the data', () => {
    describe('WHEN: the window is computed at scroll offset zero', () => {
      it('THEN: it mounts the visible rows plus the trailing overscan', () => {
        expect(computeNatTableRowWindow(context({ rowCount: 100 }))).toStrictEqual({ start: 0, end: 10 });
      });
    });

    describe('WHEN: the mounted window already covers the visible rows and overscan', () => {
      it('THEN: it keeps the current range values', () => {
        expect(computeNatTableRowWindow(context({ rowCount: 100, currentRange: { start: 0, end: 10 } }))).toStrictEqual({
          start: 0,
          end: 10
        });
      });
    });
  });

  describe('GIVEN: a window mounted far from the scroll position', () => {
    describe('WHEN: the user scrolls far below the mounted window', () => {
      it('THEN: it re-centers around the visible rows with overscan on both sides', () => {
        expect(computeNatTableRowWindow(context({ scrollOffset: 4000, currentRange: { start: 0, end: 10 } }))).toStrictEqual({
          start: 95,
          end: 110
        });
      });
    });

    describe('WHEN: the user scrolls far above the mounted window', () => {
      it('THEN: it re-anchors the window to the top of the data', () => {
        expect(computeNatTableRowWindow(context({ scrollOffset: 0, currentRange: { start: 95, end: 110 } }))).toStrictEqual({
          start: 0,
          end: 10
        });
      });
    });
  });

  describe('GIVEN: a small scroll within the mounted overscan', () => {
    describe('WHEN: at least half the overscan stays mounted beyond both visible edges', () => {
      it('THEN: it returns the same range values without re-rendering', () => {
        expect(computeNatTableRowWindow(context({ scrollOffset: 4040, currentRange: { start: 95, end: 110 } }))).toStrictEqual({
          start: 95,
          end: 110
        });
      });
    });

    describe('WHEN: the mounted rows above the viewport drop below half the overscan', () => {
      it('THEN: it remounts the window around the visible rows in one batch', () => {
        expect(computeNatTableRowWindow(context({ scrollOffset: 3860, currentRange: { start: 95, end: 110 } }))).toStrictEqual({
          start: 91,
          end: 107
        });
      });
    });
  });

  describe('GIVEN: a data length that shrank below the mounted window', () => {
    describe('WHEN: the mounted end exceeds the new row count', () => {
      it('THEN: it re-anchors to the closest valid window within the data', () => {
        expect(
          computeNatTableRowWindow(context({ scrollOffset: 4000, rowCount: 50, currentRange: { start: 97, end: 110 } }))
        ).toStrictEqual({ start: 44, end: 50 });
      });
    });

    describe('WHEN: the row count becomes zero', () => {
      it('THEN: it collapses the window to an empty range', () => {
        expect(
          computeNatTableRowWindow(context({ scrollOffset: 600, rowCount: 0, currentRange: { start: 5, end: 15 } }))
        ).toStrictEqual({ start: 0, end: 0 });
      });
    });
  });

  describe('GIVEN: a scroll offset beyond the end of the content', () => {
    describe('WHEN: the stale window also exceeds the row count', () => {
      it('THEN: it clamps the window within the data', () => {
        expect(
          computeNatTableRowWindow(context({ scrollOffset: 10_000, rowCount: 20, currentRange: { start: 12, end: 22 } }))
        ).toStrictEqual({ start: 14, end: 20 });
      });
    });
  });

  describe('GIVEN: sub-header rows interleaved on the composite fixed grid', () => {
    describe('WHEN: the window is computed at scroll offset zero', () => {
      it('THEN: it counts the leading sub-header slot toward the visible span', () => {
        // Groups of 10: slot(i) = i + floor(i / 10) + 1. The 200px viewport
        // covers slots 0..4 — one sub-header plus data rows 0..3.
        expect(computeNatTableRowWindow(context({ rowCount: 100, subHeaderOffsets: groupedOffsets(100, 10) }))).toStrictEqual({
          start: 0,
          end: 9
        });
      });
    });

    describe('WHEN: the user scrolls to a slot occupied by a sub-header row', () => {
      it('THEN: it anchors the window on that sub-header group-opening data row', () => {
        // Slot 11 holds the second group's sub-header; its opening data row 10
        // sits at slot 12, so row 10 is the first visible logical row.
        expect(
          computeNatTableRowWindow(context({ scrollOffset: 11 * 40, rowCount: 100, subHeaderOffsets: groupedOffsets(100, 10) }))
        ).toStrictEqual({ start: 5, end: 19 });
      });
    });

    describe('WHEN: the user scrolls deep into grouped data', () => {
      it('THEN: it maps composite slots back to logical row indexes', () => {
        // Offset 4000 = slot 100. With groups of 10, data row i occupies slot
        // i + floor(i / 10) + 1, so the first visible logical row is 90.
        expect(
          computeNatTableRowWindow(context({ scrollOffset: 4000, rowCount: 1000, subHeaderOffsets: groupedOffsets(1000, 10) }))
        ).toStrictEqual({ start: 85, end: 100 });
      });
    });
  });
});
