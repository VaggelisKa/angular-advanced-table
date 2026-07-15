import { getNatTableCellsWithin, getOutermostElementRoots, prepareNatTableCellControl } from './cell-control-preparation.util';
import { NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from '../cell-interaction.const';

const buildButton = (): HTMLButtonElement => document.createElement('button');

describe('FEATURE: NatTable cell-control preparation utilities', () => {
  describe('GIVEN: a disabled native control', () => {
    describe('WHEN: control preparation runs', () => {
      it('THEN: it leaves the control unmanaged', () => {
        const control = buildButton();

        control.disabled = true;
        prepareNatTableCellControl(control);

        expect(control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe(false);
      });
    });
  });

  describe('GIVEN: a control managed by Angular Aria grid-cell behavior', () => {
    describe('WHEN: control preparation runs', () => {
      it('THEN: it leaves the control unmanaged', () => {
        const control = buildButton();

        control.setAttribute('ngGridCellWidget', '');
        prepareNatTableCellControl(control);

        expect(control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe(false);
      });
    });
  });

  describe('GIVEN: an author opted a control out with a negative tabindex', () => {
    describe('WHEN: control preparation runs without an existing marker', () => {
      it('THEN: it preserves the author opt-out', () => {
        const control = buildButton();

        control.tabIndex = -1;
        prepareNatTableCellControl(control);

        expect(control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe(false);
        expect(control.tabIndex).toBe(-1);
      });
    });
  });

  describe('GIVEN: an eligible native control', () => {
    describe('WHEN: control preparation runs for the first time', () => {
      it('THEN: it marks the control and removes it from the tab sequence', () => {
        const control = buildButton();

        prepareNatTableCellControl(control);

        expect(control.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(control.tabIndex).toBe(-1);
      });
    });

    describe('WHEN: control preparation runs again', () => {
      it('THEN: it leaves the prepared element unchanged', () => {
        const control = buildButton();

        prepareNatTableCellControl(control);
        const preparedMarkup = control.outerHTML;

        prepareNatTableCellControl(control);

        expect(control.outerHTML).toBe(preparedMarkup);
      });
    });
  });

  describe('GIVEN: a mutation root that is itself a table cell and contains another cell', () => {
    describe('WHEN: cells are collected from the mutation root', () => {
      it('THEN: it returns both the root and nested cell', () => {
        const root = document.createElement('td');
        const nestedCell = document.createElement('td');

        root.setAttribute('natTableCell', '');
        nestedCell.setAttribute('natTableCell', '');
        root.appendChild(nestedCell);

        expect(getNatTableCellsWithin(root)).toStrictEqual([root, nestedCell]);
      });
    });
  });

  describe('GIVEN: candidate mutation roots with a nested duplicate', () => {
    describe('WHEN: outermost roots are selected', () => {
      it('THEN: it excludes the nested candidate without dropping its sibling', () => {
        const container = document.createElement('div');
        const parent = document.createElement('div');
        const child = document.createElement('button');
        const sibling = document.createElement('a');

        parent.appendChild(child);
        container.append(parent, sibling);

        const roots = getOutermostElementRoots(new Set([child, sibling, parent]));

        expect(roots).toHaveLength(2);
        expect(roots).toContain(parent);
        expect(roots).toContain(sibling);
        expect(roots).not.toContain(child);
      });
    });
  });
});
