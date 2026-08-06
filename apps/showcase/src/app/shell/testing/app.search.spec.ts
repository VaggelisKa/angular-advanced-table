import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { App } from '../app';
import { configureAppTestBed, getElement, settleApp, waitForFocusHandoff } from './app.testing';

const pressSearchShortcut = (): void => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }));
};

const createAppFixture = async (): Promise<ComponentFixture<App>> => {
  const fixture = TestBed.createComponent(App);

  await fixture.whenStable();

  return fixture;
};

const typeSearchQuery = async (fixture: ComponentFixture<App>, query: string): Promise<HTMLInputElement> => {
  const input = getElement<HTMLInputElement>(fixture.nativeElement as HTMLElement, '[data-testid="docs-search-input"]');

  input.value = query;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();

  return input;
};

describe('FEATURE: Docs search dialog', () => {
  beforeEach(configureAppTestBed);

  afterEach(async () => {
    await settleApp();
    vi.unstubAllGlobals();
  });

  describe('GIVEN: the showcase app shell is rendered with docs search triggers', () => {
    describe('WHEN: the sidebar search trigger is activated', () => {
      it('THEN: it opens the dialog, focuses the input, and inerts the background', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const trigger = getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]');

        expect(compiled.querySelector('[data-testid="docs-search-dialog"]')).toBeNull();

        trigger.focus();
        trigger.click();
        await fixture.whenStable();
        await waitForFocusHandoff();

        const dialog = getElement<HTMLElement>(compiled, '[data-testid="docs-search-dialog"]');
        const input = getElement<HTMLInputElement>(compiled, '[data-testid="docs-search-input"]');

        expect(dialog.getAttribute('role')).toBe('dialog');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(document.activeElement).toBe(input);
        expect(getElement(compiled, 'main.showcase-content').hasAttribute('inert')).toBe(true);
        expect(getElement(compiled, 'aside.showcase-nav').hasAttribute('inert')).toBe(true);
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with the global search shortcut', () => {
    describe('WHEN: the shortcut is pressed twice', () => {
      it('THEN: it opens the dialog and then toggles it closed', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;

        pressSearchShortcut();
        await fixture.whenStable();

        expect(compiled.querySelector('[data-testid="docs-search-dialog"]')).not.toBeNull();

        pressSearchShortcut();
        await fixture.whenStable();

        expect(compiled.querySelector('[data-testid="docs-search-dialog"]')).toBeNull();
      });
    });

    describe('WHEN: the shortcut is pressed while the mobile nav drawer is open', () => {
      it('THEN: it closes the drawer before opening the search dialog', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const menuButton = getElement<HTMLButtonElement>(compiled, '.showcase-menu-button');

        menuButton.click();
        await fixture.whenStable();

        expect(getElement(compiled, 'aside.showcase-nav').classList.contains('is-open')).toBe(true);

        pressSearchShortcut();
        await fixture.whenStable();

        expect(getElement(compiled, 'aside.showcase-nav').classList.contains('is-open')).toBe(false);
        expect(compiled.querySelector('[data-testid="docs-search-dialog"]')).not.toBeNull();
      });
    });
  });

  describe('GIVEN: the docs search dialog is open with a typed query', () => {
    describe('WHEN: the query matches documentation sections', () => {
      it('THEN: it renders grouped results and announces the count politely', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;

        getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]').click();
        await fixture.whenStable();
        await typeSearchQuery(fixture, 'pinning');

        const options = compiled.querySelectorAll('[data-testid="docs-search-option"]');

        expect(options.length).toBeGreaterThan(0);
        expect(getElement(compiled, '[data-testid="docs-search-listbox"]').getAttribute('role')).toBe('listbox');
        expect(getElement(compiled, 'mark.docs-search-mark').textContent.toLowerCase()).toContain('pinning');

        await new Promise((resolve) => setTimeout(resolve, 250));

        expect(getElement(compiled, '[data-testid="docs-search-status"]').textContent).toMatch(/^\d+ results?$/);
      });
    });

    describe('WHEN: a result is chosen with the arrow keys and Enter', () => {
      it('THEN: it navigates to the docs route with its fragment and closes the dialog', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const router = TestBed.inject(Router);

        getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]').click();
        await fixture.whenStable();

        const input = await typeSearchQuery(fixture, 'pinning');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(input.getAttribute('aria-activedescendant')).toBe('docs-search-option-0');
        expect(getElement(compiled, '#docs-search-option-0').getAttribute('aria-selected')).toBe('true');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await fixture.whenStable();
        await settleApp();

        expect(router.url).toMatch(/^\/docs\/[a-z-]+#[a-z-]+/);
        expect(compiled.querySelector('[data-testid="docs-search-dialog"]')).toBeNull();
      });
    });
  });

  describe('GIVEN: the docs search dialog is open', () => {
    describe('WHEN: Escape is pressed inside the dialog', () => {
      it('THEN: it closes the dialog and restores focus to the trigger', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const trigger = getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]');

        trigger.focus();
        trigger.click();
        await fixture.whenStable();
        await waitForFocusHandoff();

        const input = getElement<HTMLInputElement>(compiled, '[data-testid="docs-search-input"]');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        await fixture.whenStable();
        await waitForFocusHandoff();

        expect(compiled.querySelector('[data-testid="docs-search-dialog"]')).toBeNull();
        expect(document.activeElement).toBe(trigger);
        expect(getElement(compiled, 'main.showcase-content').hasAttribute('inert')).toBe(false);
      });
    });
  });
});
