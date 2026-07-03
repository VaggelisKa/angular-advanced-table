import type { Column, ColumnSizingState } from '@tanstack/angular-table';

import { computeFillFlexWidths, computeIntrinsicWidths, resolveIntrinsicColumnWidth } from './column-width.util';
import type { TableColumnSizingState } from '../common/column-render.type';

type FixtureRow = Record<string, unknown>;

/** Minimal Column stub exposing only `id` and `getSize()`, the only properties these utils read directly. */
const createColumn = (id: string, size: number): Column<FixtureRow, unknown> =>
  ({
    id,
    getSize: () => size
  }) as unknown as Column<FixtureRow, unknown>;

describe('FEATURE: column width utilities', () => {
  describe('GIVEN: computeFillFlexWidths', () => {
    it('THEN: it clamps each resized width and never consults the flex-distribution deps when every visible column already has a resized width', () => {
      const columns = [createColumn('a', 999), createColumn('b', 999)];
      const columnSizing: ColumnSizingState = { a: 120, b: 80 };

      const widths = computeFillFlexWidths(columns, columnSizing, {
        container: 1,
        clamp: (_column, width) => width,
        getBounds: () => {
          throw new Error('getBounds must not run when there are no flex columns');
        },
        getColumn: () => {
          throw new Error('getColumn must not run when there are no flex columns');
        }
      });

      expect(widths).toStrictEqual({ a: 120, b: 80 });
    });

    describe('WHEN: pinned and flex columns share a container with an even surplus', () => {
      it('THEN: it distributes the surplus across flex columns proportional to their weight', () => {
        const columns = [createColumn('a', 999), createColumn('b', 100), createColumn('c', 300)];
        const columnSizing: ColumnSizingState = { a: 150 };
        const bounds = new Map([
          ['b', { min: 48, max: null }],
          ['c', { min: 48, max: null }]
        ]);

        const widths = computeFillFlexWidths(columns, columnSizing, {
          container: 746,
          clamp: (_column, width) => width,
          getBounds: (column) => bounds.get(column.id) ?? { min: 48, max: null },
          getColumn: (id) => columns.find((column) => column.id === id)
        });

        expect(widths).toStrictEqual({ a: 150, b: 173, c: 423 });
      });
    });

    describe('WHEN: the surplus does not divide evenly across equal-weight flex columns', () => {
      it('THEN: it gives the last flex column the exact rounding remainder', () => {
        const columns = [createColumn('x', 100), createColumn('y', 100), createColumn('z', 100)];

        const widths = computeFillFlexWidths(
          columns,
          {},
          {
            container: 10,
            clamp: (_column, width) => width,
            getBounds: () => ({ min: 0, max: null }),
            getColumn: (id) => columns.find((column) => column.id === id)
          }
        );

        expect(widths).toStrictEqual({ x: 3, y: 3, z: 4 });
      });
    });

    describe('WHEN: the container is smaller than the pinned and flex minimums combined', () => {
      it('THEN: flex columns receive exactly their minimum width', () => {
        const columns = [createColumn('a', 100)];

        const widths = computeFillFlexWidths(
          columns,
          {},
          {
            container: 10,
            clamp: (_column, width) => width,
            getBounds: () => ({ min: 48, max: null }),
            getColumn: (id) => columns.find((column) => column.id === id)
          }
        );

        expect(widths).toStrictEqual({ a: 48 });
      });
    });

    describe('WHEN: a flex column reports a zero size', () => {
      it('THEN: its weight floors to one so it still receives a nonzero share of the surplus', () => {
        const columns = [createColumn('a', 0), createColumn('b', 100)];

        const widths = computeFillFlexWidths(
          columns,
          {},
          {
            container: 101,
            clamp: (_column, width) => width,
            getBounds: () => ({ min: 0, max: null }),
            getColumn: (id) => columns.find((column) => column.id === id)
          }
        );

        expect(widths).toStrictEqual({ a: 1, b: 100 });
      });
    });

    describe('WHEN: a flex column declares an explicit maximum', () => {
      it('THEN: the distributed width is capped at the maximum and the excess surplus is dropped', () => {
        const columns = [createColumn('a', 100)];

        const widths = computeFillFlexWidths(
          columns,
          {},
          {
            container: 200,
            clamp: (_column, width) => width,
            getBounds: () => ({ min: 48, max: 60 }),
            getColumn: (id) => columns.find((column) => column.id === id)
          }
        );

        expect(widths).toStrictEqual({ a: 60 });
      });
    });

    describe('WHEN: getColumn cannot resolve a flex column during the max-bound lookup', () => {
      it('THEN: no cap is applied even though the column bounds declare a maximum', () => {
        const columns = [createColumn('a', 100)];

        const widths = computeFillFlexWidths(
          columns,
          {},
          {
            container: 200,
            clamp: (_column, width) => width,
            getBounds: () => ({ min: 48, max: 60 }),
            getColumn: () => undefined
          }
        );

        expect(widths).toStrictEqual({ a: 200 });
      });
    });

    it('THEN: it returns an empty widths record when there are no visible columns', () => {
      const widths = computeFillFlexWidths(
        [] as Column<FixtureRow, unknown>[],
        {},
        {
          container: 500,
          clamp: (_column, width) => width,
          getBounds: () => ({ min: 0, max: null }),
          getColumn: () => undefined
        }
      );

      expect(widths).toStrictEqual({});
    });

    describe('WHEN: one flex column reports a NaN size', () => {
      it('THEN: it floors the offending column weight to one so only that column is affected, not every flex column', () => {
        // A NaN size is guarded to the floor weight of 1, so it no longer poisons the
        // shared `totalWeight`. The other flex columns distribute the surplus normally:
        // with weights 1 (a) and 100 (b), min 10 each, and surplus 480, `a` gets its
        // min plus floor(480/101)=4 and `b` gets its min plus the remainder.
        const columns = [createColumn('a', NaN), createColumn('b', 100)];

        const widths = computeFillFlexWidths(
          columns,
          {},
          {
            container: 500,
            clamp: (_column, width) => width,
            getBounds: () => ({ min: 10, max: null }),
            getColumn: (id) => columns.find((column) => column.id === id)
          }
        );

        expect(widths).toStrictEqual({ a: 14, b: 486 });
      });
    });
  });

  describe('GIVEN: resolveIntrinsicColumnWidth', () => {
    it('THEN: it returns the clamped resized width when a resized width exists', () => {
      const column = createColumn('a', 999);

      const width = resolveIntrinsicColumnWidth(
        column,
        { measuredWidth: undefined, sizing: undefined, resizedWidth: 150, usesAuthoritativeLayout: false },
        (_col, w) => w + 5
      );

      expect(width).toBe(155);
    });

    it('THEN: it still takes the clamp branch because zero is not undefined when the resized width is zero', () => {
      const column = createColumn('a', 999);

      const width = resolveIntrinsicColumnWidth(
        column,
        { measuredWidth: undefined, sizing: undefined, resizedWidth: 0, usesAuthoritativeLayout: false },
        (_col, w) => w + 1
      );

      expect(width).toBe(1);
    });

    describe('WHEN: layout is not authoritative and a positive measured width exists', () => {
      it('THEN: it returns the raw measured width unrounded', () => {
        // NOTE: confirmed intentional, not a bug - measuredWidth comes from
        // `getBoundingClientRect().width` (table-header-measurement.service.ts),
        // a genuinely subpixel DOM measurement. Preserving the fraction here avoids
        // rounding-induced ResizeObserver jitter; other branches use integer TanStack
        // sizing values and round deliberately.
        const column = createColumn('a', 999);

        const width = resolveIntrinsicColumnWidth(
          column,
          { measuredWidth: 123.7, sizing: undefined, resizedWidth: undefined, usesAuthoritativeLayout: false },
          (_col, w) => w
        );

        expect(width).toBe(123.7);
      });
    });

    describe('WHEN: layout is authoritative', () => {
      it('THEN: it ignores the measured width even when present', () => {
        const column = createColumn('a', 80);

        const width = resolveIntrinsicColumnWidth(
          column,
          { measuredWidth: 123.7, sizing: undefined, resizedWidth: undefined, usesAuthoritativeLayout: true },
          (_col, w) => w
        );

        expect(width).toBe(80);
      });
    });

    describe('WHEN: the measured width is zero', () => {
      it('THEN: it falls through to the sizing/def width', () => {
        const column = createColumn('a', 64);

        const width = resolveIntrinsicColumnWidth(
          column,
          { measuredWidth: 0, sizing: undefined, resizedWidth: undefined, usesAuthoritativeLayout: false },
          (_col, w) => w
        );

        expect(width).toBe(64);
      });
    });

    describe('WHEN: the measured width is negative', () => {
      it('THEN: it falls through to the sizing/def width', () => {
        const column = createColumn('a', 64);

        const width = resolveIntrinsicColumnWidth(
          column,
          { measuredWidth: -5, sizing: undefined, resizedWidth: undefined, usesAuthoritativeLayout: false },
          (_col, w) => w
        );

        expect(width).toBe(64);
      });
    });

    describe('WHEN: sizing declares an explicit size', () => {
      it('THEN: it returns the numeric column width derived from getSize', () => {
        const column = createColumn('a', 88.6);
        const sizing: TableColumnSizingState = { hasSize: true, hasMinSize: false, hasMaxSize: false };

        const width = resolveIntrinsicColumnWidth(
          column,
          { measuredWidth: undefined, sizing, resizedWidth: undefined, usesAuthoritativeLayout: false },
          (_col, w) => w
        );

        expect(width).toBe(89);
      });
    });

    describe('WHEN: sizing declares an explicit size but getSize is unusable', () => {
      it('THEN: it falls back to the rounded-floor default', () => {
        const column = createColumn('a', -20);
        const sizing: TableColumnSizingState = { hasSize: true, hasMinSize: false, hasMaxSize: false };

        const width = resolveIntrinsicColumnWidth(
          column,
          { measuredWidth: undefined, sizing, resizedWidth: undefined, usesAuthoritativeLayout: false },
          (_col, w) => w
        );

        expect(width).toBe(1);
      });
    });

    describe('WHEN: no sizing or measurement is available', () => {
      it('THEN: it falls back to the column own rounded size floored at one', () => {
        const column = createColumn('a', 0.2);

        const width = resolveIntrinsicColumnWidth(
          column,
          { measuredWidth: undefined, sizing: undefined, resizedWidth: undefined, usesAuthoritativeLayout: false },
          (_col, w) => w
        );

        expect(width).toBe(1);
      });
    });

    describe('WHEN: the column own getSize is NaN', () => {
      it('THEN: the floor-at-one default guards the NaN and resolves to one', () => {
        // A NaN getSize() is guarded so the "floor at one" safety net still applies
        // instead of propagating NaN through as the resolved width.
        const column = createColumn('a', NaN);

        const width = resolveIntrinsicColumnWidth(
          column,
          { measuredWidth: undefined, sizing: undefined, resizedWidth: undefined, usesAuthoritativeLayout: false },
          (_col, w) => w
        );

        expect(width).toBe(1);
      });
    });
  });

  describe('GIVEN: computeIntrinsicWidths', () => {
    describe('WHEN: visible columns mix resized, measured, and default sizing', () => {
      it('THEN: it builds a width per column id using each column own resolution path', () => {
        const columns = [createColumn('a', 999), createColumn('b', 999), createColumn('c', 130)];
        const columnSizing: ColumnSizingState = { a: 200 };

        const widths = computeIntrinsicWidths(columns, columnSizing, {
          measured: { b: 75.4 },
          userSizing: { c: { hasSize: true, hasMinSize: false, hasMaxSize: false } },
          usesAuthoritativeLayout: false,
          clamp: (_col, w) => w
        });

        expect(widths).toStrictEqual({ a: 200, b: 75.4, c: 130 });
      });
    });

    describe('WHEN: a column has no measured or user-sizing entry', () => {
      it('THEN: it resolves using only the default rounded-floor fallback', () => {
        const columns = [createColumn('d', 45.2)];

        const widths = computeIntrinsicWidths(
          columns,
          {},
          {
            measured: {},
            userSizing: {},
            usesAuthoritativeLayout: false,
            clamp: (_col, w) => w
          }
        );

        expect(widths).toStrictEqual({ d: 45 });
      });
    });
  });
});
