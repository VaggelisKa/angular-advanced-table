import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { SimpleSortingPage } from './simple-sorting-page';

describe('SimpleSortingPage', () => {
  let fixture: ComponentFixture<SimpleSortingPage>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const query = <T extends Element>(selector: string): T => {
    const found = host().querySelector<T>(selector);

    if (!found) {
      throw new Error(`Expected element "${selector}" to render.`);
    }

    return found;
  };

  const queryAll = <T extends Element>(selector: string): NodeListOf<T> => host().querySelectorAll<T>(selector);

  beforeEach(async () => {
    try {
      globalThis.localStorage.removeItem('nat-showcase-theme');
    } catch {
      // ignore
    }

    await TestBed.configureTestingModule({
      imports: [SimpleSortingPage],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleSortingPage);
    await fixture.whenStable();
  });

  it('should render the mock table surface with sorting and status badges', () => {
    fixture.detectChanges();

    const table = query<HTMLElement>('nat-table');
    const rows = queryAll('tbody tr');
    const sortButtons = queryAll('.sort-button');

    expect(table).toBeTruthy();
    expect(table.classList.contains('simple-table')).toBe(true);
    expect(host().querySelector('nat-table-surface')).toBeTruthy();
    expect(rows).toHaveLength(5);
    expect(sortButtons).toHaveLength(9);
    expect(host().querySelector('app-order-status-badge')).toBeTruthy();
  });

  it('should render the expected header labels', () => {
    fixture.detectChanges();

    const headerText = host().querySelector('thead')?.textContent;

    expect(headerText).toContain('Company');
    expect(headerText).toContain('Channel');
    expect(headerText).toContain('Items');
    expect(headerText).toContain('Updated');
  });

  it('should omit search, column chips, paging, and pin controls', () => {
    fixture.detectChanges();

    expect(host().querySelector('app-table-search')).toBeFalsy();
    expect(host().querySelector('.column-chip')).toBeFalsy();
    expect(host().querySelector('.pager')).toBeFalsy();
    expect(host().querySelector('.pin-button')).toBeFalsy();
  });

  it('should right-align numeric columns', () => {
    fixture.detectChanges();

    const itemsHeader = query<HTMLTableCellElement>('thead th[data-column-id="items"]');
    const itemsCell = query<HTMLTableCellElement>('tbody tr:first-child td[data-column-id="items"]');
    const totalHeader = query<HTMLTableCellElement>('thead th[data-column-id="total"]');
    const totalCell = query<HTMLTableCellElement>('tbody tr:first-child td[data-column-id="total"]');

    expect(itemsHeader.classList.contains('is-align-end')).toBe(true);
    expect(itemsCell.classList.contains('is-align-end')).toBe(true);
    expect(totalHeader.classList.contains('is-align-end')).toBe(true);
    expect(totalCell.classList.contains('is-align-end')).toBe(true);
  });

  it('should pin company left and row actions right without pin controls', () => {
    fixture.detectChanges();

    const orderCell = query<HTMLTableCellElement>('tbody tr:first-child th[data-column-id="id"]');
    const companyHeader = query<HTMLTableCellElement>('thead th[data-column-id="owner"]');
    const companyCell = query<HTMLTableCellElement>('tbody tr:first-child td[data-column-id="owner"]');
    const actionsHeader = query<HTMLTableCellElement>('thead th[data-column-id="actions"]');
    const actionsCell = query<HTMLTableCellElement>('tbody tr:first-child td[data-column-id="actions"]');

    expect(orderCell.classList.contains('is-cell-clamped')).toBe(false);
    expect(orderCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('');
    expect(companyHeader.classList.contains('is-pinned-left')).toBe(true);
    expect(companyCell.classList.contains('is-pinned-left')).toBe(true);
    expect(companyCell.classList.contains('is-cell-clamped')).toBe(true);
    expect(companyCell.style.height).toBe('72px');
    expect(companyCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('2');
    expect(actionsHeader.classList.contains('is-pinned-right')).toBe(true);
    expect(actionsCell.classList.contains('is-pinned-right')).toBe(true);
    expect(actionsHeader.querySelector('.sr-only')?.textContent.trim()).toBe('Row actions');
    expect(host().querySelector('.pin-button')).toBeFalsy();
    expect(host().querySelector('.menu-button')).toBeFalsy();
  });

  it('should render a right-pinned three-dots actions menu for each row', async () => {
    fixture.detectChanges();

    const actionTriggers = queryAll<HTMLButtonElement>('tbody td[data-column-id="actions"] .row-actions-trigger');

    expect(actionTriggers).toHaveLength(5);

    const firstTrigger = actionTriggers[0];

    expect(firstTrigger.getAttribute('aria-label')).toBe('Open demo actions for ord-1007');

    firstTrigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const actionLabels = Array.from(document.body.querySelectorAll('.row-actions-item .row-actions-item-label')).map((element) =>
      element.textContent.trim()
    );

    expect(actionLabels).toStrictEqual(['Inspect tape', 'Create alert', 'Send to blotter']);
  });

  it('should sort the mock rows from a header action', () => {
    fixture.detectChanges();

    const sortButtons = queryAll<HTMLButtonElement>('.sort-button');
    const customerSortButton = Array.from(sortButtons).find((button) => button.textContent.includes('Customer'));

    if (!customerSortButton) {
      throw new Error('Expected the Customer sort button to render.');
    }

    customerSortButton.click();
    fixture.detectChanges();

    const firstRowHeader = query<HTMLTableCellElement>('tbody tr:first-child th[data-column-id="id"]');

    expect(firstRowHeader.textContent.trim()).toBe('ORD-1011');
  });

  it('should render as an embeddable sorting demo', () => {
    fixture.detectChanges();

    const page = query<HTMLDivElement>('.simple-sorting-page');

    expect(page.classList.contains('showcase-page')).toBe(false);
    expect(page.getAttribute('data-theme')).toBeNull();
  });
});
