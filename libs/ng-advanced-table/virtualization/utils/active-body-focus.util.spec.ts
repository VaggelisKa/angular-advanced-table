import { readNatTableActiveBodyFocus } from './active-body-focus.util';

const queryRequired = (host: HTMLElement, selector: string): HTMLElement => {
  const element = host.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`Expected to find an element matching "${selector}".`);
  }

  return element;
};

describe('FEATURE: active virtual table body focus', () => {
  describe('GIVEN: data, state, and out-of-table focus targets', () => {
    describe('WHEN: active body focus is read from the rendered DOM', () => {
      it('THEN: it returns only focus owned by the table body', () => {
        const host = document.createElement('nat-table');

        host.innerHTML = `
          <table>
            <tbody>
              <tr class="data-row" data-row-id="customer-42">
                <td ngGridCell data-column-id="status" tabindex="0">
                  Active
                  <nat-table>
                    <table><tbody><tr class="data-row" data-row-id="nested-row">
                      <td ngGridCell data-column-id="nested-column" tabindex="0">Nested</td>
                    </tr></tbody></table>
                  </nat-table>
                </td>
              </tr>
              <tr><td class="table-state" ngGridCell tabindex="0">Loading</td></tr>
            </tbody>
          </table>
        `;
        document.body.append(host);

        const dataCell = queryRequired(host, '[data-column-id="status"]');
        const stateCell = queryRequired(host, '.table-state');

        dataCell.focus();
        expect(readNatTableActiveBodyFocus(host, 'name')).toStrictEqual({ rowId: 'customer-42', columnId: 'status' });

        queryRequired(host, '[data-column-id="nested-column"]').focus();
        expect(readNatTableActiveBodyFocus(host, 'name')).toStrictEqual({ rowId: 'customer-42', columnId: 'status' });

        stateCell.focus();
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
