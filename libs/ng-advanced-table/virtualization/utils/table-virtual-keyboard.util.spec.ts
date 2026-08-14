import { resolveNatTableVirtualNavigation } from './table-virtual-keyboard.util';

const event = (key: string, init: KeyboardEventInit = {}): KeyboardEvent => new KeyboardEvent('keydown', { key, ...init });

const subHeaderOffset = (index: number): number => {
  if (index < 33) {
    return 1;
  }

  return index < 67 ? 2 : 3;
};

describe('FEATURE: virtual grid keyboard navigation', () => {
  describe('GIVEN: focus is on the edge of the mounted row window', () => {
    describe('WHEN: Arrow Down targets an unmounted logical row', () => {
      it('THEN: it requests the next row while preserving the logical column', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('ArrowDown'),
          currentRowIndex: 12,
          currentColumnId: 'status',
          firstColumnId: 'name',
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
          firstColumnId: 'name',
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
          firstColumnId: 'name',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set([18, 19, 20, 21, 22]),
          rowCount: 100,
          rowsPerPage: 5
        });

        expect(request).toStrictEqual({ rowIndex: 25, columnId: 'region', align: 'start' });
      });
    });

    describe('WHEN: Page Up crosses a sub-header group boundary', () => {
      it('THEN: it counts the sub-header as one visual row in the page', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('PageUp'),
          currentRowIndex: 34,
          currentColumnId: 'region',
          firstColumnId: 'name',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set([30, 31, 32, 33, 34, 35]),
          rowCount: 100,
          rowsPerPage: 4,
          subHeaderOffsets: Array.from({ length: 100 }, (_, index) => subHeaderOffset(index))
        });

        expect(request).toStrictEqual({ rowIndex: 31, columnId: 'region', align: 'start' });
      });
    });

    describe('WHEN: Control End is pressed from a header cell', () => {
      it('THEN: it targets the last logical row and final visible column', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('End', { ctrlKey: true }),
          currentRowIndex: null,
          currentColumnId: 'name',
          firstColumnId: 'name',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set([0, 1, 2, 3, 4]),
          rowCount: 100,
          rowsPerPage: 5
        });

        expect(request).toStrictEqual({ rowIndex: 99, columnId: 'latency', align: 'end' });
      });
    });

    describe('WHEN: Control Home is pressed from a mid-list body cell', () => {
      it('THEN: it targets the first visible column in the header row', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('Home', { ctrlKey: true }),
          currentRowIndex: 48,
          currentColumnId: 'status',
          firstColumnId: 'name',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set([44, 45, 46, 47, 48, 49, 50]),
          rowCount: 100,
          rowsPerPage: 5
        });

        expect(request).toStrictEqual({ rowIndex: null, columnId: 'name', align: 'start' });
      });
    });

    describe('WHEN: Command Home is pressed with an empty row model', () => {
      it('THEN: it still targets the always-mounted first header cell', () => {
        const request = resolveNatTableVirtualNavigation({
          event: event('Home', { metaKey: true }),
          currentRowIndex: null,
          currentColumnId: 'name',
          firstColumnId: 'name',
          lastColumnId: 'latency',
          mountedRowIndexes: new Set<number>(),
          rowCount: 0,
          rowsPerPage: 5
        });

        expect(request).toStrictEqual({ rowIndex: null, columnId: 'name', align: 'start' });
      });
    });
  });

  describe('GIVEN: a modified or unrelated key on a mounted body cell', () => {
    describe('WHEN: navigation is resolved', () => {
      it('THEN: it declines every one so the grid keeps its default handling', () => {
        // The capture handler calls preventDefault AND stopImmediatePropagation
        // on any request, so a false positive silently swallows range selection
        // and browser shortcuts inside every virtualized table.
        const declined = ['ArrowDown', 'ArrowUp', 'PageDown'].flatMap((key) => [
          new KeyboardEvent('keydown', { key, shiftKey: true }),
          new KeyboardEvent('keydown', { key, altKey: true })
        ]);

        declined.push(new KeyboardEvent('keydown', { key: 'ArrowRight' }), new KeyboardEvent('keydown', { key: 'a' }));

        for (const declinedEvent of declined) {
          expect(
            resolveNatTableVirtualNavigation({
              event: declinedEvent,
              currentRowIndex: 10,
              currentColumnId: 'name',
              firstColumnId: 'name',
              lastColumnId: 'total',
              mountedRowIndexes: new Set([10]),
              rowCount: 100,
              rowsPerPage: 5
            })
          ).toBeNull();
        }
      });
    });
  });
});
