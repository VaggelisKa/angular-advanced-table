import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ListRenderer } from './list-renderer';

const clickButton = (fixture: ComponentFixture<ListRenderer>, label: string): void => {
  const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
    (candidate) => candidate.textContent.trim() === label
  ) as HTMLButtonElement;

  button.click();
};

const render = async (fixture: ComponentFixture<ListRenderer>): Promise<void> => {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
};

const firstItemOrder = (fixture: ComponentFixture<ListRenderer>): string =>
  (fixture.nativeElement as HTMLElement)
    .querySelector('[data-testid="nat-list-item"] [data-column-id="id"] .list-field-value')
    ?.textContent.trim() ?? '';

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
      it('THEN: it renders the list renderer with one item per row', () => {
        const items = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="nat-list-item"]');

        expect(items).toHaveLength(4);
      });
    });

    describe('WHEN: sorting is written through the surface state and the renderer is swapped', () => {
      it('THEN: the table renders the same sorted order the list showed', async () => {
        clickButton(fixture, 'Sort by total');
        await render(fixture);

        expect(firstItemOrder(fixture)).toBe('ORD-203');

        clickButton(fixture, 'Table');
        await render(fixture);

        const firstRowHeader = (fixture.nativeElement as HTMLElement).querySelector('tbody tr th, tbody tr td');

        expect(firstRowHeader?.textContent.trim()).toBe('ORD-203');
      });
    });
  });
});
