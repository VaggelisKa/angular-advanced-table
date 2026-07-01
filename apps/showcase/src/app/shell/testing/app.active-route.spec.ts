import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { App } from '../app';
import { configureAppTestBed, getElement } from './app.testing';

describe('FEATURE: App active route', () => {
  beforeEach(configureAppTestBed);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('GIVEN: the showcase app shell is rendered with an active nested route', () => {
    describe('WHEN: mark the current route leaf and ancestor tree branch', () => {
      it('THEN: it marks the active leaf and expanded ancestor', async () => {
        const router = TestBed.inject(Router);

        await router.navigateByUrl('/docs/quick-start');
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const docsBranch = compiled.querySelector('[data-testid="showcase-nav-branch-docs"]') as HTMLElement;
        const quickStartLink = compiled.querySelector('[data-testid="showcase-nav-link-quick-start"]') as HTMLAnchorElement;

        expect(docsBranch.classList.contains('has-current-route')).toBe(true);
        expect(docsBranch.getAttribute('aria-current')).toBeNull();
        expect(quickStartLink.getAttribute('role')).toBe('treeitem');
        expect(quickStartLink.getAttribute('aria-current')).toBe('page');
      });
    });
  });

  describe('GIVEN: the browser URL already points at a docs route', () => {
    describe('WHEN: render before the router emits navigation events', () => {
      it('THEN: it marks the browser URL route active on the first render', async () => {
        globalThis.history.replaceState(null, '', '/docs/state');

        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const docsCoreModelBranch = getElement<HTMLElement>(compiled, '[data-testid="showcase-nav-branch-docs-core-model"]');
        const quickStartLink = getElement<HTMLAnchorElement>(compiled, '[data-testid="showcase-nav-link-quick-start"]');
        const stateLink = getElement<HTMLAnchorElement>(compiled, '[data-testid="showcase-nav-link-state"]');

        expect(docsCoreModelBranch.getAttribute('aria-expanded')).toBe('true');
        expect(quickStartLink.getAttribute('aria-current')).toBeNull();
        expect(stateLink.getAttribute('aria-current')).toBe('page');
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with active index routes', () => {
    describe('WHEN: mark the root index as the quick start navigation leaf', () => {
      it('THEN: it highlights the quick start link from the home page', async () => {
        const router = TestBed.inject(Router);

        await router.navigateByUrl('/');
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const quickStartLink = getElement<HTMLAnchorElement>(compiled, '[data-testid="showcase-nav-link-quick-start"]');

        expect(quickStartLink.getAttribute('aria-current')).toBe('page');
      });
    });

    describe('WHEN: mark docs index as the quick start navigation leaf', () => {
      it('THEN: it highlights the quick start link', async () => {
        const router = TestBed.inject(Router);

        await router.navigateByUrl('/docs');
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const docsBranch = getElement<HTMLElement>(compiled, '[data-testid="showcase-nav-branch-docs"]');
        const quickStartLink = getElement<HTMLAnchorElement>(compiled, '[data-testid="showcase-nav-link-quick-start"]');

        expect(docsBranch.classList.contains('has-current-route')).toBe(true);
        expect(quickStartLink.getAttribute('aria-current')).toBe('page');
      });
    });

    describe('WHEN: mark examples index as the multiple features navigation leaf', () => {
      it('THEN: it highlights the multiple features link', async () => {
        const router = TestBed.inject(Router);

        await router.navigateByUrl('/examples');
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const galleryBranch = getElement<HTMLElement>(compiled, '[data-testid="showcase-nav-branch-gallery"]');
        const multipleFeaturesLink = getElement<HTMLAnchorElement>(compiled, '[data-testid="showcase-nav-link-multiple-features"]');

        expect(galleryBranch.classList.contains('has-current-route')).toBe(true);
        expect(multipleFeaturesLink.getAttribute('aria-current')).toBe('page');
      });
    });
  });
});
