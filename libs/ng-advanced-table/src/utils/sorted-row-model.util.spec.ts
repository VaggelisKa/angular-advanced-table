import type { ColumnDef, RowData, SortingState, Table, TableOptionsResolved } from '@tanstack/angular-table';
import { createTable, getCoreRowModel, getSortedRowModel } from '@tanstack/angular-table';

import { natGetSortedRowModel } from './sorted-row-model.util';

type SortRow = {
  readonly id: string;
  readonly code: string | undefined;
  readonly name: string;
  readonly amount: number | undefined;
  readonly createdAt: Date | undefined;
  readonly group: string;
};

const createRandom = (seed: number): (() => number) => {
  let state = seed;

  return () => {
    state = (state * 16807) % 2147483647;

    return (state - 1) / 2147483646;
  };
};

const NAMES = ['alpha', 'Alpha', 'beta', 'Beta 2', 'beta 10', 'gamma', 'item 9', 'item 10', 'Item 010', 'x-1', '', '42'];

const buildRows = (count: number, seed: number, withMissing = true): SortRow[] => {
  const random = createRandom(seed);
  const pick = <T>(values: readonly T[]): T => values[Math.floor(random() * values.length)];
  const maybe = <T>(chance: number, value: () => T): T | undefined => (random() < chance && withMissing ? undefined : value());

  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    code: maybe(0.15, () => `${pick(['A', 'b', 'C'])}${Math.floor(random() * 30)}-${pick(['x', 'Y', '7'])}`),
    name: pick(NAMES),
    amount: maybe(0.1, () => pick([Math.round(random() * 100), Number.NaN, Infinity, -5, 0, 7])),
    createdAt: maybe(0.1, () => new Date(2026, 0, 1 + Math.floor(random() * 20))),
    group: pick(['north', 'south', 'east'])
  }));
};

const createColumns = (
  overrides: Partial<Record<keyof SortRow, Partial<ColumnDef<SortRow, unknown>>>> = {}
): ColumnDef<SortRow, unknown>[] =>
  (['code', 'name', 'amount', 'createdAt', 'group'] as const).map((key) => ({
    accessorKey: key,
    ...overrides[key]
  })) as ColumnDef<SortRow, unknown>[];

const createSortedTable = <TData extends RowData>(
  data: TData[],
  columns: ColumnDef<TData, unknown>[],
  sorting: SortingState,
  sortedRowModel: typeof getSortedRowModel
): Table<TData> => {
  const options: TableOptionsResolved<TData> = {
    data,
    columns,
    state: { sorting },
    onStateChange: () => undefined,
    renderFallbackValue: null,
    getRowId: (row) => (row as { id: string }).id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortedRowModel()
  };

  return createTable(options);
};

const sortedIds = <TData extends RowData>(
  data: TData[],
  columns: ColumnDef<TData, unknown>[],
  sorting: SortingState,
  sortedRowModel: typeof getSortedRowModel
): string[] =>
  createSortedTable(data, columns, sorting, sortedRowModel)
    .getSortedRowModel()
    .rows.map((row) => row.id);

const SORTINGS: readonly SortingState[] = [
  [{ id: 'code', desc: false }],
  [{ id: 'code', desc: true }],
  [{ id: 'name', desc: false }],
  [{ id: 'name', desc: true }],
  [{ id: 'amount', desc: false }],
  [{ id: 'amount', desc: true }],
  [{ id: 'createdAt', desc: false }],
  [
    { id: 'group', desc: false },
    { id: 'name', desc: true },
    { id: 'amount', desc: false }
  ],
  [
    { id: 'createdAt', desc: true },
    { id: 'code', desc: false }
  ]
];

const COLUMN_VARIANTS: readonly (readonly [string, ColumnDef<SortRow, unknown>[]])[] = [
  ['auto sorting functions', createColumns()],
  [
    'explicit built-in sorting functions',
    createColumns({
      code: { sortingFn: 'alphanumericCaseSensitive' },
      name: { sortingFn: 'textCaseSensitive' },
      amount: { sortingFn: 'basic' },
      createdAt: { sortingFn: 'datetime' },
      group: { sortingFn: 'text' }
    })
  ],
  [
    'alphanumeric and text sorting on every string column',
    createColumns({ code: { sortingFn: 'alphanumeric' }, name: { sortingFn: 'alphanumeric' }, group: { sortingFn: 'text' } })
  ],
  [
    'sortUndefined and invertSorting options',
    createColumns({
      code: { sortUndefined: 'last' },
      amount: { sortUndefined: 'first', invertSorting: true },
      createdAt: { sortUndefined: 1 },
      name: { sortUndefined: -1 }
    })
  ],
  [
    'a consumer sorting function',
    createColumns({
      name: { sortingFn: (rowA, rowB) => rowA.original.name.length - rowB.original.name.length },
      amount: { sortingFn: (rowA, rowB) => (rowA.original.amount ?? -1) - (rowB.original.amount ?? -1), sortUndefined: -1 }
    })
  ]
];

describe('FEATURE: natGetSortedRowModel', () => {
  describe('GIVEN: randomized flat datasets compared with TanStack getSortedRowModel', () => {
    describe('WHEN: sorting with every column variant, direction, and multi-sort combination', () => {
      it('THEN: it produces the same row order', () => {
        // One dataset has no missing values, so every date column compares as times only.
        const datasets = [buildRows(160, 7), buildRows(160, 42), buildRows(160, 13, false)];
        const cases = datasets.flatMap((data) =>
          COLUMN_VARIANTS.flatMap(([, columns]) => SORTINGS.map((sorting) => ({ data, columns, sorting })))
        );

        for (const { data, columns, sorting } of cases) {
          expect(sortedIds(data, columns, sorting, natGetSortedRowModel)).toStrictEqual(
            sortedIds(data, columns, sorting, getSortedRowModel)
          );
        }
      });
    });

    describe('WHEN: rows are sorted', () => {
      it('THEN: it returns the core row objects instead of clones', () => {
        const table = createSortedTable(buildRows(50, 3), createColumns(), [{ id: 'name', desc: false }], natGetSortedRowModel);
        const sortedRows = table.getSortedRowModel().rows;

        expect(sortedRows.every((row) => table.getCoreRowModel().rowsById[row.id] === row)).toBe(true);
        expect(table.getSortedRowModel().flatRows).toStrictEqual(sortedRows);
      });
    });

    describe('WHEN: there is no sorting or no rows', () => {
      it('THEN: it returns the pre-sorted row model unchanged', () => {
        const unsorted = createSortedTable(buildRows(10, 5), createColumns(), [], natGetSortedRowModel);
        const empty = createSortedTable([], createColumns(), [{ id: 'name', desc: false }], natGetSortedRowModel);

        expect(unsorted.getSortedRowModel()).toBe(unsorted.getPreSortedRowModel());
        expect(empty.getSortedRowModel()).toBe(empty.getPreSortedRowModel());
      });
    });

    describe('WHEN: a datetime column holds Date subclasses that override valueOf', () => {
      it('THEN: it sorts by the overridden value like TanStack does', () => {
        class ReversedDate extends Date {
          public override valueOf(): number {
            return -this.getTime();
          }
        }
        const data = buildRows(60, 5, false).map((row) => ({ ...row, createdAt: new ReversedDate(row.createdAt ?? 0) }));
        const columns = createColumns({ createdAt: { sortingFn: 'datetime' } });
        const sorting: SortingState = [{ id: 'createdAt', desc: false }];

        expect(sortedIds(data, columns, sorting, natGetSortedRowModel)).toStrictEqual(
          sortedIds(data, columns, sorting, getSortedRowModel)
        );
      });
    });

    describe('WHEN: sorting by an unknown or unsortable column', () => {
      it('THEN: it ignores that entry like TanStack does', () => {
        const data = buildRows(80, 9);
        const columns = createColumns({ name: { enableSorting: false } });
        const sorting: SortingState = [
          { id: 'missing', desc: false },
          { id: 'name', desc: false },
          { id: 'amount', desc: true }
        ];

        expect(sortedIds(data, columns, sorting, natGetSortedRowModel)).toStrictEqual(
          sortedIds(data, columns, sorting, getSortedRowModel)
        );
      });
    });

    describe('WHEN: a comparison does not need a column value', () => {
      it('THEN: it only reads values the comparison uses', () => {
        const reads = new Set<string>();
        const columns: ColumnDef<SortRow, unknown>[] = [
          {
            id: 'byName',
            accessorFn: (row): never => {
              throw new Error(`unexpected read of ${row.id}`);
            },
            sortUndefined: false,
            sortingFn: (rowA, rowB) => rowA.original.name.localeCompare(rowB.original.name)
          },
          {
            id: 'byId',
            accessorFn: (row): string => {
              reads.add(row.id);

              return row.id;
            },
            sortingFn: 'basic'
          }
        ];
        const data = buildRows(40, 11).map((row, index) => ({ ...row, name: `name-${String(index).padStart(2, '0')}` }));
        const sorting: SortingState = [
          { id: 'byName', desc: true },
          { id: 'byId', desc: false }
        ];

        expect(sortedIds(data, columns, sorting, natGetSortedRowModel)).toStrictEqual(data.map((row) => row.id).reverse());
        expect(reads.size).toBe(0);
      });
    });

    describe('WHEN: rows carry sub-rows', () => {
      it('THEN: it falls back to TanStack sorting for the whole tree', () => {
        type TreeRow = { readonly id: string; readonly name: string; readonly children?: TreeRow[] };
        const data: TreeRow[] = [
          {
            id: 'b',
            name: 'b',
            children: [
              { id: 'b2', name: 'z' },
              { id: 'b1', name: 'a' }
            ]
          },
          { id: 'a', name: 'a' }
        ];
        const columns: ColumnDef<TreeRow, unknown>[] = [{ accessorKey: 'name' }];
        const table = createTable<TreeRow>({
          data,
          columns,
          state: { sorting: [{ id: 'name', desc: false }] },
          onStateChange: () => undefined,
          renderFallbackValue: null,
          getRowId: (row) => row.id,
          getSubRows: (row) => row.children,
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: natGetSortedRowModel()
        });
        const sorted = table.getSortedRowModel();

        expect(sorted.rows.map((row) => row.id)).toStrictEqual(['a', 'b']);
        expect(sorted.rows[1].subRows.map((row) => row.id)).toStrictEqual(['b1', 'b2']);
      });
    });

    describe('WHEN: sub-row sorting is cleared, then restored after the sorting function changed', () => {
      it('THEN: it sorts with the new sorting function like TanStack does', () => {
        type TreeRow = { readonly id: string; readonly name: string; readonly children?: TreeRow[] };
        const data: TreeRow[] = [
          { id: 'b', name: 'b', children: [{ id: 'b1', name: 'x' }] },
          { id: 'a', name: 'a' },
          { id: 'c', name: 'c' }
        ];
        const sorting: SortingState = [{ id: 'name', desc: false }];
        const descendingColumns: ColumnDef<TreeRow, unknown>[] = [
          { accessorKey: 'name', sortingFn: (rowA, rowB) => rowB.original.name.localeCompare(rowA.original.name) }
        ];
        const table = createTable<TreeRow>({
          data,
          columns: [{ accessorKey: 'name', sortingFn: 'text' }],
          state: { sorting },
          onStateChange: () => undefined,
          renderFallbackValue: null,
          getRowId: (row) => row.id,
          getSubRows: (row) => row.children,
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: natGetSortedRowModel()
        });

        expect(table.getSortedRowModel().rows.map((row) => row.id)).toStrictEqual(['a', 'b', 'c']);
        table.setOptions((options) => ({ ...options, state: { sorting: [] } }));
        table.getSortedRowModel();
        table.setOptions((options) => ({ ...options, columns: descendingColumns, state: { sorting } }));

        expect(table.getSortedRowModel().rows.map((row) => row.id)).toStrictEqual(['c', 'b', 'a']);
      });
    });
  });
});
