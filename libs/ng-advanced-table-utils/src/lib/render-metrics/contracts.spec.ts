import type { ColumnDef } from '@tanstack/angular-table';
import type {
  NatTableColumnMeta as InternalNatTableColumnMeta,
  NatTableRenderMetricsController as InternalNatTableRenderMetricsController,
  NatTableState
} from 'ng-advanced-table-types';

import type { NatTableColumnMeta, NatTableRenderMetricsController, NatTableRenderMetricsState } from './contracts';

type ContractRow = {
  durationMs: number;
};

type Expect<T extends true> = T;

type Equal<T, U> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? (<G>() => G extends U ? 1 : 2) extends <G>() => G extends T ? 1 : 2
      ? true
      : false
    : false;

type RenderMetricsStateMatchesCore = Expect<Equal<NatTableRenderMetricsState, NatTableState>>;
type RenderMetricsColumnMetaMatchesCore = Expect<
  Equal<NatTableColumnMeta<ContractRow, number>, InternalNatTableColumnMeta<ContractRow, number>>
>;
type RenderMetricsControllerMatchesCore = Expect<
  Equal<NatTableRenderMetricsController<ContractRow>, InternalNatTableRenderMetricsController<ContractRow>>
>;

function requireDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('Expected value to be defined.');
  }

  return value;
}

describe('ng-advanced-table-utils public table contracts', () => {
  it('matches the core render-metrics type contracts', () => {
    const typeContracts: [RenderMetricsStateMatchesCore, RenderMetricsColumnMetaMatchesCore, RenderMetricsControllerMatchesCore] = [
      true,
      true,
      true
    ];

    expect(typeContracts).toHaveLength(3);
  });

  it('reuses the core column metadata contract for TanStack column definitions', () => {
    const column: ColumnDef<ContractRow, number> = {
      accessorKey: 'durationMs',
      meta: {
        hiddenHeaderLabel: 'Duration',
        align: 'end',
        cellHeight: '3rem',
        cellMaxLines: 1,
        headerSize: 96,
        headerMinSize: '6rem',
        headerMaxSize: 144,
        export: {
          enabled: true,
          header: 'Render duration',
          value: ({ value }) => value
        },
        cellTone: (context) => (context.getValue() > 16 ? 'warning' : 'neutral')
      } satisfies NatTableColumnMeta<ContractRow, number>
    };

    const meta = requireDefined(column.meta);
    const exportMeta = requireDefined(meta.export);

    expect(meta.hiddenHeaderLabel).toBe('Duration');
    expect(meta.cellHeight).toBe('3rem');
    expect(meta.cellMaxLines).toBe(1);
    expect(meta.headerSize).toBe(96);
    expect(meta.headerMinSize).toBe('6rem');
    expect(meta.headerMaxSize).toBe(144);
    expect(exportMeta.header).toBe('Render duration');
    expect(exportMeta.value).toStrictEqual(expect.any(Function));
    expect(meta.cellTone).toStrictEqual(expect.any(Function));
  });
});
