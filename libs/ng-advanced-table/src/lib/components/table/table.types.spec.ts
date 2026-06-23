import type {
  Equal,
  Expect,
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableSortIndicatorContext as InternalNatTableSortIndicatorContext,
  NatTableState as InternalNatTableState
} from 'ng-advanced-table-types';

import type { NatTableColumnMeta, NatTableColumnMoveDirection, NatTableSortIndicatorContext, NatTableState } from './table.types';

type ContractRow = {
  amount: number;
};

type NatTableStateMatchesInternalContract = Expect<Equal<NatTableState, InternalNatTableState>>;
type NatTableColumnMetaMatchesInternalContract = Expect<
  Equal<NatTableColumnMeta<ContractRow, number>, InternalNatTableColumnMeta<ContractRow, number>>
>;
type NatTableSortIndicatorContextMatchesInternalContract = Expect<
  Equal<NatTableSortIndicatorContext<ContractRow>, InternalNatTableSortIndicatorContext<ContractRow>>
>;

describe('ng-advanced-table public table contracts', () => {
  it('keeps public table contracts aligned with the internal contract library', () => {
    // Compile-time contract assertions: the tuple type only resolves when each public
    // type structurally matches its internal counterpart, so a drift fails the build.
    const contractChecks: [
      NatTableStateMatchesInternalContract,
      NatTableColumnMetaMatchesInternalContract,
      NatTableSortIndicatorContextMatchesInternalContract
    ] = [true, true, true];

    expect(contractChecks).toStrictEqual([true, true, true]);

    const stateKey: keyof NatTableState = 'pagination';
    const moveDirection: NatTableColumnMoveDirection = 'right';
    const meta: NatTableColumnMeta<ContractRow, number> = {
      hiddenHeaderLabel: 'Amount',
      align: 'end',
      cellHeight: 48,
      cellMaxLines: 3,
      headerSize: 120,
      export: {
        enabled: true,
        header: 'Exported amount',
        value: ({ value }) => value
      },
      cellTone: (context) => (context.getValue() > 0 ? 'positive' : null)
    };

    expect(stateKey).toBe('pagination');
    expect(moveDirection).toBe('right');
    expect(meta.hiddenHeaderLabel).toBe('Amount');
    expect(meta.cellHeight).toBe(48);
    expect(meta.cellMaxLines).toBe(3);
    expect(meta.headerSize).toBe(120);
    expect(meta.export?.header).toBe('Exported amount');
    expect(meta.export?.value).toStrictEqual(expect.any(Function));
    expect(meta.cellTone).toStrictEqual(expect.any(Function));
  });
});
