import { resolveNatTableVirtualNavigation } from './table-virtual-keyboard.util';

const event = (key: string, init: KeyboardEventInit = {}): KeyboardEvent => new KeyboardEvent('keydown', { key, ...init });

describe('FEATURE: virtual grid keyboard navigation', () => {
  describe('GIVEN: focus is on the edge of the mounted row window', () => {
    describe('WHEN: Arrow Down targets an unmounted logical row', () => {
      it('THEN: it requests the next row while preserving the logical column', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('ArrowDown'),
          currentRowIndex: 12,
          currentColumnId: 'status',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set([8, 9, 10, 11, 12]),
          rowCount: 100,
          rowsPerPage: 5
        });

        expect(request).toStrictEqual({ rowIndex: 13, columnId: 'status', align: 'auto' });
      });
    });

    describe('WHEN: Arrow Down targets an already mounted logical row', () => {
      it('THEN: it leaves movement to Angular Aria', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('ArrowDown'),
          currentRowIndex: 11,
          currentColumnId: 'status',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set([8, 9, 10, 11, 12]),
          rowCount: 100,
          rowsPerPage: 5
        });

        expect(request).toBeNull();
      });
    });
  });

  describe('GIVEN: a virtualized grid with many logical rows', () => {
    describe('WHEN: Page Down is pressed', () => {
      it('THEN: it advances by the visible row count and preserves the column', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('PageDown'),
          currentRowIndex: 20,
          currentColumnId: 'region',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set([18, 19, 20, 21, 22]),
          rowCount: 100,
          rowsPerPage: 5
        });

        expect(request).toStrictEqual({ rowIndex: 25, columnId: 'region', align: 'start' });
      });
    });

    describe('WHEN: Control End is pressed from a header cell', () => {
      it('THEN: it targets the last logical row and final visible column', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('End', { ctrlKey: true }),
          currentRowIndex: null,
          currentColumnId: 'name',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set([0, 1, 2, 3, 4]),
          rowCount: 100,
          rowsPerPage: 5
        });

        expect(request).toStrictEqual({ rowIndex: 99, columnId: 'latency', align: 'end' });
      });
    });
  });
});
