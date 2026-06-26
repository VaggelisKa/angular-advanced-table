/* eslint-disable max-lines -- comprehensive app-shell unit spec */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';
import { DocsMarkdownCache } from './pages/docs/docs-markdown-cache';

const EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY = 'nat-showcase-expanded-nav-tree-items';

@Component({
  selector: 'app-test-example',
  template: 'Example route'
})
class TestExamplePage {}

function createTestStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length(): number {
      return values.size;
    },
    clear(): void {
      values.clear();
    },
    getItem(key: string): string | null {
      return values.get(key) ?? null;
    },
    key(index: number): string | null {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string): void {
      values.delete(key);
    },
    setItem(key: string, value: string): void {
      values.set(key, value);
    }
  };
}

function readStoredExpandedNavTreeIds(): string[] {
  const parsed: unknown = JSON.parse(globalThis.localStorage.getItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY) ?? '[]');

  return Array.isArray(parsed) ? parsed.filter((sectionId): sectionId is string => typeof sectionId === 'string') : [];
}

async function waitForFocusHandoff(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

function getElement<T extends Element>(container: HTMLElement, selector: string): T {
  const element = container.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Element not found: ${selector}`);
  }

  return element;
}

describe('App', () => {
  beforeEach(async () => {
    vi.stubGlobal('localStorage', createTestStorage());

    try {
      globalThis.localStorage.removeItem('nat-showcase-theme');
      globalThis.localStorage.removeItem('nat-showcase-collapsed-nav-sections');
      globalThis.localStorage.removeItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY);
    } catch {
      // ignore
    }

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: DocsMarkdownCache,
          useValue: {
            load: (): undefined => undefined,
            preload: (): undefined => undefined
          }
        },
        provideRouter([
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'docs/quick-start'
          },
          {
            path: 'docs/quick-start',
            component: TestExamplePage
          },
          {
            path: 'examples/multiple-features',
            component: TestExamplePage
          }
        ])
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render the docs and examples navigation shell', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.querySelector('.showcase-mobile-header')?.textContent).toContain('Docs and examples');
    expect(compiled.querySelector('.showcase-nav-header')?.textContent).not.toContain('Docs and examples');
    expect(compiled.querySelector('.showcase-nav')?.textContent).toContain('Docs');
    expect(compiled.querySelector('.showcase-nav')?.textContent).toContain('Gallery');
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
    expect(docsCapabilitiesBranch.querySelector(':scope > .showcase-nav-tree-row')?.textContent).toContain('Capabilities');
    expect(docsCapabilitiesBranch.getAttribute('aria-expanded')).toBe('false');
    expect(compiled.querySelector('[data-testid="showcase-nav-branch-examples-columns"]')).toBeNull();
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

  it('should collapse and expand top-level navigation tree branches', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const galleryBranch = compiled.querySelector('[data-testid="showcase-nav-branch-gallery"]') as HTMLElement;

    expect(galleryBranch.getAttribute('role')).toBe('treeitem');
    expect(galleryBranch.getAttribute('aria-expanded')).toBe('false');
    expect(galleryBranch.getAttribute('aria-current')).toBeNull();
    expect(compiled.querySelector('[data-testid="showcase-nav-branch-examples-scenarios"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();

    galleryBranch.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(galleryBranch.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('[data-testid="showcase-nav-branch-examples-scenarios"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();
    expect(readStoredExpandedNavTreeIds()).toContain('docs');
    expect(readStoredExpandedNavTreeIds()).toContain('gallery');
    expect(readStoredExpandedNavTreeIds()).not.toContain('examples-scenarios');

    galleryBranch.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(galleryBranch.getAttribute('aria-expanded')).toBe('false');
    expect(compiled.querySelector('[data-testid="showcase-nav-branch-examples-scenarios"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();
    expect(readStoredExpandedNavTreeIds()).not.toContain('gallery');
  });

  it('should expand and collapse nested navigation tree groups', async () => {
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

  it('should restore persisted expanded top-level navigation tree branches', async () => {
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

  it('should mark the current route leaf and ancestor tree branch', async () => {
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

  it('should toggle the showcase theme from the sidenav', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const shell = compiled.querySelector('.showcase-shell') as HTMLDivElement;
    const darkOption = compiled.querySelectorAll('.showcase-theme-option')[1] as HTMLButtonElement;
    const lightOption = compiled.querySelectorAll('.showcase-theme-option')[0] as HTMLButtonElement;

    darkOption.click();
    fixture.detectChanges();

    expect(shell.getAttribute('data-theme')).toBe('dark');
    expect(darkOption.getAttribute('aria-pressed')).toBe('true');

    lightOption.click();
    fixture.detectChanges();

    expect(shell.getAttribute('data-theme')).toBe('light');
    expect(lightOption.getAttribute('aria-pressed')).toBe('true');
  });

  it('should open and close the mobile navigation drawer from the trigger', async () => {
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

  it('should move focus into the mobile drawer and restore it on close', async () => {
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

  it('should close the mobile drawer after choosing a navigation link', async () => {
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

  it('should route the default page to the quick start docs', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.textContent).toContain('Example route');
  });
});
