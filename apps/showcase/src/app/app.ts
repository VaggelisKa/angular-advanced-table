/* eslint-disable max-lines -- cohesive app shell: nav-tree state component plus its co-located pure helpers */
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { DOCUMENT } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { Component, Injector, afterNextRender, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { filter, map, startWith } from 'rxjs';

import { loadDocsPage } from './app.routes';
import { resolveFocusTrapTarget } from './app.util';
import { DocsMarkdownCache } from './pages/docs/docs-markdown-cache';
import { showcaseDocs, showcaseNavSections } from './showcase-navigation';
import type { ShowcaseDoc, ShowcaseNavGroup, ShowcaseNavItem, ShowcaseNavSection } from './showcase-navigation';
import { ShowcaseThemeStore } from './showcase-theme';
import type { ShowcaseTheme } from './showcase-theme';

function getShowcaseNavBranchIds(sections: readonly ShowcaseNavSection[]): string[] {
  return sections.flatMap((section) => [section.id, ...section.groups.map((group) => group.id)]);
}

const EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY = 'nat-showcase-expanded-nav-tree-items';
const SHOWCASE_NAV_BRANCH_IDS = getShowcaseNavBranchIds(showcaseNavSections);
const SHOWCASE_NAV_BRANCH_ID_SET = new Set(SHOWCASE_NAV_BRANCH_IDS);
const DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS = ['docs', 'docs-start'];

function readInitialExpandedNavTreeBranchIds(): ReadonlySet<string> {
  try {
    const stored = globalThis.localStorage.getItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY);

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

function normalizeRoutePath(url: string): string {
  return url.split(/[?#]/, 1)[0] ?? url;
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

function isShowcaseDoc(item: ShowcaseNavItem): item is ShowcaseDoc {
  return 'markdownPaths' in item;
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

function persistExpandedNavTreeBranchIds(expandedBranchIds: ReadonlySet<string>): void {
  try {
    globalThis.localStorage.setItem(
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
  private readonly docsMarkdownCache = inject(DocsMarkdownCache);
  private readonly themeStore = inject(ShowcaseThemeStore);
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly mobileNavCloseButton = viewChild<ElementRef<HTMLButtonElement>>('mobileNavCloseButton');
  private readonly mobileNavPanel = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly navSections = showcaseNavSections;
  protected readonly expandedNavTreeBranchIds = signal<ReadonlySet<string>>(readInitialExpandedNavTreeBranchIds());
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

    afterNextRender(
      () => {
        globalThis.setTimeout(() => {
          void loadDocsPage();
          this.docsMarkdownCache.preload(showcaseDocs.flatMap((doc) => doc.markdownPaths));
        });
      },
      { injector: this.injector }
    );
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

  protected setNavTreeBranchExpanded(branchId: string, expanded: boolean): void {
    this.setNavTreeBranchesExpanded([branchId], expanded);
  }

  protected prefetchNavItem(item: ShowcaseNavItem): void {
    if (isShowcaseDoc(item)) {
      this.docsMarkdownCache.preload(item.markdownPaths);
    }
  }

  private setNavTreeBranchesExpanded(branchIds: readonly string[], expanded: boolean): void {
    if (!branchIds.some((branchId) => SHOWCASE_NAV_BRANCH_ID_SET.has(branchId))) {
      return;
    }

    const nextBranchIds = setExpandedNavTreeBranches(this.expandedNavTreeBranchIds(), branchIds, expanded);

    this.expandedNavTreeBranchIds.set(nextBranchIds);
    persistExpandedNavTreeBranchIds(nextBranchIds);
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
