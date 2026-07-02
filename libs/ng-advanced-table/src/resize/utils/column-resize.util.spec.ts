import type { Column, ColumnSizingState } from '@tanstack/angular-table';

import { clampColumnSizingWidths, clampWidth, computeKeyboardResizeWidth, getColumnResizeBounds } from './column-resize.util';
import type { TableColumnSizingState } from '../../common/column-render.type';
import { DEFAULT_MIN_COLUMN_WIDTH, RESIZE_KEYBOARD_STEP, RESIZE_KEYBOARD_STEP_LARGE } from '../column-resize.const';

type FixtureRow = Record<string, unknown>;

/** Minimal Column stub exposing only `id` and `columnDef.{minSize,maxSize}`, the only properties these utils read. */
const createColumn = (
  id: string,
  columnDef: { readonly minSize?: number; readonly maxSize?: number } = {}
): Column<FixtureRow, unknown> =>
  ({
    id,
    columnDef
  }) as unknown as Column<FixtureRow, unknown>;

describe('FEATURE: column resize utilities', () => {
  describe('GIVEN: getColumnResizeBounds', () => {
    describe('WHEN: no user override exists for the column', () => {
      it('THEN: it uses the default minimum width and leaves max unbounded', () => {
        const column = createColumn('price');

        expect(getColumnResizeBounds(column, {})).toStrictEqual({ min: DEFAULT_MIN_COLUMN_WIDTH, max: null });
      });
    });

    describe('WHEN: the user explicitly set a minimum size for the column', () => {
      it('THEN: it honours the column def minimum size', () => {
        const column = createColumn('price', { minSize: 30 });
        const userColumnSizing: Record<string, TableColumnSizingState> = {
          price: { hasSize: false, hasMinSize: true, hasMaxSize: false }
        };

        expect(getColumnResizeBounds(column, userColumnSizing)).toStrictEqual({ min: 30, max: null });
      });
    });

    describe('WHEN: the override flag is set but the column def declares no minSize', () => {
      it('THEN: it falls back to the default minimum width', () => {
        const column = createColumn('price');
        const userColumnSizing: Record<string, TableColumnSizingState> = {
          price: { hasSize: false, hasMinSize: true, hasMaxSize: false }
        };

        expect(getColumnResizeBounds(column, userColumnSizing)).toStrictEqual({ min: DEFAULT_MIN_COLUMN_WIDTH, max: null });
      });
    });

    describe('WHEN: the explicit minSize is fractional', () => {
      it('THEN: it rounds the minimum to the nearest integer', () => {
        const column = createColumn('price', { minSize: 30.6 });
        const userColumnSizing: Record<string, TableColumnSizingState> = {
          price: { hasSize: false, hasMinSize: true, hasMaxSize: false }
        };

        expect(getColumnResizeBounds(column, userColumnSizing).min).toBe(31);
      });
    });

    describe('WHEN: the explicit minSize is negative', () => {
      it('THEN: it floors the minimum at one', () => {
        const column = createColumn('price', { minSize: -10 });
        const userColumnSizing: Record<string, TableColumnSizingState> = {
          price: { hasSize: false, hasMinSize: true, hasMaxSize: false }
        };

        expect(getColumnResizeBounds(column, userColumnSizing).min).toBe(1);
      });
    });

    describe('WHEN: a custom default minWidth argument is supplied', () => {
      it('THEN: it uses the supplied default instead of the library constant', () => {
        const column = createColumn('price');

        expect(getColumnResizeBounds(column, {}, 20).min).toBe(20);
      });
    });

    describe('WHEN: the column def maxSize is Infinity', () => {
      it('THEN: it treats the maximum as unbounded', () => {
        const column = createColumn('price', { maxSize: Infinity });

        expect(getColumnResizeBounds(column, {}).max).toBeNull();
      });
    });

    describe('WHEN: the column def maxSize equals Number.MAX_SAFE_INTEGER', () => {
      it('THEN: it treats the TanStack sentinel default as unbounded', () => {
        const column = createColumn('price', { maxSize: Number.MAX_SAFE_INTEGER });

        expect(getColumnResizeBounds(column, {}).max).toBeNull();
      });
    });

    describe('WHEN: the column def maxSize is a finite fractional number', () => {
      it('THEN: it rounds the maximum to the nearest integer', () => {
        const column = createColumn('price', { maxSize: 500.4 });

        expect(getColumnResizeBounds(column, {}).max).toBe(500);
      });
    });

    describe('WHEN: the column def maxSize is NaN', () => {
      it('THEN: it treats the maximum as unbounded', () => {
        const column = createColumn('price', { maxSize: NaN });

        expect(getColumnResizeBounds(column, {}).max).toBeNull();
      });
    });

    describe('WHEN: the explicit minSize is NaN', () => {
      it('THEN: it falls back to the safe default minimum width instead of leaking NaN through', () => {
        // A NaN minSize is guarded with `Number.isFinite` (matching the maxSize path)
        // so it falls back to the default minimum width rather than producing `min: NaN`.
        const column = createColumn('price', { minSize: NaN });
        const userColumnSizing: Record<string, TableColumnSizingState> = {
          price: { hasSize: false, hasMinSize: true, hasMaxSize: false }
        };

        expect(getColumnResizeBounds(column, userColumnSizing).min).toBe(DEFAULT_MIN_COLUMN_WIDTH);
      });
    });
  });

  describe('GIVEN: clampWidth', () => {
    describe('WHEN: the width is already within bounds', () => {
      it('THEN: it returns the width unchanged', () => {
        expect(clampWidth(100, { min: 50, max: 200 })).toBe(100);
      });
    });

    describe('WHEN: the width is below the minimum', () => {
      it('THEN: it clamps up to the minimum', () => {
        expect(clampWidth(10, { min: 50, max: 200 })).toBe(50);
      });
    });

    describe('WHEN: the width is above the maximum', () => {
      it('THEN: it clamps down to the maximum', () => {
        expect(clampWidth(500, { min: 50, max: 200 })).toBe(200);
      });
    });

    describe('WHEN: the bounds declare no maximum', () => {
      it('THEN: it applies no upper clamp', () => {
        expect(clampWidth(1000, { min: 50, max: null })).toBe(1000);
      });
    });

    describe('WHEN: the width is fractional', () => {
      it('THEN: it rounds half up to the nearest integer', () => {
        expect(clampWidth(55.5, { min: 10, max: 100 })).toBe(56);
      });
    });

    describe('WHEN: the minimum is zero and the width is negative', () => {
      it('THEN: it still floors the result at one', () => {
        expect(clampWidth(-10, { min: 0, max: null })).toBe(1);
      });
    });

    describe('WHEN: the bounds minimum exceeds the bounds maximum', () => {
      it('THEN: it resolves to the minimum, silently ignoring the smaller maximum', () => {
        // NOTE: a misconfigured `min > max` bound pair always resolves to `min`
        // regardless of `width`, because `Math.min(max, width)` is clamped a second
        // time by the outer `Math.max(min, ...)`. Locked as-is; callers are expected
        // to never construct bounds where min exceeds max.
        expect(clampWidth(70, { min: 100, max: 50 })).toBe(100);
      });
    });

    describe('WHEN: the bounds minimum is NaN', () => {
      it('THEN: it ignores the NaN lower bound and returns the width floored at one', () => {
        // A NaN min is treated as "no lower bound", so the width passes through and the
        // universal floor-at-one applies instead of propagating NaN.
        expect(clampWidth(100, { min: NaN, max: null })).toBe(100);
      });
    });
  });

  describe('GIVEN: computeKeyboardResizeWidth', () => {
    describe('WHEN: ArrowRight is pressed in a left-to-right layout', () => {
      it('THEN: it steps the width larger by the keyboard step', () => {
        const next = computeKeyboardResizeWidth({ key: 'ArrowRight', current: 100, min: 0, max: null, isRtl: false });

        expect(next).toBe(100 + RESIZE_KEYBOARD_STEP);
      });
    });

    describe('WHEN: ArrowLeft is pressed in a left-to-right layout', () => {
      it('THEN: it steps the width smaller by the keyboard step', () => {
        const next = computeKeyboardResizeWidth({ key: 'ArrowLeft', current: 100, min: 0, max: null, isRtl: false });

        expect(next).toBe(100 - RESIZE_KEYBOARD_STEP);
      });
    });

    describe('WHEN: ArrowRight is pressed in a right-to-left layout', () => {
      it('THEN: it steps the width smaller because the inline edge is flipped', () => {
        const next = computeKeyboardResizeWidth({ key: 'ArrowRight', current: 100, min: 0, max: null, isRtl: true });

        expect(next).toBe(100 - RESIZE_KEYBOARD_STEP);
      });
    });

    describe('WHEN: ArrowLeft is pressed in a right-to-left layout', () => {
      it('THEN: it steps the width larger because the inline edge is flipped', () => {
        const next = computeKeyboardResizeWidth({ key: 'ArrowLeft', current: 100, min: 0, max: null, isRtl: true });

        expect(next).toBe(100 + RESIZE_KEYBOARD_STEP);
      });
    });

    describe('WHEN: Home is pressed', () => {
      it('THEN: it jumps directly to the minimum', () => {
        const next = computeKeyboardResizeWidth({ key: 'Home', current: 150, min: 40, max: 200, isRtl: false });

        expect(next).toBe(40);
      });
    });

    describe('WHEN: End is pressed and an explicit maximum exists', () => {
      it('THEN: it jumps directly to the maximum', () => {
        const next = computeKeyboardResizeWidth({ key: 'End', current: 50, min: 0, max: 300, isRtl: false });

        expect(next).toBe(300);
      });
    });

    describe('WHEN: End is pressed and no maximum is set', () => {
      it('THEN: it jumps by the large keyboard step past the current width', () => {
        const next = computeKeyboardResizeWidth({ key: 'End', current: 50, min: 0, max: null, isRtl: false });

        expect(next).toBe(50 + RESIZE_KEYBOARD_STEP_LARGE);
      });
    });

    describe('WHEN: ArrowRight would step past the maximum', () => {
      it('THEN: it clamps the result to the maximum', () => {
        const next = computeKeyboardResizeWidth({ key: 'ArrowRight', current: 195, min: 0, max: 200, isRtl: false });

        expect(next).toBe(200);
      });
    });

    describe('WHEN: ArrowLeft would step below the minimum', () => {
      it('THEN: it clamps the result to the minimum', () => {
        const next = computeKeyboardResizeWidth({ key: 'ArrowLeft', current: 5, min: 10, max: 100, isRtl: false });

        expect(next).toBe(10);
      });
    });

    describe('WHEN: the key is not a resize shortcut', () => {
      it('THEN: it returns null', () => {
        const next = computeKeyboardResizeWidth({ key: 'PageUp', current: 100, min: 0, max: 200, isRtl: false });

        expect(next).toBeNull();
      });
    });
  });

  describe('GIVEN: clampColumnSizingWidths', () => {
    describe('WHEN: the sizing state is empty', () => {
      it('THEN: it returns the same object reference', () => {
        const sizing: ColumnSizingState = {};

        const result = clampColumnSizingWidths(
          sizing,
          () => undefined,
          (_column, width) => width
        );

        expect(result).toBe(sizing);
      });
    });

    describe('WHEN: none of the clamped widths change', () => {
      it('THEN: it returns the same object reference', () => {
        const columns = [createColumn('a'), createColumn('b')];
        const sizing: ColumnSizingState = { a: 100, b: 200 };
        const getColumn = (id: string): Column<FixtureRow, unknown> | undefined => columns.find((column) => column.id === id);

        const result = clampColumnSizingWidths(sizing, getColumn, (_column, width) => width);

        expect(result).toBe(sizing);
      });
    });

    describe('WHEN: a column id cannot be resolved to a live column', () => {
      it('THEN: it leaves that entry untouched while still clamping resolvable entries', () => {
        const columns = [createColumn('a')];
        const sizing: ColumnSizingState = { a: 500, b: 9999 };
        const getColumn = (id: string): Column<FixtureRow, unknown> | undefined => columns.find((column) => column.id === id);

        const result = clampColumnSizingWidths(sizing, getColumn, (_column, width) => Math.min(width, 300));

        expect(result).toStrictEqual({ a: 300, b: 9999 });
        expect(result).not.toBe(sizing);
      });
    });

    describe('WHEN: a single entry is clamped to a new width', () => {
      it('THEN: it returns a new object with only that entry updated', () => {
        const columns = [createColumn('a'), createColumn('b')];
        const sizing: ColumnSizingState = { a: 100, b: 100 };
        const getColumn = (id: string): Column<FixtureRow, unknown> | undefined => columns.find((column) => column.id === id);

        const result = clampColumnSizingWidths(sizing, getColumn, (column, width) => (column.id === 'b' ? 250 : width));

        expect(result).toStrictEqual({ a: 100, b: 250 });
        expect(result).not.toBe(sizing);
      });
    });

    describe('WHEN: every entry is clamped to a new width', () => {
      it('THEN: it returns a new object reflecting every updated entry', () => {
        const columns = [createColumn('a'), createColumn('b'), createColumn('c')];
        const sizing: ColumnSizingState = { a: 10, b: 20, c: 30 };
        const getColumn = (id: string): Column<FixtureRow, unknown> | undefined => columns.find((column) => column.id === id);

        const result = clampColumnSizingWidths(sizing, getColumn, (_column, width) => width + 1);

        expect(result).toStrictEqual({ a: 11, b: 21, c: 31 });
        expect(result).not.toBe(sizing);
      });
    });
  });
});
