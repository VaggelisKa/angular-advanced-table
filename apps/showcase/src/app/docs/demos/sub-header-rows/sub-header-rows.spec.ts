import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { SubHeaderRows } from './sub-header-rows';

const host = (fixture: ComponentFixture<SubHeaderRows>): HTMLElement => fixture.nativeElement as HTMLElement;

// startsWith: the sort button's text carries a trailing direction arrow.
const clickButton = (fixture: ComponentFixture<SubHeaderRows>, label: string): void => {
  const button = Array.from(host(fixture).querySelectorAll('button')).find((candidate) =>
    candidate.textContent.trim().startsWith(label)
  ) as HTMLButtonElement;

  button.click();
};

const sortArrow = (fixture: ComponentFixture<SubHeaderRows>): string =>
  host(fixture).querySelector('[data-testid="sub-header-demo-sort-arrow"]')?.textContent.trim() ?? '';

const render = async (fixture: ComponentFixture<SubHeaderRows>): Promise<void> => {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
};

const tableGroupLabels = (fixture: ComponentFixture<SubHeaderRows>): string[] =>
  Array.from(host(fixture).querySelectorAll('tbody tr.sub-header-row .sub-header-demo-label')).map((label) =>
    label.textContent.trim()
  );

describe('FEATURE: Sub-header rows docs demo', () => {
  let fixture: ComponentFixture<SubHeaderRows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubHeaderRows],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubHeaderRows);
    await render(fixture);
  });

  describe('GIVEN: the demo renders with its default table view', () => {
    describe('WHEN: nothing is toggled', () => {
      it('THEN: it renders the controls outside any card chrome and groups in ascending order', () => {
        const controls = host(fixture).querySelector('.sub-header-demo-controls');

        expect(controls).not.toBeNull();
        // Both renderer branches are bare: the docs example already draws a card.
        expect(host(fixture).querySelector('.card')).toBeNull();
        expect(host(fixture).querySelector('.card-title')).toBeNull();
        expect(tableGroupLabels(fixture)).toStrictEqual(['Queued', 'Ready', 'Review']);
        expect(host(fixture).querySelectorAll('tbody tr.data-row app-order-status-badge')).toHaveLength(6);
      });
    });

    describe('WHEN: the workflow order and sort controls are used', () => {
      it('THEN: groups follow the workflow order while totals sort within groups', async () => {
        const orderButton = Array.from(host(fixture).querySelectorAll('button')).find((candidate) =>
          candidate.textContent.includes('Workflow order')
        );

        expect(orderButton?.classList.contains('is-active')).toBe(false);

        clickButton(fixture, 'Workflow order');
        clickButton(fixture, 'Sort by total');
        await render(fixture);

        expect(tableGroupLabels(fixture)).toStrictEqual(['Ready', 'Review', 'Queued']);
        expect(orderButton?.classList.contains('is-active')).toBe(true);

        const firstDataCell = host(fixture).querySelector('tbody tr.data-row th, tbody tr.data-row td');

        expect(firstDataCell?.textContent.trim()).toBe('ORD-201');
      });
    });

    describe('WHEN: the sort button is cycled through its three states', () => {
      it('THEN: the direction arrow tracks not sorted, descending, ascending, and back', async () => {
        expect(sortArrow(fixture)).toBe('↕');

        clickButton(fixture, 'Sort by total');
        await render(fixture);

        expect(sortArrow(fixture)).toBe('↓');

        clickButton(fixture, 'Sort by total');
        await render(fixture);

        expect(sortArrow(fixture)).toBe('↑');

        const firstDataCell = host(fixture).querySelector('tbody tr.data-row th, tbody tr.data-row td');

        expect(firstDataCell?.textContent.trim()).toBe('ORD-205');

        clickButton(fixture, 'Sort by total');
        await render(fixture);

        expect(sortArrow(fixture)).toBe('↕');
      });
    });

    describe('WHEN: the renderer toggle is switched to the list', () => {
      it('THEN: the view swaps to the bare list renderer with the same groups', async () => {
        const rendererButtons = Array.from(host(fixture).querySelectorAll('app-demo-toggle-group button'));

        expect(rendererButtons.map((button) => button.getAttribute('aria-pressed'))).toStrictEqual(['true', 'false']);

        clickButton(fixture, 'List');
        await render(fixture);

        expect(rendererButtons.map((button) => button.getAttribute('aria-pressed'))).toStrictEqual(['false', 'true']);
        expect(host(fixture).querySelector('nat-table')).toBeNull();
        expect(host(fixture).querySelector('nat-list')).not.toBeNull();
        // Symmetric with the table branch: neither renderer adds card chrome.
        expect(host(fixture).querySelector('.card')).toBeNull();

        const listGroups = Array.from(host(fixture).querySelectorAll('li.list-sub-header .sub-header-demo-label')).map((label) =>
          label.textContent.trim()
        );

        expect(listGroups).toStrictEqual(['Queued', 'Ready', 'Review']);
        expect(host(fixture).querySelectorAll('[data-testid="nat-list-item"] app-order-status-badge')).toHaveLength(6);
      });
    });
  });
});
