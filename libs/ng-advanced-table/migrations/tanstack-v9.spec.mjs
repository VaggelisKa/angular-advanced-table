// Exercises the TanStack v9 consumer codemod: every rewrite rule, the code it
// must leave alone, the manual-review reports, how edits are applied, the CLI,
// and two safety nets — output always parses and a second run is a no-op, and
// the repository's own (already migrated) source gets zero edits.
//
// Run with `pnpm run test:migrations`.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { applyEdits, migrateHtml, migrateTypeScript, run } from './tanstack-v9.mjs';

const ts = createRequire(import.meta.url)('typescript');
const script = fileURLToPath(new URL('./tanstack-v9.mjs', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));

const migrate = (source) => {
  const { edits, reports } = migrateTypeScript(ts, 'fixture.ts', source);

  return { output: applyEdits(source, edits), reports, edits };
};

const assertMigrates = (input, expected) => assert.equal(migrate(input).output, expected);

const assertUnchanged = (input) => {
  const { edits } = migrate(input);

  assert.deepEqual(edits, [], `expected no edits for: ${input}`);
};

/** Syntax errors only, the way a bundler would see the file. */
const syntaxErrors = (source) =>
  ts
    .transpileModule(source, {
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext }
    })
    .diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));

const reportMessages = (source) => migrate(source).reports.map((entry) => entry.message);

const temporaryDirectories = [];

afterEach(() => {
  while (temporaryDirectories.length) rmSync(temporaryDirectories.pop(), { recursive: true, force: true });
});

/** A throwaway project whose `typescript` resolves to this repository's copy, as a consumer's would. */
const createProject = (files = {}, { withTypeScript = true } = {}) => {
  const root = mkdtempSync(join(tmpdir(), 'nat-v9-codemod-'));

  temporaryDirectories.push(root);
  writeFileSync(join(root, 'package.json'), '{ "name": "consumer" }');

  if (withTypeScript) {
    mkdirSync(join(root, 'node_modules'));
    writeFileSync(
      join(root, 'node_modules', 'typescript.js'),
      `module.exports = require(${JSON.stringify(createRequire(import.meta.url).resolve('typescript'))});`
    );
  }

  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }

  return root;
};

const quiet = () => undefined;

// A realistic v8 consumer file touching most rules at once.
const V8_COMPONENT = `import { Component, computed, signal } from '@angular/core';
import type { CellContext, ColumnDef, SortingState } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';

type Order = { id: string; customer: string; total: number; createdAt: Date };

const byCustomer = (a: Order, b: Order): number => a.customer.localeCompare(b.customer);

export const columns: ColumnDef<Order, unknown>[] = [
  { accessorKey: 'id', header: 'Order', meta: { label: 'Order', rowHeader: true } },
  {
    accessorKey: 'customer',
    header: 'Customer',
    sortingFn: (rowA, rowB) => byCustomer(rowA.original, rowB.original),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: (context: CellContext<Order, number>) => \`\${context.getValue().toFixed(2)} EUR\`,
  },
  { accessorKey: 'createdAt', header: 'Created', sortingFn: 'datetime' },
];

@Component({
  selector: 'app-orders',
  imports: [NatTable],
  template: \`<nat-table [columns]="columns" [data]="rows()" accessibleName="Orders" />\`,
})
export class Orders {
  protected readonly columns = columns;
  protected readonly rows = signal<Order[]>([]);
  protected readonly state = signal<Partial<NatTableUserState>>({
    columnPinning: { left: ['id'] },
    sorting: [] as SortingState,
  });
  protected readonly pinnedStart = computed(() => this.state().columnPinning?.left ?? []);

  protected togglePin(table: { getColumn(id: string): { pin(side: false | string): void; getIsPinned(): string | false } }): void {
    const column = table.getColumn('id');

    column.pin(column.getIsPinned() === 'left' ? false : 'left');
  }

  protected pageIndex(table: { getState(): { pagination: { pageIndex: number } } }): number {
    return table.getState().pagination.pageIndex;
  }
}
`;

const V9_COMPONENT = `import { Component, computed, signal } from '@angular/core';
import type { SortingState } from '@tanstack/angular-table';
import type { CellContext, ColumnDef } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';

type Order = { id: string; customer: string; total: number; createdAt: Date };

const byCustomer = (a: Order, b: Order): number => a.customer.localeCompare(b.customer);

export const columns: ColumnDef<Order, unknown>[] = [
  { accessorKey: 'id', header: 'Order', meta: { label: 'Order', rowHeader: true } },
  {
    accessorKey: 'customer',
    header: 'Customer',
    sortFn: (rowA, rowB) => byCustomer(rowA.original, rowB.original),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: (context: CellContext<Order, unknown>) => \`\${context.getValue<number>().toFixed(2)} EUR\`,
  },
  { accessorKey: 'createdAt', header: 'Created', sortFn: 'datetime' },
];

@Component({
  selector: 'app-orders',
  imports: [NatTable],
  template: \`<nat-table [columns]="columns" [data]="rows()" accessibleName="Orders" />\`,
})
export class Orders {
  protected readonly columns = columns;
  protected readonly rows = signal<Order[]>([]);
  protected readonly state = signal<Partial<NatTableUserState>>({
    columnPinning: { start: ['id'], end: [] },
    sorting: [] as SortingState,
  });
  protected readonly pinnedStart = computed(() => this.state().columnPinning?.start ?? []);

  protected togglePin(table: { getColumn(id: string): { pin(side: false | string): void; getIsPinned(): string | false } }): void {
    const column = table.getColumn('id');

    column.pin(column.getIsPinned() === 'start' ? false : 'start');
  }

  protected pageIndex(table: { getState(): { pagination: { pageIndex: number } } }): number {
    return table.atoms.pagination.get().pageIndex;
  }
}
`;

describe('FEATURE: TanStack v9 codemod — column pinning', () => {
  describe('GIVEN: a columnPinning state literal', () => {
    describe('WHEN: it uses physical keys', () => {
      const cases = [
        [
          'both keys',
          `const s = { columnPinning: { left: ['a'], right: ['b'] } };`,
          `const s = { columnPinning: { start: ['a'], end: ['b'] } };`
        ],
        [
          'only left, adding end',
          `const s = { columnPinning: { left: ['a'] } };`,
          `const s = { columnPinning: { start: ['a'], end: [] } };`
        ],
        [
          'only right, adding start',
          `const s = { columnPinning: { right: ['z'] } };`,
          `const s = { columnPinning: { end: ['z'], start: [] } };`
        ],
        [
          'shorthand keys',
          `const s = { columnPinning: { left, right } };`,
          `const s = { columnPinning: { start: left, end: right } };`
        ],
        [
          'quoted keys',
          `const s = { columnPinning: { 'left': ['a'], "right": [] } };`,
          `const s = { columnPinning: { start: ['a'], end: [] } };`
        ],
        [
          'a quoted outer key',
          `const s = { 'columnPinning': { left: [] , right: [] } };`,
          `const s = { 'columnPinning': { start: [] , end: [] } };`
        ],
        [
          'a trailing comma',
          `const s = { columnPinning: { left: ['a'], } };`,
          `const s = { columnPinning: { start: ['a'], end: [], } };`
        ],
        [
          'a multi-line literal',
          `const s = {\n  columnPinning: {\n    left: ['a'],\n    right: ['b'],\n  },\n};`,
          `const s = {\n  columnPinning: {\n    start: ['a'],\n    end: ['b'],\n  },\n};`
        ],
        [
          'a literal inside a signal call',
          `readonly state = signal<Partial<NatTableUserState>>({ columnPinning: { left: ['id'], right: [] } });`,
          `readonly state = signal<Partial<NatTableUserState>>({ columnPinning: { start: ['id'], end: [] } });`
        ],
        [
          'a spread next to the keys, adding nothing',
          `const s = { columnPinning: { ...current, left: ['a'] } };`,
          `const s = { columnPinning: { ...current, start: ['a'] } };`
        ]
      ];

      for (const [name, input, expected] of cases) {
        it(`THEN: it rewrites ${name}`, () => assertMigrates(input, expected));
      }
    });

    describe('WHEN: it is a fallback for a missing pinning slice', () => {
      it('THEN: it rewrites the literal after ??', () =>
        assertMigrates(
          `const p = current.columnPinning ?? { left: [], right: [] };`,
          `const p = current.columnPinning ?? { start: [], end: [] };`
        ));

      it('THEN: it rewrites the literal after ||', () =>
        assertMigrates(
          `const p = state.columnPinning || { left: ['a'] };`,
          `const p = state.columnPinning || { start: ['a'], end: [] };`
        ));
    });

    describe('WHEN: the code only resembles pinning state', () => {
      const cases = [
        ['an unrelated object with left/right', `const box = { left: 4, right: 8 };`],
        ['an empty pinning literal', `const s = { columnPinning: {} };`],
        ['a pinning slice set from a variable', `const s = { columnPinning: next };`],
        ['already migrated keys', `const s = { columnPinning: { start: ['a'], end: [] } };`],
        ['a columnPinning option object with no zones', `const s = { columnPinning: { enabled: true } };`],
        ['a fallback for another slice', `const v = state.columnVisibility ?? { left: true };`]
      ];

      for (const [name, input] of cases) {
        it(`THEN: it leaves ${name} alone`, () => assertUnchanged(input));
      }
    });
  });

  describe('GIVEN: reads of a pinning zone', () => {
    describe('WHEN: the zone is read off columnPinning or a pinning variable', () => {
      const cases = [
        ['a plain read', `const a = state.columnPinning.left;`, `const a = state.columnPinning.start;`],
        ['an optional read', `const a = this.state().columnPinning?.right;`, `const a = this.state().columnPinning?.end;`],
        ['an optional chain on the zone', `state.columnPinning?.left?.includes(id);`, `state.columnPinning?.start?.includes(id);`],
        ['a variable named pinning', `const a = pinning.left ?? [];`, `const a = pinning.start ?? [];`],
        ['a variable ending in Pinning', `const a = nextPinning.right;`, `const a = nextPinning.end;`],
        ['a signal call', `const a = this.columnPinning().left;`, `const a = this.columnPinning().start;`],
        ['a non-null assertion', `const a = state.columnPinning!.right;`, `const a = state.columnPinning!.end;`],
        ['a pinning field', `const a = this.pinning.left;`, `const a = this.pinning.start;`]
      ];

      for (const [name, input, expected] of cases) {
        it(`THEN: it rewrites ${name}`, () => assertMigrates(input, expected));
      }
    });

    describe('WHEN: left or right is read off something else', () => {
      const cases = [
        ['a DOMRect', `const x = rect.left;`],
        ['a style object', `el.style.right = '0';`],
        ['a padding object', `const p = padding.left;`],
        ['a render state', `const offset = state()?.left;`],
        ['an element style read', `const x = this.element.style.left;`],
        ['a signal of something else', `const x = this.bounds().left;`]
      ];

      for (const [name, input] of cases) {
        it(`THEN: it leaves ${name} alone`, () => assertUnchanged(input));
      }
    });
  });

  describe('GIVEN: pin calls and pinned-side comparisons', () => {
    describe('WHEN: they use physical side names', () => {
      const cases = [
        ['pin left', `column.pin('left');`, `column.pin('start');`],
        ['pin right with double quotes', `column.pin("right");`, `column.pin('end');`],
        ['a side in a conditional', `column.pin(pinned ? false : 'left');`, `column.pin(pinned ? false : 'start');`],
        ['both sides of a conditional', `column.pin(atStart ? 'left' : 'right');`, `column.pin(atStart ? 'start' : 'end');`],
        [
          'a nested, parenthesized conditional',
          `column.pin(a ? (b ? 'left' : false) : 'right');`,
          `column.pin(a ? (b ? 'start' : false) : 'end');`
        ],
        [
          'a toggle that also compares the pinned side',
          `column.pin(column.getIsPinned() === 'left' ? false : 'left');`,
          `column.pin(column.getIsPinned() === 'start' ? false : 'start');`
        ],
        ['a strict equality', `const a = column.getIsPinned() === 'left';`, `const a = column.getIsPinned() === 'start';`],
        ['a reversed inequality', `const a = 'right' !== column.getIsPinned();`, `const a = 'end' !== column.getIsPinned();`],
        [
          'a comparison inside a condition',
          `if (header.column.getIsPinned() === 'right') {}`,
          `if (header.column.getIsPinned() === 'end') {}`
        ]
      ];

      for (const [name, input, expected] of cases) {
        it(`THEN: it rewrites ${name}`, () => assertMigrates(input, expected));
      }
    });

    describe('WHEN: the call or comparison is not about a pinned side', () => {
      const cases = [
        ['unpinning', `column.pin(false);`],
        ['pinning to a variable side', `column.pin(side);`],
        ['a conditional between other values', `column.pin(on ? side : false);`],
        ['an already logical side', `column.pin('start');`],
        ['another method with a side argument', `toolbar.align('left');`],
        ['a side compared to something else', `const a = layout.side === 'left';`],
        ['a loose equality the codemod does not chase', `const a = column.getIsPinned() == 'x';`]
      ];

      for (const [name, input] of cases) {
        it(`THEN: it leaves ${name} alone`, () => assertUnchanged(input));
      }
    });
  });
});

describe('FEATURE: TanStack v9 codemod — sorting and renamed APIs', () => {
  describe('GIVEN: sortingFn on column definitions', () => {
    describe('WHEN: it is written as a property', () => {
      const cases = [
        [
          'a built-in name',
          `const c = { accessorKey: 'name', sortingFn: 'text' };`,
          `const c = { accessorKey: 'name', sortFn: 'text' };`
        ],
        [
          'a function',
          `const c = { id: 'x', sortingFn: (a, b) => a.index - b.index };`,
          `const c = { id: 'x', sortFn: (a, b) => a.index - b.index };`
        ],
        [
          'a quoted key',
          `const c = { accessorKey: 'name', 'sortingFn': 'basic' };`,
          `const c = { accessorKey: 'name', sortFn: 'basic' };`
        ],
        [
          'a partial override with no other column keys',
          `const o = { code: { sortingFn: 'alphanumeric' } };`,
          `const o = { code: { sortFn: 'alphanumeric' } };`
        ],
        [
          'a nested group column',
          `const c = { header: 'Group', columns: [{ accessorKey: 'a', sortingFn: 'text' }] };`,
          `const c = { header: 'Group', columns: [{ accessorKey: 'a', sortFn: 'text' }] };`
        ]
      ];

      for (const [name, input, expected] of cases) {
        it(`THEN: it renames ${name}`, () => assertMigrates(input, expected));
      }
    });

    describe('WHEN: it is a shorthand property', () => {
      it('THEN: it expands it inside a column definition', () =>
        assertMigrates(`const c = { accessorKey: 'name', sortingFn };`, `const c = { accessorKey: 'name', sortFn: sortingFn };`));

      it('THEN: it leaves it alone in an object that is not a column', () =>
        assertUnchanged(`entries.push({ id, desc, invertSorting, sortUndefined, sortingFn });`));
    });
  });

  describe('GIVEN: methods TanStack v9 renamed', () => {
    describe('WHEN: they are called or referenced', () => {
      const renames = [
        ['getSortingFn', 'getSortFn'],
        ['getAutoSortingFn', 'getAutoSortFn'],
        ['getLeftVisibleCells', 'getStartVisibleCells'],
        ['getRightVisibleCells', 'getEndVisibleCells'],
        ['getLeftHeaderGroups', 'getStartHeaderGroups'],
        ['getRightHeaderGroups', 'getEndHeaderGroups'],
        ['getLeftFooterGroups', 'getStartFooterGroups'],
        ['getRightFooterGroups', 'getEndFooterGroups'],
        ['getLeftFlatHeaders', 'getStartFlatHeaders'],
        ['getRightFlatHeaders', 'getEndFlatHeaders'],
        ['getLeftLeafHeaders', 'getStartLeafHeaders'],
        ['getRightLeafHeaders', 'getEndLeafHeaders'],
        ['getLeftLeafColumns', 'getStartLeafColumns'],
        ['getRightLeafColumns', 'getEndLeafColumns'],
        ['getLeftVisibleLeafColumns', 'getStartVisibleLeafColumns'],
        ['getRightVisibleLeafColumns', 'getEndVisibleLeafColumns'],
        ['getLeftTotalSize', 'getStartTotalSize'],
        ['getRightTotalSize', 'getEndTotalSize']
      ];

      for (const [before, after] of renames) {
        it(`THEN: it renames ${before} to ${after}`, () =>
          assertMigrates(`const a = table.${before}();`, `const a = table.${after}();`));
      }

      it('THEN: it renames a method passed by reference', () =>
        assertMigrates(`const size = table.getLeftTotalSize;`, `const size = table.getStartTotalSize;`));

      it('THEN: it renames inside an optional chain', () =>
        assertMigrates(`table?.getRightLeafColumns();`, `table?.getEndLeafColumns();`));
    });

    describe('WHEN: a property name only matches a built-in object member', () => {
      const cases = [
        ['toLocaleString', 'const a = `${value.toLocaleString()}`;'],
        ['toString', `const a = pinning.toString();`],
        ['constructor', `column.pin('constructor');`],
        ['hasOwnProperty', `const a = state.columnPinning.hasOwnProperty('left');`],
        ['valueOf', `const a = getState().valueOf;`]
      ];

      for (const [name, input] of cases) {
        it(`THEN: it leaves ${name} alone`, () => assertUnchanged(input));
      }
    });
  });

  describe('GIVEN: reads through table.getState()', () => {
    describe('WHEN: a single slice is read in a file that imports the table', () => {
      const tableImport = `import { injectTable } from '@tanstack/angular-table';\n`;
      const cases = [
        ['a plain slice', `const s = table.getState().sorting;`, `const s = table.atoms.sorting.get();`],
        ['a nested property', `const i = table.getState().pagination.pageIndex;`, `const i = table.atoms.pagination.get().pageIndex;`],
        [
          'an optional receiver',
          `const q = this.table()?.getState().globalFilter ?? '';`,
          `const q = this.table()?.atoms.globalFilter.get() ?? '';`
        ],
        ['an optional table', `const q = table?.getState().columnFilters;`, `const q = table?.atoms.columnFilters.get();`],
        ['a table field', `const s = this.table.getState().sorting;`, `const s = this.table.atoms.sorting.get();`],
        [
          'a receiver ending in Table',
          `const r = ordersTable.getState().rowSelection;`,
          `const r = ordersTable.atoms.rowSelection.get();`
        ],
        ['a non-null table', `const p = table!.getState().pagination;`, `const p = table!.atoms.pagination.get();`],
        [
          'the renamed resizing slice',
          `const id = table.getState().columnSizingInfo.isResizingColumn;`,
          `const id = table.atoms.columnResizing.get().isResizingColumn;`
        ],
        [
          'a read inside a template literal',
          'const t = `${table.getState().pagination.pageSize} rows`;',
          'const t = `${table.atoms.pagination.get().pageSize} rows`;'
        ]
      ];

      for (const [name, input, expected] of cases) {
        it(`THEN: it rewrites ${name}`, () => assertMigrates(`${tableImport}${input}`, `${tableImport}${expected}`));
      }

      it('THEN: it also rewrites code inside the receiver in the same pass', () =>
        assertMigrates(
          `${tableImport}const s = getTable(column.getIsPinned() === 'left').getState().sorting;`,
          `${tableImport}const s = getTable(column.getIsPinned() === 'start').atoms.sorting.get();`
        ));

      it('THEN: it also rewrites in a file that imports a library entry point', () =>
        assertMigrates(
          `import { NatTableService } from 'ng-advanced-table/components';\nconst s = table.getState().sorting;`,
          `import { NatTableService } from 'ng-advanced-table/components';\nconst s = table.atoms.sorting.get();`
        ));
    });

    describe('WHEN: the whole state is read', () => {
      const cases = [
        ['a bare call', `const all = table.getState();`],
        ['destructuring', `const { sorting } = table.getState();`],
        ['an element access', `const s = table.getState()['sorting'];`],
        ['a spread', `const copy = { ...table.getState() };`]
      ];

      for (const [name, input] of cases) {
        it(`THEN: it reports ${name} without changing it`, () => {
          const { edits, reports } = migrate(input);

          assert.deepEqual(edits, []);
          assert.equal(reports.length, 1);
          assert.match(reports[0].message, /getState\(\)` is gone/);
        });
      }

      it('THEN: it leaves a getState with arguments alone', () => {
        assertUnchanged(`const s = store.getState(key);`);
        assert.deepEqual(reportMessages(`const s = store.getState(key);`), []);
      });
    });

    describe('WHEN: the receiver may not be a table', () => {
      const tableImport = `import type { ColumnDef } from 'ng-advanced-table';\n`;

      const untouched = [
        ['another store', `const t = settingsStore.getState().theme;`],
        ['another store with a table-like slice', `const s = store.getState().sorting;`],
        ['a whole-state read of another store', `const all = settingsStore.getState();`]
      ];

      for (const [name, input] of untouched) {
        it(`THEN: it leaves ${name} alone in a file that does not use the table`, () => {
          assertUnchanged(input);
          assert.deepEqual(reportMessages(input), []);
        });
      }

      const reported = [
        [
          'a table slice on a receiver not named like a table',
          `${tableImport}const s = grid.getState().sorting;`,
          /if `grid` is a table, read `grid\.atoms\.sorting\.get\(\)`/
        ],
        ['an unknown slice on a table', `const t = table.getState().theme;`, /if `table` is a table/],
        [
          'a store named like a table in a file that does not import the table',
          `const s = dataTable.getState().sorting;`,
          /if `dataTable` is a table, read `dataTable\.atoms\.sorting\.get\(\)`/
        ],
        ['a whole-state read in a file that uses the table', `${tableImport}const all = store.getState();`, /getState\(\)` is gone/]
      ];

      for (const [name, input, message] of reported) {
        it(`THEN: it reports ${name} without changing it`, () => {
          const { edits, reports } = migrate(input);

          assert.deepEqual(edits, []);
          assert.equal(reports.length, 1);
          assert.match(reports[0].message, message);
        });
      }

      it('THEN: it leaves another store with no table slice alone, even in a file that uses the table', () => {
        const input = `${tableImport}const t = settingsStore.getState().theme;`;

        assertUnchanged(input);
        assert.deepEqual(reportMessages(input), []);
      });
    });
  });
});

describe('FEATURE: TanStack v9 codemod — cell renderers', () => {
  describe('GIVEN: a CellContext parameter with a concrete value type', () => {
    describe('WHEN: the parameter is a plain identifier', () => {
      const cases = [
        [
          'an arrow function',
          `cell: (context: CellContext<Order, number>) => format(context.getValue())`,
          `cell: (context: CellContext<Order, unknown>) => format(context.getValue<number>())`
        ],
        [
          'renderValue',
          `cell: (info: CellContext<Order, string>) => info.renderValue()`,
          `cell: (info: CellContext<Order, unknown>) => info.renderValue<string>()`
        ],
        [
          'several reads',
          `cell: (c: CellContext<R, number>) => c.getValue() + c.getValue()`,
          `cell: (c: CellContext<R, unknown>) => c.getValue<number>() + c.getValue<number>()`
        ],
        [
          'a union value type',
          `cell: (c: CellContext<R, Date | null>) => c.getValue()?.toISOString()`,
          `cell: (c: CellContext<R, unknown>) => c.getValue<Date | null>()?.toISOString()`
        ],
        [
          'an indexed value type',
          `cell: (c: CellContext<Order, Order['status']>) => label(c.getValue())`,
          `cell: (c: CellContext<Order, unknown>) => label(c.getValue<Order['status']>())`
        ],
        [
          'a function expression',
          `const cell = function (c: CellContext<R, number>) { return c.getValue(); };`,
          `const cell = function (c: CellContext<R, unknown>) { return c.getValue<number>(); };`
        ],
        [
          'a function declaration',
          `function cell(c: CellContext<R, boolean>): string { return c.getValue() ? 'Yes' : 'No'; }`,
          `function cell(c: CellContext<R, unknown>): string { return c.getValue<boolean>() ? 'Yes' : 'No'; }`
        ],
        [
          'a class method',
          `class A { cell(c: CellContext<R, number>) { return c.getValue(); } }`,
          `class A { cell(c: CellContext<R, unknown>) { return c.getValue<number>(); } }`
        ],
        [
          'a renderer with a return type',
          'cell: (context: CellContext<DemoItem, number>): string => `$${context.getValue().toLocaleString()}`',
          'cell: (context: CellContext<DemoItem, unknown>): string => `$${context.getValue<number>().toLocaleString()}`'
        ]
      ];

      for (const [name, input, expected] of cases) {
        it(`THEN: it widens and narrows ${name}`, () => assertMigrates(input, expected));
      }

      it('THEN: it keeps reads that already pass a type argument', () =>
        assertMigrates(
          `cell: (c: CellContext<R, number>) => c.getValue<number>() + c.getValue()`,
          `cell: (c: CellContext<R, unknown>) => c.getValue<number>() + c.getValue<number>()`
        ));

      it('THEN: it leaves reads on other objects alone', () =>
        assertMigrates(
          `cell: (c: CellContext<R, number>) => other.getValue() + c.row.getValue('id')`,
          `cell: (c: CellContext<R, unknown>) => other.getValue() + c.row.getValue('id')`
        ));
    });

    describe('WHEN: a nested scope reuses the parameter name or the read is optional', () => {
      const cases = [
        [
          'a nested function with its own parameter of that name',
          `cell: (c: CellContext<R, number>) => c.getValue() + list.map((c) => c.getValue()).length`,
          `cell: (c: CellContext<R, unknown>) => c.getValue<number>() + list.map((c) => c.getValue()).length`
        ],
        [
          'a nested renderer typed on its own',
          `cell: (c: CellContext<R, number>) => wrap(c.getValue(), (c: CellContext<R, string>) => c.getValue())`,
          `cell: (c: CellContext<R, unknown>) => wrap(c.getValue<number>(), (c: CellContext<R, unknown>) => c.getValue<string>())`
        ],
        [
          'a block that declares the name again',
          `function cell(c: CellContext<R, number>) { if (x) { const c = other(); return c.getValue(); } return c.getValue(); }`,
          `function cell(c: CellContext<R, unknown>) { if (x) { const c = other(); return c.getValue(); } return c.getValue<number>(); }`
        ],
        [
          'a loop variable of that name',
          `function cell(c: CellContext<R, number>) { for (const c of items) c.getValue(); return c.getValue(); }`,
          `function cell(c: CellContext<R, unknown>) { for (const c of items) c.getValue(); return c.getValue<number>(); }`
        ],
        [
          'an optional call',
          `cell: (c: CellContext<R, number>) => c.getValue?.()`,
          `cell: (c: CellContext<R, unknown>) => c.getValue?.<number>()`
        ]
      ];

      for (const [name, input, expected] of cases) {
        it(`THEN: it handles ${name}`, () => {
          assertMigrates(input, expected);
          assert.deepEqual(syntaxErrors(expected), []);
        });
      }
    });

    describe('WHEN: the parameter is destructured', () => {
      it('THEN: it reports it without changing it', () => {
        const input = `cell: ({ getValue }: CellContext<Order, number>) => getValue()`;
        const { edits, reports } = migrate(input);

        assert.deepEqual(edits, []);
        assert.equal(reports.length, 1);
        assert.match(reports[0].message, /getValue<number>\(\)/);
      });
    });
  });

  describe('GIVEN: a CellContext parameter that already fits v9', () => {
    describe('WHEN: the value type is unknown, any, or omitted', () => {
      const cases = [
        ['unknown', `cell: (c: CellContext<R, unknown>) => c.getValue<number>()`],
        ['any', `cell: (c: CellContext<R, any>) => c.getValue()`],
        ['a single type argument', `cell: (c: CellContext<R>) => c.getValue()`],
        ['a v9 three-argument type', `cell: (c: CellContext<F, Order, number>) => format(c.getValue())`],
        ['an untyped parameter', `cell: (c) => c.getValue<number>()`],
        ['another generic type', `cell: (c: Context<R, number>) => c.getValue()`]
      ];

      for (const [name, input] of cases) {
        it(`THEN: it leaves ${name} alone`, () => assertUnchanged(input));
      }
    });
  });
});

describe('FEATURE: TanStack v9 codemod — imports', () => {
  describe('GIVEN: an import from @tanstack/angular-table', () => {
    describe('WHEN: it holds only types the library re-exports', () => {
      const cases = [
        [
          'a type-only import',
          `import type { ColumnDef, CellContext } from '@tanstack/angular-table';`,
          `import type { ColumnDef, CellContext } from 'ng-advanced-table';`
        ],
        [
          'inline type modifiers',
          `import { type Row, type Column } from '@tanstack/angular-table';`,
          `import type { Row, Column } from 'ng-advanced-table';`
        ],
        [
          'a renamed import',
          `import type { Row as TableRow } from '@tanstack/angular-table';`,
          `import type { Row as TableRow } from 'ng-advanced-table';`
        ],
        [
          'the v8-only names',
          `import type { SortingFn, VisibilityState } from '@tanstack/angular-table';`,
          `import type { SortingFn, VisibilityState } from 'ng-advanced-table';`
        ],
        [
          'the column definition variants',
          `import type { AccessorColumnDef, AccessorFnColumnDef, AccessorKeyColumnDef, DisplayColumnDef, GroupColumnDef, IdentifiedColumnDef } from '@tanstack/angular-table';`,
          `import type { AccessorColumnDef, AccessorFnColumnDef, AccessorKeyColumnDef, DisplayColumnDef, GroupColumnDef, IdentifiedColumnDef } from 'ng-advanced-table';`
        ],
        [
          'table options and state used with v8 arguments',
          `import type { TableOptions, TableState } from '@tanstack/angular-table';\nlet o: TableOptions<Order>;\nlet s: TableState;`,
          `import type { TableOptions, TableState } from 'ng-advanced-table';\nlet o: TableOptions<Order>;\nlet s: TableState;`
        ]
      ];

      for (const [name, input, expected] of cases) {
        it(`THEN: it moves ${name}`, () => assertMigrates(input, expected));
      }
    });

    describe('WHEN: it mixes re-exported types with other names', () => {
      it('THEN: it splits the import and keeps the rest on TanStack', () =>
        assertMigrates(
          `import { type ColumnDef, type SortingState } from '@tanstack/angular-table';`,
          `import { type SortingState } from '@tanstack/angular-table';\nimport type { ColumnDef } from 'ng-advanced-table';`
        ));

      it('THEN: it keeps value imports on TanStack', () =>
        assertMigrates(
          `import { createColumnHelper, type Row } from '@tanstack/angular-table';`,
          `import { createColumnHelper } from '@tanstack/angular-table';\nimport type { Row } from 'ng-advanced-table';`
        ));

      it('THEN: it handles each TanStack import in a file', () =>
        assertMigrates(
          `import type { Row } from '@tanstack/angular-table';\nimport type { PaginationState, Table } from '@tanstack/angular-table';`,
          `import type { Row } from 'ng-advanced-table';\nimport type { PaginationState } from '@tanstack/angular-table';\nimport type { Table } from 'ng-advanced-table';`
        ));
    });

    describe('WHEN: the code already uses the v9 generics or v9-only names', () => {
      const cases = [
        ['Row with a feature argument', `import type { Row } from '@tanstack/angular-table';\ntype R = Row<typeof features, Order>;`],
        [
          'ColumnDef with three arguments',
          `import type { ColumnDef } from '@tanstack/angular-table';\nconst c: ColumnDef<F, Order, number>[] = [];`
        ],
        ['SortFn, which v8 did not export', `import type { SortFn } from '@tanstack/angular-table';`],
        [
          'TableState with a feature argument',
          `import type { TableState } from '@tanstack/angular-table';\ntype S = TableState<typeof features>;`
        ],
        [
          'TableOptions with two arguments',
          `import type { TableOptions } from '@tanstack/angular-table';\ntype O = TableOptions<F, Order>;`
        ],
        [
          'a column definition variant with three arguments',
          `import type { DisplayColumnDef } from '@tanstack/angular-table';\nconst d: DisplayColumnDef<F, Order, unknown> = {};`
        ],
        ['a state type', `import type { SortingState } from '@tanstack/angular-table';`],
        ['another package', `import type { ColumnDef } from '@tanstack/table-core';`],
        ['a side-effect import', `import '@tanstack/angular-table';`]
      ];

      for (const [name, input] of cases) {
        it(`THEN: it leaves ${name} alone`, () => assertUnchanged(input));
      }
    });

    describe('WHEN: the import cannot be rewritten safely', () => {
      it('THEN: it reports a namespace import', () =>
        assert.match(reportMessages(`import * as TS from '@tanstack/angular-table';`)[0], /Namespace import/));

      it('THEN: it reports the renamed sorting registry', () =>
        assert.match(reportMessages(`import { sortingFns } from '@tanstack/angular-table';`)[0], /`sortingFns` is `sortFns`/));

      it('THEN: it reports the renamed sorting registry under an alias', () =>
        assert.match(reportMessages(`import { sortingFns as fns } from '@tanstack/angular-table';`)[0], /`sortingFns` is `sortFns`/));
    });
  });
});

describe('FEATURE: TanStack v9 codemod — manual-review reports', () => {
  describe('GIVEN: row-selection predicates', () => {
    describe('WHEN: getIsSome...Selected stands alone', () => {
      for (const predicate of ['getIsSomeRowsSelected', 'getIsSomePageRowsSelected']) {
        it(`THEN: it reports ${predicate}`, () => {
          const messages = reportMessages(`const indeterminate = table.${predicate}();`);

          assert.equal(messages.length, 1);
          assert.match(messages[0], new RegExp(predicate));
        });
      }
    });

    describe('WHEN: it is already paired with the all-selected check', () => {
      const cases = [
        `const i = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();`,
        `const i = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();`,
        `const i = !table.getIsAllRowsSelected() && table.getIsSomeRowsSelected();`,
        `const i = this.enabled() && table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();`,
        `const i = a && (table.getIsSomeRowsSelected() && b) && !table.getIsAllRowsSelected();`
      ];

      for (const input of cases) {
        it(`THEN: it does not report ${input.slice(10, 50)}…`, () => assert.deepEqual(reportMessages(input), []));
      }

      it('THEN: it still reports a check paired with something else in an || chain', () =>
        assert.equal(reportMessages(`const i = table.getIsSomeRowsSelected() || !table.getIsAllRowsSelected();`).length, 1));
    });
  });

  describe('GIVEN: FlexRender bindings', () => {
    describe('WHEN: props come from a call', () => {
      it('THEN: it reports each binding in HTML with its line', () => {
        const html = [
          `<div>`,
          `  <ng-container *flexRender="a(); props: buildA(); let r">{{ r }}</ng-container>`,
          `  <ng-container *flexRender="b(); props: helper.build(row); let r">{{ r }}</ng-container>`,
          `</div>`
        ].join('\n');

        assert.deepEqual(
          migrateHtml(html).map((entry) => entry.line),
          [2, 3]
        );
      });

      it('THEN: it reports an inline component template at the binding line', () => {
        const source = [
          '@Component({',
          '  template: `',
          '    <ng-container *flexRender="a(); props: ctx(); let r"></ng-container>',
          '  `',
          '})',
          'class A {}'
        ].join('\n');
        const { reports } = migrate(source);

        assert.equal(reports.length, 1);
        assert.equal(reports[0].line, 3);
      });

      it('THEN: it covers the flexRenderCell and flexRenderHeader variants', () =>
        assert.equal(migrateHtml(`<ng-container *flexRenderCell="c; props: make(c)"></ng-container>`).length, 1));

      const calls = [
        ['a single-quoted attribute', `<ng-container *flexRender='a(); props: build(); let r'></ng-container>`],
        ['an optional-chained receiver', `<ng-container *flexRender="a(); props: helper?.build(row)"></ng-container>`],
        ['an optional call', `<ng-container *flexRender="a(); props: build?.()"></ng-container>`]
      ];

      for (const [name, html] of calls) {
        it(`THEN: it reports ${name}`, () => assert.equal(migrateHtml(html).length, 1));
      }

      it('THEN: it reports the column where the binding starts in HTML', () =>
        assert.deepEqual(
          migrateHtml(`<div>\n    <ng-container *flexRender="a(); props: b()"></ng-container>\n</div>`).map(({ line, column }) => ({
            line,
            column
          })),
          [{ line: 2, column: 19 }]
        ));

      it('THEN: it points at the binding in an inline template with CRLF line ends', () => {
        const source = [
          '@Component({',
          '  template: `',
          '    <p>x</p>',
          '    <ng-container *flexRender="a(); props: ctx()"></ng-container>',
          '  `',
          '})',
          'class A {}'
        ].join('\r\n');
        const { reports } = migrate(source);

        assert.deepEqual(
          reports.map(({ line, column }) => ({ line, column })),
          [{ line: 4, column: 19 }]
        );
      });

      it('THEN: it points at the binding in an inline string template with escapes', () => {
        const source = `@Component({ template: "<b>\\u0041\\"</b>\\n<ng-container *flexRender=\\"a(); props: ctx()\\"></ng-container>" })\nclass A {}`;
        const { reports } = migrate(source);

        assert.equal(reports.length, 1);
        assert.equal(source.slice(reports[0].column - 1, reports[0].column - 1 + '*flexRender'.length), '*flexRender');
      });
    });

    describe('WHEN: props are already stable', () => {
      const cases = [
        ['a property', `<ng-container *flexRender="a(); props: context; let r"></ng-container>`],
        ['TanStack cell context', `<ng-container *flexRender="cell.column.columnDef.cell; props: cell.getContext()"></ng-container>`],
        [
          'TanStack header context',
          `<ng-container *flexRender="header.column.columnDef.header; props: header.getContext()"></ng-container>`
        ],
        ['no props at all', `<ng-container *flexRender="a(); let r"></ng-container>`],
        [
          'optional-chained TanStack context',
          `<ng-container *flexRender="cell.column.columnDef.cell; props: cell?.getContext()"></ng-container>`
        ]
      ];

      for (const [name, html] of cases) {
        it(`THEN: it does not report ${name}`, () => assert.deepEqual(migrateHtml(html), []));
      }
    });
  });

  describe('GIVEN: a report in a TypeScript file', () => {
    describe('WHEN: it is collected', () => {
      it('THEN: it carries the one-based line and column of the code', () => {
        const { reports } = migrate(`const a = 1;\n  const all = table.getState();`);

        assert.deepEqual(
          reports.map(({ line, column }) => ({ line, column })),
          [{ line: 2, column: 15 }]
        );
      });
    });
  });
});

describe('FEATURE: TanStack v9 codemod — applying edits', () => {
  describe('GIVEN: a set of edits', () => {
    describe('WHEN: they do not overlap', () => {
      it('THEN: it applies them whatever order they arrive in', () => {
        const edits = [
          { start: 0, end: 1, replacement: 'A' },
          { start: 4, end: 5, replacement: 'E' },
          { start: 2, end: 3, replacement: 'C' }
        ];

        assert.equal(applyEdits('abcde', edits), 'AbCdE');
      });

      it('THEN: it places an insertion before a replacement at the same position', () =>
        assert.equal(
          applyEdits('abc', [
            { start: 1, end: 2, replacement: 'B' },
            { start: 1, end: 1, replacement: '+' }
          ]),
          'a+Bc'
        ));

      it('THEN: it returns the text unchanged without edits', () => assert.equal(applyEdits('abc', []), 'abc'));
    });

    describe('WHEN: an edit lies inside another', () => {
      it('THEN: it keeps the outer edit and drops the inner one', () =>
        assert.equal(
          applyEdits('table.getState().pagination', [
            { start: 0, end: 27, replacement: 'table.atoms.pagination.get()' },
            { start: 6, end: 14, replacement: 'WRONG' }
          ]),
          'table.atoms.pagination.get()'
        ));
    });
  });
});

describe('FEATURE: TanStack v9 codemod — whole files', () => {
  describe('GIVEN: a realistic v8 consumer component', () => {
    describe('WHEN: it is migrated', () => {
      it('THEN: it produces the expected v9 file', () => assert.equal(migrate(V8_COMPONENT).output, V9_COMPONENT));

      it('THEN: it produces a file without syntax errors', () => assert.deepEqual(syntaxErrors(migrate(V8_COMPONENT).output), []));

      it('THEN: a second run changes nothing', () => assertUnchanged(migrate(V8_COMPONENT).output));
    });
  });

  describe('GIVEN: inputs that combine several rules', () => {
    describe('WHEN: each is migrated', () => {
      const snippets = [
        `const s = { columnPinning: { left: ['a'] } };`,
        `const p = current.columnPinning ?? { left: [], right: [] };`,
        `column.pin(column.getIsPinned() === 'left' ? false : 'right');`,
        `const c = { accessorKey: 'name', sortingFn };`,
        `import { injectTable } from '@tanstack/angular-table';\nconst i = table.getState().columnSizingInfo.isResizingColumn;`,
        `const columns = [{ cell: (c: CellContext<R, Date | null>) => c.getValue()?.toISOString() }];`,
        `import { createColumnHelper, type Row } from '@tanstack/angular-table';`
      ];

      for (const snippet of snippets) {
        it(`THEN: it stays valid and idempotent for ${snippet.slice(0, 48)}…`, () => {
          const once = migrate(snippet).output;

          assert.notEqual(once, snippet, 'the snippet should exercise at least one rule');
          assert.deepEqual(syntaxErrors(once), []);
          assertUnchanged(once);
        });
      }
    });
  });

  describe("GIVEN: this repository's own source, already on v9", () => {
    describe('WHEN: the codemod runs over it', () => {
      it('THEN: it makes no edits', () => {
        const { editCount, changedFiles } = run(['--dry-run', 'libs', 'apps', 'e2e'], repositoryRoot, quiet);

        assert.equal(changedFiles, 0);
        assert.equal(editCount, 0);
      });
    });
  });
});

describe('FEATURE: TanStack v9 codemod — command line', () => {
  describe('GIVEN: a consumer project', () => {
    describe('WHEN: it runs without paths', () => {
      it('THEN: it migrates src by default', () => {
        const root = createProject({
          'src/app/state.ts': `export const s = { columnPinning: { left: ['id'] } };\n`,
          'other/ignored.ts': `export const s = { columnPinning: { left: ['id'] } };\n`
        });
        const result = run([], root, quiet);

        assert.equal(result.changedFiles, 1);
        assert.equal(
          readFileSync(join(root, 'src/app/state.ts'), 'utf8'),
          `export const s = { columnPinning: { start: ['id'], end: [] } };\n`
        );
        assert.equal(readFileSync(join(root, 'other/ignored.ts'), 'utf8'), `export const s = { columnPinning: { left: ['id'] } };\n`);
      });
    });

    describe('WHEN: it runs with --dry-run', () => {
      it('THEN: it reports the changes without writing them', () => {
        const source = `export const s = { columnPinning: { left: ['id'], right: [] } };\n`;
        const root = createProject({ 'src/state.ts': source });
        const lines = [];
        const result = run(['--dry-run'], root, (line) => lines.push(line));

        assert.equal(result.changedFiles, 1);
        assert.equal(readFileSync(join(root, 'src/state.ts'), 'utf8'), source);
        assert.ok(lines.some((line) => line.startsWith('would update src/state.ts (2 edits)')));
        assert.ok(lines.some((line) => line.includes('Dry run: 2 edits in 1 of 1 files.')));
      });
    });

    describe('WHEN: it runs over several paths and generated folders', () => {
      it('THEN: it visits the given paths and skips dependencies, builds, and declarations', () => {
        const pinning = `export const s = { columnPinning: { left: ['a'] } };\n`;
        const root = createProject({
          'src/a.ts': pinning,
          'projects/lib/b.ts': pinning,
          'src/node_modules/pkg/c.ts': pinning,
          'src/dist/d.ts': pinning,
          'src/.angular/cache/e.ts': pinning,
          'src/types.d.ts': pinning
        });
        const result = run(['src', 'projects/lib/b.ts'], root, quiet);

        assert.equal(result.changedFiles, 2);
        assert.equal(readFileSync(join(root, 'src/node_modules/pkg/c.ts'), 'utf8'), pinning);
        assert.equal(readFileSync(join(root, 'src/types.d.ts'), 'utf8'), pinning);
      });
    });

    describe('WHEN: a file uses the table API without importing the library', () => {
      it('THEN: it still migrates it', () => {
        const source = [
          `export const toggle = (column: Col) => column.pin(column.getIsPinned() === 'left' ? false : 'left');`,
          `export const width = (table: T) => table.getLeftTotalSize();`,
          `export const ids = (pinning: P) => pinning.right;`,
          `export const some = (table: T) => table.getIsSomeRowsSelected();`,
          ''
        ].join('\n');
        const root = createProject({ 'src/helpers.ts': source });
        const result = run([], root, quiet);

        assert.equal(
          readFileSync(join(root, 'src/helpers.ts'), 'utf8'),
          [
            `export const toggle = (column: Col) => column.pin(column.getIsPinned() === 'start' ? false : 'start');`,
            `export const width = (table: T) => table.getStartTotalSize();`,
            `export const ids = (pinning: P) => pinning.end;`,
            `export const some = (table: T) => table.getIsSomeRowsSelected();`,
            ''
          ].join('\n')
        );
        assert.deepEqual(
          result.manual.map(({ file, line }) => `${file}:${line}`),
          ['src/helpers.ts:4']
        );
      });
    });

    describe('WHEN: the source tree holds symlinks', () => {
      it('THEN: it skips them, so dangling, cyclic, and outside links are never read or written', () => {
        const pinning = `export const s = { columnPinning: { left: ['a'] } };\n`;
        const outside = createProject({ 'shared/state.ts': pinning });
        const root = createProject({ 'src/real.ts': pinning });

        symlinkSync(join(root, 'src/missing.ts'), join(root, 'src/dangling.ts'));
        symlinkSync(join(root, 'src'), join(root, 'src/loop'), 'dir');
        symlinkSync(join(outside, 'shared/state.ts'), join(root, 'src/outside.ts'));
        symlinkSync(join(outside, 'shared'), join(root, 'src/shared'), 'dir');

        const result = run([], root, quiet);

        assert.equal(result.changedFiles, 1);
        assert.equal(
          readFileSync(join(root, 'src/real.ts'), 'utf8'),
          `export const s = { columnPinning: { start: ['a'], end: [] } };\n`
        );
        assert.equal(readFileSync(join(outside, 'shared/state.ts'), 'utf8'), pinning);
      });
    });

    describe('WHEN: it is given an option it does not know', () => {
      it('THEN: it throws before reading any file', () => {
        const source = `export const s = { columnPinning: { left: ['id'] } };\n`;
        const root = createProject({ 'src/state.ts': source });

        assert.throws(() => run(['--dryrun', 'src'], root, quiet), /Unknown option: --dryrun/);
        assert.equal(readFileSync(join(root, 'src/state.ts'), 'utf8'), source);
      });
    });

    describe('WHEN: some code needs a manual look', () => {
      it('THEN: it lists each item with its relative path and position', () => {
        const root = createProject({
          'src/a.ts': `export const all = (table: any) => table.getState();\n`,
          'src/b.html': `<ng-container *flexRender="a(); props: build(); let r"></ng-container>\n`
        });
        const result = run([], root, quiet);

        assert.deepEqual(result.manual.map(({ file, line }) => `${file}:${line}`).sort(), ['src/a.ts:1', 'src/b.html:1']);
      });
    });

    describe('WHEN: files hold nothing to migrate', () => {
      it('THEN: it leaves them byte for byte untouched', () => {
        const source = `export const add = (a: number, b: number): number => a + b;\n`;
        const root = createProject({ 'src/math.ts': source });
        const result = run([], root, quiet);

        assert.equal(result.editCount, 0);
        assert.equal(readFileSync(join(root, 'src/math.ts'), 'utf8'), source);
      });
    });
  });

  describe('GIVEN: the script run as a command', () => {
    describe('WHEN: the project has TypeScript', () => {
      it('THEN: it exits cleanly and prints the summary', () => {
        const root = createProject({ 'src/state.ts': `export const s = { columnPinning: { left: ['id'] } };\n` });
        const result = spawnSync(process.execPath, [script, '--dry-run'], { cwd: root, encoding: 'utf8' });

        assert.equal(result.status, 0, result.stderr);
        assert.match(result.stdout, /Dry run: 2 edits in 1 of 1 files\./);
      });
    });

    describe('WHEN: it is asked for help', () => {
      for (const flag of ['--help', '-h']) {
        it(`THEN: it prints the usage for ${flag}, exits 0, and changes nothing`, () => {
          const source = `export const s = { columnPinning: { left: ['id'] } };\n`;
          const root = createProject({ 'src/state.ts': source });
          const result = spawnSync(process.execPath, [script, flag], { cwd: root, encoding: 'utf8' });

          assert.equal(result.status, 0, result.stderr);
          assert.match(result.stdout, /^Usage: ng-advanced-table-migrate-v9 \[--dry-run\] \[path \.\.\.\]/);
          assert.equal(readFileSync(join(root, 'src/state.ts'), 'utf8'), source);
        });
      }
    });

    describe('WHEN: it is given an unknown option', () => {
      for (const flag of ['--dryrun', '-n', '--write']) {
        it(`THEN: it exits 1 naming ${flag} and changes nothing`, () => {
          const source = `export const s = { columnPinning: { left: ['id'] } };\n`;
          const root = createProject({ 'src/state.ts': source });
          const result = spawnSync(process.execPath, [script, flag, 'src'], { cwd: root, encoding: 'utf8' });

          assert.equal(result.status, 1);
          assert.match(result.stderr, new RegExp(`Unknown option: ${flag}`));
          assert.match(result.stderr, /Usage:/);
          assert.equal(readFileSync(join(root, 'src/state.ts'), 'utf8'), source);
        });
      }
    });

    describe('WHEN: it is started through the node_modules/.bin link npm creates', () => {
      it('THEN: it still runs and prints the summary', () => {
        const root = createProject({ 'src/state.ts': `export const s = { columnPinning: { left: ['id'] } };\n` });
        const link = join(root, 'node_modules/.bin/ng-advanced-table-migrate-v9');

        mkdirSync(dirname(link), { recursive: true });
        symlinkSync(script, link);

        const result = spawnSync(process.execPath, [link, '--dry-run'], { cwd: root, encoding: 'utf8' });

        assert.equal(result.status, 0, result.stderr);
        assert.match(result.stdout, /Dry run: 2 edits in 1 of 1 files\./);
      });
    });

    describe('WHEN: the project has no TypeScript', () => {
      it('THEN: it exits with an error that says what is missing', () => {
        const root = createProject({ 'src/state.ts': '' }, { withTypeScript: false });
        const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });

        assert.equal(result.status, 1);
        assert.match(result.stderr, /needs the project's "typescript" package/);
      });
    });
  });
});
