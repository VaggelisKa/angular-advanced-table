/* eslint-disable max-lines -- exhaustive branch coverage for buildColumnRenderState */
import type { Column } from '@tanstack/angular-table';

import { buildColumnRenderState } from './column-render-state.util';
import { DEFAULT_CELL_MAX_LINES } from '../common/column-meta.const';
import type { NatTableColumnMeta } from '../common/column-meta.type';
import type { ColumnRenderStateContext, TableColumnSizingState } from '../common/column-render.type';
import type { NatTableUserState } from '../common/table-state.type';

/** Minimal row shape used to satisfy the `Column<TData, unknown>` generic in stubs. */
type Row = { readonly id: string };

type ColumnStubOptions = {
  readonly id?: string;
  readonly size?: number;
  readonly header?: string;
  readonly accessorKey?: string;
  readonly minSize?: number;
  readonly maxSize?: number;
  readonly meta?: NatTableColumnMeta<Row, unknown>;
};

/** Stubs only the `Column` surface `buildColumnRenderState` actually reads: `.id`, `.getSize()`, `.columnDef`. */
const createColumn = (options: ColumnStubOptions = {}): Column<Row, unknown> => {
  const { id, size, header, accessorKey, minSize, maxSize, meta } = { id: 'name', size: 0, ...options };

  return {
    id,
    getSize: () => size,
    columnDef: { header, accessorKey, minSize, maxSize, meta }
  } as unknown as Column<Row, unknown>;
};

/** A bare column reference (`.id` only), enough for the `leftVisibleColumns` / `rightVisibleColumns` zone arrays. */
const columnRef = (id: string): Column<Row, unknown> => ({ id }) as unknown as Column<Row, unknown>;

const createState = (overrides: Partial<NatTableUserState> = {}): NatTableUserState => ({
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  pagination: { pageIndex: 0, pageSize: 10 },
  columnVisibility: {},
  columnOrder: [],
  columnPinning: { left: [], right: [] },
  columnSizing: {},
  rowSelection: {},
  ...overrides
});

const createContext = (overrides: Partial<ColumnRenderStateContext<Row>> = {}): ColumnRenderStateContext<Row> => ({
  widths: {},
  state: createState(),
  userColumnSizing: {},
  primarySortColumnId: null,
  leftVisibleColumns: [],
  rightVisibleColumns: [],
  leftPinnedIds: new Set(),
  rightPinnedIds: new Set(),
  leftOffsets: {},
  rightOffsets: {},
  ...overrides
});

const sizing = (overrides: Partial<TableColumnSizingState> = {}): Record<string, TableColumnSizingState> => ({
  name: { hasSize: false, hasMinSize: false, hasMaxSize: false, ...overrides }
});

describe('FEATURE: column render state', () => {
  describe('GIVEN: label resolution', () => {
    describe('WHEN: the column declares a hidden header label', () => {
      it('THEN: it trims the label and uses it for both the visible label and the hidden header label', () => {
        const column = createColumn({ id: 'status', header: 'Status', meta: { hiddenHeaderLabel: '  Status Column  ' } });

        const result = buildColumnRenderState(column, createContext());

        expect(result.label).toBe('Status Column');
        expect(result.hiddenHeaderLabel).toBe('Status Column');
      });
    });

    describe('WHEN: the column declares a meta label but no hidden header label', () => {
      it('THEN: it uses the meta label and reports no hidden header label', () => {
        const column = createColumn({ id: 'age', meta: { label: 'Age (Years)' } });

        const result = buildColumnRenderState(column, createContext());

        expect(result.label).toBe('Age (Years)');
        expect(result.hiddenHeaderLabel).toBeNull();
      });
    });

    describe('WHEN: the column has a string header but no meta label', () => {
      it('THEN: it uses the header string as the label', () => {
        const column = createColumn({ id: 'status', header: 'Status' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.label).toBe('Status');
      });
    });

    describe('WHEN: the column has an accessor key but no header string or meta label', () => {
      it('THEN: it uses the accessor key as the label', () => {
        const column = createColumn({ id: 'email', accessorKey: 'emailAddress' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.label).toBe('emailAddress');
      });
    });

    describe('WHEN: the column has no header content at all', () => {
      it('THEN: it falls back to the column id', () => {
        const column = createColumn({ id: 'status' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.label).toBe('status');
      });
    });
  });

  describe('GIVEN: render flags from column meta', () => {
    describe('WHEN: meta declares end alignment', () => {
      it('THEN: it marks the column end-aligned in the resolved state and both class maps', () => {
        const column = createColumn({ id: 'amount', meta: { align: 'end' } });

        const result = buildColumnRenderState(column, createContext());

        expect(result.alignEnd).toBe(true);
        expect(result.headerClassMap).toContain('is-align-end');
        expect(result.cellClassMap).toContain('is-align-end');
      });
    });

    describe('WHEN: meta marks the column as the row header', () => {
      it('THEN: it flags the column as a row header and adds the row-header cell class', () => {
        const column = createColumn({ id: 'name', meta: { rowHeader: true } });

        const result = buildColumnRenderState(column, createContext());

        expect(result.rowHeader).toBe(true);
        expect(result.cellClassMap).toContain('data-row-header');
      });
    });

    describe('WHEN: meta declares neither alignment nor a row header', () => {
      it('THEN: it leaves both flags false and omits their classes', () => {
        const column = createColumn({ id: 'name' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.alignEnd).toBe(false);
        expect(result.rowHeader).toBe(false);
        expect(result.cellClassMap).not.toContain('data-row-header');
      });
    });
  });

  describe('GIVEN: pinned edges', () => {
    describe('WHEN: the column is not pinned', () => {
      it('THEN: it reports no pinning, no edge flags, and null offsets', () => {
        const column = createColumn({ id: 'name' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.pinnedLeft).toBe(false);
        expect(result.pinnedRight).toBe(false);
        expect(result.hasPinnedEdgeLeft).toBe(false);
        expect(result.hasPinnedEdgeRight).toBe(false);
        expect(result.left).toBeNull();
        expect(result.right).toBeNull();
      });
    });

    describe('WHEN: the column is the last visible column in the left-pinned zone', () => {
      it('THEN: it flags the left pinned edge and resolves the recorded offset', () => {
        const column = createColumn({ id: 'name' });
        const context = createContext({
          leftPinnedIds: new Set(['id', 'name']),
          leftVisibleColumns: [columnRef('id'), columnRef('name')],
          leftOffsets: { name: 120 }
        });

        const result = buildColumnRenderState(column, context);

        expect(result.pinnedLeft).toBe(true);
        expect(result.hasPinnedEdgeLeft).toBe(true);
        expect(result.left).toBe(120);
      });
    });

    describe('WHEN: the column is left-pinned but not the last column in the zone', () => {
      it('THEN: it does not flag the left pinned edge and defaults a missing offset to zero', () => {
        const column = createColumn({ id: 'name' });
        const context = createContext({
          leftPinnedIds: new Set(['name', 'id']),
          leftVisibleColumns: [columnRef('name'), columnRef('id')],
          leftOffsets: {}
        });

        const result = buildColumnRenderState(column, context);

        expect(result.hasPinnedEdgeLeft).toBe(false);
        expect(result.left).toBe(0);
      });
    });

    describe('WHEN: the column is the first visible column in the right-pinned zone', () => {
      it('THEN: it flags the right pinned edge and resolves the recorded offset', () => {
        const column = createColumn({ id: 'actions' });
        const context = createContext({
          rightPinnedIds: new Set(['actions', 'more']),
          rightVisibleColumns: [columnRef('actions'), columnRef('more')],
          rightOffsets: { actions: 64 }
        });

        const result = buildColumnRenderState(column, context);

        expect(result.pinnedRight).toBe(true);
        expect(result.hasPinnedEdgeRight).toBe(true);
        expect(result.right).toBe(64);
      });
    });

    describe('WHEN: the column is right-pinned but not the first column in the zone', () => {
      it('THEN: it does not flag the right pinned edge and defaults a missing offset to zero', () => {
        const column = createColumn({ id: 'actions' });
        const context = createContext({
          rightPinnedIds: new Set(['more', 'actions']),
          rightVisibleColumns: [columnRef('more'), columnRef('actions')],
          rightOffsets: {}
        });

        const result = buildColumnRenderState(column, context);

        expect(result.hasPinnedEdgeRight).toBe(false);
        expect(result.right).toBe(0);
      });
    });
  });

  describe('GIVEN: sort state resolution', () => {
    describe('WHEN: the column is the primary sort in ascending order', () => {
      it('THEN: it resolves an ascending aria-sort value', () => {
        const column = createColumn({ id: 'name' });
        const context = createContext({
          primarySortColumnId: 'name',
          state: createState({ sorting: [{ id: 'name', desc: false }] })
        });

        const result = buildColumnRenderState(column, context);

        expect(result.ariaSort).toBe('ascending');
      });
    });

    describe('WHEN: the column is the primary sort in descending order', () => {
      it('THEN: it resolves a descending aria-sort value', () => {
        const column = createColumn({ id: 'name' });
        const context = createContext({
          primarySortColumnId: 'name',
          state: createState({ sorting: [{ id: 'name', desc: true }] })
        });

        const result = buildColumnRenderState(column, context);

        expect(result.ariaSort).toBe('descending');
      });
    });

    describe('WHEN: the column is only a secondary sort entry', () => {
      it('THEN: it resolves a null aria-sort value', () => {
        const column = createColumn({ id: 'name' });
        const context = createContext({
          primarySortColumnId: 'status',
          state: createState({
            sorting: [
              { id: 'status', desc: false },
              { id: 'name', desc: true }
            ]
          })
        });

        const result = buildColumnRenderState(column, context);

        expect(result.ariaSort).toBeNull();
      });
    });

    describe('WHEN: the column has no sort entry at all', () => {
      it('THEN: it resolves a null aria-sort value', () => {
        const column = createColumn({ id: 'name' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.ariaSort).toBeNull();
      });
    });

    describe('WHEN: the column is marked primary but the sorting state has no matching entry', () => {
      it('THEN: it resolves a null aria-sort value instead of throwing', () => {
        const column = createColumn({ id: 'name' });
        const context = createContext({ primarySortColumnId: 'name', state: createState({ sorting: [] }) });

        const result = buildColumnRenderState(column, context);

        expect(result.ariaSort).toBeNull();
      });
    });
  });

  describe('GIVEN: body width and constrained-width resolution', () => {
    describe('WHEN: the column declares no explicit size and has not been resized', () => {
      it('THEN: it resolves null width, min width, and max width and reports an unconstrained width', () => {
        const column = createColumn({ id: 'name', size: 150 });

        const result = buildColumnRenderState(column, createContext());

        expect(result.width).toBeNull();
        expect(result.minWidth).toBeNull();
        expect(result.maxWidth).toBeNull();
        expect(result.constrainedWidth).toBe(false);
      });
    });

    describe('WHEN: the column declares an explicit def size', () => {
      it('THEN: it resolves the width from getSize and defaults min/max width to that same width', () => {
        const column = createColumn({ id: 'name', size: 180 });
        const context = createContext({ userColumnSizing: sizing({ hasSize: true }) });

        const result = buildColumnRenderState(column, context);

        expect(result.width).toBe('180px');
        expect(result.minWidth).toBe('180px');
        expect(result.maxWidth).toBe('180px');
        expect(result.constrainedWidth).toBe(true);
      });
    });

    describe('WHEN: the column has been interactively resized', () => {
      it('THEN: it resolves the width from the measured widths map over the column def size', () => {
        const column = createColumn({ id: 'name', size: 150 });
        const context = createContext({
          state: createState({ columnSizing: { name: 220 } }),
          widths: { name: 235 }
        });

        const result = buildColumnRenderState(column, context);

        expect(result.width).toBe('235px');
      });
    });

    describe('WHEN: the column is resized but the measured widths map has no entry for it yet', () => {
      it('THEN: it falls back to the column def size', () => {
        const column = createColumn({ id: 'name', size: 190 });
        const context = createContext({ state: createState({ columnSizing: { name: 220 } }), widths: {} });

        const result = buildColumnRenderState(column, context);

        expect(result.width).toBe('190px');
      });
    });

    describe('WHEN: the column declares explicit min and max sizes independent of its resolved width', () => {
      it('THEN: it uses the declared bounds and reports a constrained width even though the base width is unset', () => {
        const column = createColumn({ id: 'name', minSize: 50, maxSize: 300 });
        const context = createContext({ userColumnSizing: sizing({ hasMinSize: true, hasMaxSize: true }) });

        const result = buildColumnRenderState(column, context);

        expect(result.width).toBeNull();
        expect(result.minWidth).toBe('50px');
        expect(result.maxWidth).toBe('300px');
        expect(result.constrainedWidth).toBe(true);
      });
    });
  });

  describe('GIVEN: header width resolution', () => {
    describe('WHEN: the column has been interactively resized and declares header meta bounds', () => {
      it('THEN: the resized width drives every header dimension, overriding the header meta bounds', () => {
        const column = createColumn({
          id: 'name',
          size: 150,
          meta: { headerSize: 999, headerMinSize: 10, headerMaxSize: 20 }
        });
        const context = createContext({
          state: createState({ columnSizing: { name: 220 } }),
          widths: { name: 220 }
        });

        const result = buildColumnRenderState(column, context);

        expect(result.headerWidth).toBe('220px');
        expect(result.headerMinWidth).toBe('220px');
        expect(result.headerMaxWidth).toBe('220px');
        expect(result.headerConstrainedWidth).toBe(true);
      });
    });

    describe('WHEN: the column is unresized and declares header-only meta sizing', () => {
      it('THEN: it uses the meta values and falls back to the header width for an unset bound', () => {
        const column = createColumn({ id: 'name', meta: { headerSize: 150, headerMaxSize: '20rem' } });

        const result = buildColumnRenderState(column, createContext());

        expect(result.headerWidth).toBe('150px');
        expect(result.headerMinWidth).toBe('150px');
        expect(result.headerMaxWidth).toBe('20rem');
        expect(result.headerConstrainedWidth).toBe(true);
      });
    });

    describe('WHEN: the column is unresized and declares no header sizing at all', () => {
      it('THEN: it leaves every header dimension unset and reports an unconstrained header width', () => {
        const column = createColumn({ id: 'name' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.headerWidth).toBeNull();
        expect(result.headerMinWidth).toBeNull();
        expect(result.headerMaxWidth).toBeNull();
        expect(result.headerConstrainedWidth).toBe(false);
      });
    });
  });

  describe('GIVEN: cell max lines normalization', () => {
    describe('WHEN: meta does not declare cellMaxLines', () => {
      it('THEN: it defaults to the shared default line count', () => {
        const column = createColumn({ id: 'name' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.cellMaxLines).toBe(DEFAULT_CELL_MAX_LINES);
      });
    });

    describe('WHEN: meta declares cellMaxLines as Infinity', () => {
      it('THEN: it resolves a null line count and disables cell clamping', () => {
        const column = createColumn({ id: 'name', meta: { cellMaxLines: Infinity } });

        const result = buildColumnRenderState(column, createContext());

        expect(result.cellMaxLines).toBeNull();
        expect(result.cellClassMap).not.toContain('is-cell-clamped');
      });
    });

    describe('WHEN: meta declares a valid fractional cellMaxLines', () => {
      it('THEN: it floors the value to a whole number of lines', () => {
        const column = createColumn({ id: 'name', meta: { cellMaxLines: 4.9 } });

        const result = buildColumnRenderState(column, createContext());

        expect(result.cellMaxLines).toBe(4);
      });
    });

    describe('WHEN: meta declares an out-of-range cellMaxLines', () => {
      it('THEN: it falls back to the shared default line count', () => {
        const column = createColumn({ id: 'name', meta: { cellMaxLines: 0 } });

        const result = buildColumnRenderState(column, createContext());

        expect(result.cellMaxLines).toBe(DEFAULT_CELL_MAX_LINES);
      });
    });
  });

  describe('GIVEN: header and cell class map composition', () => {
    describe('WHEN: the column has no special flags', () => {
      it('THEN: it renders only the base classes, still clamped by the default line count', () => {
        const column = createColumn({ id: 'name' });

        const result = buildColumnRenderState(column, createContext());

        expect(result.headerClassMap).toBe('header-cell');
        expect(result.cellClassMap).toBe('data-cell is-cell-clamped');
      });
    });

    describe('WHEN: the column is a left-pinned edge with end alignment and a constrained width', () => {
      it('THEN: it composes every applicable header and cell class in declaration order', () => {
        const column = createColumn({ id: 'amount', size: 120, meta: { align: 'end', headerSize: 120 } });
        const context = createContext({
          leftPinnedIds: new Set(['amount']),
          leftVisibleColumns: [columnRef('amount')],
          leftOffsets: { amount: 0 },
          userColumnSizing: { amount: { hasSize: true, hasMinSize: false, hasMaxSize: false } }
        });

        const result = buildColumnRenderState(column, context);

        expect(result.headerClassMap).toBe('header-cell has-pinned-edge-left is-align-end is-pinned-left is-width-constrained');
        expect(result.cellClassMap).toBe(
          'data-cell has-pinned-edge-left is-align-end is-cell-clamped is-pinned-left is-width-constrained'
        );
      });
    });

    describe('WHEN: the column is a right-pinned edge row header with clamping disabled', () => {
      it('THEN: it composes only the applicable header and cell classes', () => {
        const column = createColumn({ id: 'actions', meta: { rowHeader: true, cellMaxLines: Infinity } });
        const context = createContext({
          rightPinnedIds: new Set(['actions']),
          rightVisibleColumns: [columnRef('actions')],
          rightOffsets: { actions: 0 }
        });

        const result = buildColumnRenderState(column, context);

        expect(result.headerClassMap).toBe('header-cell has-pinned-edge-right is-pinned-right');
        expect(result.cellClassMap).toBe('data-cell data-row-header has-pinned-edge-right is-pinned-right');
      });
    });
  });
});
