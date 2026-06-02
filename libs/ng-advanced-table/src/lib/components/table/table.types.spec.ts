import type {
  Equal,
  Expect,
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableSortIndicatorContext as InternalNatTableSortIndicatorContext,
  NatTableState as InternalNatTableState,
} from 'ng-advanced-table-types';

import type {
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
  Equal<NatTableSortIndicatorContext<ContractRow>, InternalNatTableSortIndicatorContext<ContractRow>>
>;

describe('ng-advanced-table public table contracts', () => {
  it('keeps public table contracts aligned with the internal contract library', () => {
    const stateKey: keyof NatTableState = 'pagination';
    const meta: NatTableColumnMeta<ContractRow, number> = {
      label: 'Amount',
      align: 'end',
      headerSize: 120,
      cellTone: (context) => (context.getValue() > 0 ? 'positive' : null),
    };

    expect(stateKey).toBe('pagination');
    expect(meta.headerSize).toBe(120);
    expect(meta.cellTone).toEqual(expect.any(Function));
  });
});
