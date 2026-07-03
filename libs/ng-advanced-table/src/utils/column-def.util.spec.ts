import type { ColumnDef } from '@tanstack/angular-table';

import {
  getColumnDefLeafIds,
  getNumericColumnWidth,
  getUserColumnSizing,
  normalizeCellMaxLines,
  normalizeColumnDimension,
  readColumnEntry
} from './column-def.util';
import { DEFAULT_CELL_MAX_LINES } from '../common/column-meta.const';

type FixtureRow = { readonly id: string };

/** Minimal ColumnDef shape: only the fields read by `resolveColumnDefId` and the sizing hints. */
type FixtureColumnDef = {
  readonly id?: string;
  readonly accessorKey?: string;
  readonly header?: string | (() => string);
  readonly columns?: readonly FixtureColumnDef[];
  readonly size?: number;
  readonly minSize?: number;
  readonly maxSize?: number;
};

const asColumnDefs = (defs: readonly FixtureColumnDef[]): ColumnDef<FixtureRow, unknown>[] =>
  defs as unknown as ColumnDef<FixtureRow, unknown>[];

describe('FEATURE: Column definition utilities', () => {
  describe('GIVEN: readColumnEntry', () => {
    it('THEN: it returns the value stored at the given column id', () => {
      expect(readColumnEntry({ a: 1, b: 2 }, 'a')).toBe(1);
    });

    it('THEN: it returns undefined when the column id is not present in the record', () => {
      expect(readColumnEntry({ a: 1 }, 'ghost')).toBeUndefined();
    });

    it('THEN: it returns a falsy stored value instead of treating it as missing', () => {
      expect(readColumnEntry({ a: 0 }, 'a')).toBe(0);
      expect(readColumnEntry({ a: '' }, 'a')).toBe('');
      expect(readColumnEntry({ a: false }, 'a')).toBe(false);
    });
  });

  describe('GIVEN: getColumnDefLeafIds', () => {
    it('THEN: it returns the ids of flat leaf columns in declaration order', () => {
      const columns = asColumnDefs([{ id: 'a' }, { id: 'b' }]);

      expect(getColumnDefLeafIds(columns)).toStrictEqual(['a', 'b']);
    });

    it('THEN: it falls back to accessorKey when a column has no explicit id', () => {
      const columns = asColumnDefs([{ accessorKey: 'name' }]);

      expect(getColumnDefLeafIds(columns)).toStrictEqual(['name']);
    });

    it('THEN: it falls back to a string header when neither id nor accessorKey is set', () => {
      const columns = asColumnDefs([{ header: 'Name' }]);

      expect(getColumnDefLeafIds(columns)).toStrictEqual(['Name']);
    });

    it('THEN: it omits a column that has no id, accessorKey, or string header', () => {
      const columns = asColumnDefs([{ header: (): string => 'Name' }]);

      expect(getColumnDefLeafIds(columns)).toStrictEqual([]);
    });

    it('THEN: it recurses into grouped columns and returns only their leaf ids, not the group id', () => {
      const columns = asColumnDefs([{ id: 'group', columns: [{ id: 'a' }, { id: 'b' }] }]);

      expect(getColumnDefLeafIds(columns)).toStrictEqual(['a', 'b']);
    });

    it('THEN: it recurses through multiple levels of nested groups', () => {
      const columns = asColumnDefs([{ id: 'g1', columns: [{ id: 'g2', columns: [{ id: 'a' }] }] }]);

      expect(getColumnDefLeafIds(columns)).toStrictEqual(['a']);
    });

    it('THEN: it treats a group column with an empty columns array as its own leaf', () => {
      const columns = asColumnDefs([{ id: 'group', columns: [] }]);

      expect(getColumnDefLeafIds(columns)).toStrictEqual(['group']);
    });

    it('THEN: it flattens leaf ids across a mix of flat and grouped top-level columns', () => {
      const columns = asColumnDefs([{ id: 'a' }, { id: 'group', columns: [{ id: 'b' }, { id: 'c' }] }, { accessorKey: 'd' }]);

      expect(getColumnDefLeafIds(columns)).toStrictEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('GIVEN: getUserColumnSizing', () => {
    it('THEN: it reports which sizing hints were explicitly provided per column', () => {
      const columns = asColumnDefs([{ id: 'a', size: 100 }, { id: 'b' }]);

      expect(getUserColumnSizing(columns)).toStrictEqual({
        a: { hasSize: true, hasMinSize: false, hasMaxSize: false },
        b: { hasSize: false, hasMinSize: false, hasMaxSize: false }
      });
    });

    it('THEN: it treats an explicit zero size as provided rather than missing', () => {
      const columns = asColumnDefs([{ id: 'a', size: 0 }]);

      expect(getUserColumnSizing(columns)).toStrictEqual({
        a: { hasSize: true, hasMinSize: false, hasMaxSize: false }
      });
    });

    it('THEN: it recurses into grouped columns and merges their leaf sizing, omitting the group itself', () => {
      const columns = asColumnDefs([{ id: 'group', columns: [{ id: 'a', size: 50 }] }]);

      expect(getUserColumnSizing(columns)).toStrictEqual({
        a: { hasSize: true, hasMinSize: false, hasMaxSize: false }
      });
    });

    it('THEN: it skips a column that resolves to no usable id', () => {
      const columns = asColumnDefs([{ header: (): string => 'Name' }]);

      expect(getUserColumnSizing(columns)).toStrictEqual({});
    });

    it('THEN: it treats a group column with an empty columns array as its own sizable leaf', () => {
      const columns = asColumnDefs([{ id: 'group', columns: [], size: 10 }]);

      expect(getUserColumnSizing(columns)).toStrictEqual({
        group: { hasSize: true, hasMinSize: false, hasMaxSize: false }
      });
    });

    it('THEN: it keeps the first column sizing when a later column resolves to the same id', () => {
      // First declaration wins: the earlier column's `hasSize: true` is preserved
      // rather than being clobbered by the later duplicate.
      const columns = asColumnDefs([
        { id: 'dup', size: 10 },
        { id: 'dup', minSize: 5 }
      ]);

      expect(getUserColumnSizing(columns)).toStrictEqual({
        dup: { hasSize: true, hasMinSize: false, hasMaxSize: false }
      });
    });
  });

  describe('GIVEN: normalizeColumnDimension', () => {
    it('THEN: it converts a positive integer to a rounded pixel string', () => {
      expect(normalizeColumnDimension(100)).toBe('100px');
    });

    it('THEN: it rounds a fractional number before appending the pixel unit', () => {
      expect(normalizeColumnDimension(100.6)).toBe('101px');
    });

    it('THEN: it treats zero as a valid width', () => {
      expect(normalizeColumnDimension(0)).toBe('0px');
    });

    it('THEN: it returns null for a negative number', () => {
      expect(normalizeColumnDimension(-10)).toBeNull();
    });

    it('THEN: it returns null for a non-finite number', () => {
      expect(normalizeColumnDimension(Infinity)).toBeNull();
    });

    it('THEN: it returns a non-numeric CSS value trimmed but otherwise unchanged', () => {
      expect(normalizeColumnDimension('  50%  ')).toBe('50%');
    });

    it('THEN: it returns null for a whitespace-only string', () => {
      expect(normalizeColumnDimension('   ')).toBeNull();
    });

    it('THEN: it returns null when the value is undefined', () => {
      expect(normalizeColumnDimension(undefined)).toBeNull();
    });
  });

  describe('GIVEN: normalizeCellMaxLines', () => {
    it('THEN: it floors a fractional value of at least 1', () => {
      expect(normalizeCellMaxLines(3.7)).toBe(3);
    });

    it('THEN: it accepts the boundary value of exactly 1', () => {
      expect(normalizeCellMaxLines(1)).toBe(1);
    });

    it('THEN: it returns null for Infinity, treating it as an unlimited line count', () => {
      expect(normalizeCellMaxLines(Infinity)).toBeNull();
    });

    it('THEN: it falls back to the default line count for a value below 1', () => {
      expect(normalizeCellMaxLines(0)).toBe(DEFAULT_CELL_MAX_LINES);
    });

    it('THEN: it falls back to the default line count for a negative value', () => {
      expect(normalizeCellMaxLines(-5)).toBe(DEFAULT_CELL_MAX_LINES);
    });

    it('THEN: it falls back to the default line count for NaN', () => {
      expect(normalizeCellMaxLines(Number.NaN)).toBe(DEFAULT_CELL_MAX_LINES);
    });

    it('THEN: it falls back to the default line count for negative Infinity', () => {
      // Only a positive non-finite value (+Infinity) means "unlimited". -Infinity is
      // not a usable line count, so it deliberately falls back to the default like any
      // other out-of-range value.
      expect(normalizeCellMaxLines(-Infinity)).toBe(DEFAULT_CELL_MAX_LINES);
    });
  });

  describe('GIVEN: getNumericColumnWidth', () => {
    it('THEN: it rounds a fractional positive number', () => {
      expect(getNumericColumnWidth(100.4)).toBe(100);
    });

    it('THEN: it returns null for a negative number', () => {
      expect(getNumericColumnWidth(-10)).toBeNull();
    });

    it('THEN: it returns null for a non-finite number', () => {
      expect(getNumericColumnWidth(Infinity)).toBeNull();
    });

    it('THEN: it parses a pixel string and rounds the numeric part', () => {
      expect(getNumericColumnWidth('100.5px')).toBe(101);
    });

    it('THEN: it matches the pixel unit case-insensitively', () => {
      expect(getNumericColumnWidth('100PX')).toBe(100);
    });

    it('THEN: it trims surrounding whitespace before matching', () => {
      expect(getNumericColumnWidth('  100px  ')).toBe(100);
    });

    it('THEN: it returns null for a string without a pixel unit', () => {
      expect(getNumericColumnWidth('100')).toBeNull();
    });

    it('THEN: it returns null for a non-numeric string', () => {
      expect(getNumericColumnWidth('abc')).toBeNull();
    });

    it('THEN: it returns null for a negative pixel string since the pattern excludes a sign', () => {
      expect(getNumericColumnWidth('-100px')).toBeNull();
    });

    it('THEN: it returns null when the value is undefined', () => {
      expect(getNumericColumnWidth(undefined)).toBeNull();
    });
  });
});
