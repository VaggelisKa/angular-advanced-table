import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleSortingPage } from './simple-sorting-page';

describe('SimpleSortingPage', () => {
  let fixture: ComponentFixture<SimpleSortingPage>;

  beforeEach(async () => {
    try {
      globalThis.localStorage?.removeItem('nat-showcase-theme');
    } catch {
      // ignore
    }

    await TestBed.configureTestingModule({
      imports: [SimpleSortingPage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleSortingPage);
    await fixture.whenStable();
  });

  it('should create a single mock table with sorting and fixed pins', () => {
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('nat-table') as HTMLElement;
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const sortButtons = fixture.nativeElement.querySelectorAll('.sort-button');

    expect(table).toBeTruthy();
    expect(table.classList.contains('simple-table')).toBe(true);
    expect(fixture.nativeElement.querySelector('nat-table-surface')).toBeTruthy();
    expect(rows.length).toBe(5);
    expect(sortButtons.length).toBe(9);
    expect(fixture.nativeElement.querySelector('thead')?.textContent).toContain('Company');
    expect(fixture.nativeElement.querySelector('thead')?.textContent).toContain('Channel');
    expect(fixture.nativeElement.querySelector('thead')?.textContent).toContain('Items');
    expect(fixture.nativeElement.querySelector('thead')?.textContent).toContain('Updated');
    expect(fixture.nativeElement.querySelector('.search-input')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.column-chip')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.pager')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.pin-button')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('app-order-status-badge')).toBeTruthy();
  });

  it('should right-align numeric columns', () => {
    fixture.detectChanges();

    const itemsHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="items"]',
    ) as HTMLTableCellElement;
    const itemsCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="items"]',
    ) as HTMLTableCellElement;
    const totalHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="total"]',
    ) as HTMLTableCellElement;
    const totalCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="total"]',
    ) as HTMLTableCellElement;

    expect(itemsHeader.classList.contains('is-align-end')).toBe(true);
    expect(itemsCell.classList.contains('is-align-end')).toBe(true);
    expect(totalHeader.classList.contains('is-align-end')).toBe(true);
    expect(totalCell.classList.contains('is-align-end')).toBe(true);
  });

  it('should pin company left and row actions right without pin controls', () => {
    fixture.detectChanges();

    const companyHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="owner"]',
    ) as HTMLTableCellElement;
    const companyCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="owner"]',
    ) as HTMLTableCellElement;
    const actionsHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="actions"]',
    ) as HTMLTableCellElement;
    const actionsCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="actions"]',
    ) as HTMLTableCellElement;

    expect(companyHeader.classList.contains('is-pinned-left')).toBe(true);
    expect(companyCell.classList.contains('is-pinned-left')).toBe(true);
    expect(companyCell.classList.contains('is-cell-clamped')).toBe(true);
    expect(companyCell.style.height).toBe('72px');
    expect(companyCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('2');
    expect(actionsHeader.classList.contains('is-pinned-right')).toBe(true);
    expect(actionsCell.classList.contains('is-pinned-right')).toBe(true);
    expect(actionsHeader.querySelector('.sr-only')?.textContent?.trim()).toBe('Row actions');
    expect(fixture.nativeElement.querySelector('.pin-button')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.menu-button')).toBeFalsy();
  });

  it('should render a right-pinned three-dots actions menu for each row', async () => {
    fixture.detectChanges();

    const actionTriggers = fixture.nativeElement.querySelectorAll(
      'tbody td[data-column-id="actions"] .row-actions-trigger',
    ) as NodeListOf<HTMLButtonElement>;

    expect(actionTriggers.length).toBe(5);
    expect(actionTriggers[0]?.getAttribute('aria-label')).toBe('Open demo actions for ord-1007');

    actionTriggers[0]!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const actionLabels = Array.from(
      document.body.querySelectorAll('.row-actions-item .row-actions-item-label'),
    ).map((element) => element.textContent?.trim());

    expect(actionLabels).toEqual(['Inspect tape', 'Create alert', 'Send to blotter']);
  });

  it('should sort the mock rows from a header action', () => {
    fixture.detectChanges();

    const sortButtons = fixture.nativeElement.querySelectorAll(
      '.sort-button',
    ) as NodeListOf<HTMLButtonElement>;
    const customerSortButton = Array.from(sortButtons).find((button) =>
      button.textContent?.includes('Customer'),
    );

    if (!customerSortButton) {
      throw new Error('Expected the Customer sort button to render.');
    }

    customerSortButton.click();
    fixture.detectChanges();

    const firstRowHeader = fixture.nativeElement.querySelector(
      'tbody tr:first-child th[data-column-id="id"]',
    ) as HTMLTableCellElement;

    expect(firstRowHeader.textContent?.trim()).toBe('ORD-1011');
  });

  it('should use the shared showcase page layout', () => {
    fixture.detectChanges();

    const page = fixture.nativeElement.querySelector('.simple-sorting-page') as HTMLDivElement;

    expect(page.classList.contains('showcase-page')).toBe(true);
    expect(page.getAttribute('data-theme')).toBeNull();
  });
});
