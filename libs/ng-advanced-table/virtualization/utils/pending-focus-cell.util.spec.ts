import { resolveNatTablePendingFocusCells } from './pending-focus-cell.util';

const firstColumnId = (cells: readonly HTMLElement[]): string | undefined => cells.at(0)?.dataset['columnId'];
const removeBody = (host: HTMLElement): void => host.querySelector('tbody')?.remove();

describe('FEATURE: pending virtual table focus targets', () => {
  describe('GIVEN: mounted header, data, and state cells', () => {
    describe('WHEN: pending focus targets are resolved after rendering', () => {
      it('THEN: it returns the requested row or the appropriate body and header fallbacks', () => {
        const host = document.createElement('div');

        host.innerHTML = `
          <table>
            <thead><tr><th ngGridCell data-column-id="name"></th><th ngGridCell data-column-id="status"></th></tr></thead>
            <tbody>
              <tr class="data-row" data-row-index="12"><td ngGridCell data-column-id="name"></td></tr>
            </tbody>
          </table>
        `;

        expect(resolveNatTablePendingFocusCells(host, { rowIndex: null, columnId: 'name', preferHeader: true })).toHaveLength(2);
        expect(resolveNatTablePendingFocusCells(host, { rowIndex: 12, columnId: 'name' })).toHaveLength(1);
        expect(firstColumnId(resolveNatTablePendingFocusCells(host, { rowIndex: null, columnId: 'status' }))).toBe('name');

        removeBody(host);
        expect(firstColumnId(resolveNatTablePendingFocusCells(host, { rowIndex: null, columnId: 'status' }))).toBe('status');
        expect(resolveNatTablePendingFocusCells(host, { rowIndex: 99, columnId: 'status' })).toStrictEqual([]);
      });
    });
  });
});
