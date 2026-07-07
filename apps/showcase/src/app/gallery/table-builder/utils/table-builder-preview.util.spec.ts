import { DEFAULT_FLAGS } from '../common';
import { buildBuilderColumns, toBuilderColumnFlags } from './table-builder-preview.util';
import { buildColumns } from './table-builder-source-columns.util';

describe('FEATURE: table builder localization codegen', () => {
  describe('GIVEN: the live-preview column builder', () => {
    describe('WHEN: the Danish preview locale is active', () => {
      it('THEN: column headers use the Danish copy via meta.label', () => {
        // when: building columns for the Danish preview
        const columns = buildBuilderColumns(toBuilderColumnFlags(DEFAULT_FLAGS), 'da');
        const nameColumn = columns.find((column) => (column as { accessorKey?: string }).accessorKey === 'name');

        // then: the name header is localized (meta survives the header-actions wrapper; header does not)
        expect(nameColumn?.meta?.label).toBe('Navn');
      });
    });

    describe('WHEN: the English preview locale is active', () => {
      it('THEN: column headers use the English copy', () => {
        // when: building columns for the English preview
        const columns = buildBuilderColumns(toBuilderColumnFlags(DEFAULT_FLAGS), 'en');
        const nameColumn = columns.find((column) => (column as { accessorKey?: string }).accessorKey === 'name');

        // then: the name header is English
        expect(nameColumn?.meta?.label).toBe('Name');
      });
    });
  });

  describe('GIVEN: the generated TypeScript column snippet', () => {
    describe('WHEN: localization is enabled with row selection', () => {
      it('THEN: headers ship in Danish and the selection label is omitted so it inherits the provider', () => {
        // when: generating the columns block with localization + row selection on
        const snippet = buildColumns({ ...DEFAULT_FLAGS, withLocalization: true, withRowSelection: true }, '');

        // then: Danish headers appear and no hardcoded English selection label overrides the provider
        expect(snippet).toContain("header: 'Navn'");
        expect(snippet).not.toContain("label: 'Selection'");
      });
    });

    describe('WHEN: localization is disabled', () => {
      it('THEN: headers ship in English', () => {
        // when: generating the columns block with localization off
        const snippet = buildColumns({ ...DEFAULT_FLAGS, withLocalization: false }, '');

        // then: English headers appear
        expect(snippet).toContain("header: 'Name'");
      });
    });
  });

  describe('GIVEN: column resizing is enabled', () => {
    describe('WHEN: building the preview columns', () => {
      it('THEN: name, category and status resize but the last column (value) stays the non-resizable fill sink', () => {
        // when: building columns with resizing on
        const columns = buildBuilderColumns(toBuilderColumnFlags({ ...DEFAULT_FLAGS, withColumnResizing: true }), 'en');
        const resizingByKey = (key: string): boolean | undefined =>
          columns.find((column) => (column as { accessorKey?: string }).accessorKey === key)?.enableResizing;

        // then: the three leading columns are resizable; value explicitly opts out (so it
        // absorbs surplus width). value must be `false`, not omitted — the table enables
        // resizing globally, so an omitted flag would inherit resizable.
        expect(resizingByKey('name')).toBe(true);
        expect(resizingByKey('category')).toBe(true);
        expect(resizingByKey('status')).toBe(true);
        expect(resizingByKey('value')).toBe(false);
      });
    });

    describe('WHEN: generating the snippet with resizing', () => {
      it('THEN: the last column opts out of resizing explicitly with enableResizing: false', () => {
        // when: generating the columns block with resizing on (no pinning)
        const snippet = buildColumns({ ...DEFAULT_FLAGS, withColumnResizing: true, withColumnPinning: false }, '');
        const valueBlock = snippet.slice(snippet.indexOf("accessorKey: 'value'"));

        // then: leading columns resize, the trailing value column opts out explicitly
        expect(snippet).toContain('enableResizing: true');
        expect(valueBlock).toContain('enableResizing: false');
        expect(valueBlock).not.toContain('enableResizing: true');
      });
    });
  });
});
