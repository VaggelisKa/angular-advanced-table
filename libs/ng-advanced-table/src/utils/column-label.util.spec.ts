import type { Column, ColumnDef, Header, HeaderGroup } from '@tanstack/angular-table';

import {
  getHeaderRowColumnIds,
  isPrimitiveHeaderContent,
  normalizeColumnLabel,
  resolveColumnLabel,
  shouldHidePrimitiveHeaderLabel
} from './column-label.util';

type FixtureRow = { readonly id: string };

/** Minimal Column stub: only `.id` and the `columnDef` fields `resolveColumnLabel` reads. */
const createColumn = (overrides: {
  readonly id?: string;
  readonly meta?: { readonly hiddenHeaderLabel?: string; readonly label?: string };
  readonly header?: unknown;
  readonly accessorKey?: string;
}): Column<FixtureRow, unknown> =>
  ({
    id: overrides.id ?? '',
    columnDef: {
      meta: overrides.meta,
      header: overrides.header,
      accessorKey: overrides.accessorKey
    }
  }) as unknown as Column<FixtureRow, unknown>;

/**
 * `isPrimitiveHeaderContent`'s declared parameter type (`ColumnDefTemplate | undefined`) never
 * includes `number`, even though its implementation checks `typeof header === 'number'` at
 * runtime. Cast to exercise that branch anyway - see the latent-inconsistency note in the report.
 */
const asHeader = (value: unknown): ColumnDef<FixtureRow, unknown>['header'] => value as ColumnDef<FixtureRow, unknown>['header'];

/** Minimal Header stub: only the nested `column.columnDef.header` field is read. */
const createHeader = (columnHeader: unknown): Header<FixtureRow, unknown> =>
  ({
    column: { columnDef: { header: columnHeader } }
  }) as unknown as Header<FixtureRow, unknown>;

/** Minimal HeaderGroup stub: only `isPlaceholder` and `column.id` are read. */
const createHeaderGroup = (headers: readonly { readonly isPlaceholder: boolean; readonly id: string }[]): HeaderGroup<FixtureRow> =>
  ({
    headers: headers.map((header) => ({ isPlaceholder: header.isPlaceholder, column: { id: header.id } }))
  }) as unknown as HeaderGroup<FixtureRow>;

describe('FEATURE: Column label utilities', () => {
  describe('GIVEN: normalizeColumnLabel', () => {
    it('THEN: it returns null when the label is undefined', () => {
      expect(normalizeColumnLabel(undefined)).toBeNull();
    });

    it('THEN: it returns null when the label is only whitespace', () => {
      expect(normalizeColumnLabel('   ')).toBeNull();
    });

    it('THEN: it returns the trimmed label when content is present', () => {
      expect(normalizeColumnLabel('  Name  ')).toBe('Name');
    });
  });

  describe('GIVEN: resolveColumnLabel', () => {
    it('THEN: it prefers the trimmed hiddenHeaderLabel over every other source', () => {
      const column = createColumn({ meta: { hiddenHeaderLabel: '  Hidden  ', label: 'Meta' }, header: 'Header' });

      expect(resolveColumnLabel(column)).toBe('Hidden');
    });

    it('THEN: it falls back to the meta label when there is no hiddenHeaderLabel', () => {
      const column = createColumn({ meta: { label: 'Meta' }, header: 'Header' });

      expect(resolveColumnLabel(column)).toBe('Meta');
    });

    it('THEN: it falls through past a whitespace-only meta label to the string header', () => {
      // The meta label is normalized like hiddenHeaderLabel, so a whitespace-only
      // label is treated as absent and the string header wins instead.
      const column = createColumn({ meta: { label: '   ' }, header: 'Header' });

      expect(resolveColumnLabel(column)).toBe('Header');
    });

    it('THEN: it falls back to a string header when there is no hiddenHeaderLabel or meta label', () => {
      const column = createColumn({ header: 'Header' });

      expect(resolveColumnLabel(column)).toBe('Header');
    });

    it('THEN: it treats an explicitly empty header as absent and falls back to the accessorKey', () => {
      // An empty/whitespace header is not a usable label, so it is normalized away
      // and the accessorKey fallback applies.
      const column = createColumn({ header: '', accessorKey: 'name' });

      expect(resolveColumnLabel(column)).toBe('name');
    });

    it('THEN: it falls back to the accessorKey when the header is not a string', () => {
      const column = createColumn({ header: () => 'Header', accessorKey: 'name' });

      expect(resolveColumnLabel(column)).toBe('name');
    });

    it('THEN: it falls back to the column id when there is no usable label source', () => {
      const column = createColumn({ id: 'colId' });

      expect(resolveColumnLabel(column)).toBe('colId');
    });

    it('THEN: it falls back to the literal Column label when the id is also empty', () => {
      const column = createColumn({ id: '' });

      expect(resolveColumnLabel(column)).toBe('Column');
    });
  });

  describe('GIVEN: isPrimitiveHeaderContent', () => {
    it('THEN: it returns true for a string header', () => {
      expect(isPrimitiveHeaderContent('Name')).toBe(true);
    });

    it('THEN: it returns true for a numeric header', () => {
      expect(isPrimitiveHeaderContent(asHeader(42))).toBe(true);
    });

    it('THEN: it returns false for a function header', () => {
      expect(isPrimitiveHeaderContent(() => 'Name')).toBe(false);
    });

    it('THEN: it returns false for an undefined header', () => {
      expect(isPrimitiveHeaderContent(undefined)).toBe(false);
    });
  });

  describe('GIVEN: getHeaderRowColumnIds', () => {
    it('THEN: it returns the column ids for non-placeholder headers in order', () => {
      const headerGroup = createHeaderGroup([
        { isPlaceholder: false, id: 'a' },
        { isPlaceholder: false, id: 'b' }
      ]);

      expect(getHeaderRowColumnIds(headerGroup)).toStrictEqual(['a', 'b']);
    });

    it('THEN: it skips placeholder headers', () => {
      const headerGroup = createHeaderGroup([
        { isPlaceholder: false, id: 'a' },
        { isPlaceholder: true, id: 'b' },
        { isPlaceholder: false, id: 'c' }
      ]);

      expect(getHeaderRowColumnIds(headerGroup)).toStrictEqual(['a', 'c']);
    });

    it('THEN: it returns an empty array when the header row has no headers', () => {
      expect(getHeaderRowColumnIds(createHeaderGroup([]))).toStrictEqual([]);
    });
  });

  describe('GIVEN: shouldHidePrimitiveHeaderLabel', () => {
    it('THEN: it returns true when hiddenHeaderLabel is set and the header content is primitive', () => {
      const header = createHeader('Name');

      expect(shouldHidePrimitiveHeaderLabel(header, { hiddenHeaderLabel: 'Name' })).toBe(true);
    });

    it('THEN: it returns false when columnState is undefined', () => {
      const header = createHeader('Name');

      expect(shouldHidePrimitiveHeaderLabel(header, undefined)).toBe(false);
    });

    it('THEN: it returns false when hiddenHeaderLabel is null', () => {
      const header = createHeader('Name');

      expect(shouldHidePrimitiveHeaderLabel(header, { hiddenHeaderLabel: null })).toBe(false);
    });

    it('THEN: it returns false when the header content is not primitive even if hiddenHeaderLabel is set', () => {
      const header = createHeader(() => 'Name');

      expect(shouldHidePrimitiveHeaderLabel(header, { hiddenHeaderLabel: 'Name' })).toBe(false);
    });
  });
});
