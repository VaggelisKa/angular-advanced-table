import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { SelectionShowcasePage } from './selection-showcase';

describe('FEATURE: SelectionShowcasePage', () => {
  let fixture: ComponentFixture<SelectionShowcasePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionShowcasePage],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionShowcasePage);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const headerCheckbox = (): HTMLInputElement | null =>
    element().querySelector<HTMLInputElement>('thead th[data-column-id="__natSelect"] input.nat-selection-checkbox');

  const rowCheckbox = (index: number): HTMLInputElement =>
    element().querySelectorAll<HTMLInputElement>('tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox')[index];

  const dataRowCount = (): number => element().querySelectorAll('tbody tr.data-row').length;

  const selectedRowCount = (): number =>
    Array.from(element().querySelectorAll<HTMLElement>('tbody tr.data-row')).filter(
      (row) => row.getAttribute('aria-selected') === 'true'
    ).length;

  const clickButton = (label: string): void => {
    const button = Array.from(element().querySelectorAll('button')).find((candidate) =>
      candidate.textContent.trim().startsWith(label)
    );

    if (!button) {
      throw new Error(`Expected a button starting with "${label}".`);
    }

    button.click();
  };

  async function flush(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  describe('GIVEN: the selection showcase page is rendered', () => {
    describe('WHEN: clears the selection when the mode changes and restores a correct partial header', () => {
      it('THEN: it resets selection state and header checkbox state', async () => {
        rowCheckbox(0).click();
        await flush();
        rowCheckbox(1).click();
        await flush();
        expect(selectedRowCount()).toBe(2);

        clickButton('Single mode');
        await flush();
        // Switching cardinality clears the selection instead of collapsing it.
        expect(selectedRowCount()).toBe(0);

        rowCheckbox(2).click();
        await flush();
        expect(selectedRowCount()).toBe(1);

        clickButton('Multiple mode');
        await flush();
        // Switching back to multiple clears again.
        expect(selectedRowCount()).toBe(0);

        rowCheckbox(0).click();
        await flush();
        rowCheckbox(1).click();
        await flush();

        expect(selectedRowCount()).toBe(2);
        expect(headerCheckbox()?.indeterminate).toBe(true);
        expect(headerCheckbox()?.checked).toBe(false);
      });
    });
  });

  describe('GIVEN: the selection showcase page is rendered with deletable selected rows', () => {
    describe('WHEN: prunes the selection when selected rows are deleted', () => {
      it('THEN: it removes deleted rows from selection state', async () => {
        const header = headerCheckbox();

        if (!header) {
          throw new Error('Expected the header checkbox to render.');
        }

        header.click();
        await flush();
        expect(selectedRowCount()).toBe(6);

        clickButton('Delete selected');
        await flush();

        expect(dataRowCount()).toBe(0);
        expect(element().textContent).toContain('Selected (0): None');
      });
    });
  });

  describe('GIVEN: the selection showcase page is rendered with a partially selected row set', () => {
    describe('WHEN: drops a deleted row from a partial selection without leaving a stale id', () => {
      it('THEN: it removes the stale partial-selection id', async () => {
        rowCheckbox(0).click();
        await flush();
        rowCheckbox(1).click();
        await flush();
        expect(selectedRowCount()).toBe(2);

        // Delete only the selected rows; the remaining rows stay unselected.
        clickButton('Delete selected');
        await flush();

        expect(dataRowCount()).toBe(4);
        expect(selectedRowCount()).toBe(0);
        expect(headerCheckbox()?.checked).toBe(false);
        expect(headerCheckbox()?.indeterminate).toBe(false);
        expect(element().textContent).toContain('Selected (0): None');
      });
    });
  });

  describe('GIVEN: the selection showcase page is rendered with selected checkboxes', () => {
    describe('WHEN: clears every checkbox when selection is cleared', () => {
      it('THEN: it unchecks all rendered selection controls', async () => {
        rowCheckbox(0).click();
        await flush();
        rowCheckbox(1).click();
        await flush();
        expect(selectedRowCount()).toBe(2);

        clickButton('Clear selection');
        await flush();

        expect(selectedRowCount()).toBe(0);
        expect(rowCheckbox(0).checked).toBe(false);
        expect(rowCheckbox(1).checked).toBe(false);
        expect(headerCheckbox()?.indeterminate).toBe(false);
      });
    });
  });
});
