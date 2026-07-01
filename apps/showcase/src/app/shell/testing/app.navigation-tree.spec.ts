import { TestBed } from '@angular/core/testing';

import { App } from '../app';
import { EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY, configureAppTestBed, readStoredExpandedNavTreeIds } from './app.testing';

describe('FEATURE: App navigation tree', () => {
  beforeEach(configureAppTestBed);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('GIVEN: the showcase app shell is rendered with expandable top-level navigation', () => {
    describe('WHEN: collapse and expand top-level navigation tree branches', () => {
      it('THEN: it updates top-level tree expansion state', async () => {
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const galleryBranch = compiled.querySelector('[data-testid="showcase-nav-branch-gallery"]') as HTMLElement;

        expect(galleryBranch.getAttribute('role')).toBe('treeitem');
        expect(galleryBranch.getAttribute('aria-expanded')).toBe('false');
        expect(galleryBranch.getAttribute('aria-current')).toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-branch-examples-sticky-header"]')).toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-multiple-features"]')).toBeNull();

        galleryBranch.click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(galleryBranch.getAttribute('aria-expanded')).toBe('true');
        expect(compiled.querySelector('[data-testid="showcase-nav-branch-examples-sticky-header"]')).not.toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-multiple-features"]')).not.toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-sticky-header-max-height"]')).toBeNull();
        expect(readStoredExpandedNavTreeIds()).toContain('docs');
        expect(readStoredExpandedNavTreeIds()).toContain('gallery');
        expect(readStoredExpandedNavTreeIds()).not.toContain('examples-sticky-header');

        galleryBranch.click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(galleryBranch.getAttribute('aria-expanded')).toBe('false');
        expect(compiled.querySelector('[data-testid="showcase-nav-branch-examples-sticky-header"]')).toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-multiple-features"]')).toBeNull();
        expect(readStoredExpandedNavTreeIds()).not.toContain('gallery');
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with nested navigation groups', () => {
    describe('WHEN: expand and collapse nested navigation tree groups', () => {
      it('THEN: it updates nested tree expansion state', async () => {
        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const docsBranch = compiled.querySelector('[data-testid="showcase-nav-branch-docs"]') as HTMLElement;

        docsBranch.click();
        docsBranch.click();
        await fixture.whenStable();
        fixture.detectChanges();

        const docsCapabilitiesBranch = compiled.querySelector('[data-testid="showcase-nav-branch-docs-capabilities"]') as HTMLElement;

        expect(docsCapabilitiesBranch.getAttribute('role')).toBe('treeitem');
        expect(docsCapabilitiesBranch.getAttribute('aria-expanded')).toBe('false');
        expect(docsCapabilitiesBranch.getAttribute('aria-current')).toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();

        docsCapabilitiesBranch.click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(docsCapabilitiesBranch.getAttribute('aria-expanded')).toBe('true');
        expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).not.toBeNull();
        expect(readStoredExpandedNavTreeIds()).toContain('docs-capabilities');

        docsCapabilitiesBranch.click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(docsCapabilitiesBranch.getAttribute('aria-expanded')).toBe('false');
        expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();
        expect(readStoredExpandedNavTreeIds()).not.toContain('docs-capabilities');
      });
    });
  });

  describe('GIVEN: the showcase app shell is rendered with persisted navigation state', () => {
    describe('WHEN: restore persisted expanded top-level navigation tree branches', () => {
      it('THEN: it loads expansion state from storage', async () => {
        globalThis.localStorage.setItem(
          EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY,
          JSON.stringify(['docs', 'docs-core-model', 'removed-branch'])
        );

        const fixture = TestBed.createComponent(App);

        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const docsBranch = compiled.querySelector('[data-testid="showcase-nav-branch-docs"]') as HTMLElement;
        const galleryBranch = compiled.querySelector('[data-testid="showcase-nav-branch-gallery"]') as HTMLElement;
        const docsCoreModelBranch = compiled.querySelector('[data-testid="showcase-nav-branch-docs-core-model"]') as HTMLElement;

        expect(docsBranch.getAttribute('aria-expanded')).toBe('true');
        expect(docsCoreModelBranch.getAttribute('aria-expanded')).toBe('true');
        expect(compiled.querySelector('[data-testid="showcase-nav-link-quick-start"]')).not.toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-composition"]')).not.toBeNull();
        expect(compiled.querySelector('[data-testid="showcase-nav-link-columns"]')).not.toBeNull();
        expect(galleryBranch.getAttribute('aria-expanded')).toBe('false');
        expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();
      });
    });
  });
});
