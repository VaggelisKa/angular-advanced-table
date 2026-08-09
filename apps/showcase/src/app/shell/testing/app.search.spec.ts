import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { App } from '../app';
import { configureAppTestBed, getElement, settleApp, waitForFocusHandoff } from './app.testing';
import { DOCS_SEARCH_INDEX_LOADER } from '../../search/docs-search.store';

const pressSearchShortcut = (): void => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }));
};

const createAppFixture = async (): Promise<ComponentFixture<App>> => {
  const fixture = TestBed.createComponent(App);

  await fixture.whenStable();

  return fixture;
};

/* The dialog renders into the CDK overlay container appended to `document.body`,
   outside the fixture element, so dialog content is queried from the body. */
const queryDialog = (): HTMLElement | null => document.body.querySelector<HTMLElement>('[data-testid="docs-search-dialog"]');

const typeSearchQuery = async (fixture: ComponentFixture<App>, query: string): Promise<HTMLInputElement> => {
  const input = getElement<HTMLInputElement>(document.body, '[data-testid="docs-search-input"]');

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
      it('THEN: it opens the dialog, focuses the input, and hides the background from assistive technology', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const trigger = getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]');

        expect(queryDialog()).toBeNull();

        trigger.focus();
        trigger.click();
        await fixture.whenStable();
        await waitForFocusHandoff();

        const dialog = getElement<HTMLElement>(document.body, '[data-testid="docs-search-dialog"]');
        const input = getElement<HTMLInputElement>(document.body, '[data-testid="docs-search-input"]');
        const container = dialog.closest('cdk-dialog-container');

        expect(container?.getAttribute('role')).toBe('dialog');
        expect(container?.getAttribute('aria-modal')).toBe('true');
        expect(document.activeElement).toBe(input);
        /* CDK hides every overlay-container sibling (including the app shell)
           from assistive technology while the dialog is open, replacing the
           previous manual `inert` bindings. */
        expect(compiled.closest('[aria-hidden="true"]')).not.toBeNull();
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with the global search shortcut', () => {
    describe('WHEN: the shortcut is pressed twice', () => {
      it('THEN: it opens the dialog and then toggles it closed', async () => {
        const fixture = await createAppFixture();

        pressSearchShortcut();
        await fixture.whenStable();

        expect(queryDialog()).not.toBeNull();

        pressSearchShortcut();
        await fixture.whenStable();

        expect(queryDialog()).toBeNull();
      });
    });

    describe('WHEN: the shortcut is pressed while the mobile nav drawer is open', () => {
      it('THEN: it closes the drawer before opening the search dialog', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const menuButton = getElement<HTMLButtonElement>(compiled, '.showcase-menu-button');

        menuButton.click();
        await fixture.whenStable();

        expect(document.body.querySelector('.showcase-nav-drawer')).not.toBeNull();

        pressSearchShortcut();
        await fixture.whenStable();

        expect(document.body.querySelector('.showcase-nav-drawer')).toBeNull();
        expect(queryDialog()).not.toBeNull();
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

        const options = document.body.querySelectorAll('[data-testid="docs-search-option"]');

        expect(options.length).toBeGreaterThan(0);
        expect(getElement(document.body, '[data-testid="docs-search-listbox"]').getAttribute('role')).toBe('listbox');
        expect(getElement(document.body, 'mark.docs-search-mark').textContent.toLowerCase()).toContain('pinning');

        await new Promise((resolve) => setTimeout(resolve, 250));

        expect(getElement(document.body, '[data-testid="docs-search-status"]').textContent).toMatch(/^\d+ results?$/);
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
        expect(getElement(document.body, '#docs-search-option-0').getAttribute('aria-selected')).toBe('true');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await fixture.whenStable();
        await settleApp();

        expect(router.url).toMatch(/^\/docs\/[a-z-]+#[a-z-]+/);
        expect(queryDialog()).toBeNull();
      });
    });
  });

  describe('GIVEN: the docs search dialog is open', () => {
    describe('WHEN: Escape closes a dialog opened by the shortcut while nothing was focused', () => {
      it('THEN: it restores focus to a visible search trigger instead of body', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;

        /* Mirrors Safari/Firefox on macOS, where clicking a button never
           focuses it: the shortcut fires while `activeElement` is `body`. */
        (document.activeElement as HTMLElement | null)?.blur();
        expect(document.activeElement).toBe(document.body);

        pressSearchShortcut();
        await fixture.whenStable();

        const input = getElement<HTMLInputElement>(document.body, '[data-testid="docs-search-input"]');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true, cancelable: true }));
        await fixture.whenStable();
        await waitForFocusHandoff();

        expect(queryDialog()).toBeNull();
        expect(document.activeElement).toBe(getElement(compiled, '[data-testid="docs-search-trigger"]'));
      });
    });

    describe('WHEN: Escape is pressed inside the dialog', () => {
      it('THEN: it closes the dialog and restores focus to the trigger', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const trigger = getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]');

        trigger.focus();
        trigger.click();
        await fixture.whenStable();
        await waitForFocusHandoff();

        const input = getElement<HTMLInputElement>(document.body, '[data-testid="docs-search-input"]');

        /* `keyCode` is required alongside `key` because the CDK dialog still
           detects Escape through the legacy code. */
        input.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true, cancelable: true } as KeyboardEventInit)
        );
        await fixture.whenStable();
        await waitForFocusHandoff();

        expect(queryDialog()).toBeNull();
        expect(document.activeElement).toBe(trigger);
        expect(compiled.closest('[aria-hidden="true"]')).toBeNull();
      });
    });

    describe('WHEN: the close button is tapped', () => {
      it('THEN: it closes the dialog and restores focus to the trigger', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const trigger = getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]');

        trigger.focus();
        trigger.click();
        await fixture.whenStable();
        await waitForFocusHandoff();

        getElement<HTMLButtonElement>(document.body, '[data-testid="docs-search-close"]').click();
        await fixture.whenStable();
        await waitForFocusHandoff();

        expect(queryDialog()).toBeNull();
        expect(document.activeElement).toBe(trigger);
      });
    });

    describe('WHEN: the search index chunk fails to download and retry is pressed', () => {
      it('THEN: it shows the unavailable state, then recovers and lists results', async () => {
        /* Both the open-trigger preload and the dialog constructor preload
           attempt a load, so the loader keeps failing until the test lets the
           explicit retry succeed. */
        let attempts = 0;
        let chunkAvailable = false;

        TestBed.overrideProvider(DOCS_SEARCH_INDEX_LOADER, {
          useValue: async (): Promise<{ docsSearchIndex: Record<string, { sections: [] }> }> => {
            await Promise.resolve();
            attempts += 1;

            if (!chunkAvailable) {
              throw new Error('docs search index chunk failed to load');
            }

            return { docsSearchIndex: {} };
          }
        });

        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;

        getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]').click();
        await fixture.whenStable();

        await typeSearchQuery(fixture, 'sorting');

        expect(document.body.querySelector('[data-testid="docs-search-error"]')).not.toBeNull();
        expect(document.body.querySelector('[data-testid="docs-search-no-results"]')).toBeNull();

        chunkAvailable = true;

        const attemptsBeforeRetry = attempts;

        getElement<HTMLButtonElement>(document.body, '[data-testid="docs-search-retry"]').click();
        await fixture.whenStable();

        expect(attempts).toBe(attemptsBeforeRetry + 1);
        expect(document.body.querySelector('[data-testid="docs-search-error"]')).toBeNull();
        expect(document.body.querySelectorAll('[data-testid="docs-search-option"]').length).toBeGreaterThan(0);
      });
    });

    describe('WHEN: the dialog opens and later closes', () => {
      it('THEN: it blocks page scroll while open and restores it on close', async () => {
        const fixture = await createAppFixture();
        const compiled = fixture.nativeElement as HTMLElement;
        const trigger = getElement<HTMLButtonElement>(compiled, '[data-testid="docs-search-trigger"]');

        /* CDK's block scroll strategy only engages when the page actually
           overflows the viewport; the test DOM has no layout, so the overflow
           is stubbed to let the strategy run. */
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 10_000, configurable: true });

        try {
          expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(false);

          trigger.focus();
          trigger.click();
          await fixture.whenStable();
          await waitForFocusHandoff();

          expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(true);

          getElement<HTMLElement>(document.body, '[data-testid="docs-search-backdrop"]').click();
          await fixture.whenStable();

          expect(queryDialog()).toBeNull();
          expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(false);
        } finally {
          delete (document.documentElement as { scrollHeight?: number }).scrollHeight;
        }
      });
    });
  });
});
