import type {
  ColumnDef as TanStackColumnDef,
  PaginationState as TanStackPaginationState,
  RowData as TanStackRowData,
  SortingState as TanStackSortingState
} from '@tanstack/angular-table';
import { flexRenderComponent as tanStackFlexRenderComponent } from '@tanstack/angular-table';
import type {
  Equal,
  Expect,
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableSortIndicatorContext as InternalNatTableSortIndicatorContext,
  NatTableUserState as InternalNatTableState,
  NatTableUiController as InternalNatTableUiController
} from 'ng-advanced-table/testing';

import type {
  ColumnDef as ForwardedColumnDef,
  PaginationState as ForwardedPaginationState,
  RowData as ForwardedRowData,
  SortingState as ForwardedSortingState,
  NatTableColumnMeta,
  NatTableColumnMoveDirection,
  NatTableSortIndicatorContext,
  NatTableUiController,
  NatTableUserState
} from '..';
import { flexRenderComponent as forwardedFlexRenderComponent } from '..';

type ContractRow = {
  readonly amount: number;
};

type NatTableStateMatchesInternalContract = Expect<Equal<NatTableUserState, InternalNatTableState>>;
type NatTableColumnMetaMatchesInternalContract = Expect<
  Equal<NatTableColumnMeta<ContractRow, number>, InternalNatTableColumnMeta<ContractRow, number>>
>;
type NatTableSortIndicatorContextMatchesInternalContract = Expect<
  Equal<NatTableSortIndicatorContext<ContractRow>, InternalNatTableSortIndicatorContext<ContractRow>>
>;
type NatTableUiControllerMatchesInternalContract = Expect<
  Equal<NatTableUiController<ContractRow>, InternalNatTableUiController<ContractRow>>
>;
type ForwardedColumnDefMatchesTanStack = Expect<Equal<ForwardedColumnDef<ContractRow>, TanStackColumnDef<ContractRow>>>;
type ForwardedSortingStateMatchesTanStack = Expect<Equal<ForwardedSortingState, TanStackSortingState>>;
type ForwardedPaginationStateMatchesTanStack = Expect<Equal<ForwardedPaginationState, TanStackPaginationState>>;
type ForwardedRowDataMatchesTanStack = Expect<Equal<ForwardedRowData, TanStackRowData>>;

describe('FEATURE: ng-advanced-table public table contracts', () => {
  describe('GIVEN: the core public contract mirror is available', () => {
    describe('WHEN: keeps public table contracts aligned with the internal contract library', () => {
      it('THEN: it type-checks the published table contracts', () => {
        // Compile-time contract assertions: the tuple type only resolves when each public
        // type structurally matches its internal counterpart, so a drift fails the build.
        const contractChecks: [
          NatTableStateMatchesInternalContract,
          NatTableColumnMetaMatchesInternalContract,
          NatTableSortIndicatorContextMatchesInternalContract,
          NatTableUiControllerMatchesInternalContract,
          ForwardedColumnDefMatchesTanStack,
          ForwardedSortingStateMatchesTanStack,
          ForwardedPaginationStateMatchesTanStack,
          ForwardedRowDataMatchesTanStack
        ] = [true, true, true, true, true, true, true, true];

        expect(contractChecks).toStrictEqual([true, true, true, true, true, true, true, true]);

        const stateKey: keyof NatTableUserState = 'pagination';
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
        expect(forwardedFlexRenderComponent).toBe(tanStackFlexRenderComponent);
      });
    });
  });
});
