import type { Column } from '@tanstack/angular-table';

import { buildColumnWidths, buildHeaderWidths, normalizeMetaDimension } from './column-render-width.util';
import type { TableColumnSizingState } from '../common/column-render.type';

type FixtureRow = Record<string, unknown>;

/** Minimal Column stub exposing only `id`, `getSize()`, and `columnDef.{minSize,maxSize}` — the only properties these utils read. */
const createColumn = (
  id: string,
  size: number,
  columnDef: { readonly minSize?: number; readonly maxSize?: number } = {}
): Column<FixtureRow, unknown> =>
  ({
    id,
    getSize: () => size,
    columnDef
  }) as unknown as Column<FixtureRow, unknown>;

describe('FEATURE: column render-width utilities', () => {
  describe('GIVEN: normalizeMetaDimension', () => {
    describe('WHEN: the value is undefined', () => {
      it('THEN: it returns null', () => {
        expect(normalizeMetaDimension(undefined)).toBeNull();
      });
    });

    describe('WHEN: the value is a positive finite number', () => {
      it('THEN: it returns a rounded pixel string', () => {
        expect(normalizeMetaDimension(42.6)).toBe('43px');
      });
    });

    describe('WHEN: the value is a negative number', () => {
      it('THEN: it returns null', () => {
        expect(normalizeMetaDimension(-5)).toBeNull();
      });
    });

    describe('WHEN: the value is NaN', () => {
      it('THEN: it returns null', () => {
        expect(normalizeMetaDimension(NaN)).toBeNull();
      });
    });

    describe('WHEN: the value is a non-empty string', () => {
      it('THEN: it returns the trimmed string as-is', () => {
        expect(normalizeMetaDimension(' 10rem ')).toBe('10rem');
      });
    });

    describe('WHEN: the value is a whitespace-only string', () => {
      it('THEN: it returns null', () => {
        expect(normalizeMetaDimension('   ')).toBeNull();
      });
    });
  });

  describe('GIVEN: buildColumnWidths', () => {
    describe('WHEN: there is no sizing and no resized width', () => {
      it('THEN: width, minWidth, and maxWidth are all null', () => {
        const column = createColumn('price', 100);

        expect(buildColumnWidths(column, undefined, undefined, {})).toStrictEqual({ width: null, minWidth: null, maxWidth: null });
      });
    });

    describe('WHEN: sizing declares an explicit size with no resized width', () => {
      it('THEN: width uses the column own size, ignoring the widths map', () => {
        const column = createColumn('price', 120);
        const sizing: TableColumnSizingState = { hasSize: true, hasMinSize: false, hasMaxSize: false };

        expect(buildColumnWidths(column, sizing, undefined, { price: 9999 })).toStrictEqual({
          width: '120px',
          minWidth: '120px',
          maxWidth: '120px'
        });
      });
    });

    describe('WHEN: a resized width is present and the widths map has a matching entry', () => {
      it('THEN: width uses the widths map value', () => {
        const column = createColumn('price', 999);

        expect(buildColumnWidths(column, undefined, 150, { price: 150 })).toStrictEqual({
          width: '150px',
          minWidth: '150px',
          maxWidth: '150px'
        });
      });
    });

    describe('WHEN: a resized width is present but the widths map is missing the entry', () => {
      it('THEN: width falls back to the column own size', () => {
        const column = createColumn('price', 88);

        expect(buildColumnWidths(column, undefined, 150, {}).width).toBe('88px');
      });
    });

    describe('WHEN: sizing declares an explicit min size', () => {
      it('THEN: minWidth uses the column def value independent of width', () => {
        const column = createColumn('price', 999, { minSize: 40 });
        const sizing: TableColumnSizingState = { hasSize: false, hasMinSize: true, hasMaxSize: false };

        expect(buildColumnWidths(column, sizing, undefined, {})).toStrictEqual({ width: null, minWidth: '40px', maxWidth: null });
      });
    });

    describe('WHEN: sizing declares hasMinSize but the column def omits minSize', () => {
      it('THEN: minWidth resolves to null even though width itself is defined', () => {
        // NOTE: `resolveSizedDimension` takes the explicit-bound branch whenever
        // hasMinSize is true, calling `normalizeColumnDimension(column.columnDef.minSize)`
        // directly instead of falling back to the resolved width. When minSize is
        // undefined that normalizes to null, not to the (perfectly valid) width. In
        // practice hasMinSize is only ever true when minSize was set upstream
        // (getUserColumnSizing derives it from the same columnDef), so this combination
        // should be unreachable via the real column pipeline - locked defensively.
        const column = createColumn('price', 999, {});
        const sizing: TableColumnSizingState = { hasSize: false, hasMinSize: true, hasMaxSize: false };

        expect(buildColumnWidths(column, sizing, 150, { price: 150 })).toStrictEqual({
          width: '150px',
          minWidth: null,
          maxWidth: '150px'
        });
      });
    });

    describe('WHEN: sizing declares an explicit max size', () => {
      it('THEN: maxWidth uses the column def value independent of width', () => {
        const column = createColumn('price', 999, { maxSize: 300 });
        const sizing: TableColumnSizingState = { hasSize: false, hasMinSize: false, hasMaxSize: true };

        expect(buildColumnWidths(column, sizing, undefined, {})).toStrictEqual({ width: null, minWidth: null, maxWidth: '300px' });
      });
    });

    describe('WHEN: a resized width is present but sizing reports hasSize as false', () => {
      it('THEN: the resized width alone is still enough to produce an explicit width', () => {
        const column = createColumn('price', 999, {});
        const sizing: TableColumnSizingState = { hasSize: false, hasMinSize: false, hasMaxSize: false };

        expect(buildColumnWidths(column, sizing, 77, { price: 77 })).toStrictEqual({
          width: '77px',
          minWidth: '77px',
          maxWidth: '77px'
        });
      });
    });
  });

  describe('GIVEN: buildHeaderWidths', () => {
    describe('WHEN: a resized dimension is provided', () => {
      it('THEN: header width, min, and max all use the resized dimension regardless of meta', () => {
        const meta = { headerSize: 999, headerMinSize: 10, headerMaxSize: 20 };

        expect(buildHeaderWidths(meta, '150px')).toStrictEqual({
          headerWidth: '150px',
          headerMinWidth: '150px',
          headerMaxWidth: '150px'
        });
      });
    });

    describe('WHEN: there is no resized dimension and no meta', () => {
      it('THEN: header width, min, and max all resolve to null', () => {
        expect(buildHeaderWidths(undefined, null)).toStrictEqual({ headerWidth: null, headerMinWidth: null, headerMaxWidth: null });
      });
    });

    describe('WHEN: there is no resized dimension and meta declares only a header size', () => {
      it('THEN: header min and max both default to the resolved header width', () => {
        const meta = { headerSize: 100 };

        expect(buildHeaderWidths(meta, null)).toStrictEqual({
          headerWidth: '100px',
          headerMinWidth: '100px',
          headerMaxWidth: '100px'
        });
      });
    });

    describe('WHEN: meta declares an explicit headerMinSize', () => {
      it('THEN: header min width uses the meta value independent of the header width', () => {
        const meta = { headerSize: 100, headerMinSize: 20 };

        const result = buildHeaderWidths(meta, null);

        expect(result.headerWidth).toBe('100px');
        expect(result.headerMinWidth).toBe('20px');
      });
    });

    describe('WHEN: meta declares an explicit headerMaxSize', () => {
      it('THEN: header max width uses the meta value independent of the header width', () => {
        const meta = { headerSize: 100, headerMaxSize: 300 };

        const result = buildHeaderWidths(meta, null);

        expect(result.headerWidth).toBe('100px');
        expect(result.headerMaxWidth).toBe('300px');
      });
    });
  });
});
