import type { ColumnDef } from '@tanstack/angular-table';

import type {
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableState,
} from 'ng-advanced-table-types';

import type { NatTableColumnMeta, NatTableRenderMetricsState } from './contracts';

interface ContractRow {
  durationMs: number;
}

type Expect<T extends true> = T;

type Equal<T, U> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? (<G>() => G extends U ? 1 : 2) extends <G>() => G extends T ? 1 : 2
      ? true
      : false
    : false;

type _RenderMetricsStateMatchesCore = Expect<Equal<NatTableRenderMetricsState, NatTableState>>;
type _RenderMetricsColumnMetaMatchesCore = Expect<
  Equal<NatTableColumnMeta<ContractRow, number>, InternalNatTableColumnMeta<ContractRow, number>>
>;

describe('ng-advanced-table-utils public table contracts', () => {
  it('reuses the core column metadata contract for TanStack column definitions', () => {
    const column: ColumnDef<ContractRow, number> = {
      accessorKey: 'durationMs',
      meta: {
        label: 'Duration',
        align: 'end',
        headerSize: 96,
        headerMinSize: '6rem',
        headerMaxSize: 144,
        cellTone: (context) => (context.getValue() > 16 ? 'warning' : 'neutral'),
      } satisfies NatTableColumnMeta<ContractRow, number>,
    };

    expect(column.meta?.headerSize).toBe(96);
    expect(column.meta?.headerMinSize).toBe('6rem');
    expect(column.meta?.headerMaxSize).toBe(144);
    expect(column.meta?.cellTone).toEqual(expect.any(Function));
  });
});
