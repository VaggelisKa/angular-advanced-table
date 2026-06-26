import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { StatesShowcasePage } from './states-showcase';

const clickCardButton = (card: HTMLElement, label: string): void => {
  const button = Array.from(card.querySelectorAll('button')).find(
    (candidate) => candidate.textContent.trim() === label
  ) as HTMLButtonElement;

  button.click();
};

describe('FEATURE: StatesShowcasePage', () => {
  let fixture: ComponentFixture<StatesShowcasePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatesShowcasePage],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(StatesShowcasePage);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('GIVEN: the states showcase page is rendered', () => {
    describe('WHEN: renders loading, empty, error, transition, and refresh state examples', () => {
      it('THEN: it shows each table state example', () => {
        fixture.detectChanges();

        const page = fixture.nativeElement as HTMLElement;
        const cards = Array.from(page.querySelectorAll('.card-title')).map((title) => title.textContent.trim());
        const busyTables = page.querySelectorAll('table[aria-busy="true"]');

        expect(cards).toStrictEqual(['Loading state', 'Empty state', 'Error state', 'Transition preview', 'Background refresh']);
        expect(page.textContent).toContain('Loading incidents');
        expect(page.textContent).toContain('No incidents found');
        expect(page.textContent).toContain('Incident queue unavailable');
        expect(page.textContent).toContain('Loading queue');
        expect(busyTables).toHaveLength(3);
      });
    });
  });

  describe('GIVEN: the states showcase page is rendered with transition preview controls', () => {
    describe('WHEN: switches the transition preview between table states', () => {
      it('THEN: it updates the transition preview state', () => {
        fixture.detectChanges();

        const page = fixture.nativeElement as HTMLElement;
        const transitionCard = Array.from(page.querySelectorAll('.card')).find(
          (card) => card.querySelector('.card-title')?.textContent.trim() === 'Transition preview'
        ) as HTMLElement;

        clickCardButton(transitionCard, 'Empty');
        fixture.detectChanges();

        expect(transitionCard.textContent).toContain('No transition rows');
        expect(transitionCard.textContent).not.toContain('Loading queue');

        clickCardButton(transitionCard, 'Error');
        fixture.detectChanges();

        expect(transitionCard.textContent).toContain('Transition request failed');
        expect(transitionCard.textContent).toContain('Transition service returned 503.');

        clickCardButton(transitionCard, 'Rows');
        fixture.detectChanges();

        expect(transitionCard.textContent).toContain('INC-1042');
        expect(transitionCard.textContent).not.toContain('Transition request failed');
      });
    });
  });

  describe('GIVEN: the states showcase page is rendered with an error state retry action', () => {
    describe('WHEN: lets keyboard users enter the retry action from the state cell', () => {
      it('THEN: it activates retry from the keyboard path', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const page = fixture.nativeElement as HTMLElement;
        const errorCell = page.querySelector('.error-state') as HTMLTableCellElement;
        const retryButton = Array.from(page.querySelectorAll('button')).find((button) =>
          button.textContent.includes('Retry')
        ) as HTMLButtonElement;

        errorCell.focus();
        errorCell.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true
          })
        );
        fixture.detectChanges();

        expect(document.activeElement).toBe(retryButton);
      });
    });
  });

  describe('GIVEN: the states showcase page is rendered with retry state cycling enabled', () => {
    describe('WHEN: loops retry through loading and back to error', () => {
      it('THEN: it cycles retry state through loading and error', () => {
        vi.useFakeTimers();
        fixture.detectChanges();

        const page = fixture.nativeElement as HTMLElement;
        const retryButton = Array.from(page.querySelectorAll('button')).find((button) =>
          button.textContent.includes('Retry')
        ) as HTMLButtonElement;

        retryButton.click();
        fixture.detectChanges();

        expect(page.textContent).toContain('Retrying incident queue');
        expect(page.textContent).not.toContain('Incident queue unavailable');

        vi.advanceTimersByTime(900);
        fixture.detectChanges();

        expect(page.textContent).toContain('Incident queue unavailable');
        expect(page.textContent).toContain('Incident service returned 503 after retry.');
      });
    });
  });
});
