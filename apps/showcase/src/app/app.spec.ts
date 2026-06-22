import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';

const EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY = 'nat-showcase-expanded-nav-tree-items';

@Component({
  selector: 'app-test-example',
  template: 'Example route',
})
class TestExamplePage {}

describe('App', () => {
  beforeEach(async () => {
    try {
      globalThis.localStorage?.removeItem('nat-showcase-theme');
      globalThis.localStorage?.removeItem('nat-showcase-collapsed-nav-sections');
      globalThis.localStorage?.removeItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY);
    } catch {
      // ignore
    }

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'docs/quick-start',
          },
          {
            path: 'docs/quick-start',
            component: TestExamplePage,
          },
          {
            path: 'examples/multiple-features',
            component: TestExamplePage,
          },
        ]),
      ],
    }).compileComponents();
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
    expect(compiled.querySelector('.showcase-nav')?.textContent).toContain('Docs and examples');
    expect(compiled.querySelector('.showcase-nav')?.textContent).toContain('Docs');
    expect(compiled.querySelector('.showcase-nav')?.textContent).toContain('Examples');
    const tree = compiled.querySelector('[data-testid="showcase-nav-tree"]') as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.showcase-nav-tree-link'));
    const linkLabels = links.map((link) => link.textContent);
    const linkTargets = links.map((link) => link.getAttribute('href'));
    const navItems = fixture.componentInstance['navSections'].flatMap((section) =>
      section.groups.flatMap((group) => group.items),
    );

    const expectedLabels = navItems.map((item) => expect.stringContaining(item.label));
    const expectedTargets = navItems.map((item) => item.path);

    expect(tree.getAttribute('role')).toBe('tree');
    expect(tree.getAttribute('aria-label')).toBe('Docs and examples');
    expect(linkLabels).toEqual(expectedLabels);
    expect(linkTargets).toEqual(expectedTargets);
    expect(
      compiled.querySelector('[data-testid="showcase-nav-branch-docs-foundations"]'),
    ).not.toBeNull();
    const docsCompositionBranch = compiled.querySelector(
      '[data-testid="showcase-nav-branch-docs-composition"]',
    ) as HTMLElement;
    const docsOverviewLink = compiled.querySelector(
      '[data-testid="showcase-nav-link-composition"]',
    ) as HTMLAnchorElement;
    expect(docsCompositionBranch.getAttribute('aria-label')).toBe('Composition');
    expect(
      docsCompositionBranch.querySelector(':scope > .showcase-nav-tree-row')?.textContent,
    ).toContain('Composition');
    expect(docsOverviewLink.textContent).toContain('Overview');
    expect(
      compiled.querySelector('[data-testid="showcase-nav-branch-examples-columns"]'),
    ).not.toBeNull();
    expect(compiled.querySelector('.showcase-nav-count')).toBeNull();
    expect(compiled.querySelector('.showcase-theme-toggle')).not.toBeNull();
  });

  it('should collapse and expand top-level navigation tree branches', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const examplesBranch = compiled.querySelector(
      '[data-testid="showcase-nav-branch-examples"]',
    ) as HTMLElement;

    expect(examplesBranch.getAttribute('role')).toBe('treeitem');
    expect(examplesBranch.getAttribute('aria-expanded')).toBe('true');
    expect(examplesBranch.getAttribute('aria-current')).toBeNull();
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).not.toBeNull();

    examplesBranch.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(examplesBranch.getAttribute('aria-expanded')).toBe('false');
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();
    expect(readStoredExpandedNavTreeIds()).toContain('docs');
    expect(readStoredExpandedNavTreeIds()).not.toContain('examples');
    expect(readStoredExpandedNavTreeIds()).toContain('examples-columns');

    examplesBranch.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(examplesBranch.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).not.toBeNull();
    expect(readStoredExpandedNavTreeIds()).toContain('examples');
  });

  it('should collapse and expand nested navigation tree groups', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const examplesColumnsBranch = compiled.querySelector(
      '[data-testid="showcase-nav-branch-examples-columns"]',
    ) as HTMLElement;

    expect(examplesColumnsBranch.getAttribute('role')).toBe('treeitem');
    expect(examplesColumnsBranch.getAttribute('aria-expanded')).toBe('true');
    expect(examplesColumnsBranch.getAttribute('aria-current')).toBeNull();
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).not.toBeNull();

    examplesColumnsBranch.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(examplesColumnsBranch.getAttribute('aria-expanded')).toBe('false');
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();
    expect(readStoredExpandedNavTreeIds()).not.toContain('examples-columns');

    examplesColumnsBranch.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(examplesColumnsBranch.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).not.toBeNull();
    expect(readStoredExpandedNavTreeIds()).toContain('examples-columns');
  });

  it('should restore persisted expanded top-level navigation tree branches', async () => {
    globalThis.localStorage?.setItem(
      EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY,
      JSON.stringify(['docs', 'docs-foundations', 'removed-branch']),
    );

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const docsBranch = compiled.querySelector(
      '[data-testid="showcase-nav-branch-docs"]',
    ) as HTMLElement;
    const examplesBranch = compiled.querySelector(
      '[data-testid="showcase-nav-branch-examples"]',
    ) as HTMLElement;

    expect(docsBranch.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('[data-testid="showcase-nav-link-quick-start"]')).not.toBeNull();
    expect(examplesBranch.getAttribute('aria-expanded')).toBe('false');
    expect(compiled.querySelector('[data-testid="showcase-nav-link-sorting"]')).toBeNull();
  });

  it('should mark the current route leaf and ancestor tree branch', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/docs/quick-start');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const docsBranch = compiled.querySelector(
      '[data-testid="showcase-nav-branch-docs"]',
    ) as HTMLElement;
    const foundationsBranch = compiled.querySelector(
      '[data-testid="showcase-nav-branch-docs-foundations"]',
    ) as HTMLElement;
    const quickStartLink = compiled.querySelector(
      '[data-testid="showcase-nav-link-quick-start"]',
    ) as HTMLAnchorElement;

    expect(docsBranch.classList.contains('has-current-route')).toBe(true);
    expect(docsBranch.getAttribute('aria-current')).toBeNull();
    expect(foundationsBranch.classList.contains('has-current-route')).toBe(true);
    expect(foundationsBranch.getAttribute('aria-current')).toBeNull();
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
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const trigger = compiled.querySelector('.showcase-menu-button') as HTMLButtonElement;
    const nav = compiled.querySelector('.showcase-nav') as HTMLElement;
    const firstLink = compiled.querySelector('.showcase-nav-tree-link') as HTMLAnchorElement;

    trigger.click();
    await fixture.whenStable();

    expect(nav.classList.contains('is-open')).toBe(true);

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

function waitForFocusHandoff(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

function readStoredExpandedNavTreeIds(): string[] {
  const parsed: unknown = JSON.parse(
    globalThis.localStorage?.getItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY) ?? '[]',
  );

  return Array.isArray(parsed)
    ? parsed.filter((sectionId): sectionId is string => typeof sectionId === 'string')
    : [];
}
