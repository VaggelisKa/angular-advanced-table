import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { App } from '../app';
import { configureAppTestBed, queryText } from './app.testing';

describe('FEATURE: App rendering', () => {
  beforeEach(configureAppTestBed);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('GIVEN: the showcase app shell is rendered', () => {
    describe('WHEN: create the app', () => {
      it('THEN: it creates the app component instance', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;

        expect(app).toBeTruthy();
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with docs and examples routes', () => {
    describe('WHEN: render the docs and examples navigation shell', () => {
      it('THEN: it shows the navigation landmarks and branches', async () => {
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('router-outlet')).not.toBeNull();
        expect(queryText(compiled, '.showcase-mobile-header')).toContain('Docs and examples');
        expect(queryText(compiled, '.showcase-nav-header')).not.toContain('Docs and examples');
        expect(queryText(compiled, '.showcase-nav')).toContain('Docs');
        expect(queryText(compiled, '.showcase-nav')).toContain('Gallery');
        const tree = compiled.querySelector('[data-testid="showcase-nav-tree"]') as HTMLElement;
        const docsBranch = compiled.querySelector('[data-testid="showcase-nav-branch-docs"]') as HTMLElement;
        const galleryBranch = compiled.querySelector('[data-testid="showcase-nav-branch-gallery"]') as HTMLElement;

        expect(tree.getAttribute('role')).toBe('tree');
        expect(tree.getAttribute('aria-label')).toBe('Docs and examples');
        expect(docsBranch.getAttribute('aria-expanded')).toBe('true');
        expect(galleryBranch.getAttribute('aria-expanded')).toBe('false');
        expect(compiled.querySelector('[data-testid="showcase-nav-link-quick-start"]')).not.toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-branch-docs-start"]')).toBeNull();
        const docsCoreModelBranch = compiled.querySelector('[data-testid="showcase-nav-branch-docs-core-model"]') as HTMLElement;
        const docsCapabilitiesBranch = compiled.querySelector('[data-testid="showcase-nav-branch-docs-capabilities"]') as HTMLElement;

        expect(docsCoreModelBranch.getAttribute('aria-label')).toBe('Core principles');
        expect(docsCoreModelBranch.getAttribute('aria-expanded')).toBe('false');
        expect(compiled.querySelector('[data-testid="showcase-nav-link-composition"]')).toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-columns"]')).toBeNull();
        expect(docsCapabilitiesBranch.getAttribute('aria-label')).toBe('Capabilities');
        expect(queryText(docsCapabilitiesBranch, ':scope > .showcase-nav-tree-row')).toContain('Capabilities');
        expect(docsCapabilitiesBranch.getAttribute('aria-expanded')).toBe('false');
        expect(compiled.querySelector('[data-testid="showcase-nav-branch-examples-sticky-header"]')).toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();
        expect(compiled.querySelector('.showcase-nav-count')).toBeNull();
        expect(compiled.querySelector('.showcase-theme-control')).toBeNull();
        expect(compiled.querySelector('.showcase-repo-section')).toBeNull();
        expect(compiled.querySelector('.showcase-nav-caption')).toBeNull();

        const utilities = compiled.querySelector('.showcase-nav-utilities') as HTMLElement;
        const themeToggle = utilities.querySelector('.showcase-theme-toggle') as HTMLElement;
        const themeOptions = Array.from(utilities.querySelectorAll('.showcase-theme-option')) as HTMLButtonElement[];
        const githubLink = utilities.querySelector('.showcase-github-link') as HTMLAnchorElement;

        expect(utilities.getAttribute('aria-label')).toBe('Showcase utilities');
        expect(utilities.textContent.trim()).toBe('');
        expect(themeToggle.getAttribute('aria-label')).toBe('Color theme');
        expect(themeOptions.map((option) => option.getAttribute('aria-label'))).toStrictEqual(['Use light theme', 'Use dark theme']);
        expect(githubLink.getAttribute('aria-label')).toBe('Open angular-advanced-table repository on GitHub');
        expect(githubLink.getAttribute('title')).toBe('Open GitHub repository');
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with the default route configured', () => {
    describe('WHEN: route the default page as the quick start docs alias', () => {
      it('THEN: it renders the page without redirecting', async () => {
        const fixture = TestBed.createComponent(App);
        const router = TestBed.inject(Router);

        await router.navigateByUrl('/');
        fixture.detectChanges();
        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;

        expect(router.url).toBe('/');
        expect(compiled.querySelector('router-outlet')).not.toBeNull();
        expect(compiled.textContent).toContain('Example route');
      });
    });
  });
});
