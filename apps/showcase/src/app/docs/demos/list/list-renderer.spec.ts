import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ListRenderer } from './list-renderer';

const host = (fixture: ComponentFixture<ListRenderer>): HTMLElement => fixture.nativeElement as HTMLElement;

// startsWith: the sort button's text carries a trailing direction arrow.
const clickButton = (fixture: ComponentFixture<ListRenderer>, label: string): void => {
  const button = Array.from(host(fixture).querySelectorAll('button')).find((candidate) =>
    candidate.textContent.trim().startsWith(label)
  ) as HTMLButtonElement;

  button.click();
};

const render = async (fixture: ComponentFixture<ListRenderer>): Promise<void> => {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
};

const firstItemOrder = (fixture: ComponentFixture<ListRenderer>): string =>
  host(fixture).querySelector('[data-testid="nat-list-item"] [data-column-id="id"] .list-field-value')?.textContent.trim() ?? '';

describe('FEATURE: List renderer docs demo', () => {
  let fixture: ComponentFixture<ListRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRenderer],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListRenderer);
    await render(fixture);
  });

  describe('GIVEN: the demo renders with its default view', () => {
    describe('WHEN: nothing is toggled', () => {
      it('THEN: it renders the bare list with one item per row and controls outside any card', () => {
        const items = host(fixture).querySelectorAll('[data-testid="nat-list-item"]');
        const controls = host(fixture).querySelector('.list-demo-controls');

        expect(items).toHaveLength(6);
        expect(host(fixture).querySelector('.card')).toBeNull();
        expect(controls?.closest('.card')).toBeNull();
        expect(host(fixture).querySelectorAll('[data-testid="nat-list-item"] app-order-status-badge')).toHaveLength(6);
      });
    });

    describe('WHEN: sorting is written through the surface state and the renderer is swapped', () => {
      it('THEN: the table renders the same sorted order the list showed', async () => {
        const sortArrow = host(fixture).querySelector('[data-testid="list-demo-sort-arrow"]');

        expect(sortArrow?.textContent.trim()).toBe('↕');

        clickButton(fixture, 'Sort by total');
        await render(fixture);

        expect(sortArrow?.textContent.trim()).toBe('↓');
        expect(firstItemOrder(fixture)).toBe('ORD-203');

        clickButton(fixture, 'Table');
        await render(fixture);

        const firstRowHeader = host(fixture).querySelector('tbody tr th, tbody tr td');

        expect(host(fixture).querySelector('.card nat-table')).not.toBeNull();
        expect(firstRowHeader?.textContent.trim()).toBe('ORD-203');
      });
    });
  });
});
