import type { ColumnDef } from '@tanstack/angular-table';

import type {
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableState,
} from 'ng-advanced-table-types';

import type { NatTableColumnMeta, NatTableUiState } from './table-ui.types';

interface ContractRow {
  amount: number;
}

type Expect<T extends true> = T;

type Equal<T, U> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? (<G>() => G extends U ? 1 : 2) extends <G>() => G extends T ? 1 : 2
      ? true
      : false
    : false;

type _UiStateMatchesCore = Expect<Equal<NatTableUiState, NatTableState>>;
type _UiColumnMetaMatchesCore = Expect<
  Equal<NatTableColumnMeta<ContractRow, number>, InternalNatTableColumnMeta<ContractRow, number>>
>;

describe('ng-advanced-table-ui public table contracts', () => {
  it('reuses the core column metadata contract for TanStack column definitions', () => {
    const column: ColumnDef<ContractRow, number> = {
      accessorKey: 'amount',
      meta: {
        label: 'Amount',
        align: 'end',
        rowHeader: true,
        headerSize: 120,
        headerMinSize: '8rem',
        headerMaxSize: 180,
        cellTone: (context) => (context.getValue() > 0 ? 'positive' : null),
      } satisfies NatTableColumnMeta<ContractRow, number>,
    };

    expect(column.meta?.headerSize).toBe(120);
    expect(column.meta?.headerMinSize).toBe('8rem');
    expect(column.meta?.headerMaxSize).toBe(180);
    expect(column.meta?.cellTone).toEqual(expect.any(Function));
  });
});
