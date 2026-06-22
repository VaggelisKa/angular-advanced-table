import type { ColumnDef } from '@tanstack/angular-table';
import type {
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableState,
} from 'ng-advanced-table-types';

import type {
  NatTableColumnMeta,
  NatTableColumnMoveDirection,
  NatTableUiState,
} from './table-ui.types';

type ContractRow = {
  amount: number;
}

type Expect<T extends true> = T;

type Equal<T, U> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? (<G>() => G extends U ? 1 : 2) extends <G>() => G extends T ? 1 : 2
      ? true
      : false
    : false;

type UiStateMatchesCore = Expect<Equal<NatTableUiState, NatTableState>>;
type UiColumnMetaMatchesCore = Expect<
  Equal<NatTableColumnMeta<ContractRow, number>, InternalNatTableColumnMeta<ContractRow, number>>
>;

describe('ng-advanced-table-ui public table contracts', () => {
  // eslint-disable-next-line complexity -- linear chain of independent contract assertions
  it('reuses the core column metadata contract for TanStack column definitions', () => {
    const contractsHold: [UiStateMatchesCore, UiColumnMetaMatchesCore] = [true, true];

    expect(contractsHold).toStrictEqual([true, true]);

    const column: ColumnDef<ContractRow, number> = {
      accessorKey: 'amount',
      meta: {
        hiddenHeaderLabel: 'Amount',
        align: 'end',
        rowHeader: true,
        cellHeight: 52,
        cellMaxLines: Infinity,
        headerSize: 120,
        headerMinSize: '8rem',
        headerMaxSize: 180,
        export: {
          enabled: true,
          header: 'Exported amount',
          value: ({ value }) => value,
        },
        cellTone: (context) => (context.getValue() > 0 ? 'positive' : null),
      } satisfies NatTableColumnMeta<ContractRow, number>,
    };
    const moveDirection: NatTableColumnMoveDirection = 'left';

    expect(column.meta?.hiddenHeaderLabel).toBe('Amount');
    expect(moveDirection).toBe('left');
    expect(column.meta?.cellHeight).toBe(52);
    expect(column.meta?.cellMaxLines).toBe(Infinity);
    expect(column.meta?.headerSize).toBe(120);
    expect(column.meta?.headerMinSize).toBe('8rem');
    expect(column.meta?.headerMaxSize).toBe(180);
    expect(column.meta?.export?.header).toBe('Exported amount');
    expect(column.meta?.export?.value).toStrictEqual(expect.any(Function));
    expect(column.meta?.cellTone).toStrictEqual(expect.any(Function));
  });
});
