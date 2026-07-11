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

      it('THEN: Owner uses the Danish copy in fourth visible-column position', () => {
        // when: building columns for the Danish preview
        const columns = buildBuilderColumns(toBuilderColumnFlags(DEFAULT_FLAGS), 'da');

        // then: Owner is the fourth visible data column and uses localized copy
        expect(columns.at(3)?.meta?.label).toBe('Ejer');
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
        expect(snippet).toContain("accessorKey: 'owner'");
        expect(snippet).toContain("header: 'Ejer'");
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

  describe('GIVEN: column reordering is enabled', () => {
    describe('WHEN: building the preview columns', () => {
      it('THEN: no column carries meta.reorderable (reordering is a surface-level opt-out default)', () => {
        // when: building columns with reordering on
        const columns = buildBuilderColumns(toBuilderColumnFlags({ ...DEFAULT_FLAGS, withColumnReorder: true }), 'en');

        // then: columns are reorderable by default, so no per-column meta flag is needed
        expect(columns.length).toBeGreaterThan(0);

        for (const column of columns) {
          expect(column.meta?.reorderable).toBeUndefined();
        }
      });
    });

    describe('WHEN: generating the snippet with reordering', () => {
      it('THEN: no meta literal mentions reorderable', () => {
        // when: generating the columns block with reordering on
        const snippet = buildColumns({ ...DEFAULT_FLAGS, withColumnReorder: true }, '');

        // then: reordering is a surface-level default, so no meta literal mentions it
        expect(snippet).not.toContain('reorderable');
      });
    });
  });

  describe('GIVEN: column reordering is disabled', () => {
    describe('WHEN: building the preview columns', () => {
      it('THEN: no column carries meta.reorderable', () => {
        // when: building columns with reordering off
        const columns = buildBuilderColumns(toBuilderColumnFlags({ ...DEFAULT_FLAGS, withColumnReorder: false }), 'en');

        // then: reorderable is absent from every column meta
        for (const column of columns) {
          expect(column.meta?.reorderable).toBeUndefined();
        }
      });
    });

    describe('WHEN: generating the snippet without reordering', () => {
      it('THEN: no meta literal mentions reorderable', () => {
        // when: generating the columns block with reordering off
        const snippet = buildColumns({ ...DEFAULT_FLAGS, withColumnReorder: false }, '');

        // then: the emitted snippet never mentions reorderable
        expect(snippet).not.toContain('reorderable');
      });
    });
  });

  describe('GIVEN: column resizing is enabled', () => {
    describe('WHEN: building the preview columns', () => {
      it('THEN: name, category and status inherit resizing from the surface but the last column (value) opts out', () => {
        // when: building columns with resizing on
        const columns = buildBuilderColumns(toBuilderColumnFlags({ ...DEFAULT_FLAGS, withColumnResizing: true }), 'en');
        const resizingByKey = (key: string): boolean | undefined =>
          columns.find((column) => (column as { accessorKey?: string }).accessorKey === key)?.enableResizing;

        // then: the three leading columns carry no per-column flag — resizing is on by
        // default at the surface level. value explicitly opts out (`false`, not omitted)
        // so it stays the fill sink that absorbs surplus width.
        expect(resizingByKey('name')).toBeUndefined();
        expect(resizingByKey('category')).toBeUndefined();
        expect(resizingByKey('status')).toBeUndefined();
        expect(resizingByKey('value')).toBe(false);
      });
    });

    describe('WHEN: generating the snippet with resizing', () => {
      it('THEN: the last column opts out of resizing explicitly with enableResizing: false', () => {
        // when: generating the columns block with resizing on (no pinning)
        const snippet = buildColumns({ ...DEFAULT_FLAGS, withColumnResizing: true, withColumnPinning: false }, '');
        const valueBlock = snippet.slice(snippet.indexOf("accessorKey: 'value'"));
        const leadingBlock = snippet.slice(0, snippet.indexOf("accessorKey: 'value'"));

        // then: leading columns emit no resize flag (default-on), the trailing value
        // column opts out explicitly
        expect(leadingBlock).not.toContain('enableResizing');
        expect(valueBlock).toContain('enableResizing: false');
      });
    });
  });
});
