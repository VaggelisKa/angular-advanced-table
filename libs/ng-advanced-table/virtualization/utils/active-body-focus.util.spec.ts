import { readNatTableActiveBodyFocus } from './active-body-focus.util';

describe('FEATURE: active virtual table body focus', () => {
  describe('GIVEN: data, state, and out-of-table focus targets', () => {
    describe('WHEN: active body focus is read from the rendered DOM', () => {
      it('THEN: it returns only focus owned by the table body', () => {
        const host = document.createElement('div');

        host.innerHTML = `
          <table>
            <tbody>
              <tr class="data-row" data-row-id="customer-42">
                <td ngGridCell data-column-id="status" tabindex="0">Active</td>
              </tr>
              <tr><td class="table-state" ngGridCell tabindex="0">Loading</td></tr>
            </tbody>
          </table>
        `;
        document.body.append(host);

        const dataCell = host.querySelector<HTMLElement>('[data-column-id="status"]');
        const stateCell = host.querySelector<HTMLElement>('.table-state');

        dataCell?.focus();
        expect(readNatTableActiveBodyFocus(host, 'name')).toStrictEqual({ rowId: 'customer-42', columnId: 'status' });

        stateCell?.focus();
        expect(readNatTableActiveBodyFocus(host, 'name')).toStrictEqual({ rowId: null, columnId: 'name' });

        const outsideButton = document.createElement('button');

        document.body.append(outsideButton);
        outsideButton.focus();
        expect(readNatTableActiveBodyFocus(host, 'name')).toBeNull();

        host.remove();
        outsideButton.remove();
      });
    });
  });
});
