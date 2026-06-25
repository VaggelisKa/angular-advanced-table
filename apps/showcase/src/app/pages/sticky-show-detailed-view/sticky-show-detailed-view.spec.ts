import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { StickyShowDetailedView } from './sticky-show-detailed-view';

describe('StickyShowDetailedView', () => {
  let fixture: ComponentFixture<StickyShowDetailedView>;
  let mockRouter: {
    url: string;
    navigate: ReturnType<typeof vi.fn>;
  };

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const query = <T extends Element>(selector: string): T => {
    const found = host().querySelector<T>(selector);

    if (!found) {
      throw new Error(`Expected element "${selector}" to render.`);
    }

    return found;
  };

  const queryAll = <T extends Element>(selector: string): NodeListOf<T> => host().querySelectorAll<T>(selector);

  beforeEach(() => {
    // eslint-disable-next-line vitest/prefer-spy-on
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });

    // eslint-disable-next-line vitest/prefer-spy-on
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });

    mockRouter = {
      url: '/examples/sticky-show-detailed-view',
      navigate: vi.fn()
    };
  });

  describe('Default Card View', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StickyShowDetailedView],
        providers: [provideZonelessChangeDetection(), { provide: Router, useValue: mockRouter }]
      }).compileComponents();

      fixture = TestBed.createComponent(StickyShowDetailedView);
      await fixture.whenStable();
    });

    it('should render two example cards', () => {
      fixture.detectChanges();

      const cards = queryAll('.example-card-surface');

      expect(cards).toHaveLength(2);
      expect(cards[0].textContent).toContain('Detailed View in Modal Dialog');
      expect(cards[1].textContent).toContain('Detailed View in Separate Page');
    });

    it('should render short tables with hidden columns by default', () => {
      fixture.detectChanges();

      const rows = queryAll('.example-card-surface tbody tr');

      // 2 cards * 5 rows each = 10 rows total
      expect(rows).toHaveLength(10);

      // Verify that hidden columns are not in the headers
      const headerText = query('thead').textContent;

      expect(headerText).not.toContain('Company');
      expect(headerText).not.toContain('Customer');
      expect(headerText).not.toContain('Total');
      expect(headerText).not.toContain('Actions');

      // Verify visible columns
      expect(headerText).toContain('Order');
      expect(headerText).toContain('Channel');
      expect(headerText).toContain('Status');
      expect(headerText).toContain('Items');
    });

    it('should open the dialog when clicking the dialog card button', () => {
      fixture.detectChanges();

      const buttons = queryAll<HTMLButtonElement>('.example-card-surface footer button');
      const dialog = query<HTMLDialogElement>('dialog');

      expect(dialog.hasAttribute('open')).toBe(false);

      buttons[0].click();
      fixture.detectChanges();

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      expect(dialog.hasAttribute('open')).toBe(true);
    });

    it('should navigate to details page when clicking the page card button', () => {
      fixture.detectChanges();

      const buttons = queryAll<HTMLButtonElement>('.example-card-surface footer button');

      buttons[1].click();
      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/examples/sticky-show-detailed-view/details']);
    });
  });

  describe('Detailed Page View', () => {
    beforeEach(async () => {
      mockRouter.url = '/examples/sticky-show-detailed-view/details';

      await TestBed.configureTestingModule({
        imports: [StickyShowDetailedView],
        providers: [provideZonelessChangeDetection(), { provide: Router, useValue: mockRouter }]
      }).compileComponents();

      fixture = TestBed.createComponent(StickyShowDetailedView);
      await fixture.whenStable();
    });

    it('should render the full detailed table page structure', () => {
      fixture.detectChanges();

      expect(query('.detailed-page-container')).toBeTruthy();
      expect(query('.detailed-page-header .back-button')).toBeTruthy();

      // Verify detailed table rows
      const rows = queryAll('tbody tr');

      expect(rows).toHaveLength(50);
    });

    it('should show all columns on the detailed table', () => {
      fixture.detectChanges();

      const headerText = query('thead').textContent;

      expect(headerText).toContain('Order');
      expect(headerText).toContain('Company');
      expect(headerText).toContain('Customer');
      expect(headerText).toContain('Channel');
      expect(headerText).toContain('Status');
      expect(headerText).toContain('Items');
      expect(headerText).toContain('Updated');
      expect(headerText).toContain('Total');
    });

    it('should navigate back to card view when clicking back button', () => {
      fixture.detectChanges();

      const backBtn = query<HTMLButtonElement>('.back-button');

      backBtn.click();
      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/examples/sticky-show-detailed-view']);
    });
  });
});
