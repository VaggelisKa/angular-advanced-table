import type {
  Equal,
  Expect,
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableSortIndicatorContext as InternalNatTableSortIndicatorContext,
  NatTableState as InternalNatTableState,
} from 'ng-advanced-table-types';

import type {
  NatTableColumnMoveDirection,
  NatTableColumnMeta,
  NatTableSortIndicatorContext,
  NatTableState,
} from './table.types';

interface ContractRow {
  amount: number;
}

type _NatTableStateMatchesInternalContract = Expect<Equal<NatTableState, InternalNatTableState>>;
type _NatTableColumnMetaMatchesInternalContract = Expect<
  Equal<NatTableColumnMeta<ContractRow, number>, InternalNatTableColumnMeta<ContractRow, number>>
>;
type _NatTableSortIndicatorContextMatchesInternalContract = Expect<
  Equal<
    NatTableSortIndicatorContext<ContractRow>,
    InternalNatTableSortIndicatorContext<ContractRow>
  >
>;

describe('ng-advanced-table public table contracts', () => {
  it('keeps public table contracts aligned with the internal contract library', () => {
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
        value: ({ value }) => value,
      },
      cellTone: (context) => (context.getValue() > 0 ? 'positive' : null),
    };

    expect(stateKey).toBe('pagination');
    expect(moveDirection).toBe('right');
    expect(meta.hiddenHeaderLabel).toBe('Amount');
    expect(meta.cellHeight).toBe(48);
    expect(meta.cellMaxLines).toBe(3);
    expect(meta.headerSize).toBe(120);
    expect(meta.export?.header).toBe('Exported amount');
    expect(meta.export?.value).toEqual(expect.any(Function));
    expect(meta.cellTone).toEqual(expect.any(Function));
  });
});
