/* eslint-disable max-lines -- cohesive app shell: nav-tree state component plus its co-located pure helpers */
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { DOCUMENT } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { Component, Injector, afterNextRender, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { filter, map, startWith } from 'rxjs';

import {
  SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH,
  SHOWCASE_DEFAULT_ROUTE_PATH,
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH
} from './app.route-paths';
import { loadDocsPage } from './app.routes';
import { resolveFocusTrapTarget } from './app.util';
import { showcaseNavSections } from './showcase-navigation';
import type { ShowcaseNavGroup, ShowcaseNavItem, ShowcaseNavSection } from './showcase-navigation';
import { ShowcaseThemeStore } from './showcase-theme';
import type { ShowcaseTheme } from './showcase-theme';

function getShowcaseNavBranchIds(sections: readonly ShowcaseNavSection[]): string[] {
  return sections.flatMap((section) => [section.id, ...section.groups.map((group) => group.id)]);
}

const EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY = 'nat-showcase-expanded-nav-tree-items';
const SHOWCASE_NAV_BRANCH_IDS = getShowcaseNavBranchIds(showcaseNavSections);
const SHOWCASE_NAV_BRANCH_ID_SET = new Set(SHOWCASE_NAV_BRANCH_IDS);
const DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS = ['docs'];

function readStoredExpandedNavTreeBranchIds(storage: Storage): ReadonlySet<string> {
  try {
    const stored = storage.getItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY);

    if (!stored) {
      return new Set(DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS);
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return new Set(DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS);
    }

    return new Set(
      parsed.filter((branchId): branchId is string => typeof branchId === 'string' && SHOWCASE_NAV_BRANCH_ID_SET.has(branchId))
    );
  } catch {
    // Storage access can throw in private/sandboxed contexts; default to top-level branches.
    return new Set(DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS);
  }
}

function readBrowserStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function readInitialRouteUrl(document: Document, routerUrl: string): string {
  if (routerUrl !== '' && routerUrl !== '/') {
    return routerUrl;
  }

  const routeUrl = `${document.location.pathname}${document.location.search}${document.location.hash}`;

  return routeUrl.startsWith('/') ? routeUrl : routerUrl;
}

function normalizeRoutePath(url: string): string {
  const routePath = url.split(/[?#]/, 1)[0] ?? url;
  const routePathWithoutSlash = routePath.replace(/^\/+/, '');

  if (routePathWithoutSlash === '' || routePathWithoutSlash === SHOWCASE_DOCS_INDEX_ROUTE_PATH) {
    return `/${SHOWCASE_DEFAULT_ROUTE_PATH}`;
  }

  if (routePathWithoutSlash === SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH) {
    return `/${SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH}`;
  }

  return routePath.startsWith('/') ? routePath : `/${routePath}`;
}

function findNavBranchIdsByRoute(sections: readonly ShowcaseNavSection[], routePath: string): string[] {
  for (const section of sections) {
    if (section.items.some((item) => item.path === routePath)) {
      return [section.id];
    }

    const group = section.groups.find((navGroup) => navGroup.items.some((item) => item.path === routePath));

    if (group) {
      return [section.id, group.id];
    }
  }

  return [];
}

function branchContainsRoute(branch: ShowcaseNavSection | ShowcaseNavGroup, routePath: string): boolean {
  if ('groups' in branch) {
    return (
      branch.items.some((item) => item.path === routePath) || branch.groups.some((group) => branchContainsRoute(group, routePath))
    );
  }

  return branch.items.some((item) => item.path === routePath);
}

function isDocsNavItem(item: ShowcaseNavItem): boolean {
  return item.path.startsWith('/docs/');
}

function setExpandedNavTreeBranches(
  expandedBranchIds: ReadonlySet<string>,
  branchIds: readonly string[],
  expanded: boolean
): ReadonlySet<string> {
  const nextBranchIds = new Set(expandedBranchIds);

  for (const branchId of branchIds) {
    if (!SHOWCASE_NAV_BRANCH_ID_SET.has(branchId)) {
      continue;
    }

    if (expanded) {
      nextBranchIds.add(branchId);
    } else {
      nextBranchIds.delete(branchId);
    }
  }

  return nextBranchIds;
}

function persistExpandedNavTreeBranchIds(storage: Storage, expandedBranchIds: ReadonlySet<string>): void {
  try {
    storage.setItem(
      EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY,
      JSON.stringify(SHOWCASE_NAV_BRANCH_IDS.filter((branchId) => expandedBranchIds.has(branchId)))
    );
  } catch {
    // Ignore quota / privacy-mode failures.
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, Tree, TreeItem, TreeItemGroup],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly themeStore = inject(ShowcaseThemeStore);
  private navTreeStorage: Storage | null = null;
  private readonly initialRouteUrl = readInitialRouteUrl(this.document, this.router.url);
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly mobileNavCloseButton = viewChild<ElementRef<HTMLButtonElement>>('mobileNavCloseButton');
  private readonly mobileNavPanel = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.initialRouteUrl)
    ),
    { initialValue: this.initialRouteUrl }
  );

  protected readonly navSections = showcaseNavSections;
  protected readonly expandedNavTreeBranchIds = signal<ReadonlySet<string>>(new Set(DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS));
  protected readonly navTreeHydrated = signal(false);
  protected readonly docsPagePrefetched = signal(false);
  protected readonly mobileNavOpen = signal(false);
  protected readonly theme = this.themeStore.theme;
  protected readonly activeNavRoutePath = computed(() => normalizeRoutePath(this.currentUrl()));
  protected readonly activeNavTreeValues = computed(() => {
    const activeRoutePath = this.activeNavRoutePath();

    return activeRoutePath ? [activeRoutePath] : [];
  });

  protected readonly activeNavBranchIds = computed(() => {
    const activeRoutePath = this.activeNavRoutePath();

    return activeRoutePath ? findNavBranchIdsByRoute(this.navSections, activeRoutePath) : [];
  });

  public constructor() {
    effect(() => {
      const activeBranchIds = this.activeNavBranchIds();

      if (!activeBranchIds.length) {
        return;
      }

      untracked(() => this.setNavTreeBranchesExpanded(activeBranchIds, true));
    });

    afterNextRender(() => {
      this.restoreExpandedNavTreeBranches();
      this.navTreeHydrated.set(true);
    });
  }

  protected setTheme(theme: ShowcaseTheme): void {
    this.themeStore.setTheme(theme);
  }

  protected isNavTreeBranchExpanded(sectionId: string): boolean {
    return this.expandedNavTreeBranchIds().has(sectionId);
  }

  protected navTreeBranchContainsCurrentRoute(branch: ShowcaseNavSection | ShowcaseNavGroup): boolean {
    const activeRoutePath = this.activeNavRoutePath();

    return branchContainsRoute(branch, activeRoutePath);
  }

  protected navItemIsCurrentRoute(item: ShowcaseNavItem): boolean {
    return item.path === this.activeNavRoutePath();
  }

  protected setNavTreeBranchExpanded(branchId: string, expanded: boolean): void {
    this.setNavTreeBranchesExpanded([branchId], expanded);
  }

  protected prefetchNavItem(item: ShowcaseNavItem): void {
    if (isDocsNavItem(item) && !this.docsPagePrefetched()) {
      this.docsPagePrefetched.set(true);
      void loadDocsPage();
    }
  }

  private setNavTreeBranchesExpanded(branchIds: readonly string[], expanded: boolean): void {
    if (!branchIds.some((branchId) => SHOWCASE_NAV_BRANCH_ID_SET.has(branchId))) {
      return;
    }

    const nextBranchIds = setExpandedNavTreeBranches(this.expandedNavTreeBranchIds(), branchIds, expanded);

    this.expandedNavTreeBranchIds.set(nextBranchIds);

    if (this.navTreeStorage) {
      persistExpandedNavTreeBranchIds(this.navTreeStorage, nextBranchIds);
    }
  }

  private restoreExpandedNavTreeBranches(): void {
    const storage = readBrowserStorage();

    if (!storage) {
      return;
    }

    this.navTreeStorage = storage;
    const storedBranchIds = readStoredExpandedNavTreeBranchIds(storage);
    const expandedBranchIds = setExpandedNavTreeBranches(storedBranchIds, this.activeNavBranchIds(), true);

    this.expandedNavTreeBranchIds.set(expandedBranchIds);
  }

  protected toggleMobileNav(): void {
    if (this.mobileNavOpen()) {
      this.closeMobileNav();

      return;
    }

    this.openMobileNav();
  }

  protected openMobileNav(): void {
    this.mobileNavOpen.set(true);
    this.focusAfterRender(() => this.mobileNavCloseButton()?.nativeElement);
  }

  protected closeMobileNav(restoreFocus = true): void {
    if (!this.mobileNavOpen()) {
      return;
    }

    this.mobileNavOpen.set(false);

    if (restoreFocus) {
      this.focusAfterRender(() => this.mobileMenuButton()?.nativeElement);
    }
  }

  protected trapMobileNavFocus(event: KeyboardEvent): void {
    if (!this.mobileNavOpen() || event.key !== 'Tab') {
      return;
    }

    const panel = this.mobileNavPanel()?.nativeElement;

    if (!panel) {
      return;
    }

    const target = resolveFocusTrapTarget(panel, this.document.activeElement, event.shiftKey);

    if (target) {
      event.preventDefault();
      target.focus();
    }
  }

  private focusAfterRender(getElement: () => HTMLElement | undefined): void {
    afterNextRender({ write: () => getElement()?.focus() }, { injector: this.injector });
  }
}
