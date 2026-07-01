import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { App } from '../app';
import { configureAppTestBed, getElement, waitForFocusHandoff } from './app.testing';

describe('FEATURE: App controls', () => {
  beforeEach(configureAppTestBed);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('GIVEN: the showcase app shell is rendered with sidenav theme controls', () => {
    describe('WHEN: toggle the showcase theme from the sidenav', () => {
      it('THEN: it updates theme state and button copy', async () => {
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const shell = compiled.querySelector('.showcase-shell') as HTMLDivElement;
        const darkOption = compiled.querySelectorAll('.showcase-theme-option')[1] as HTMLButtonElement;
        const lightOption = compiled.querySelectorAll('.showcase-theme-option')[0] as HTMLButtonElement;

        expect(shell.getAttribute('data-theme')).toBeNull();

        darkOption.click();
        fixture.detectChanges();

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(darkOption.getAttribute('aria-pressed')).toBe('true');

        lightOption.click();
        fixture.detectChanges();

        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(lightOption.getAttribute('aria-pressed')).toBe('true');
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with a mobile navigation trigger', () => {
    describe('WHEN: open and close the mobile navigation drawer from the trigger', () => {
      it('THEN: it updates drawer visibility and trigger state', async () => {
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const nav = compiled.querySelector('.showcase-nav') as HTMLElement;
        const trigger = compiled.querySelector('.showcase-menu-button') as HTMLButtonElement;

        expect(trigger.getAttribute('aria-controls')).toBe('showcase-navigation');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(nav.classList.contains('is-open')).toBe(false);

        trigger.click();
        await fixture.whenStable();

        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(nav.classList.contains('is-open')).toBe(true);
        expect(nav.getAttribute('role')).toBe('dialog');
        expect(nav.getAttribute('aria-modal')).toBe('true');
        expect(compiled.querySelector('.showcase-nav-backdrop')).not.toBeNull();

        const closeButton = compiled.querySelector('.showcase-nav-close') as HTMLButtonElement;

        closeButton.click();
        await fixture.whenStable();

        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(nav.classList.contains('is-open')).toBe(false);
        expect(nav.getAttribute('role')).toBeNull();
        expect(nav.getAttribute('aria-modal')).toBeNull();
        expect(compiled.querySelector('.showcase-nav-backdrop')).toBeNull();
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with mobile drawer focus management', () => {
    describe('WHEN: move focus into the mobile drawer and restore it on close', () => {
      it('THEN: it moves focus into the drawer and back to the trigger', async () => {
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const trigger = compiled.querySelector('.showcase-menu-button') as HTMLButtonElement;
        const closeButton = compiled.querySelector('.showcase-nav-close') as HTMLButtonElement;

        trigger.focus();
        trigger.click();
        await fixture.whenStable();
        await waitForFocusHandoff();

        expect(document.activeElement).toBe(closeButton);

        closeButton.click();
        await fixture.whenStable();
        await waitForFocusHandoff();

        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with mobile drawer navigation links', () => {
    describe('WHEN: close the mobile drawer after choosing a navigation link', () => {
      it('THEN: it hides the drawer after link activation', async () => {
        const fixture = TestBed.createComponent(App);
        const router = TestBed.inject(Router);

        await router.navigateByUrl('/docs/quick-start');
        fixture.detectChanges();
        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const trigger = compiled.querySelector('.showcase-menu-button') as HTMLButtonElement;
        const nav = compiled.querySelector('.showcase-nav') as HTMLElement;

        trigger.click();
        await fixture.whenStable();

        expect(nav.classList.contains('is-open')).toBe(true);

        const firstLink = getElement<HTMLAnchorElement>(compiled, '[data-testid="showcase-nav-link-quick-start"]');

        firstLink.click();
        await fixture.whenStable();

        expect(nav.classList.contains('is-open')).toBe(false);
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
      });
    });
  });
});
