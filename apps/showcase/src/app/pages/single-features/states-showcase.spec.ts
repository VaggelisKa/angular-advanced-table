import { GridCellWidget } from '@angular/aria/grid';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { StatesShowcasePage } from './states-showcase';

describe('StatesShowcasePage', () => {
  let fixture: ComponentFixture<StatesShowcasePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatesShowcasePage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatesShowcasePage);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders loading, empty, error, and refresh state examples', () => {
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const cards = Array.from(page.querySelectorAll('.card-title')).map((title) =>
      title.textContent?.trim(),
    );
    const busyTables = page.querySelectorAll('table[aria-busy="true"]');

    expect(cards).toEqual(['Loading state', 'Empty state', 'Error state', 'Background refresh']);
    expect(page.textContent).toContain('Loading incidents');
    expect(page.textContent).toContain('No incidents found');
    expect(page.textContent).toContain('Incident queue unavailable');
    expect(busyTables.length).toBe(2);
  });

  it('marks the retry action as a grid-cell widget', () => {
    fixture.detectChanges();

    const retryWidget = fixture.debugElement
      .queryAll(By.directive(GridCellWidget))
      .find((debugElement) => debugElement.nativeElement.textContent.includes('Retry'));

    expect(retryWidget).toBeTruthy();
  });

  it('loops retry through loading and back to error', () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const retryButton = Array.from(page.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Retry'),
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
