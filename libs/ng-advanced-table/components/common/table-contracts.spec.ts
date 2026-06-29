import type { ColumnDef } from '@tanstack/angular-table';
import type {
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableSortIndicatorContext as InternalNatTableSortIndicatorContext,
  NatTableState
} from 'ng-advanced-table/testing';

import type { NatTableColumnMeta } from './column-meta.type';
import type { NatTableColumnMoveDirection, NatTableSortIndicatorContext } from './header-actions.type';
import type { NatTableUiState } from './table-controller.type';

type ContractRow = {
  readonly amount: number;
};

type Expect<T extends true> = T;

type Equal<T, U> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? (<G>() => G extends U ? 1 : 2) extends <G>() => G extends T ? 1 : 2
      ? true
      : false
    : false;

type UiStateMatchesCore = Expect<Equal<NatTableUiState, NatTableState>>;
type UiColumnMetaMatchesCore = Expect<Equal<NatTableColumnMeta<ContractRow, number>, InternalNatTableColumnMeta<ContractRow, number>>>;
type UiSortIndicatorContextMatchesCore = Expect<
  Equal<NatTableSortIndicatorContext<ContractRow>, InternalNatTableSortIndicatorContext<ContractRow>>
>;

describe('FEATURE: ng-advanced-table/components public table contracts', () => {
  describe('GIVEN: the UI public contract mirror is available', () => {
    const contractsHold: [UiStateMatchesCore, UiColumnMetaMatchesCore, UiSortIndicatorContextMatchesCore] = [true, true, true];

    describe('WHEN: keeps public UI contracts aligned with the core table contracts', () => {
      it('THEN: it type-checks the published UI contracts', () => {
        expect(contractsHold).toStrictEqual([true, true, true]);

        const meta: NatTableColumnMeta<ContractRow, number> = {
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
            value: ({ value }) => value
          },
          cellTone: (context) => (context.getValue() > 0 ? 'positive' : null)
        };
        const column: ColumnDef<ContractRow, number> = {
          accessorKey: 'amount',
          meta
        };
        const moveDirection: NatTableColumnMoveDirection = 'left';

        expect(column.meta).toBe(meta);
        expect(meta.hiddenHeaderLabel).toBe('Amount');
        expect(moveDirection).toBe('left');
        expect(meta.cellHeight).toBe(52);
        expect(meta.cellMaxLines).toBe(Infinity);
        expect(meta.headerSize).toBe(120);
        expect(meta.headerMinSize).toBe('8rem');
        expect(meta.headerMaxSize).toBe(180);
        expect(meta.export?.header).toBe('Exported amount');
        expect(meta.export?.value).toStrictEqual(expect.any(Function));
        expect(meta.cellTone).toStrictEqual(expect.any(Function));
      });
    });
  });
});
