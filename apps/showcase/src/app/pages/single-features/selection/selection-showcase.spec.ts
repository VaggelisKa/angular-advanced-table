import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionShowcasePage } from './selection-showcase';

describe('SelectionShowcasePage', () => {
  let fixture: ComponentFixture<SelectionShowcasePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionShowcasePage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionShowcasePage);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function headerCheckbox(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector(
      'thead th[data-column-id="__natSelect"] input.nat-selection-checkbox',
    ) as HTMLInputElement | null;
  }

  function rowCheckbox(index: number): HTMLInputElement {
    return fixture.nativeElement.querySelectorAll(
      'tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox',
    )[index] as HTMLInputElement;
  }

  function dataRowCount(): number {
    return fixture.nativeElement.querySelectorAll('tbody tr.data-row').length;
  }

  function selectedRowCount(): number {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr.data-row')).filter(
      (row) => (row as HTMLElement).getAttribute('aria-selected') === 'true',
    ).length;
  }

  function clickButton(label: string): void {
    const button = Array.from(fixture.nativeElement.querySelectorAll('button')).find((candidate) =>
      (candidate as HTMLElement).textContent?.trim().startsWith(label),
    ) as HTMLButtonElement;

    button.click();
  }

  async function flush(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('clears the selection when the mode changes and restores a correct partial header', async () => {
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

  it('prunes the selection when selected rows are deleted', async () => {
    headerCheckbox()!.click();
    await flush();
    expect(selectedRowCount()).toBe(6);

    clickButton('Delete selected');
    await flush();

    expect(dataRowCount()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Selected (0): None');
  });

  it('drops a deleted row from a partial selection without leaving a stale id', async () => {
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
    expect(fixture.nativeElement.textContent).toContain('Selected (0): None');
  });

  it('clears every checkbox when selection is cleared', async () => {
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
